from document_agent.prompt import DOCUMENT_CONCIERGE_PROMPT
from google.adk.agents.llm_agent import Agent

agent = Agent(
    model='gemini-2.5-flash-lite-preview-09-2025',
    name='document_agent',
    instruction=DOCUMENT_CONCIERGE_PROMPT
)