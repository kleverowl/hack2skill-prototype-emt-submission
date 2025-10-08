from google.adk.agents.llm_agent import Agent
from router_agent.prompt import ROUTER_AGENT_PROMPT

agent = Agent(
    model='gemini-2.5-flash-lite-preview-09-2025',
    name='router_agent',
    instruction=ROUTER_AGENT_PROMPT
)