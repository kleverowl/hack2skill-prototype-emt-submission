import os
import sys
import logging
import json
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response, HTTPException
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

import firebase_admin
from firebase_admin import credentials, db

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from message_broker import MessageBroker
from message_protocol import Message, Header, TaskPayload

# --- Setup ---
load_dotenv()

# --- Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Firebase Initialization ---
try:
    logger.info("Attempting to initialize Firebase...")
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

except (ValueError, SystemExit) as e:
    logger.error(e)
    sys.exit(1)
except Exception as e:
    logger.critical(f"CRITICAL: An unexpected error occurred during Firebase initialization: {e}", exc_info=True)
    sys.exit(1)

# --- Pydantic Models ---
class FirebaseMessage(BaseModel):
    sender: str
    message: str
    timestamp: str
    activityType: Optional[str] = None
    activity_object: Optional[str] = None
    message_type: str = "text"

# --- FastAPI App ---
app = FastAPI()

# --- CORS Middleware ---
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from redis_session_service import RedisSessionService

# --- Message Broker ---
broker = MessageBroker()

# --- Session Service ---
session_service = RedisSessionService()

# --- Response Storage Worker ---
from response_storage_worker import ResponseStorageWorker

worker = ResponseStorageWorker(broker=broker, session_service=session_service)

@app.on_event("startup")
async def startup_event():
    """Start the background worker when the app starts."""
    logger.info("Starting background response storage worker...")
    worker.start()

@app.on_event("shutdown")
async def shutdown_event():
    """Stop the background worker when the app shuts down."""
    logger.info("Shutting down background response storage worker...")
    worker.stop()

@app.post("/chat")
async def chat(request: Request):
    """
    Handles incoming chat messages with Firebase storage.
    """
    data = await request.json()
    logger.info(f"Incoming request payload: {json.dumps(data, indent=2)}")

    try:
        user_message = data["message"]
        user_id = data.get("user_id", "anonymous")
        itinerary_id = data.get("itinerary_id", "default")

        # Use a combination of user_id and itinerary_id as session_id
        session_id = f"{user_id}_{itinerary_id}"

        # Firebase references
        messages_path = f"users/user_id/{user_id}/itineraries/{itinerary_id}/messages/message_id"
        messages_ref = db.reference(messages_path)
        typing_ref = db.reference(f"users/user_id/{user_id}/itineraries/{itinerary_id}/messages")
        state_ref = db.reference(f"users/user_id/{user_id}/itineraries/{itinerary_id}/state")

        logger.info(f"Using Firebase messages path: {messages_path}")

        # Check if session exists, if not create it
        session = await session_service.get_session(
            app_name="chat_app",
            user_id=user_id,
            id=session_id
        )

        if not session:
            logger.info(f"Creating new session: {session_id}")
            session = await session_service.create_session(
                app_name="chat_app",
                user_id=user_id,
                id=session_id,
                state={}
            )
        else:
            logger.info(f"Using existing session: {session_id}")

        # Set typing indicator to true
        logger.info("Setting typing indicator to True.")
        typing_ref.update({"typing": True})

        # Generate a unique correlation_id for this specific message
        correlation_id = str(uuid.uuid4())

        logger.info(f"Received message from {user_id}: {user_message}")
        
        # Create and enqueue a new task for the router_agent
        task_payload = TaskPayload(
            task_name="route_request",
            parameters={
                "user_request": user_message,
                "session_id": session_id,
                "user_id": user_id,
                "itinerary_id": itinerary_id
            }
        )

        initial_message = Message(
            header=Header(
                correlation_id=correlation_id,
                message_type="TASK",
                source_agent="user_interface",
                target_agent="router_agent",
                reply_to_channel="results:user_interface"
            ),
            payload=task_payload
        )

        main_queue = "tasks:router_agent"
        broker.enqueue_task(main_queue, initial_message.model_dump())
        
        logger.info(f"Enqueued task for router_agent with correlation_id: {correlation_id}")

        return {"status": "success", "correlation_id": correlation_id}

    except Exception as e:
        logger.error(f"Error processing request: {e}", exc_info=True)
        # Set typing indicator to false on error
        try:
            logger.warning("Attempting to set typing indicator to False after error.")
            typing_ref.update({"typing": False})
        except Exception as db_e:
            logger.error(f"Could not set typing to false after an error: {db_e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/get_response/{correlation_id}")
async def get_response(correlation_id: str, user_id: str, itinerary_id: str):
    """
    Retrieves the response for a given correlation_id.
    NOTE: The background worker now handles Firebase storage automatically.
    This endpoint is kept for backward compatibility and polling.
    """
    try:
        # Check if response has been processed by checking Firebase directly
        messages_path = f"users/user_id/{user_id}/itineraries/{itinerary_id}/messages/message_id"
        messages_ref = db.reference(messages_path)

        # Get recent messages to check if response was already stored
        messages = messages_ref.order_by_child("timestamp").limit_to_last(10).get()

        if messages:
            # Check if we have an agent response after the user's message
            for msg_id, msg_data in messages.items():
                if msg_data.get("sender") == "agent":
                    logger.info(f"Found agent response in Firebase for correlation_id: {correlation_id}")
                    state_ref = db.reference(f"users/user_id/{user_id}/itineraries/{itinerary_id}/state")
                    state = state_ref.get()
                    logger.info(f"State for correlation_id {correlation_id}: {json.dumps(state, indent=2)}")
                    return {
                        "status": "success",
                        "response": msg_data.get("message", ""),
                        "message_type": msg_data.get("message_type", "text"),
                        "activity_type": msg_data.get("activityType"),
                        "activity_object": msg_data.get("activity_object")
                    }

        # If no response yet, just return pending status
        logger.info(f"Response pending for correlation_id: {correlation_id}")
        return {"status": "pending"}

    except Exception as e:
        logger.error(f"Error retrieving response: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8014))
    logger.info(f"Starting FastAPI server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)