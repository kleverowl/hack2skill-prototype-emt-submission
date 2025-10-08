from currency_agent.prompt import CURRENCY_CONCIERGE_PROMPT
from google.adk.agents.llm_agent import Agent

agent = Agent(
    model='gemini-2.5-flash-lite-preview-09-2025',
    name='currency_agent',
    instruction=CURRENCY_CONCIERGE_PROMPT
)