FROM node:20-alpine AS builder
WORKDIR /app

ENV NPM_CONFIG_PRODUCTION=false
ENV NODE_ENV=development

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN node_modules/.bin/tsc -p packages/shared
RUN node_modules/.bin/tsc -p apps/web
WORKDIR /app/apps/web
RUN node ../../node_modules/vite/bin/vite.js build
WORKDIR /app

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/apps/web/dist ./apps/web/dist

COPY scripts/railway-start-web.sh ./scripts/
RUN chmod +x ./scripts/railway-start-web.sh

EXPOSE 3000
