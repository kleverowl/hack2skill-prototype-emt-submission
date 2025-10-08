from hotel_agent.prompt import HOTEL_CONCIERGE_PROMPT
from google.adk.agents.llm_agent import Agent
from hotel_agent.firestoredata import get_hotels

agent = Agent(
    model='gemini-2.5-flash-lite-preview-09-2025',
    name='hotel_agent',
    instruction=HOTEL_CONCIERGE_PROMPT,
    tools=[get_hotels]
)