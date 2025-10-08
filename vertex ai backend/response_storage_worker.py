"""
Background worker that monitors Redis queue and stores LLM responses to Firebase.
This ensures responses are stored even if the frontend doesn't poll.
"""
import os
import sys
import json
import logging
import time
from datetime import datetime, timezone
from threading import Thread, Event
from typing import Optional

import firebase_admin
from firebase_admin import db, credentials

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from message_broker import MessageBroker
from redis_session_service import RedisSessionService

# --- Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ResponseStorageWorker:
    """
    Background worker that continuously monitors the results queue and stores responses to Firebase.
    """

    def __init__(self, broker: MessageBroker, session_service: Optional[RedisSessionService] = None):
        self.broker = broker
        self.session_service = session_service
        self.stop_event = Event()
        self.worker_thread: Optional[Thread] = None
        self.results_queue = "results:user_interface"

    def start(self):
        """Start the background worker thread."""
        if self.worker_thread and self.worker_thread.is_alive():
            logger.warning("Worker thread is already running")
            return

        logger.info("Starting ResponseStorageWorker...")
        self.stop_event.clear()
        self.worker_thread = Thread(target=self._run, daemon=True)
        self.worker_thread.start()
        logger.info("ResponseStorageWorker started successfully")

    def stop(self):
        """Stop the background worker thread."""
        logger.info("Stopping ResponseStorageWorker...")
        self.stop_event.set()
        if self.worker_thread:
            self.worker_thread.join(timeout=5)
        logger.info("ResponseStorageWorker stopped")

    def _run(self):
        """Main worker loop that processes responses from Redis."""
        logger.info(f"Worker thread started, monitoring queue: {self.results_queue}")

        while not self.stop_event.is_set():
            try:
                # Use a shorter timeout so we can check stop_event regularly
                result = self.broker.redis_client.blpop(self.results_queue, timeout=2)

                if result:
                    _, response_data = result
                    self._process_response(response_data)

            except Exception as e:
                logger.error(f"Error in worker loop: {e}", exc_info=True)
                # Sleep briefly to avoid tight error loops
                time.sleep(1)

        logger.info("Worker thread exiting")

    def _process_response(self, response_data: bytes):
        """Process and store a single response to Firebase."""
        try:
            response = json.loads(response_data)
            logger.info(f"Processing response: {json.dumps(response, indent=2)[:500]}")

            # Extract information from response
            header = response.get("header", {})
            payload = response.get("payload", {})

            correlation_id = header.get("correlation_id")
            source_agent = header.get("source_agent", "")

            # Handle ResultPayload structure with data field
            data = payload.get("data", {})
            agent_response_text = data.get("response", "")
            user_id = data.get("user_id")
            itinerary_id = data.get("itinerary_id")
            state_info = data.get("state", {})

            if not user_id or not itinerary_id:
                logger.warning(f"Missing user_id or itinerary_id in response payload. Skipping storage.")
                logger.debug(f"Full response: {json.dumps(response, indent=2)}")
                return

            # Firebase references
            messages_path = f"users/user_id/{user_id}/itineraries/{itinerary_id}/messages/message_id"
            messages_ref = db.reference(messages_path)
            typing_ref = db.reference(f"users/user_id/{user_id}/itineraries/{itinerary_id}/messages")
            state_ref = db.reference(f"users/user_id/{user_id}/itineraries/{itinerary_id}/state")

            logger.info(f"Storing response to Firebase path: {messages_path}")

            # Check if itinerary was created
            itinerary_created = state_info.get("itinerary_created", False)

            # Create Firebase message object
            agent_message = {
                "sender": "agent",
                "message": agent_response_text,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "message_type": "text"
            }

            # Add activity metadata only if itinerary was created
            if itinerary_created:
                agent_message["activityType"] = "itinerary"
                agent_message["activity_object"] = itinerary_id
                logger.info(f"Added itinerary activity info: type=itinerary, object={itinerary_id}")

            # Store agent message in Firebase with retry logic
            max_retries = 3
            retry_delay = 1  # seconds

            for attempt in range(max_retries):
                try:
                    logger.info(f"Pushing agent message to Firebase (attempt {attempt + 1}/{max_retries}): {json.dumps(agent_message, indent=2)[:300]}")
                    messages_ref.push(agent_message)
                    logger.info(f"Successfully pushed agent message to Firebase")
                    break
                except Exception as firebase_error:
                    if attempt < max_retries - 1:
                        logger.warning(f"Failed to push to Firebase (attempt {attempt + 1}/{max_retries}): {firebase_error}. Retrying in {retry_delay}s...")
                        time.sleep(retry_delay)
                        retry_delay *= 2  # Exponential backoff
                    else:
                        logger.error(f"Failed to push agent message to Firebase after {max_retries} attempts: {firebase_error}", exc_info=True)
                        raise

            # Update state in Firebase if available
            if state_info or itinerary_created:
                try:
                    # If itinerary was just created, reset the flag
                    if itinerary_created:
                        if not state_info:
                            state_info = {}
                        state_info['itinerary_created'] = False
                        logger.info("Resetting itinerary_created flag to False after storing message")

                    if state_info:
                        logger.info(f"Updating state in Firebase: {json.dumps(state_info, indent=2)[:300]}")
                        state_ref.update(state_info)
                        logger.info(f"Successfully updated state in Firebase")
                except Exception as state_error:
                    logger.error(f"Failed to update state in Firebase: {state_error}", exc_info=True)
                    # Don't fail the whole operation if state update fails

            # Set typing indicator to false
            try:
                logger.info("Setting typing indicator to False")
                typing_ref.update({"typing": False})
            except Exception as typing_error:
                logger.error(f"Failed to set typing indicator to False: {typing_error}", exc_info=True)
                # Don't fail the whole operation if typing update fails

            logger.info(f"Successfully stored response with correlation_id: {correlation_id}")

        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode JSON response: {e}", exc_info=True)
            logger.error(f"Raw response data: {response_data}")
        except Exception as e:
            logger.error(f"Error processing response: {e}", exc_info=True)
            # Try to set typing indicator to false even if processing failed
            try:
                if 'typing_ref' in locals():
                    typing_ref.update({"typing": False})
            except:
                pass  # Best effort


