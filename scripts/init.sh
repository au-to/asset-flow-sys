#!/bin/bash
set -e

echo "Starting asset-flow-sys..."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

docker compose up -d --build

echo ""
echo "Waiting for services to be ready..."
sleep 10

echo ""
echo "============================================"
echo "  Asset Flow System is running!"
echo "  Web UI:  http://localhost"
echo "  API:     http://localhost:3001/api/health"
echo ""
echo "  Test accounts (password: 123456):"
echo "    employee_a  - 普通员工"
echo "    manager_a   - 研发部主管"
echo "    manager_b   - 市场部主管"
echo "    admin       - 系统管理员"
echo "    auditor     - 合规审计员"
echo "============================================"
