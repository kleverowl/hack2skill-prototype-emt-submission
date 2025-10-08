import redis
import json
import threading
import logging
import os
import re
from typing import Callable

# --- Setup structured logging ---
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, "broker.log")

# Create a logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create a file handler and set the formatter
file_handler = logging.FileHandler(log_file)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)

# Add the handler to the logger
if not logger.handlers:
    logger.addHandler(file_handler)

class MessageBroker:
    """
    A centralized class for handling Redis communication, using Lists for reliable
    task queuing and Pub/Sub for ephemeral events, as per the ARCHITECTURE_GUIDE.md.
    """

    def __init__(self):
        """Initializes the connection to Redis using environment variables."""
        redis_host = "localhost"
        port_str = "".join(filter(str.isdigit, os.getenv("REDIS_PORT", "6379")))
        redis_port = int(port_str) if port_str else 6379
        redis_password = os.getenv("REDIS_PASSWORD", None)
        redis_db = int(os.getenv("REDIS_DB", "0"))

        try:
            self.redis_client = redis.Redis(host=redis_host, port=redis_port, password=redis_password, db=redis_db, decode_responses=True)
            self.redis_client.ping() # Check the connection
            logger.info(f"MessageBroker initialized and connected to Redis at {redis_host}:{redis_port} (DB: {redis_db}).")
        except redis.exceptions.ConnectionError as e:
            logger.error(f"Could not connect to Redis at {redis_host}:{redis_port}. Please check your REDIS_HOST and REDIS_PORT environment variables. Error: {e}")
            raise
            
        self.pubsub = self.redis_client.pubsub(ignore_subscribe_messages=True)
        self.subscriber_thread = None
        self.callbacks = {}

    def enqueue_task(self, queue_name: str, task: dict):
        """Adds a critical task to a reliable queue (Redis List)."""
        payload = json.dumps(task)
        self.redis_client.lpush(queue_name, payload)
        logger.info(f"Enqueued task on '{queue_name}'. Correlation ID: {task.get('header', {}).get('correlation_id')}")

    def publish_event(self, channel: str, message: dict):
        """Publishes a non-critical event to a Pub/Sub channel."""
        payload = json.dumps(message)
        self.redis_client.publish(channel, payload)
        logger.info(f"Published event to '{channel}'.")

    def _message_handler(self, message: dict):
        """Internal wrapper to decode and route messages from Pub/Sub."""
        try:
            channel = message['channel']
            if channel in self.callbacks:
                data = json.loads(message['data'])
                logger.info(f"Received Pub/Sub message on '{channel}'.")
                self.callbacks[channel](data)
        except Exception as e:
            logger.error(f"Error in pub/sub message handler: {e}", exc_info=True)

    def subscribe_to_channel(self, channel: str, callback: Callable):
        """Subscribes to a Pub/Sub channel for non-critical events."""
        if channel not in self.callbacks:
            self.pubsub.subscribe(**{channel: self._message_handler})
            logger.info(f"Subscribed to Pub/Sub channel: {channel}")
        self.callbacks[channel] = callback
        
        if not self.subscriber_thread or not self.subscriber_thread.is_alive():
            self.subscriber_thread = self.pubsub.run_in_thread(sleep_time=0.01, daemon=True)

    def get_task_non_blocking(self, queue_name: str) -> dict | None:
        """
        Retrieves a task from a reliable queue (Redis List) in a non-blocking manner.
        """
        try:
            task_json = self.redis_client.rpop(queue_name)
            if task_json is None:
                return None
            logger.info(f"Popped task from '{queue_name}'.")
            return json.loads(task_json)
        except (TypeError, json.JSONDecodeError) as e:
            logger.error(f"Error decoding task from queue {queue_name}: {e}")
            return None

    def start_atomic_task(self, main_queue: str, processing_queue: str, timeout: int = 0) -> dict | None:
        """Atomically moves a task from the main queue to a worker-specific processing queue."""
        try:
            logger.info(f"Atomically waiting for task from '{main_queue}' to move to '{processing_queue}'.")
            task_json = self.redis_client.brpoplpush(main_queue, processing_queue, timeout)
            if task_json is None:
                return None
            task = json.loads(task_json)
            logger.info(f"Started atomic task. Moved from '{main_queue}' to '{processing_queue}'. Correlation ID: {task.get('header', {}).get('correlation_id')}")
            return task
        except (TypeError, json.JSONDecodeError) as e:
            logger.error(f"Error decoding atomic task: {e}", exc_info=True)
            return None

    def finish_atomic_task(self, processing_queue: str, task: dict):
        """Removes a successfully processed task from the processing queue."""
        task_json = json.dumps(task)
        result = self.redis_client.lrem(processing_queue, 1, task_json)
        if result > 0:
            logger.info(f"Finished atomic task. Removed from '{processing_queue}'. Correlation ID: {task.get('header', {}).get('correlation_id')}")
        else:
            logger.warning(f"Could not find task to remove from '{processing_queue}'. Race condition? Correlation ID: {task.get('header', {}).get('correlation_id')}")

    def requeue_failed_task(self, processing_queue: str, main_queue: str, task: dict):
        """Atomically moves a failed task from the processing queue back to the main queue for a retry."""
        task_json = json.dumps(task)
        self.redis_client.lpush(main_queue, task_json)
        self.redis_client.lrem(processing_queue, 1, task_json)
        logger.warning(f"Re-queued failed task from '{processing_queue}' to '{main_queue}'. Correlation ID: {task.get('header', {}).get('correlation_id')}")

    def move_to_dlq(self, processing_queue: str, dlq_name: str, task: dict):
        """Moves a task that has exhausted its retries to the Dead-Letter Queue."""
        task_json = json.dumps(task)
        self.redis_client.lpush(dlq_name, task_json)
        self.redis_client.lrem(processing_queue, 1, task_json)
        logger.error(f"Moved task to DLQ '{dlq_name}' from '{processing_queue}'. Correlation ID: {task.get('header', {}).get('correlation_id')}")

    def unsubscribe(self):
        """Stops the subscriber thread and unsubscribes from all channels."""
        if self.subscriber_thread:
            self.subscriber_thread.stop()
        self.pubsub.unsubscribe()
        logger.info("Unsubscribed from all channels and stopped subscriber thread.")