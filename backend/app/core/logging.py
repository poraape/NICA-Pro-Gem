import logging
import sys
from typing import Optional

import structlog


def configure_logging(level: Optional[str] = None) -> None:
    """Configure structured logging for the application."""
    chosen_level = level or "INFO"
    timestamper = structlog.processors.TimeStamper(fmt="iso")

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            timestamper,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.getLevelName(chosen_level)),
        logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
        cache_logger_on_first_use=True,
    )

    logging.basicConfig(
        level=chosen_level,
        format="%(message)s",
        stream=sys.stdout,
    )
