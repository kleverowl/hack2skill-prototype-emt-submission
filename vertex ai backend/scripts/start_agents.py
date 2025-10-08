"""Multi-Agent Worker Startup Script.

This script provides a convenient way to start, manage, and monitor the
Redis-based worker agents required for this project. It handles the
startup of all specialist agents and the main agent.

USAGE:
- Start all agents (default behavior):
  $ python scripts/start_agents.py

- Start only the specialist agents:
  $ python scripts/start_agents.py --no-with-main

FEATURES:
- Uses `click` for a clean command-line interface.
- Loads environment variables from `.env`.
- Checks for required API keys before starting.
- Starts each agent worker in a separate subprocess.
- Logs all agent output to files in the logs/ directory.
- Gracefully terminates all child processes on exit (Ctrl+C).
"""
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

import click
from dotenv import load_dotenv

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Load environment variables from .env file
load_dotenv()

# --- Agent Configurations ---
# The new configuration is simpler, as workers don't need host/port.
AGENT_CONFIGS: Dict[str, Dict[str, Any]] = {
    "flight": {"module": "flight_agent", "env_var": "GOOGLE_API_KEY"},
    "weather": {"module": "weather_agent", "env_var": "GOOGLE_API_KEY"},
    "food": {"module": "food_agent", "env_var": "GOOGLE_API_KEY"},
    "activity": {"module": "activity_agent", "env_var": "GOOGLE_API_KEY"},
    "budget": {"module": "budget_agent", "env_var": "GOOGLE_API_KEY"},
    "cab": {"module": "cab_agent", "env_var": "GOOGLE_API_KEY"},
    "currency": {"module": "currency_agent", "env_var": "GOOGLE_API_KEY"},
    "document": {"module": "document_agent", "env_var": "GOOGLE_API_KEY"},
    "hotel": {"module": "hotel_agent", "env_var": "GOOGLE_API_KEY"},
    "router": {"module": "router_agent", "env_var": "GOOGLE_API_KEY"},
    "main": {"module": "main_agent", "env_var": "GOOGLE_API_KEY"},
    "response_storage": {"module": "response_storage_worker", "env_var": None},
}

def check_env_vars(agents_to_start: List[str]) -> None:
    """Check for required environment variables before starting agents."""
    for agent_name in agents_to_start:
        config = AGENT_CONFIGS[agent_name]
        env_var = config.get("env_var")
        if env_var and not os.getenv(env_var):
            raise click.UsageError(
                f"Missing environment variable: {env_var} is required for '{agent_name}' agent. "
                "Please set it in your .env file."
            )
    print("All required environment variables are set.")

def ensure_logs_directory() -> Path:
    """Ensure the logs directory exists and return its path."""
    script_dir = Path(__file__).parent
    logs_dir = script_dir.parent / "logs"
    logs_dir.mkdir(exist_ok=True)
    return logs_dir

@click.command()
@click.option(
    "--with-main/--no-with-main",
    default=True,
    help="Start the main agent in addition to specialist agents. Default is --with-main.",
)
def main(with_main: bool) -> None:
    """Starts and manages the agent worker processes."""
    agents_to_start = [
        "router", "flight", "weather", "food", "activity", "budget",
        "cab", "currency", "document", "hotel", "response_storage"
    ]
    if with_main:
        # The main agent should be started last to ensure it can subscribe to topics
        # that workers might publish to upon startup (if any).
        agents_to_start.append("main")

    logs_dir = ensure_logs_directory()
    print(f"Agent logs will be saved to: {logs_dir.absolute()}")

    try:
        check_env_vars(agents_to_start)
    except click.UsageError as e:
        click.echo(f"Error: {e}")
        sys.exit(1)

    processes: Dict[str, subprocess.Popen] = {}

    try:
        for agent_name in agents_to_start:
            config = AGENT_CONFIGS[agent_name]
            # Command for starting a worker is now much simpler.
            cmd = [sys.executable, "-m", config["module"]]

            print(f"Starting {agent_name} worker with command: {' '.join(cmd)}")

            stdout_log = logs_dir / f"{agent_name}_agent_stdout.log"
            stderr_log = logs_dir / f"{agent_name}_agent_stderr.log"

            print(f"   Logs: {stdout_log} & {stderr_log}")

            env = os.environ.copy()
            env["PYTHONPATH"] = str(project_root)

            with open(stdout_log, 'w') as stdout_file, open(stderr_log, 'w') as stderr_file:
                process = subprocess.Popen(
                    cmd,
                    stdout=stdout_file,
                    stderr=stderr_file,
                    text=True,
                    env=env
                )
                processes[agent_name] = process
            # Give a small delay to let the process initialize
            time.sleep(1)

        print("\nAll agent workers have been started. Press Ctrl+C to stop.")
        print("You can monitor their activity in the 'logs' directory.")

        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nShutting down all agents...")

    finally:
        for agent_name, process in reversed(processes.items()):
            if process.poll() is None:
                print(f"   Terminating {agent_name} worker (PID: {process.pid})...")
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    print(f"   {agent_name} worker did not terminate gracefully, killing.")
                    process.kill()
        print("All agent processes terminated.")

if __name__ == "__main__":
    main()
