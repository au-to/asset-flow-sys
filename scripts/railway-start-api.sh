#!/bin/sh
set -e

echo "Starting API..."
echo "PORT=${PORT}"
echo "DATABASE_URL=${DATABASE_URL:+[set]}"
cd apps/api
node dist/main.js 2>&1
