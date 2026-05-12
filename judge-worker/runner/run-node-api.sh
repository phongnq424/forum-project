#!/bin/sh
set -eu

cd /sandbox

PORT="${PORT:-3000}"
export PORT
export NODE_ENV=test

SERVER_LOG=/sandbox/server.log

if [ ! -f app.js ]; then
  echo "__NO_APP_JS__"
  exit 1
fi

node app.js > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Chờ server lên tối đa 5 giây
i=0
while [ "$i" -lt 10 ]; do
  if curl -s "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
    break
  fi
  i=$((i + 1))
  sleep 0.5
done

if ! curl -s "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
  echo "__SERVER_NOT_STARTED__"
  cat "$SERVER_LOG" || true
  exit 1
fi

node /runner/api-test-runner.cjs