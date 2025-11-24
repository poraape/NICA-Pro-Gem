#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

mkdir -p logs
echo "Tailing backend logs (writing to logs/backend.log). Press Ctrl+C to exit."
docker compose logs -f backend | tee logs/backend.log
