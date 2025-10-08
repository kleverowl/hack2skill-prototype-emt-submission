
import uuid
from message_broker import MessageBroker
from message_protocol import Message, Header, TaskPayload


def initiate_new_plan(user_request: str):
    """Creates a new plan and sends the initial task to the router agent."""
    broker = MessageBroker()
    correlation_id = str(uuid.uuid4())

    print(f"Initiating new plan with Correlation ID: {correlation_id}")

    # This is the initial task for the router agent
    # The router will break this down into specialist tasks
    initial_task_payload = TaskPayload(
        task_name="plan_travel",
        parameters={"user_request": user_request}
    )

    initial_message = Message(
        header=Header(
            correlation_id=correlation_id,
            message_type="TASK",
            source_agent="user_interface",
            target_agent="router_agent" # Explicitly for the router
        ),
        payload=initial_task_payload
    )

    # The main queue that the router listens on
    main_queue = "tasks:main"
    broker.enqueue_task(main_queue, initial_message.model_dump())

    print(f"Successfully sent initial task to the '{main_queue}' queue.")
    print("Monitor the logs of your running agents to see the progress.")

if __name__ == "__main__":
    # --- Example Usage ---
    # request = "I need to book a flight from JFK to LAX for next Tuesday and find a hotel near the airport."
    request = "Find a 5-star hotel in Paris for 3 nights next month for 2 people, budget is $800 per night."
    initiate_new_plan(request)