if __name__ == "__main__":
    """Main entry point for running the response storage worker."""
    from dotenv import load_dotenv

    # Load environment variables
    load_dotenv()

    # Initialize Firebase
    try:
        logger.info("Initializing Firebase...")
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        firebase_database_url = os.getenv("FIREBASE_DATABASE_URL")

        if not cred_path:
            logger.critical("FATAL: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.")
            sys.exit("Exiting: GOOGLE_APPLICATION_CREDENTIALS is not set.")

        if not os.path.exists(cred_path):
            logger.critical(f"FATAL: Service account key file not found at path: {cred_path}")
            sys.exit(f"Exiting: Service account key file not found at path: {cred_path}")

        if not firebase_database_url:
            logger.critical("FATAL: FIREBASE_DATABASE_URL environment variable is not set.")
            sys.exit("Exiting: FIREBASE_DATABASE_URL is not set.")

        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {
            'databaseURL': firebase_database_url
        })
        logger.info("Firebase initialized successfully.")
    except Exception as e:
        logger.critical(f"CRITICAL: Failed to initialize Firebase: {e}", exc_info=True)
        sys.exit(1)

    # Initialize MessageBroker
    broker = MessageBroker()
    logger.info("MessageBroker initialized.")

    # Create and start the worker
    worker = ResponseStorageWorker(broker)
    worker.start()

    logger.info("Response storage worker is running. Press Ctrl+C to stop.")

    try:
        # Keep the main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Received interrupt signal, shutting down...")
        worker.stop()
        logger.info("Worker stopped successfully.")
