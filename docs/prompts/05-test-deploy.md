# Phase 5 — 测试与部署交付

**背景**：功能做完，补 E2E、Docker 一键启动、README，准备交卷。

---

### Prompt 1 — E2E 测试

```
用 Jest + Supertest 写 apps/api/test/app.e2e-spec.ts，覆盖认证题目要求的场景：
正常审批流、员工 approve 403、manager_b 越权 403、终态重复审批 409、
驳回 audit_log 字段完整、assetKey 脱敏、并发 approve 幂等、撤回、admin 终止、
员工访问 audit 403、export 流式 xlsx 且 Key 脱敏、按申请单 status 筛选。

npm run test:e2e 根目录能跑。
```

---

### Prompt 2 — Docker 与 README

```
完善 docker-compose 一键启动，api 启动前 migrate + seed。
scripts/init.sh  chmod 后能用。
README 写 5 分钟启动指南、测试账号、页面路径、API 概览、审计查询参数。
```

---

### Prompt 3 — Railway 部署

```
部署到 Railway，写 docs/railway-deploy.md。
web 配 VITE_API_BASE_URL，api 配 WEB_ORIGIN 和 DATABASE_URL。
README 贴在线演示链接。
```

---

### Prompt 4 — 文档交付

```
写 docs/architecture.md 架构说明、docs/implementation-plan.md 分阶段计划。
创建 PROMPT 记录文件。统一 API 错误码格式。
```
