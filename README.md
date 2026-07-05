# 企业级资产流转与审批系统

基于 React + Ant Design + NestJS + Prisma + PostgreSQL 的企业级资产流转与审批系统（EI 全栈工程师认证项目）。

## 在线演示

| 环境 | 地址 |
|------|------|
| 前端 | https://web-production-da953.up.railway.app/login |
| API Health | 同域名 `/api/health`（Nginx 反代至后端） |

测试账号：`employee_a` / `123456`（普通员工），`manager_a` / `123456`（研发部主管），`admin` / `123456`（系统管理员），`auditor` / `123456`（合规审计员）。

## 文档

- [认证题目要求](docs/全栈工程师认证题目及要求.md)
- [技术架构方案](docs/architecture.md)
- [分阶段实施计划](docs/implementation-plan.md)
- [Vibecoding Prompt 记录](docs/PROMPT.md)
- [Railway 部署指南](docs/railway-deploy.md)

## 5 分钟快速启动

### 方式一：Docker 一键启动（推荐）

```bash
chmod +x scripts/init.sh
./scripts/init.sh
```

访问 http://localhost

### 方式二：本地开发

```bash
# 1. 启动数据库
docker compose -f docker-compose.dev.yml up -d

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env

# 4. 数据库迁移与种子数据
cd apps/api
npx prisma migrate deploy
npx prisma db seed

# 5. 启动后端（终端1）
npm run start:dev

# 6. 启动前端（终端2，项目根目录）
npm run dev:web
```

- 前端：http://localhost:5173
- 后端：http://localhost:3001/api/health

## 测试账号

| 用户名 | 角色 | 密码 |
|--------|------|------|
| employee_a | 普通员工（研发部） | 123456 |
| manager_a | 部门主管（研发部） | 123456 |
| manager_b | 部门主管（市场部） | 123456 |
| admin | 系统管理员 | 123456 |
| auditor | 合规审计员 | 123456 |

## 页面路径

| 路径 | 说明 | 权限 |
|------|------|------|
| `/login` | 登录 | 公开 |
| `/application` | 资产申请 | 已登录 |
| `/approval` | 审批工作台 | 已登录（视图按角色切换） |
| `/audit` | 审计日志 | ADMIN / AUDITOR |
| `/403` | 无权限 | 公开 |

## API 概览

统一响应格式：`{ code: 0, message: "success", data: {} }`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me` | 当前用户 |
| POST | `/api/applications` | 提交申请 |
| GET | `/api/applications/mine` | 我的申请 |
| GET | `/api/approvals/pending` | 待审批（主管） |
| POST | `/api/approvals/:id/approve` | 同意 |
| POST | `/api/approvals/:id/reject` | 驳回 |
| GET | `/api/audit/logs` | 审计日志（多条件分页） |
| GET | `/api/audit/export` | 流式导出 Excel |

### 审计查询参数

筛选条件作用于**关联申请单**（`asset_applications`）：

| 参数 | 说明 |
|------|------|
| `applicantId` | 申请人 UUID（精确匹配） |
| `applicantUsername` | 申请人用户名（模糊匹配） |
| `category` | 资产分类 |
| `status` | 申请单当前状态 |
| `startTime` / `endTime` | 申请单创建时间区间（ISO8601） |
| `page` / `pageSize` | 分页 |

## 运行测试

```bash
# 确保数据库已启动并 seed
docker compose -f docker-compose.dev.yml up -d
npm run prisma:migrate -w @asset-flow/api
npm run prisma:seed -w @asset-flow/api

# 运行 E2E 测试（15 个场景全覆盖）
npm run test:e2e
```

## 技术栈

- 前端：React 18 + TypeScript + Vite + Ant Design 5 + Zustand + React Router 6
- 后端：NestJS 10 + Prisma 5 + PostgreSQL 15 + JWT + exceljs
- 部署：Docker Compose（本地）/ [Railway](docs/railway-deploy.md)（生产推荐）

## Railway 云部署（推荐）

完整步骤见 **[docs/railway-deploy.md](docs/railway-deploy.md)**。

简要流程：

1. Railway 创建 Project + PostgreSQL
2. 部署 `api` 服务（`npm run railway:build:api` / `railway:start:api`）
3. 部署 `web` 服务，设置 `VITE_API_BASE_URL=https://<api域名>/api`
4. 在 API 设置 `WEB_ORIGIN=https://<web域名>`
5. 访问 Web 公网链接，用 `employee_a / 123456` 验证

```bash
# 本地模拟 Railway 构建（可选）
VITE_API_BASE_URL=http://localhost:3001/api npm run railway:build:web
```
