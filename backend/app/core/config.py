from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    app_name: str = "MAS Backend"
    version: str = "0.1.0"
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)

    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    redis_url: str = Field(default="redis://localhost:6379/0")
    database_url: str = Field(default="postgresql+asyncpg://mas_user:mas_pass@localhost:5432/mas_db")
    celery_broker_url: str = Field(default="redis://localhost:6379/0")
    celery_result_backend: str = Field(default="redis://localhost:6379/1")

    gemini_api_key: str = Field(default="", description="Google Gemini API key")
    gemini_model: str = Field(default="gemini-2.0-flash-exp")
    gemini_retries: int = Field(default=3)
    gemini_backoff_base: float = Field(default=1.5)
    gemini_circuit_threshold: int = Field(default=3)
    gemini_circuit_cooldown: float = Field(default=60.0)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
