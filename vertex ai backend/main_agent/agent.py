import os
from google.adk.agents import Agent
from main_agent.memory import _load_precreated_eventplan
from main_agent.prompt import ROOT_AGENT_PROMPT
from main_agent.tools import TOOLS
from flight_agent.agent import agent as flight_agent
from weather_agent.agent import agent as weather_agent
from food_agent.agent import agent as food_agent
from activity_agent.agent import agent as activity_agent
from budget_agent.agent import agent as budget_agent
from cab_agent.agent import agent as cab_agent
from currency_agent.agent import agent as currency_agent
from document_agent.agent import agent as document_agent
from hotel_agent.agent import agent as hotel_agent

root_agent = Agent(
    model=os.getenv("MODEL_NAME", "gemini-2.5-flash"),
    name="main_agent",
    description="A service provider assistant which helps users find appropriate service providers and businesses related to their events.",
    instruction=ROOT_AGENT_PROMPT,
    tools=list(TOOLS.values()),
    sub_agents=[
        flight_agent,
        weather_agent,
        food_agent,
        activity_agent,
        budget_agent,
        cab_agent,
        currency_agent,
        document_agent,
        hotel_agent
    ],
    before_agent_callback=[
        _load_precreated_eventplan
    ]
)

import json
import logging
import asyncio
import time
import sys
from message_broker import MessageBroker
from message_protocol import Message, Header, ResultPayload, TaskPayload
from google.adk.runners import Runner
from redis_session_service import RedisSessionService
from firebase_state_service import FirebaseStateService
from google.genai import types
from main_agent.memory import set_firebase_context

# Configure logging to output to stderr with detailed formatting
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s:%(name)s:%(message)s',
    stream=sys.stderr,
    force=True
)
logger = logging.getLogger(__name__)

