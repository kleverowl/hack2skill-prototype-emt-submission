from flight_agent.prompt import FLIGHT_CONCIERGE_PROMPT
from google.adk.agents.llm_agent import Agent
from flight_agent.firestoredata import get_flights

agent = Agent(
    model='gemini-2.5-flash-lite-preview-09-2025',
    name='flight_agent',
    instruction=FLIGHT_CONCIERGE_PROMPT,
    tools=[get_flights]
)