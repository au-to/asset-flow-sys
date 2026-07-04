#!/bin/sh
set -e

echo "Running database migration and seed..."
cd apps/api
npx prisma migrate deploy
npx prisma db seed
