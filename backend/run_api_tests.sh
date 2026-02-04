#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${API_TEST_BASE_URL:-http://127.0.0.1:8000}"
EMAIL="${API_TEST_EMAIL:-admin.user@cygnet.one}"
PASSWORD="${API_TEST_PASSWORD:-user.one@cygnet.one}"

export API_TEST_BASE_URL="$BASE_URL"
export API_TEST_EMAIL="$EMAIL"
export API_TEST_PASSWORD="$PASSWORD"
export PYTHONPATH="${PYTHONPATH:-/home/cygnet/backend/backend}"

VENV_PYTHON="${VENV_PYTHON:-/home/cygnet/backend/venv/bin/python}"
VENV_PYTEST="${VENV_PYTEST:-/home/cygnet/backend/venv/bin/pytest}"

SERVER_PID=""

start_server() {
  "$VENV_PYTHON" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 >/tmp/api_test_server.log 2>&1 &
  SERVER_PID=$!
}

stop_server() {
  if [ -n "${SERVER_PID}" ] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
}

wait_for_server() {
  local attempts=20
  local delay=0.5
  while [ $attempts -gt 0 ]; do
    if curl -s "$BASE_URL/health" >/dev/null 2>&1; then
      return 0
    fi
    attempts=$((attempts - 1))
    sleep "$delay"
  done
  return 1
}

if command -v curl >/dev/null 2>&1; then
  if ! curl -s "$BASE_URL/health" >/dev/null 2>&1; then
    echo "API server not reachable. Starting a local server for tests..." >&2
    start_server
    trap stop_server EXIT

    if ! wait_for_server; then
      echo "Server failed to start. See /tmp/api_test_server.log" >&2
      exit 1
    fi
  fi
fi

"$VENV_PYTEST" -q backend/api_tests
