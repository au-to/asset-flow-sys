#!/bin/sh
set -e

echo "Starting API..."
cd apps/api
npx prisma migrate deploy
npx prisma db seed
node dist/main.js
