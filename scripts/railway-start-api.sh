#!/bin/sh
set -e

echo "Starting API..."
cd apps/api
node dist/main.js
