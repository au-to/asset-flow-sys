# Vibecoding Prompt 记录

本项目使用 AI 辅助分阶段开发，以下为核心 Prompt 记录。

## Phase 0 - 工程基建

```
按 docs/architecture.md §4 目录结构，初始化 Monorepo：NestJS api + Vite React web + shared 包；
实现 Prisma schema 五表模型；docker-compose.dev 起 PostgreSQL；seed 2 部门 5 账号；前后端空壳可启动。
```

## Phase 1 - 认证与 RBAC

```
实现 auth 模块：login/me API、JWT、JwtAuthGuard、RolesGuard、@Roles 装饰器；
前端 Login 页 + Zustand authStore + AuthGuard；/audit 仅 ADMIN/AUDITOR；Axios 拦截器处理 401/403。
```

## Phase 2 - 资产申请单

```
实现 applications 模块：创建提交 API、mine 列表、详情；Form.List 动态明细前端页；
提交时事务写 audit_log；SENSITIVE_DATA 自动生成 assetKey 并脱敏返回。
```

## Phase 3 - 审批工作台

```
实现 approvals 模块：状态机 transition 含乐观锁与事务写 audit_log；
pending/approve/reject/withdraw/terminate/all API；水平越权校验；
前端 Approval 页三角色条件渲染，审批按钮 loading 防重复。
```

## Phase 4 - 审计与导出

```
实现 audit 模块：多条件分页查询 + exceljs 流式导出（游标每批500）；
seed 5万条审计日志；前端 Audit 页带 debounce 筛选与导出按钮；shared maskAssetKey 前后端复用。
```

## Phase 5 - 测试与交付

```
编写 Jest+Supertest 集成测试覆盖 11 个必测场景；修复 jest-e2e.json 为合法 JSON；
完善 docker-compose 一键启动含 migrate+seed；README 补充在线演示链接与五分钟指南；创建 PROMPT.md。
```
