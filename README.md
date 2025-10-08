# Event Management & Travel Planning System

An AI-powered multi-agent system for intelligent event management and travel planning using Google's Generative AI (Gemini) and distributed agent architecture.

## Overview

This system leverages a multi-agent architecture where specialized AI agents collaborate to provide comprehensive travel planning and event management services. Each agent is responsible for a specific domain (flights, hotels, activities, weather, etc.) and communicates through a centralized message broker using Redis.

## Architecture

### Multi-Agent System

The system follows a hierarchical agent architecture with three main layers:

1. **Router Agent**: Entry point that routes user requests to the appropriate handler
2. **Main Agent**: Orchestrates the planning process and delegates tasks to specialist agents
3. **Specialist Agents**: Domain-specific agents that handle specialized tasks

```
User Request → Router Agent → Main Agent
                                   ↓
                    [Delegates to Specialist Agents]
                                   ↓
        [flight, hotel, food, activity, weather, budget, cab, currency, document]
                                   ↓
                    [Results collected via Message Broker]
                                   ↓
                    [Main Agent generates itinerary]
                                   ↓
                         [Response to user]
```

### Specialist Agents

- **Flight Agent**: Searches and recommends flight options
- **Hotel Agent**: Finds accommodation based on preferences
- **Food Agent**: Suggests restaurants and dining options
- **Activity Agent**: Recommends attractions and activities
- **Weather Agent**: Provides weather forecasts for destinations
- **Budget Agent**: Calculates and tracks trip budgets
- **Cab Agent**: Plans local transportation
- **Currency Agent**: Handles currency conversion
- **Document Agent**: Manages travel documentation requirements

## Tech Stack

### Core Technologies

- **Python 3.13**: Primary programming language
- **Google Generative AI**: AI/LLM capabilities using Gemini models (2.5-flash, 2.5-flash-lite)
- **Google ADK (Agent Development Kit)**: Framework for building AI agents
- **FastAPI**: Web framework for REST API endpoints
- **Uvicorn**: ASGI server for FastAPI

### Data & State Management

- **Firebase Realtime Database**: Persistent state storage for itineraries
- **Firebase Admin SDK**: Firebase integration
- **Redis**: Message broker and session management
- **Pydantic**: Data validation and serialization

### Additional Libraries

- **python-dotenv**: Environment variable management
- **Click**: CLI interface
- **a2a-sdk**: Agent-to-Agent communication protocol

## Project Structure

```
.
├── main_agent/                # Main orchestrator agent
│   ├── agent.py               # Agent definition and implementation
│   ├── agent_executor.py      # Execution logic
│   ├── prompt.py              # Agent prompts and instructions
│   ├── tools.py               # Agent tools and capabilities
│   ├── memory.py              # State and memory management
│   ├── models.py              # Data models
│   ├── constants.py           # Configuration constants
│   └── remote_connections.py  # External service connections
│
├── router_agent/              # Request routing agent
│   ├── agent.py
│   └── prompt.py
│
├── [specialist_agents]/       # Domain-specific agents
│   ├── flight_agent/
│   ├── hotel_agent/
│   ├── food_agent/
│   ├── activity_agent/
│   ├── weather_agent/
│   ├── budget_agent/
│   ├── cab_agent/
│   ├── currency_agent/
│   └── document_agent/
│       ├── agent.py           # Agent definition
│       ├── agent_executor.py  # Execution logic
│       ├── prompt.py          # Agent-specific prompts
│       ├── firestoredata.py   # Firebase data access (some agents)
│       └── __main__.py        # Entry point for standalone execution
│
├── ui/                        # User interface components
│   ├── app.py
│   ├── a2a_app.py             # Agent-to-Agent interface
│   └── agent_executor.py
│
├── scripts/                   # Utility scripts
│   ├── start_agents.py        # Agent orchestration script
│   └── clear_redis_sessions.py
│
├── eval/                      # Evaluation data
│   └── event_plan_default.json
│
├── message_broker.py          # Redis-based message broker
├── message_protocol.py        # Message format definitions
├── chat_backend.py            # FastAPI chat endpoint
├── firebase_state_service.py  # Firebase state management
├── redis_session_service.py   # Redis session management
├── response_storage_worker.py # Background worker for response handling
├── initiate_task.py           # Task initiation utilities
├── config.py                  # Application configuration
├── main.py                    # Application entry point
├── requirements.txt           # Python dependencies
└── pyproject.toml             # Project metadata
```

## Key Components

### Message Broker

The `MessageBroker` class provides centralized Redis-based communication:

- **Task Queuing**: Reliable message queuing using Redis Lists
- **Pub/Sub**: Real-time event broadcasting
- **Atomic Operations**: BRPOPLPUSH for reliable task processing
- **Dead Letter Queue**: Handling failed tasks

### State Management

**Redis Session Service**
- Manages conversation history
- Stores session state
- Tracks user context across requests

**Firebase State Service**
- Persists itinerary data
- Manages user profiles
- Stores travel plans and preferences

### Message Protocol

Standardized message format for agent communication:

```python
Message {
    header: {
        correlation_id: str,
        message_type: "TASK" | "RESULT",
        source_agent: str,
        target_agent: str,
        reply_to_channel: str
    },
    payload: TaskPayload | ResultPayload
}
```

### Agent Runner

Uses Google ADK's `Runner` class to:
- Execute agent workflows
- Manage session state
- Handle agent delegation
- Process tool calls
- Stream responses

## Features

### User Profile Management
- Automatic profile loading on new conversations
- Profile confirmation workflow
- Companion management
- Preference tracking (travel themes, cuisine, dietary restrictions)

### Itinerary Planning
- Multi-day trip planning
- Day-by-day schedule generation
- Activity recommendations based on preferences
- Budget tracking and breakdown
- Weather-aware planning

### Real-time Communication
- WebSocket-like typing indicators
- Streaming responses
- Background task processing
- Correlation ID tracking for request/response matching

### Error Handling
- Retry mechanisms for failed tasks
- Dead letter queue for persistent failures
- Graceful degradation
- Comprehensive logging

## Configuration

Environment variables (`.env`):

- `GOOGLE_API_KEY`: Google Generative AI API key
- `GOOGLE_APPLICATION_CREDENTIALS`: Firebase service account key path
- `FIREBASE_DATABASE_URL`: Firebase Realtime Database URL
- `REDIS_PORT`: Redis server port
- `REDIS_PASSWORD`: Redis authentication password
- `REDIS_DB`: Redis database number
- `MODEL_NAME`: Gemini model name (default: gemini-2.5-flash)
- Agent service URLs (e.g., `WEATHER_AGENT_A2A_URL`, `FLIGHT_AGENT_A2A_URL`)

## Agent Communication Flow

1. User sends message to `/chat` endpoint
2. `chat_backend.py` creates a task and enqueues it to `router_agent`
3. Router agent routes request to `main_agent`
4. Main agent:
   - Loads user profile and context
   - Delegates subtasks to specialist agents via message broker
   - Waits for specialist results (with timeout)
   - Generates comprehensive itinerary from collected data
   - Saves state to Firebase
5. Response flows back through message broker to user interface
6. `ResponseStorageWorker` stores final response in Firebase

## State Management Strategy

- **Session State (Redis)**: Conversation history, temporary context, agent state
- **Itinerary State (Firebase)**: Persistent user data, trip details, confirmed plans
- **In-Memory State**: Active processing state, tool execution context

## Logging

Structured logging across all components:
- Component-specific log levels
- Correlation ID tracking
- Detailed error traces
- Performance monitoring

Logs are stored in `logs/` directory with separate files per component.