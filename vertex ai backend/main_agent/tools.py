"""
Host Agent tools for dispatching tasks and managing state.
"""
import uuid
import logging
import json
from typing import Dict, Any, Optional, List
import requests

from pydantic import BaseModel
from firebase_admin import firestore

from message_broker import MessageBroker
from message_protocol import Header, TaskPayload, Message
from google.adk.tools import ToolContext
from main_agent.models import ItineraryState
from main_agent.memory import update_state_field, get_current_state

# Get the logger from the message_broker to use the same file
logger = logging.getLogger('message_broker')

# A single, shared broker instance for all tool calls.
broker = MessageBroker()

def delegate_task(
    tool_context: ToolContext,
    agent_name: str,
    task_description: str,
    correlation_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Delegates a task to a specified child agent asynchronously via the MessageBroker.
    Automatically passes user_id, itinerary_id, and session_id from context.
    """
    if not agent_name:
        return {"error": "Agent name must be provided."}

    if correlation_id is None:
        correlation_id = str(uuid.uuid4())
        logger.info(f"New correlation ID created for task delegation: {correlation_id}")

    queue_name = f"tasks:{agent_name}"
    reply_channel = "results:main"

    # Extract context parameters from tool_context.state
    user_id = tool_context.state.get("user_id", "user")
    itinerary_id = tool_context.state.get("itinerary_id", "default")
    session_id = tool_context.state.get("session_id", correlation_id)

    try:
        header = Header(
            correlation_id=correlation_id,
            task_id=str(uuid.uuid4()),
            message_type="TASK",
            source_agent="main_agent",
            target_agent=agent_name,
            reply_to_channel=reply_channel
        )
        payload = TaskPayload(
            task_name="execute_task",
            parameters={
                "task_description": task_description,
                "user_id": user_id,
                "itinerary_id": itinerary_id,
                "session_id": session_id
            }
        )
        message = Message(header=header, payload=payload)
        message_dump = message.model_dump()

        logger.info(f"DELEGATING task to {agent_name}. Message: {json.dumps(message_dump, indent=2)}")
        broker.enqueue_task(queue_name, message_dump)

        return {
            "status": "Task successfully delegated.",
            "correlation_id": correlation_id,
            "task_id": header.task_id,
            "details": f"Task for '{agent_name}' placed on queue '{queue_name}'."
        }
    except Exception as e:
        logger.error(f"Error delegating task to {agent_name}: {str(e)}", exc_info=True)
        return {"error": f"Error delegating task to {agent_name}: {str(e)}"}

def collect_specialist_results(
    tool_context: ToolContext,
    expected_agents: List[str],
    timeout_seconds: int = 60
) -> Dict[str, Any]:
    """
    Waits for and collects results from specialist agents.

    Args:
        tool_context: The tool context
        expected_agents: List of agent names to wait for (e.g., ["flight_agent", "hotel_agent"])
        timeout_seconds: Maximum time to wait for all results

    Returns:
        Dict mapping agent names to their results
    """
    import time

    results_channel = "results:main"
    collected_results = {}
    start_time = time.time()

    logger.info(f"Waiting for results from {len(expected_agents)} agents: {expected_agents}")
    logger.info(f"Timeout: {timeout_seconds} seconds")

    while len(collected_results) < len(expected_agents):
        elapsed = time.time() - start_time
        if elapsed > timeout_seconds:
            logger.warning(f"Timeout reached. Collected {len(collected_results)}/{len(expected_agents)} results")
            break

        # Try to get a result (non-blocking with short timeout)
        try:
            result_dict = broker.redis_client.blpop(results_channel, timeout=2)
            if result_dict:
                _, result_json = result_dict
                import json
                result_message = json.loads(result_json)

                # Parse the result message
                source_agent = result_message.get("header", {}).get("source_agent")
                correlation_id = result_message.get("header", {}).get("correlation_id")
                payload_data = result_message.get("payload", {}).get("data", {})

                if source_agent in expected_agents:
                    collected_results[source_agent] = payload_data
                    logger.info(f"Collected result from {source_agent} (correlation: {correlation_id})")
                    logger.info(f"Progress: {len(collected_results)}/{len(expected_agents)} results collected")
                else:
                    logger.warning(f"Received unexpected result from {source_agent}")

        except Exception as e:
            logger.error(f"Error collecting result: {e}", exc_info=True)

    # Store results in state for the agent to access
    for agent_name, result_data in collected_results.items():
        state_key = f"specialist_results.{agent_name}"
        try:
            update_state_field(tool_context, state_key, result_data)
            logger.info(f"Stored {agent_name} results in state at {state_key}")
        except Exception as e:
            logger.error(f"Error storing {agent_name} results in state: {e}")

    summary_message = f"""
SPECIALIST RESULTS COLLECTION COMPLETE:
- Collected {len(collected_results)}/{len(expected_agents)} agent results
- Results stored in state under specialist_results
- Agents that responded: {', '.join(collected_results.keys())}

CRITICAL NEXT STEP: You MUST now proceed to Step 3 - Construct the Itinerary.
1. Call get_current_state() to retrieve specialist results
2. Extract activity_object from each specialist's response
3. Generate the complete day-wise itinerary using all specialist data
4. Call update_state_field(key="itinerary", value=<itinerary_object>)
5. Call update_state_field(key="itinerary_created", value=true)
6. Present a user-friendly summary to the user

DO NOT ask clarifying questions. DO NOT restart the conversation. IMMEDIATELY generate the itinerary NOW.
"""

    return {
        "status": "complete",
        "collected": len(collected_results),
        "expected": len(expected_agents),
        "message": summary_message.strip(),
        "results": collected_results,
        "missing_agents": [a for a in expected_agents if a not in collected_results]
    }

def send_whatsapp_message(to_number: str, message: str) -> dict:
    """
    Sends a text message to a specified WhatsApp number using the WhatsApp Business API.
    """
    # This is a placeholder. In a real implementation, you would integrate with a WhatsApp API provider.
    logger.info(f"Sending WhatsApp message to {to_number}: {message}")
    return {"status": "success", "response": "Message sent successfully."}

# Base URL for your Firestore API
BASE_URL = "https://firestore.googleapis.com/v1/projects/hack2skill-emt/databases/(default)/documents"

def _parse_firestore_fields(fields: Dict[str, Any]) -> Dict[str, Any]:
    """Parses Firestore's complex field structure into a simple dictionary."""
    data = {}
    if not isinstance(fields, dict):
        return {}
    for key, value_dict in fields.items():
        if "stringValue" in value_dict:
            data[key] = value_dict["stringValue"]
        elif "integerValue" in value_dict:
            data[key] = int(value_dict["integerValue"])
        elif "doubleValue" in value_dict:
            data[key] = float(value_dict["doubleValue"])
        elif "booleanValue" in value_dict:
            data[key] = value_dict["booleanValue"]
        elif "mapValue" in value_dict and "fields" in value_dict["mapValue"]:
            data[key] = _parse_firestore_fields(value_dict["mapValue"]["fields"])
        elif "arrayValue" in value_dict and "values" in value_dict["arrayValue"]:
            data[key] = [list(v.values())[0] for v in value_dict["arrayValue"].get("values", [])]
        else:
            data[key] = None
    return data

def fetch_user_profile_by_id(user_id: str) -> Dict[str, Any]:
    """
    Helper function to fetch user profile from Firestore by user_id.
    Returns empty dict if user not found (graceful handling for new users).
    Can be called directly without ToolContext.
    Uses Firebase Admin SDK for authenticated access.
    """
    if not user_id:
        logger.error("fetch_user_profile_by_id: user_id is empty")
        return {}

    logger.info(f"fetch_user_profile_by_id: Fetching profile for user_id='{user_id}' from Firestore")

    try:
        # Get Firestore client (uses the already initialized Firebase Admin app)
        db = firestore.client()

        # Fetch the user document from the 'users' collection
        doc_ref = db.collection('users').document(user_id)
        doc = doc_ref.get()

        if not doc.exists:
            logger.info(f"fetch_user_profile_by_id: No profile found for user_id='{user_id}' (new user)")
            return {}

        # Get document data as dictionary
        profile_data = doc.to_dict()

        if profile_data:
            logger.info(f"fetch_user_profile_by_id: Successfully fetched profile for user_id='{user_id}'")
            logger.info(f"fetch_user_profile_by_id: Profile data keys: {list(profile_data.keys())}")
            logger.info(f"fetch_user_profile_by_id: Profile data: {json.dumps(profile_data, indent=2, default=str)}")
            return profile_data
        else:
            logger.warning(f"fetch_user_profile_by_id: Document exists but is empty for user_id='{user_id}'")
            return {}

    except Exception as e:
        logger.error(f"fetch_user_profile_by_id: Error fetching profile for user_id='{user_id}': {e}", exc_info=True)
        return {}

def get_user_profile(tool_context: ToolContext) -> Dict[str, Any]:
    """
    Fetches a user's profile from the 'users' collection in Firestore.
    The user_id is retrieved from the tool_context.
    Returns empty dict if user not found (graceful handling for new users).
    This is the tool version that uses ToolContext.
    """
    user_id = tool_context.state.get("user_id")
    if not user_id:
        logger.error("get_user_profile: user_id not found in tool_context.state")
        logger.error(f"get_user_profile: tool_context.state keys: {list(tool_context.state.keys())}")
        return {}

    logger.info(f"get_user_profile: Delegating to fetch_user_profile_by_id for user_id='{user_id}'")
    return fetch_user_profile_by_id(user_id)


TOOLS = {
    "delegate_task": delegate_task,
    "collect_specialist_results": collect_specialist_results,
    "update_state_field": update_state_field,
    "get_current_state": get_current_state,
    "get_user_profile": get_user_profile,
}
