from weather_agent.prompt import WEATHER_CONCIERGE_PROMPT
from google.adk.agents.llm_agent import Agent

agent = Agent(
    model='gemini-2.0-flash-exp',
    name='weather_agent',
    instruction=WEATHER_CONCIERGE_PROMPT
)