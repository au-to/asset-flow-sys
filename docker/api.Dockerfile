FROM node:20-alpine AS builder
WORKDIR /app

# Railway 构建环境可能注入 NODE_ENV=production，需显式关闭以免漏装 workspace 依赖
ENV NPM_CONFIG_PRODUCTION=false
ENV NODE_ENV=development

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN npx tsc -p packages/shared
WORKDIR /app/apps/api
RUN npx prisma generate
RUN node ../../node_modules/@nestjs/cli/bin/nest.js build
RUN npx tsc prisma/seed.ts --skipLibCheck --module commonjs --target ES2021 --esModuleInterop --outDir prisma
WORKDIR /app

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

COPY scripts/railway-predeploy-api.sh scripts/railway-start-api.sh ./scripts/
RUN chmod +x ./scripts/railway-predeploy-api.sh ./scripts/railway-start-api.sh

EXPOSE 3001
CMD ["/bin/sh", "./scripts/railway-start-api.sh"]
