import json
import logging
import asyncio
from message_broker import MessageBroker
from message_protocol import Message, Header, TaskPayload
from router_agent.agent import agent
from google.adk.runners import Runner
from redis_session_service import RedisSessionService
from google.genai import types

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('message_broker')

class RouterAgent:
    def __init__(self):
        self.broker = MessageBroker()
        self.agent_name = "router_agent"
        self.llm_agent = agent
        self.session_service = RedisSessionService()
        self.runner = Runner(
            agent=self.llm_agent,
            app_name=f"{self.agent_name}_app",
            session_service=self.session_service
        )

    def _invoke_llm_sync(self, user_request: str, correlation_id: str) -> str:
        """Invokes the agent's LLM synchronously using the Runner."""
        async def _run_async():
            user_id = "user"
            session_id = correlation_id

            session = await self.session_service.get_session(
                app_name=self.runner.app_name,
                user_id=user_id,
                id=session_id
            )
            if not session:
                logging.info(f"Creating new session for user: {user_id}, session: {session_id}")
                await self.session_service.create_session(
                    app_name=self.runner.app_name,
                    user_id=user_id,
                    id=session_id,
                    state={}
                )

            content = types.Content(role='user', parts=[types.Part(text=user_request)])
            final_response_text = ""
            async for event in self.runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
                if event.is_final_response():
                    if event.content and event.content.parts:
                        final_response_text = event.content.parts[0].text
                    break
            return final_response_text

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(_run_async())
            return result
        finally:
            loop.close()

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

                llm_input = task_message.payload.parameters["user_request"]
                
                llm_response_str = self._invoke_llm_sync(llm_input, correlation_id)
                logger.info(f"[{self.agent_name}] Raw LLM response: {llm_response_str}")
                logger.info(f"[{self.agent_name}] Raw LLM response: {llm_response_str}")

                try:
                    # Strip markdown code blocks
                    llm_response_str = llm_response_str.strip(' `').strip('json\n')
                    llm_response_json = json.loads(llm_response_str)
                    target_agent = llm_response_json.get("agent")
                    next_task = llm_response_json.get("task")
                except json.JSONDecodeError:
                    logger.warning(f"[{self.agent_name}] LLM response is not valid JSON: {llm_response_str}. Defaulting to main_agent.")
                    target_agent = "main_agent"
                    next_task = "Handle user request"

                if not target_agent or not next_task:
                    raise ValueError("LLM response did not include a target agent or task.")

                task_header = Header(
                    correlation_id=correlation_id,
                    message_type="TASK",
                    source_agent=self.agent_name,
                    target_agent=target_agent,
                    reply_to_channel=task_message.header.reply_to_channel
                )
                task_payload = TaskPayload(
                    task_name=next_task,
                    parameters=task_message.payload.parameters
                )
                new_task_message = Message(header=task_header, payload=task_payload)

                self.broker.enqueue_task(f"tasks:{target_agent}", new_task_message.model_dump())
                logger.info(f"[{self.agent_name}] Delegated task '{next_task}' to {target_agent}")

                self.broker.finish_atomic_task(processing_queue, task_message_dict)

            except Exception as e:
                logger.error(f"[{self.agent_name}] Task failed: {e}", exc_info=True)
                task_message_dict['retry_count'] = task_message_dict.get('retry_count', 0) + 1
                if task_message_dict['retry_count'] >= max_retries:
                    self.broker.move_to_dlq(processing_queue, dlq, task_message_dict)
                else:
                    self.broker.requeue_failed_task(processing_queue, main_queue, task_message_dict)

if __name__ == "__main__":
    agent = RouterAgent()
    agent.run()