#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -f .venv/bin/python ]]; then
  echo "Virtual environment not found. Run ./setup-macos.sh first."
  exit 1
fi
exec .venv/bin/python app.py
