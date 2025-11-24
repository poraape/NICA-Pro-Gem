import asyncio
import time
from abc import ABC, abstractmethod
from enum import Enum
from typing import Any, Dict, Optional, TypeVar, Generic

import structlog
from pydantic import BaseModel, Field

logger = structlog.get_logger()


class AgentState(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    WAITING = "waiting"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentMessage(BaseModel):
    sender: str
    receiver: str
    content: Dict[str, Any]
    message_type: str
    timestamp: float = Field(default_factory=lambda: time.time())
    correlation_id: Optional[str] = None


class AgentConfig(BaseModel):
    name: str
    description: str
    max_retries: int = 3
    timeout: float = 30.0
    logging_level: str = "INFO"
    enable_memory: bool = True
    llm_model: Optional[str] = None


class AgentProcessingError(Exception):
    """Raised when an agent fails after retry attempts."""


T = TypeVar("T")


class BaseAgent(ABC, Generic[T]):
    """Base class for all agents."""

    def __init__(self, config: AgentConfig):
        self.config = config
        self.state = AgentState.IDLE
        self.message_queue: asyncio.Queue[AgentMessage] = asyncio.Queue()
        self._running = False

    @abstractmethod
    async def process(self, input_data: T) -> Any:  # pragma: no cover - to be implemented by subclasses
        ...

    async def run(self, input_data: T) -> Any:
        """Execute the agent with retries and timeout handling."""
        self.state = AgentState.RUNNING
        retries = 0

        while retries < self.config.max_retries:
            try:
                logger.info("agent_run_start", agent=self.config.name, attempt=retries + 1)
                result = await asyncio.wait_for(self.process(input_data), timeout=self.config.timeout)
                self.state = AgentState.COMPLETED
                logger.info("agent_run_success", agent=self.config.name)
                return result
            except asyncio.TimeoutError:
                retries += 1
                logger.warning("agent_timeout", agent=self.config.name, attempt=retries)
                await asyncio.sleep(2**retries)
            except Exception as exc:  # pragma: no cover - upstream tests should mock
                retries += 1
                logger.exception("agent_error", agent=self.config.name, attempt=retries, error=str(exc))
                if retries >= self.config.max_retries:
                    self.state = AgentState.FAILED
                    raise AgentProcessingError(f"Agent {self.config.name} failed after retries") from exc

    async def handle_message(self, message: AgentMessage) -> None:
        """Handle incoming message. Override as needed."""
        logger.info("agent_message_received", agent=self.config.name, message_type=message.message_type)

    async def receive_messages(self) -> None:
        """Continuously process messages from queue."""
        self._running = True
        while self._running:
            message = await self.message_queue.get()
            await self.handle_message(message)

    def stop(self) -> None:
        self._running = False
