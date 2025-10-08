import json
import logging
import asyncio
import os
import sys
from message_broker import MessageBroker
from message_protocol import Message, Header, ResultPayload
from weather_agent.agent import agent
from google.adk.runners import Runner
from redis_session_service import RedisSessionService
from firebase_state_service import FirebaseStateService
from main_agent.memory import set_firebase_context
from google.genai import types

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s:%(name)s:%(message)s',
    stream=sys.stderr,
    force=True
)
logger = logging.getLogger(__name__)

class WeatherAgentExecutor:
    def __init__(self):
        self.broker = MessageBroker()
        self.agent_name = "weather_agent"
        self.llm_agent = agent

        # Redis session service for conversation history
        self.session_service = RedisSessionService()

        # Firebase service for state management
        cred_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'hack2skill-emt-firebase-adminsdk-fbsvc-b2ea50c49d.json'))
        self.firebase_service = FirebaseStateService(cred_path=cred_path)

        # Use consistent app_name
        self.app_name = "chat_app"

        self.runner = Runner(
            agent=self.llm_agent,
            app_name=self.app_name,
            session_service=self.session_service
        )
        logger.info(f"[{self.agent_name}] Initialized with Firebase state service")

    async def _invoke_llm_sync(self, user_request: str, session_id: str, user_id: str, itinerary_id: str) -> str:
        """Invokes the agent's LLM synchronously using the Runner."""
        logger.info(f"[{self.agent_name}] Invoking runner for user: {user_id}, session: {session_id}, itinerary: {itinerary_id}")

        # Set Firebase context before invoking runner
        set_firebase_context(self.firebase_service, user_id, itinerary_id)
        logger.info(f"[{self.agent_name}] Firebase context set")

        content = types.Content(role='user', parts=[types.Part(text=user_request)])
        final_response_text = ""

        async for event in self.runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if hasattr(part, 'text') and part.text:
                        final_response_text += part.text

        logger.info(f"[{self.agent_name}] Final response length: {len(final_response_text)}")
        return final_response_text

    def run(self):
        main_queue = f"tasks:{self.agent_name}"
        processing_queue = f"processing:{self.agent_name}"
        dlq = f"dlq:{self.agent_name}"
        max_retries = 3

        logger.info(f"[{self.agent_name}] is waiting for tasks on {main_queue}...")
        while True:
            task_message_dict = self.broker.start_atomic_task(main_queue, processing_queue)
            if not task_message_dict:
                continue

            try:
                task_message = Message.model_validate(task_message_dict)
                correlation_id = task_message.header.correlation_id
                logger.info(f"[{self.agent_name}] Received task: {task_message.payload.task_name} with Correlation ID: {correlation_id}")

                # Extract parameters including user_id and itinerary_id
                params = task_message.payload.parameters
                task_description = params.get("task_description", "")
                user_id = params.get("user_id", "user")
                itinerary_id = params.get("itinerary_id", "default")
                session_id = params.get("session_id", correlation_id)

                logger.info(f"[{self.agent_name}] Processing for user={user_id}, itinerary={itinerary_id}")
                logger.info(f"[{self.agent_name}] Task description: {task_description}")

                # Invoke the LLM with Firebase context
                llm_response_str = asyncio.run(
                    self._invoke_llm_sync(task_description, session_id, user_id, itinerary_id)
                )
                logger.info(f"[{self.agent_name}] Raw LLM response: {llm_response_str[:200]}")

                # Try to parse JSON response, fallback to plain text
                try:
                    # Strip markdown code fences if present
                    cleaned_response = llm_response_str.strip()
                    if cleaned_response.startswith('```json'):
                        cleaned_response = cleaned_response[7:]  # Remove ```json
                    elif cleaned_response.startswith('```'):
                        cleaned_response = cleaned_response[3:]  # Remove ```
                    if cleaned_response.endswith('```'):
                        cleaned_response = cleaned_response[:-3]  # Remove trailing ```
                    cleaned_response = cleaned_response.strip()

                    llm_response_json = json.loads(cleaned_response)
                    result_data = llm_response_json.get('results', llm_response_json)
                except json.JSONDecodeError:
                    logger.warning(f"[{self.agent_name}] Response not JSON, using as plain text")
                    result_data = {"response": llm_response_str, "results": []}

                result_header = Header(
                    correlation_id=correlation_id,
                    message_type="RESULT",
                    source_agent=self.agent_name,
                    target_agent=task_message.header.source_agent,
                )
                result_payload = ResultPayload(
                    status="SUCCESS",
                    data=result_data
                )
                result_message = Message(header=result_header, payload=result_payload)

                reply_channel = task_message.header.reply_to_channel or "results:main"
                self.broker.enqueue_task(reply_channel, result_message.model_dump())
                logger.info(f"[{self.agent_name}] Sent result to {reply_channel}")

                self.broker.finish_atomic_task(processing_queue, task_message_dict)

            except Exception as e:
                logger.error(f"[{self.agent_name}] Task failed: {e}", exc_info=True)
                task_message_dict['retry_count'] = task_message_dict.get('retry_count', 0) + 1
                if task_message_dict['retry_count'] >= max_retries:
                    self.broker.move_to_dlq(processing_queue, dlq, task_message_dict)
                    logger.error(f"[{self.agent_name}] Task moved to DLQ after {max_retries} retries")
                else:
                    self.broker.requeue_failed_task(processing_queue, main_queue, task_message_dict)
                    logger.warning(f"[{self.agent_name}] Task requeued, retry {task_message_dict['retry_count']}/{max_retries}")

if __name__ == "__main__":
    agent_executor = WeatherAgentExecutor()
    agent_executor.run()