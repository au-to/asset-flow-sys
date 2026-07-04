#!/bin/sh
set -e

echo "Building API..."
npm install
npm run build -w @asset-flow/shared
cd apps/api
npx prisma generate
npm run build
echo "API build complete."
