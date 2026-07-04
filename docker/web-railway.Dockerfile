FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm install
RUN npm run build -w @asset-flow/shared
RUN npm run build -w @asset-flow/web

FROM node:20-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/apps/web/dist ./dist
EXPOSE 3000
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
