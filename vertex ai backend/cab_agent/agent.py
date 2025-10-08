from cab_agent.prompt import CAB_CONCIERGE_PROMPT
from google.adk.agents.llm_agent import Agent
from cab_agent.firestoredata import get_cabs

agent = Agent(
    model='gemini-2.5-flash-lite-preview-09-2025',
    name='cab_agent',
    instruction=CAB_CONCIERGE_PROMPT,
    tools=[get_cabs]
)