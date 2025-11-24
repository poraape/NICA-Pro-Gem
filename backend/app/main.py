import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import configure_logging
from app.api.routes import health, tasks, ws, profiles


def create_app() -> FastAPI:
    """Application factory to build the FastAPI app."""
    configure_logging()
    app = FastAPI(
        title="MAS Backend",
        version=settings.version,
        description="Multi-Agent System backend with FastAPI, Redis Streams, and Gemini-powered agents.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix="/api")
    app.include_router(tasks.router, prefix="/api")
    app.include_router(profiles.router, prefix="/api")
    app.include_router(ws.router)

    @app.get("/health", tags=["system"])
    async def healthcheck() -> dict[str, str]:
        return {"status": "ok", "service": "mas-backend"}

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
