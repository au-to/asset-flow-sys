#!/bin/sh
set -e

# Railway/Nixpacks 默认以 production 模式安装，会跳过 devDependencies。
# 构建阶段必须补齐 typescript、@nestjs/cli、vite 等工具。
export NPM_CONFIG_PRODUCTION=false
export NODE_ENV=development

echo "Installing dependencies (including devDependencies)..."
npm install --include=dev --prefer-offline --no-audit --no-fund

if [ ! -x node_modules/.bin/tsc ]; then
  echo "Error: tsc not found after install. Build cannot continue."
  npm ls typescript || true
  exit 1
fi

echo "Build dependencies ready."
