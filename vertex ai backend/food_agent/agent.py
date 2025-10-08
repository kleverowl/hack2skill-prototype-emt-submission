from food_agent.prompt import FOOD_CONCIERGE_PROMPT
from google.adk.agents.llm_agent import Agent

agent = Agent(
    model='gemini-2.5-flash-lite-preview-09-2025',
    name='food_agent',
    instruction=FOOD_CONCIERGE_PROMPT
)
