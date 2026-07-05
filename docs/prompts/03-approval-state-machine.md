# Phase 3 — 审批工作台

**背景**：核心难点，状态机 + 越权 + 三角色不同界面，题目分值最高的一块。

---

### Prompt 1 — 状态机

```
StateMachineService 做审批状态流转：
PENDING 可以 APPROVE/REJECT/WITHDRAW/TERMINATE，终态不能再动。
Prisma 事务里 updateMany(where: { id, version, status }) 做乐观锁，version++，
同时 insert audit_log。count=0 就 ConflictException。
REJECT 必须带 reason，WITHDRAW 只能本人。
```

---

### Prompt 2 — 水平越权

```
主管审批要校验 departments.manager_id === 当前用户 id，不是比 departmentId 相等。
GET /api/approvals/pending 只返回我管辖部门的 PENDING 单。
manager_b 批 employee_a（研发部）的单必须 403。抽个 manager-scope.ts 公共方法。
```

---

### Prompt 3 — 审批 API

```
approvals 模块：
GET pending（MANAGER）、GET all（ADMIN）
POST approve、reject（MANAGER）、terminate（ADMIN）
withdraw 走 applications 模块调状态机。
都挂 @Roles，水平校验在 service 里做。
```

---

### Prompt 4 — 前端三角色

```
Approval 页按 role 渲染，普通员工 DOM 里不能有同意/驳回按钮：
- EMPLOYEE：我的申请，PENDING 可撤回
- MANAGER：待我审批，同意/驳回，驳回弹窗必填原因
- ADMIN：全量列表，PENDING 可强制终止

详情 Modal 展示基本信息和资产明细。审批按钮 loading + disabled 防重复点。
```