class MainAgent:
    def __init__(self):
        self.broker = MessageBroker()
        self.agent_name = "main_agent"
        self.llm_agent = root_agent
        # Redis session service for conversation history only
        self.session_service = RedisSessionService()
        # Firebase service for itinerary state management
        cred_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'hack2skill-emt-firebase-adminsdk-fbsvc-b2ea50c49d.json'))
        self.firebase_service = FirebaseStateService(cred_path=cred_path)
        # Use "chat_app" to match the app_name in chat_backend.py
        self.app_name = "chat_app"
        self.runner = Runner(
            agent=self.llm_agent,
            app_name=self.app_name,
            session_service=self.session_service
        )
        logger.info(f"[{self.agent_name}] Initialized with runner, app_name={self.app_name}")
        logger.info(f"[{self.agent_name}] Firebase state service initialized")

    async def _invoke_llm_sync(self, user_request: str, session_id: str, user_id: str = "user", itinerary_id: str = "default") -> str:
        """Invokes the agent's LLM synchronously using the Runner."""
        async def _run_async():
            logger.info(f"[{self.agent_name}] Invoking runner for user: {user_id}, session: {session_id}, itinerary: {itinerary_id}")

            # Set Firebase context before invoking runner
            set_firebase_context(self.firebase_service, user_id, itinerary_id)
            logger.info(f"[{self.agent_name}] Firebase context set for user={user_id}, itinerary={itinerary_id}")

            # Get or create session and inject context IDs
            session = await self.session_service.get_session(
                app_name=self.runner.app_name,
                user_id=user_id,
                id=session_id
            )
            if not session:
                logger.info(f"[{self.agent_name}] No session found for {session_id}. Creating a new one.")
                session = await self.session_service.create_session(
                    app_name=self.runner.app_name,
                    user_id=user_id,
                    id=session_id,
                    state={}
                )
            else:
                logger.info(f"[{self.agent_name}] Loaded existing session for {session_id}")
                logger.info(f"[{self.agent_name}] Session has {len(session.events) if session.events else 0} events")
                logger.info(f"[{self.agent_name}] Session state keys: {list(session.state.keys())}")

            # Inject session_id, user_id, and itinerary_id into state for delegate_task and tool access
            session.state["session_id"] = session_id
            session.state["user_id"] = user_id
            session.state["itinerary_id"] = itinerary_id
            await self.session_service.update_session(session)
            logger.info(f"[{self.agent_name}] Injected session_id, user_id, and itinerary_id into session state")

            # --- Check for pending profile confirmation ---
            if "pending_user_profile" in session.state:
                logger.info(f"[{self.agent_name}] Detected pending user profile - processing user's response")

                # Parse user response for yes/no
                user_response_lower = user_request.lower().strip()
                is_affirmative = any(word in user_response_lower for word in ["yes", "yeah", "yep", "sure", "ok", "okay", "y"])

                if is_affirmative:
                    logger.info(f"[{self.agent_name}] User confirmed - moving pending profile to user_profile")
                    session.state["user_profile"] = session.state["pending_user_profile"]
                else:
                    logger.info(f"[{self.agent_name}] User declined - discarding pending profile")
                    session.state["user_profile"] = {}

                # Clean up pending profile and mark sync complete
                del session.state["pending_user_profile"]
                session.state["sync_user_profile"] = True
                await self.session_service.update_session(session)
                logger.info(f"[{self.agent_name}] Processed pending profile confirmation and set sync_user_profile to True")

            # --- Load user profile on new conversation ---
            # Check if this is a new conversation by checking sync_user_profile flag
            # If sync_user_profile is False, it means we haven't asked the user about their profile yet
            sync_user_profile = session.state.get("sync_user_profile", False)
            is_new_conversation = not sync_user_profile
            logger.info(f"[{self.agent_name}] sync_user_profile flag: {sync_user_profile}")
            logger.info(f"[{self.agent_name}] Is new conversation: {is_new_conversation}")

            profile_question_asked = False
            modified_user_request = user_request  # Keep original, modify if needed

            if is_new_conversation:
                try:
                    from main_agent.tools import fetch_user_profile_by_id

                    logger.info(f"[{self.agent_name}] New conversation detected - fetching user profile for user_id: {user_id}")

                    # Fetch profile directly
                    profile_data = fetch_user_profile_by_id(user_id)

                    if profile_data and profile_data != {}:
                        logger.info(f"[{self.agent_name}] User profile loaded successfully from tool")
                        logger.info(f"[{self.agent_name}] Profile data: {json.dumps(profile_data, indent=2)}")
                        session.state["pending_user_profile"] = profile_data

                        # Build comprehensive profile summary
                        profile = profile_data.get('profile', {})
                        prefs = profile.get('preferences', {})
                        companions = profile_data.get('companion', {}).get('companion_id', {})

                        profile_summary = f"Profile Details:\n"
                        profile_summary += f"• Name: {profile.get('firstname', 'N/A')} {profile.get('lastname', 'N/A')}\n"
                        profile_summary += f"• Email: {profile.get('email', 'N/A')}\n"
                        profile_summary += f"• Phone: {profile.get('phone', 'N/A')}\n"
                        profile_summary += f"• Gender: {profile.get('gender', 'N/A')}\n"
                        profile_summary += f"• Address: {profile.get('address', 'N/A')}\n"
                        profile_summary += f"• Preferences: Travel themes: {', '.join(prefs.get('travel_theme', [])) or 'None'}, "
                        profile_summary += f"Cuisine: {', '.join(prefs.get('cuisine_preferences', [])) or 'None'}, "
                        profile_summary += f"Dietary: {', '.join(prefs.get('dietary_restrictions', [])) or 'None'}\n"
                        if companions:
                            profile_summary += f"• Companions: {len(companions)} person(s) - {', '.join([c.get('name', 'Unknown') for c in companions.values()])}"

                        modified_user_request = f"[SYSTEM NOTE: I found your saved profile:\n{profile_summary}\n\nDo you want to USE this profile data for your current trip planning? If YES, I'll use all this data automatically. If NO, I'll ask you for details one by one. Please respond yes or no.]\n\nUser's actual message: {user_request}"
                        profile_question_asked = True
                        logger.info(f"[{self.agent_name}] Prepended comprehensive profile update question to user request")
                    else:
                        logger.info(f"[{self.agent_name}] No existing profile found for user_id: {user_id} (new user or empty profile)")
                        session.state["user_profile"] = {}
                        # Set sync to True since there's no profile to ask about
                        session.state["sync_user_profile"] = True

                    await self.session_service.update_session(session)
                    logger.info(f"[{self.agent_name}] Stored user_profile in session state")
                except Exception as e:
                    logger.error(f"[{self.agent_name}] Error loading user profile: {e}", exc_info=True)
                    session.state["user_profile"] = {}
                    session.state["sync_user_profile"] = True
                    await self.session_service.update_session(session)
            else:
                logger.info(f"[{self.agent_name}] Existing conversation - skipping profile load")
            # --- End of profile loading ---

            # The Runner will automatically handle session creation/retrieval via session_service
            # User profile is available in session.state["user_profile"] for agent to use
            # Agent will automatically use it when relevant based on prompt instructions
            content = types.Content(role='user', parts=[types.Part(text=modified_user_request)])
            final_response_text = ""
            all_response_parts = []

            try:
                event_count = 0
                logger.info(f"[{self.agent_name}] Starting runner.run_async...")
                async for event in self.runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
                    event_count += 1
                    logger.info(f"[{self.agent_name}] Event {event_count}: type={type(event).__name__}, is_final={event.is_final_response()}, has_content={event.content is not None}, turn_complete={event.turn_complete if hasattr(event, 'turn_complete') else 'N/A'}")

                    # Check finish_reason and error details
                    if hasattr(event, 'finish_reason'):
                        logger.info(f"[{self.agent_name}] finish_reason: {event.finish_reason}")
                    if hasattr(event, 'error_code') and event.error_code:
                        logger.error(f"[{self.agent_name}] error_code: {event.error_code}")
                    if hasattr(event, 'error_message') and event.error_message:
                        logger.error(f"[{self.agent_name}] error_message: {event.error_message}")

                    # Check for actions attribute
                    if hasattr(event, 'actions') and event.actions:
                        logger.info(f"[{self.agent_name}] Event has actions (truncated): {str(event.actions)[:500]}")

                    if event.content:
                        logger.info(f"[{self.agent_name}] Event content: role={event.content.role if hasattr(event.content, 'role') else 'N/A'}")
                        logger.info(f"[{self.agent_name}] Event content parts: {len(event.content.parts) if event.content.parts else 0}")
                        if event.content.parts:
                            for i, part in enumerate(event.content.parts):
                                logger.info(f"[{self.agent_name}] Part {i}: type={type(part).__name__}, has_text={hasattr(part, 'text')}, text_length={len(part.text) if hasattr(part, 'text') and part.text else 0}")
                                # Log first 200 chars of text if available
                                if hasattr(part, 'text') and part.text:
                                    logger.info(f"[{self.agent_name}] Part {i} text preview: {part.text[:200]}")
                                    all_response_parts.append(part.text)

                    # Collect text from all events
                    if event.content and event.content.parts:
                        for part in event.content.parts:
                            if hasattr(part, 'text') and part.text:
                                final_response_text += part.text
                                logger.info(f"[{self.agent_name}] Accumulated text, total length: {len(final_response_text)}")

                    # Don't break on first final, continue collecting
                    if event.is_final_response():
                        logger.info(f"[{self.agent_name}] Final response event detected")
                        # Continue to collect any remaining events

                logger.info(f"[{self.agent_name}] Total events processed: {event_count}")
                logger.info(f"[{self.agent_name}] All response parts collected: {len(all_response_parts)}")
            except Exception as e:
                logger.error(f"[{self.agent_name}] Error in _run_async: {e}", exc_info=True)

            # If we got no response from events, check if itinerary was created and generate appropriate response
            if not final_response_text:
                logger.warning(f"[{self.agent_name}] No text response generated from runner!")

                # Check if itinerary was just created
                try:
                    session = await self.session_service.get_session(
                        app_name=self.runner.app_name,
                        user_id=user_id,
                        id=session_id
                    )

                    if session and "itinerary_state" in session.state:
                        state = session.state["itinerary_state"]
                        itinerary_created = state.get("itinerary_created", False)
                        itinerary_data = state.get("itinerary", {})
                        specialist_results = state.get("specialist_results", {})

                        # Check if specialist results exist but itinerary wasn't generated
                        if specialist_results and len(specialist_results) > 3 and not itinerary_created:
                            logger.warning(f"[{self.agent_name}] Specialist results exist ({len(specialist_results)} agents) but itinerary not created!")
                            logger.info(f"[{self.agent_name}] Specialist agents: {list(specialist_results.keys())}")

                            # Try to extract key info from specialist results to show something useful
                            final_response_text = "I've gathered all the information from my specialist agents:\n\n"

                            if "flight_agent" in specialist_results:
                                final_response_text += "✈️ Flight options available\n"
                            if "hotel_agent" in specialist_results:
                                final_response_text += "🏨 Hotel recommendations ready\n"
                            if "activity_agent" in specialist_results:
                                final_response_text += "🎯 Activities and attractions found\n"
                            if "food_agent" in specialist_results:
                                final_response_text += "🍽️ Restaurant suggestions prepared\n"
                            if "weather_agent" in specialist_results:
                                final_response_text += "🌤️ Weather forecast obtained\n"
                            if "budget_agent" in specialist_results:
                                final_response_text += "💰 Budget breakdown calculated\n"
                            if "cab_agent" in specialist_results:
                                final_response_text += "🚗 Transportation options identified\n"

                            final_response_text += "\nI'm now creating your complete day-by-day itinerary. This will be ready in just a moment..."

                            # Log this issue for debugging
                            logger.error(f"[{self.agent_name}] LLM FAILED TO GENERATE ITINERARY after collecting specialist results!")

                        # If itinerary was created, generate a summary
                        elif itinerary_created and itinerary_data:
                            logger.info(f"[{self.agent_name}] Itinerary was created but no response text. Generating summary...")

                            trip_name = itinerary_data.get("trip_name", "Your trip")
                            origin = itinerary_data.get("origin", "")
                            destination = itinerary_data.get("destination", "")
                            start_date = itinerary_data.get("start_date", "")
                            end_date = itinerary_data.get("end_date", "")
                            days = itinerary_data.get("days", [])

                            final_response_text = f"Perfect! I've created your complete {len(days)}-day itinerary for {trip_name} from {origin} to {destination} ({start_date} to {end_date}).\n\n"

                            # Add day-by-day summary
                            for day in days:
                                day_num = day.get("day_number", "")
                                date = day.get("date", "")
                                schedule = day.get("schedule", [])
                                final_response_text += f"Day {day_num} ({date}):\n"

                                for activity in schedule[:3]:  # Show first 3 activities per day
                                    activity_type = activity.get("activity_type", "activity")
                                    description = activity.get("description", "")
                                    start_time = activity.get("start_time", "")
                                    final_response_text += f"  • {start_time} - {description}\n"

                                if len(schedule) > 3:
                                    final_response_text += f"  • ...and {len(schedule) - 3} more activities\n"
                                final_response_text += "\n"

                            final_response_text += "Your complete itinerary has been saved! Would you like to make any changes or adjustments?"
                        else:
                            # No itinerary created, use standard greeting
                            logger.info(f"[{self.agent_name}] No itinerary found. Using standard greeting...")
                            final_response_text = "Hello! I'm your travel planning assistant. I can help you plan amazing trips, find flights, hotels, activities, and create detailed itineraries. What would you like to plan today?"
                    else:
                        logger.info(f"[{self.agent_name}] No session state found. Using standard greeting...")
                        final_response_text = "Hello! I'm your travel planning assistant. I can help you plan amazing trips, find flights, hotels, activities, and create detailed itineraries. What would you like to plan today?"

                except Exception as fallback_error:
                    logger.error(f"[{self.agent_name}] Error generating fallback response: {fallback_error}", exc_info=True)
                    final_response_text = "Hello! I'm your travel planning assistant. I can help you plan amazing trips, find flights, hotels, activities, and create detailed itineraries. What would you like to plan today?"

            # Save the conversation session to Redis (conversation history only)
            try:
                session = await self.session_service.get_session(
                    app_name=self.runner.app_name,
                    user_id=user_id,
                    id=session_id
                )
                if session:
                    logger.info(f"[{self.agent_name}] Retrieved session after runner completion")
                    logger.info(f"[{self.agent_name}] Session now has {len(session.events) if session.events else 0} events")
                    logger.info(f"[{self.agent_name}] Session events: {session.events[:2] if session.events else []}")  # Log first 2 events

                    # Don't set sync_user_profile yet - wait for user's response
                    # The flag will be set after processing the user's yes/no answer

                    logger.info(f"[{self.agent_name}] Saving conversation session to Redis")
                    await self.session_service.update_session(session)
                else:
                    logger.warning(f"[{self.agent_name}] Could not retrieve session for saving")
            except Exception as e:
                logger.error(f"[{self.agent_name}] Error saving session: {e}", exc_info=True)

            # Save the itinerary state to Firebase
            try:
                from main_agent.memory import get_state
                from google.adk.tools import ToolContext

                # Get the final state from callback context
                # Note: We'll need to access this through the runner's session
                session = await self.session_service.get_session(
                    app_name=self.runner.app_name,
                    user_id=user_id,
                    id=session_id
                )

                if session and "itinerary_state" in session.state:
                    logger.info(f"[{self.agent_name}] Final itinerary state for session {session_id}: {json.dumps(session.state['itinerary_state'], indent=2)}")
                    from main_agent.models import ItineraryState
                    final_state = ItineraryState(**session.state["itinerary_state"])
                    success = self.firebase_service.update_state(user_id, itinerary_id, final_state)
                    if success:
                        logger.info(f"[{self.agent_name}] Saved final itinerary state to Firebase")
                    else:
                        logger.error(f"[{self.agent_name}] Failed to save state to Firebase")
                else:
                    logger.warning(f"[{self.agent_name}] No itinerary state found in session to save to Firebase")
            except Exception as e:
                logger.error(f"[{self.agent_name}] Error saving state to Firebase: {e}", exc_info=True)

            logger.info(f"[{self.agent_name}] Final response text from _run_async (length={len(final_response_text)}): {final_response_text[:200] if final_response_text else 'EMPTY'}")
            return final_response_text

        return await _run_async()

    def run(self):
        task_queue = f"tasks:{self.agent_name}"

        logger.info(f"[{self.agent_name}] is waiting for tasks on {task_queue}...")

        while True:
            try:
                task_message_dict = self.broker.get_task_non_blocking(task_queue)
                if task_message_dict:
                    try:
                        task_message = Message.model_validate(task_message_dict)
                        correlation_id = task_message.header.correlation_id
                        logger.info(f"[{self.agent_name}] Received task: {task_message.payload.task_name} with Correlation ID: {correlation_id}")

                        # Extract parameters
                        params = task_message.payload.parameters
                        user_request = params.get("user_request", "")
                        session_id = params.get("session_id", correlation_id)  # Fallback to correlation_id if not provided
                        user_id = params.get("user_id", "user")
                        itinerary_id = params.get("itinerary_id", "default")

                        logger.info(f"[{self.agent_name}] User: {user_id}, Session: {session_id}, Itinerary: {itinerary_id}, Request: {user_request[:100]}")

                        llm_response_str = asyncio.run(self._invoke_llm_sync(user_request, session_id, user_id, itinerary_id))
                        logger.info(f"[{self.agent_name}] Raw LLM response (length={len(llm_response_str)}): {llm_response_str[:200] if llm_response_str else 'EMPTY'}")

                        # For now, just send the response back to the user interface
                        reply_channel = "results:user_interface"
                        result_header = Header(
                            correlation_id=correlation_id,
                            message_type="RESULT",
                            source_agent=self.agent_name,
                            target_agent="user_interface"
                        )

                        # Build response data
                        response_data = {
                            "response": llm_response_str,
                            "user_id": user_id,
                            "itinerary_id": itinerary_id
                        }

                        # Add state information for response_storage_worker
                        # This includes itinerary_created flag which determines if activityType should be set
                        try:
                            async def get_final_state():
                                session = await self.session_service.get_session(
                                    app_name=self.runner.app_name,
                                    user_id=user_id,
                                    id=session_id
                                )
                                if session and "itinerary_state" in session.state:
                                    return session.state["itinerary_state"]
                                return {}

                            final_state = asyncio.run(get_final_state())
                            if final_state:
                                response_data["state"] = final_state
                                logger.info(f"[{self.agent_name}] Including state in response (itinerary_created={final_state.get('itinerary_created', False)})")
                        except Exception as e:
                            logger.warning(f"[{self.agent_name}] Could not extract state for response: {e}")

                        result_payload = ResultPayload(
                            status="SUCCESS",
                            data=response_data
                        )
                        result_message = Message(header=result_header, payload=result_payload)
                        self.broker.enqueue_task(reply_channel, result_message.model_dump())
                        logger.info(f"[{self.agent_name}] Sent response to {reply_channel}")

                    except Exception as e:
                        logger.error(f"[{self.agent_name}] Task failed: {e}", exc_info=True)
                else:
                    # Sleep for a short duration to avoid busy-waiting
                    time.sleep(0.1)
            except KeyboardInterrupt:
                logger.warning(f"[{self.agent_name}] Received interrupt signal, ignoring and continuing...")
                continue