#!/bin/sh
set -e

echo "Starting Web static server on port ${PORT:-3000}..."
npx serve apps/web/dist -s -l "${PORT:-3000}"
