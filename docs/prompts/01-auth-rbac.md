# Phase 1 — 认证与 RBAC

**背景**：业务 API 上线前先把登录和权限框架搭好。

---

### Prompt 1 — 后端 auth

```
实现 auth 模块：
POST /api/auth/login（bcrypt 验密码，发 JWT）
GET /api/auth/me（返回 id、username、role、departmentId、departmentName）

JWT payload：sub, username, role, departmentId
全局 JwtAuthGuard，@Public() 标记 login 和 health
RolesGuard + @Roles() 装饰器，没权限 403
```

---

### Prompt 2 — 前端登录与守卫

```
Login 页用户名密码登录，Zustand 存 token 和 user。
AuthGuard：没登录跳 /login，角色不对跳 /403。
/audit 只有 ADMIN 和 AUDITOR 能进。
Axios 拦截器带 Bearer，401 清 token 回登录，403 跳无权限页。
```

---

### Prompt 3 — 菜单与 403 页

```
侧边栏 /audit 菜单只有 admin 和 auditor 看得到，用条件渲染数组，别用 CSS 隐藏。
Forbidden 页面做简单点就行。
登录成功默认去 /application。
```
