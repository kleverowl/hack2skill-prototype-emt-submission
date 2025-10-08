import json
import os
import logging
from typing import Any, Dict, List
from pydantic import BaseModel

from google.adk.agents.callback_context import CallbackContext
from google.adk.tools import ToolContext
from .models import ItineraryState
from . import constants

logger = logging.getLogger(__name__)

# Construct the path to the eval directory relative to this file.
_CURRENT_FILE_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_CURRENT_FILE_DIR, ".."))
SAMPLE_SCENARIO_PATH = os.path.join(_PROJECT_ROOT, "eval", "event_plan_default.json")

# Firebase state service - will be injected from main agent
_firebase_service = None
_current_user_id = None
_current_itinerary_id = None

def set_firebase_context(firebase_service, user_id: str, itinerary_id: str):
    """Set Firebase service and context for the current request."""
    global _firebase_service, _current_user_id, _current_itinerary_id
    _firebase_service = firebase_service
    _current_user_id = user_id
    _current_itinerary_id = itinerary_id

def _load_precreated_eventplan(callback_context: CallbackContext):
    """
    Sets up the initial state from Firebase or loads empty template.
    This gets called before the system instruction is constructed.

    Args:
        callback_context: The callback context.
    """
    if "itinerary_state" in callback_context.state:
        logger.info("State already exists in callback_context, skipping load")
        return

    initial_state = None

    # Try to load from Firebase if context is available
    if _firebase_service and _current_user_id and _current_itinerary_id:
        logger.info(f"Loading state from Firebase for user={_current_user_id}, itinerary={_current_itinerary_id}")
        try:
            firebase_state = _firebase_service.get_state(_current_user_id, _current_itinerary_id)
            if firebase_state:
                initial_state = firebase_state
                logger.info("Successfully loaded state from Firebase")
            else:
                logger.info("No existing state in Firebase, loading empty template")
        except Exception as e:
            logger.error(f"Error loading state from Firebase: {e}", exc_info=True)

    # If no Firebase state, load empty template
    if initial_state is None:
        data = {}
        try:
            with open(SAMPLE_SCENARIO_PATH, "r") as file:
                data = json.load(file)
                logger.info(f"Loading empty state template from {SAMPLE_SCENARIO_PATH}")
        except FileNotFoundError:
            logger.error(f"Error: {SAMPLE_SCENARIO_PATH} not found. Creating default empty state.")
        except json.JSONDecodeError:
            logger.error(f"Error: Invalid JSON in {SAMPLE_SCENARIO_PATH}. Creating default empty state.")

        # Ensure the loaded data matches the ItineraryState structure
        if "state" in data and isinstance(data["state"], dict):
            initial_state = ItineraryState(**data["state"])
        else:
            initial_state = ItineraryState()

    callback_context.state["itinerary_state"] = initial_state.model_dump()
    callback_context.state[constants.STATE_INITIALIZED] = True
    callback_context.state[constants.USER_EXIST] = False

    # Store context IDs so delegate_task can access them
    callback_context.state["user_id"] = _current_user_id
    callback_context.state["itinerary_id"] = _current_itinerary_id
    # session_id will be set by main_agent

    logger.info("State loaded successfully into callback_context")

def get_state(tool_context: ToolContext) -> ItineraryState:
    """
    Gets the current itinerary state from the tool context.
    Assumes _load_precreated_plan has already initialized the state.
    """
    state_dict = tool_context.state.get("itinerary_state", {})
    return ItineraryState(**state_dict)

def update_state(tool_context: ToolContext, state: ItineraryState):
    """
    Updates the itinerary state in the tool context.
    """
    tool_context.state["itinerary_state"] = state.dict()


def _update_nested_field(obj: Any, keys: List[str], value: Any):
    """
    Recursively traverses the object structure to update a nested field.
    """
    key = keys[0]
    if len(keys) == 1:
        if isinstance(obj, BaseModel):
            setattr(obj, key, value)
        elif isinstance(obj, dict):
            obj[key] = value
        elif isinstance(obj, list):
            obj[int(key)] = value
        return

    next_obj = None
    if isinstance(obj, BaseModel):
        next_obj = getattr(obj, key)
    elif isinstance(obj, dict):
        next_obj = obj.get(key)
    elif isinstance(obj, list):
        try:
            next_obj = obj[int(key)]
        except IndexError:
            # If the index is out of bounds, we cannot proceed.
            # This case might need specific handling based on requirements,
            # such as appending to the list if the index is equivalent to the list's length.
            return

    if next_obj is not None:
        _update_nested_field(next_obj, keys[1:], value)


def update_state_field(tool_context: ToolContext, key: str, value: Any) -> str:
    """
    Updates a single field in the itinerary state and syncs to Firebase.
    """
    # Update local state
    state = get_state(tool_context)
    keys = key.split('.')
    _update_nested_field(state, keys, value)
    update_state(tool_context, state)

    # Sync to Firebase if context is available
    if _firebase_service and _current_user_id and _current_itinerary_id:
        try:
            _firebase_service.update_partial_state(_current_user_id, _current_itinerary_id, key, value)
            logger.info(f"Synced state field '{key}' to Firebase")
        except Exception as e:
            logger.error(f"Error syncing state field to Firebase: {e}", exc_info=True)

    return "Itinerary state updated successfully."


def get_current_state(tool_context: ToolContext) -> Dict[str, Any]:
    """
    Gets the current itinerary state as a dictionary.
    """
    state = get_state(tool_context)
    return state.dict()
