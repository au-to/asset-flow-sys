#!/bin/sh
set -eu

echo "Starting API..."
echo "PWD=$(pwd)"
echo "PORT=${PORT:-<unset>}"
echo "DATABASE_URL=${DATABASE_URL:+[set]}"

if [ ! -f apps/api/dist/main.js ]; then
  echo "ERROR: apps/api/dist/main.js not found"
  ls -la apps/api/ 2>&1 || true
  exit 1
fi

cd apps/api
exec node dist/main.js
