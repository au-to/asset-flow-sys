# 开发过程 — 问题修复 Prompt

开发中遇到问题时发送的 Prompt（零散记录）。

---

### manager_b 越权测试失败

```
E2E 水平越权 case 过了但实现用的是 operator.departmentId === applicant.departmentId，
改成 departments.manager_id 校验，和 seed 里主管关系一致。
```

---

### 审计筛选结果不对

```
按单据状态「已通过」筛出来的还是待审批的。
buildWhere 应该用 application.status 和 application.createdAt，
不是 audit_log.afterStatus 和 log.createdAt。
```

---

### 导出前端超时

```
导出大数据 Excel 30 秒就 timeout 了，导出请求单独设 5 分钟 timeout，
导出过程中把筛选按钮 disable 掉。
```

---

### Form.List 删行错位

```
删中间一行后后面行字段乱了，检查 Form.List name 用法和 key 是不是用的 field.key。
```

---

### E2E 读 xlsx 类型报错

```
test 里 exceljs load buffer TS 报错，用类型断言绕过去，保证 export 用例能跑通。
```
