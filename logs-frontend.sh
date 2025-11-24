#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

mkdir -p logs
echo "Tailing frontend logs (writing to logs/frontend.log). Press Ctrl+C to exit."
docker compose logs -f frontend | tee logs/frontend.log
