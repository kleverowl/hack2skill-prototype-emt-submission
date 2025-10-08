import redis
import json
import os
import uuid
import base64
from google.adk.sessions.base_session_service import BaseSessionService
from google.adk.events import Event
from google.adk.sessions import Session, State

import re

class SessionJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle bytes and other non-serializable types."""
    def default(self, obj):
        if isinstance(obj, bytes):
            # Encode bytes as base64 string
            return {"__type__": "bytes", "data": base64.b64encode(obj).decode('utf-8')}
        if isinstance(obj, set):
            # Convert set to list
            return list(obj)
        return super().default(obj)

def decode_custom_types(obj):
    """Recursively decode custom types from JSON representation back to Python objects."""
    if isinstance(obj, dict):
        # Check if this is a bytes object
        if obj.get("__type__") == "bytes" and "data" in obj:
            return base64.b64decode(obj["data"])
        # Recursively process all dict values
        return {k: decode_custom_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        # Recursively process all list items
        return [decode_custom_types(item) for item in obj]
    else:
        return obj

class RedisSessionService(BaseSessionService):
    def __init__(self):
        redis_host = os.getenv("REDIS_HOST", "localhost").strip()
        redis_host = re.sub(r'[^\x00-\x7F]+', '', redis_host).strip()
        port_str = "".join(filter(str.isdigit, os.getenv("REDIS_PORT", "6379")))
        redis_port = int(port_str) if port_str else 6379
        redis_password = os.getenv("REDIS_PASSWORD", None)
        redis_db = int(os.getenv("REDIS_DB", "0"))

        self.redis_client = redis.Redis(host=redis_host, port=redis_port, password=redis_password, db=redis_db, decode_responses=True)

    async def create_session(self, app_name: str, user_id: str, id: str = None, session_id: str = None, state: State = None) -> Session:
        session_id = id or session_id or str(uuid.uuid4())
        session = Session(app_name=app_name, user_id=user_id, id=session_id, state=state or {})
        self.redis_client.hset(f"session:{session_id}", "session_data", json.dumps(session.model_dump(), cls=SessionJSONEncoder))
        return session

    async def get_session(self, app_name: str, user_id: str, id: str = None, session_id: str = None) -> Session | None:
        session_id = id or session_id
        if not session_id:
            return None
        session_data = self.redis_client.hget(f"session:{session_id}", "session_data")
        if session_data:
            session_dict = json.loads(session_data)
            # Decode custom types (bytes, etc.) back to Python objects
            session_dict = decode_custom_types(session_dict)
            return Session.model_validate(session_dict)
        return None

    async def update_session(self, session: Session):
        self.redis_client.hset(f"session:{session.id}", "session_data", json.dumps(session.model_dump(), cls=SessionJSONEncoder))

    async def append_event(self, session: Session, event):
        """Override to persist events to Redis immediately."""
        # Call parent method to add event to session.events in memory
        event = await super().append_event(session, event)
        # Persist the updated session to Redis
        await self.update_session(session)
        return event

    async def delete_session(self, app_name: str, user_id: str, id: str = None, session_id: str = None):
        session_id = id or session_id
        if session_id:
            self.redis_client.delete(f"session:{session_id}")

    async def list_sessions(self, app_name: str, user_id: str) -> list[str]:
        # This is not trivial to implement with the current schema.
        # For now, we will return an empty list.
        return []
