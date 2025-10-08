from budget_agent.prompt import BUDGET_CONCIERGE_PROMPT
from google.adk.agents.llm_agent import Agent

agent = Agent(
    model='gemini-2.5-flash-lite-preview-09-2025',
    name='budget_agent',
    instruction=BUDGET_CONCIERGE_PROMPT
)