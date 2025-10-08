
from pydantic import BaseModel, Field
from typing import Dict, Any, Literal, List
import uuid
from datetime import datetime, timezone

def get_utc_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()

def create_message_id() -> str:
    return str(uuid.uuid4())

class Header(BaseModel):
    message_id: str = Field(default_factory=create_message_id)
    correlation_id: str # Tracks the entire user request journey
    task_id: str | None = None # ID for a specific task-response loop
    timestamp: str = Field(default_factory=get_utc_timestamp)
    message_type: Literal["TASK", "RESULT", "CLARIFICATION_REQUEST", "ERROR", "EVENT"]
    source_agent: str
    target_agent: str | None = None
    reply_to_channel: str | None = None

class TaskPayload(BaseModel):
    task_name: str
    parameters: Dict[str, Any]
    retry_count: int = 0

class ResultPayload(BaseModel):
    status: Literal["SUCCESS", "FAILURE"]
    data: Any
    error_message: str | None = None

class ClarificationPayload(BaseModel):
    question: str
    options: List[str] | None = None

class EventPayload(BaseModel):
    event_name: str
    data: Dict[str, Any]

class ErrorPayload(BaseModel):
    error_code: str
    error_message: str

class Message(BaseModel):
    header: Header
    payload: TaskPayload | ResultPayload | ClarificationPayload | EventPayload | ErrorPayload

    def to_json(self):
        return self.model_dump_json()

    @classmethod
    def from_json(cls, json_str: str):
        return cls.model_validate_json(json_str)
