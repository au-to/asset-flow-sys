# Phase 6 — 提交前优化

**背景**：对照认证题目自查一遍，修几个评审可能扣分的点。

---

### Prompt 1 — 模拟判卷

```
你是判卷老师，按 docs/全栈工程师认证题目及要求.md 给本项目打分，看还有哪些不足。
```

---

### Prompt 2 — 按问题点优化

```
针对判卷问题优化：
1. 主管权限改成 departments.manager_id，pending 列表按管辖部门过滤
2. 审计筛选 status 和 time 改绑申请单，不是 audit_log 的 afterStatus
3. 前端审计页申请人改成用户名搜索，加 applicationStatus 列
4. 导出 timeout 5 分钟，导出时 disable 筛选
5. 补 export E2E 和 status 筛选测试
6. 文档和实现对齐
```

---

### Prompt 3 — 文档同步

```
把 architecture.md 和 implementation-plan.md 里过时的描述同步成当前实现，
补全 docs/prompts 分阶段 Prompt 归档。
```
