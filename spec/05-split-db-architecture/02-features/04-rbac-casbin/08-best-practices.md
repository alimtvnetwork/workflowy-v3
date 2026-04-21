# 8. Best Practices

> **Parent:** [00-overview.md](./00-overview.md)

---

## 1. Use Wildcards Sparingly

```go
// ❌ Too permissive
manager.AddPolicy("user", "*", "*")

// ✅ Specific permissions
manager.AddPolicy("user", "/api/documents/*", "read")
```

---

## 2. Leverage Role Hierarchy

Roles inherit permissions from parent roles:

```go
// superadmin → admin → manager → editor → viewer

// Adding viewer role gives read access
// Adding manager role gives read + write access
```

---

## 3. Reload Policies After Changes

```go
// After bulk policy updates
manager.ReloadPolicy()
```

---

## 4. Use Domain-based RBAC for Multi-tenancy

```go
// Separate permissions per company
manager.EnforceWithDomain(user, company, resource, action)
```

---

## 5. Validate Before Enforcement

```go
func checkPermission(manager *rbac.RbacManager, user, resource, action string) bool {
    if manager == nil {
        return false // Fail closed
    }
    allowed, err := manager.Enforce(user, resource, action)
    if err != nil {
        log.Printf("RBAC error: %v", err)
        return false
    }
    return allowed
}
```

---

## 6. Audit Policy Changes

```go
// Log policy modifications
func logPolicyChange(user string, action string, policy []string) {
    log.Printf("[RBAC] User %s %s policy: %v", user, action, policy)
}
```
