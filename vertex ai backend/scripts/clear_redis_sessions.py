"""
Script to clear all Redis sessions to remove old conversation history.
This is useful when we've updated the agent behavior and want to start fresh.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from message_broker import MessageBroker

def clear_all_sessions():
    # Use MessageBroker which already has Redis connection
    broker = MessageBroker()
    redis_client = broker.redis_client

    # Get all session keys
    session_keys = redis_client.keys("session:*")

    if not session_keys:
        print("No sessions found in Redis")
        return

    print(f"Found {len(session_keys)} sessions in Redis")

    # Delete all session keys
    for key in session_keys:
        redis_client.delete(key)
        print(f"Deleted: {key}")

    print(f"\nCleared {len(session_keys)} sessions from Redis")
    print("Old conversation history removed. New conversations will start fresh.")

if __name__ == "__main__":
    clear_all_sessions()
