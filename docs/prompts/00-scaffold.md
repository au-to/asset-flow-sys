# Phase 0 — 工程基建

**背景**：项目启动，先搭 Monorepo 和数据层，保证后面能边写边跑。

---

### Prompt 1 — 初始化仓库

```
按 docs/architecture.md 里的目录结构，帮我初始化 Monorepo：
- apps/api：NestJS + TypeScript，/api 前缀，3001 端口
- apps/web：Vite + React 18 + Ant Design 5
- packages/shared：Role、ApplicationStatus、AssetCategory 枚举

Prisma 建五表（departments、users、asset_applications、application_items、sys_audit_log），
申请单加 version 字段后面做乐观锁。docker-compose.dev 起 PostgreSQL，.env.example 写好。
```

---

### Prompt 2 — 种子数据

```
seed 灌 2 个部门（研发部、市场部）和 5 个测试账号，密码统一 123456：
employee_a、manager_a、manager_b、admin、auditor。
manager_a 是研发部主管（departments.manager_id），manager_b 是市场部主管。
第二次 seed 不要报错，已有数据就 skip。
```

---

### Prompt 3 — 公共层与空壳

```
后端加统一响应格式 { code, message, data }，HttpExceptionFilter + ResponseInterceptor。
GET /api/health 公开。

前端 AppLayout + 路由占位 /login /application /approval /audit /403，Axios baseURL /api。
```

---

### Prompt 4 — Docker 生产编排

```
补 docker-compose.yml（db + api + web）、Dockerfile、nginx 反代 /api。
scripts/init.sh 一键启动，README 里写怎么跑。
```
