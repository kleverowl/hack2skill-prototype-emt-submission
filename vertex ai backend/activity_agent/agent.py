from activity_agent.prompt import ACTIVITY_CONCIERGE_PROMPT
from google.adk.agents.llm_agent import Agent

agent = Agent(
    model='gemini-2.5-flash-lite-preview-09-2025',
    name='activity_agent',
    instruction=ACTIVITY_CONCIERGE_PROMPT
)