# MAS AI Full-Stack (Frontend + FastAPI Backend)

This repo is being refactored into a Multi-Agent System with a FastAPI backend (Gemini-based) and a React/Vite frontend.

## Structure
- `backend/`: FastAPI app, agent scaffolding, Redis Streams integration points.
- `frontend/`: Existing Vite React app (moved from root).
- `infra/`: Docker/K8s placeholders.
- `docs/`: Architecture/API docs (to be expanded).
- `.github/workflows/`: CI/CD pipelines (coming next).
- `docker-compose.yml`: backend + frontend + Postgres + Redis + Celery worker wired.

## Quickstart (local)
```bash
cp .env.example .env
docker-compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000/health
# Celery worker runs in docker-compose as `celery_worker`
```

## Backend (dev)
```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload
# Celery worker (local): poetry run celery -A app.core.celery_app worker --loglevel=info
```

## API (initial)
- `POST /api/agents/plan` -> enfileira geração de plano (Celery) usando Gemini; retorna `task_id`
- `GET /api/agents/plan/{task_id}` -> status do job
- `GET /health` ou `/api/health` -> healthcheck
- `WS /ws/agents` -> stream de eventos via Redis Streams (status de agentes/planos)

## Frontend (dev)
```bash
cd frontend
npm install
npm run dev -- --host
```

## Notes
- Redis Streams is the selected message bus; Celery is included as the default worker (can be swapped with Dramatiq later).
- Gemini API key must be set in `.env` (`GEMINI_API_KEY`). The frontend will call the backend, not Gemini directly.
