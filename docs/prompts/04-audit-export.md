# Phase 4 — 审计与导出

**背景**：第三个页面，筛选 + 脱敏 + 5 万条 Excel 流式导出，防 OOM。

---

### Prompt 1 — seed 大数据

```
seed 里 bulk insert 5 万条 sys_audit_log，createMany 每批 1000。
metadata 里带 SECRET_KEY_2026_X 这种 key 方便测脱敏。
```

---

### Prompt 2 — 审计查询 API

```
audit 模块，ADMIN 和 AUDITOR 能访问：
GET /api/audit/logs 多条件分页
GET /api/audit/export 流式 Excel

筛选条件打在关联申请单上：applicantUsername 模糊搜、category、申请单 status、申请单 created_at 时间区间。
返回 list 带 applicationStatus，assetKey 脱敏。
```

---

### Prompt 3 — 流式导出

```
导出用 exceljs WorkbookWriter 直接写 response stream，
游标分批 findMany 500 条 orderBy id asc，禁止一次查全表进内存。
Excel 列：操作时间、操作人、动作、驳回原因、前后状态、资产Key(脱敏)、申请人、单据状态。
export 接口 SkipResponseInterceptor。
```

---

### Prompt 4 — 前端审计页

```
Audit 页：申请人用户名输入、分类、单据状态、申请时间 RangePicker。
onValuesChange 300ms debounce 再请求，别每敲一个字就调接口。
列表显示 applicationStatus 和脱敏 assetKey。
导出 blob 下载，timeout 设 5 分钟，导出过程中禁用筛选按钮。
```
