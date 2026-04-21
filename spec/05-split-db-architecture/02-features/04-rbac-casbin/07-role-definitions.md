# 7. Default Role Definitions

> **Parent:** [00-overview.md](./00-overview.md)

---

## Role Priority Table

| Role | Priority | Permissions | Description |
|------|----------|-------------|-------------|
| `superadmin` | 100 | `*` on `*` | Full system access |
| `admin` | 90 | `*` on `/api/*` | Full API access |
| `manager` | 70 | `read`, `write` on `/api/*` | Read/write API access |
| `editor` | 50 | `read`, `write` on `/api/documents/*` | Document management |
| `viewer` | 10 | `read` on `/api/*` | Read-only access |

---

## Role Hierarchy

Roles inherit permissions from parent roles:

```
superadmin
    └── admin
          └── manager
                └── editor
                      └── viewer
```

### Inheritance Examples

| Role | Inherits From | Effective Permissions |
|------|---------------|----------------------|
| `viewer` | — | `read` on `/api/*` |
| `editor` | `viewer` | + `write` on `/api/documents/*` |
| `manager` | `editor` | + `write` on `/api/*` |
| `admin` | `manager` | `*` on `/api/*` |
| `superadmin` | `admin` | `*` on `*` |

---

## Custom Roles

```go
// Create custom role with specific permissions
manager.AddPolicy("analyst", "/api/reports/*", "read")
manager.AddPolicy("analyst", "/api/analytics/*", "read")

// Assign custom role
manager.AddRoleForUser("user_999", "analyst")
```
