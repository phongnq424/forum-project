#!/bin/sh
set -eu

cd /sandbox

PORT="${PORT:-3000}"
export PORT
export NODE_ENV=test

if [ ! -f app.js ]; then
  echo "__NO_APP_JS__"
  exit 1
fi

node app.js