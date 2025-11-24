#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Detect docker compose binary
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "Docker Compose not found. Please install Docker Desktop or docker-compose." >&2
  exit 1
fi

# Ensure .env exists
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "Created .env from .env.example. Update secrets (e.g., GEMINI_API_KEY) before proceeding."
  else
    echo ".env.example not found; cannot bootstrap env." >&2
    exit 1
  fi
fi

if [ "${1:-}" = "--fresh" ]; then
  echo "==> Running fresh start: docker compose down (keeping volumes by default)."
  $COMPOSE down --remove-orphans
  shift
fi

echo "==> Building and starting full stack (backend, worker, frontend, Postgres, Redis)"
if lsof -i:6379 >/dev/null 2>&1; then
  echo "Port 6379 in use; stopping existing process (usually Redis)."
  if command -v docker >/dev/null 2>&1; then
    docker ps --filter "publish=6379" -q | xargs -r docker stop
  fi
fi

if lsof -i:5432 >/dev/null 2>&1; then
  echo "Port 5432 in use; stopping existing process (usually Postgres)."
  if command -v docker >/dev/null 2>&1; then
    docker ps --filter "publish=5432" -q | xargs -r docker stop
  fi
fi

$COMPOSE up -d --build

echo "==> Waiting for backend healthcheck on http://localhost:8000/health"
for i in $(seq 1 40); do
  if curl -fsS http://localhost:8000/health >/dev/null 2>&1; then
    echo "Backend is up."
    break
  fi
  sleep 2
  if [ "$i" -eq 40 ]; then
    echo "Backend did not become healthy; check logs with '$COMPOSE logs -f backend'." >&2
    exit 1
  fi
done

echo "==> Frontend dev server: http://localhost:3000"
echo "==> Backend API:         http://localhost:8000"
echo "==> Celery worker and Redis/PG are running. Follow logs with '$COMPOSE logs -f'."
