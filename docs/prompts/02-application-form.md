# Phase 2 — 资产申请单

**背景**：第一个完整业务页，题目要求动态明细表单 + 校验 + 提交进待审批。

---

### Prompt 1 — 后端 API

```
applications 模块：
POST /api/applications 创建并直接提交，status=PENDING
GET /api/applications/mine 分页
GET /api/applications/:id 详情

DTO 校验：reason 必填最多 100 字，items 至少一条，assetName 必填，quantity 正整数。
提交和写 sys_audit_log（SUBMIT）同一个事务。
SENSITIVE_DATA 分类自动生成 assetKey 像 SECRET_KEY_2026_X，返回时脱敏成 SEC-****-X。
```

---

### Prompt 2 — 前端动态表单

```
Application 页：
申请人、部门从 me 接口带出，只读。
Form.List 动态增删资产明细，至少保留一行。
申请原因、资产名称、数量都要校验，不合法红字提示，提交前 validateFields。
提交按钮 loading 防连点，成功跳 /approval。
```

---

### Prompt 3 — 分类联动

```
资产分类选「软件许可证」时数量锁死为 1；
选「敏感数据权限」时如果名称为空默认填「数据访问权限」，上面给个说明 Alert 说 Key 会脱敏展示。
maskAssetKey 放 packages/shared，前后端共用。
```
