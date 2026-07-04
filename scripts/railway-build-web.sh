#!/bin/sh
set -e

if [ -z "$VITE_API_BASE_URL" ]; then
  echo "Warning: VITE_API_BASE_URL is not set. Frontend will use relative /api path."
fi

echo "Building Web..."
npm install
npm run build -w @asset-flow/shared
npm run build -w @asset-flow/web
echo "Web build complete."
