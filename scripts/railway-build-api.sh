#!/bin/sh
set -e

. ./scripts/railway-install-deps.sh

echo "Building API..."
npm run build -w @asset-flow/shared
cd apps/api
npx prisma generate
npm run build
echo "API build complete."
