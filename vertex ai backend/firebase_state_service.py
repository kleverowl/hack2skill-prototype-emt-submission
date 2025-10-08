"""
Firebase State Service for managing itinerary state across all agents.
Provides a centralized way to load and save state to Firebase Realtime Database.
"""
import os
import logging
import json
from typing import Optional, Any, Dict
import firebase_admin
from firebase_admin import credentials, db
from main_agent.models import ItineraryState

logger = logging.getLogger(__name__)

class FirebaseStateService:
    _instance = None
    _initialized = False

    def __new__(cls, cred_path: Optional[str] = None):
        if cls._instance is None:
            cls._instance = super(FirebaseStateService, cls).__new__(cls)
        return cls._instance

    def __init__(self, cred_path: Optional[str] = None):
        """Initialize Firebase connection (singleton pattern).

        Args:
            cred_path: Optional path to Firebase credentials file.
                      If not provided, uses GOOGLE_APPLICATION_CREDENTIALS from environment.
        """
        if not FirebaseStateService._initialized:
            try:
                # Get credentials from parameter or environment
                if cred_path is None:
                    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

                database_url = os.getenv("FIREBASE_DATABASE_URL")

                if not cred_path or not database_url:
                    raise ValueError("Firebase credentials not found. Provide cred_path or set GOOGLE_APPLICATION_CREDENTIALS environment variable")

                # Initialize Firebase Admin SDK
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {
                    'databaseURL': database_url
                })

                logger.info(f"Firebase initialized successfully with database: {database_url}")
                FirebaseStateService._initialized = True
            except Exception as e:
                logger.error(f"Failed to initialize Firebase: {e}", exc_info=True)
                raise

    def _get_state_path(self, user_id: str, itinerary_id: str) -> str:
        """Get the Firebase path for a specific itinerary state."""
        return f"users/user_id/{user_id}/itineraries/{itinerary_id}/state"

    def get_state(self, user_id: str, itinerary_id: str) -> Optional[ItineraryState]:
        """
        Load itinerary state from Firebase.

        Args:
            user_id: Firebase user ID
            itinerary_id: Itinerary ID

        Returns:
            ItineraryState object if exists, None otherwise
        """
        try:
            path = self._get_state_path(user_id, itinerary_id)
            ref = db.reference(path)
            state_data = ref.get()

            if state_data is None:
                logger.info(f"No state found in Firebase for user={user_id}, itinerary={itinerary_id}")
                return None

            logger.info(f"Loaded state from Firebase for user={user_id}, itinerary={itinerary_id}")

            # Convert Firebase data to ItineraryState
            return ItineraryState(**state_data)
        except Exception as e:
            logger.error(f"Error loading state from Firebase: {e}", exc_info=True)
            return None

    def update_state(self, user_id: str, itinerary_id: str, state: ItineraryState) -> bool:
        """
        Save complete itinerary state to Firebase.

        Args:
            user_id: Firebase user ID
            itinerary_id: Itinerary ID
            state: ItineraryState object to save

        Returns:
            True if successful, False otherwise
        """
        try:
            path = self._get_state_path(user_id, itinerary_id)
            ref = db.reference(path)

            # Convert ItineraryState to dict
            state_dict = state.model_dump()

            # Save to Firebase
            ref.set(state_dict)

            logger.info(f"Saved state to Firebase for user={user_id}, itinerary={itinerary_id}")
            return True
        except Exception as e:
            logger.error(f"Error saving state to Firebase: {e}", exc_info=True)
            return False

    def update_partial_state(self, user_id: str, itinerary_id: str, path: str, value: Any) -> bool:
        """
        Update a specific field in the state. If the value is a dictionary,
        it will be merged with the existing data. Otherwise, it will be overwritten.

        Args:
            user_id: Firebase user ID
            itinerary_id: Itinerary ID
            path: Dot-separated path to field (e.g., "user_details.name" or "user_details")
            value: Value to set. If a dict, it will be merged.

        Returns:
            True if successful, False otherwise
        """
        try:
            base_path = self._get_state_path(user_id, itinerary_id)
            # Convert dot notation to Firebase path
            field_path = f"{base_path}/{path.replace('.', '/')}"
            ref = db.reference(field_path)

            if isinstance(value, dict):
                ref.update(value)
                logger.info(f"Merged Firebase state field {path} for user={user_id}, itinerary={itinerary_id}")
            else:
                ref.set(value)
                logger.info(f"Set Firebase state field {path} for user={user_id}, itinerary={itinerary_id}")

            return True
        except Exception as e:
            logger.error(f"Error updating partial state in Firebase: {e}", exc_info=True)
            return False

    def delete_state(self, user_id: str, itinerary_id: str) -> bool:
        """
        Delete itinerary state from Firebase.

        Args:
            user_id: Firebase user ID
            itinerary_id: Itinerary ID

        Returns:
            True if successful, False otherwise
        """
        try:
            path = self._get_state_path(user_id, itinerary_id)
            ref = db.reference(path)
            ref.delete()

            logger.info(f"Deleted state from Firebase for user={user_id}, itinerary={itinerary_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting state from Firebase: {e}", exc_info=True)
            return False

    def state_exists(self, user_id: str, itinerary_id: str) -> bool:
        """
        Check if state exists in Firebase.

        Args:
            user_id: Firebase user ID
            itinerary_id: Itinerary ID

        Returns:
            True if state exists, False otherwise
        """
        try:
            path = self._get_state_path(user_id, itinerary_id)
            ref = db.reference(path)
            state_data = ref.get()
            return state_data is not None
        except Exception as e:
            logger.error(f"Error checking state existence in Firebase: {e}", exc_info=True)
            return False