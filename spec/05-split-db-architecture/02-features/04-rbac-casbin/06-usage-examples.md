# 6. Usage Examples

> **Parent:** [00-overview.md](./00-overview.md)

---

## Root Level RBAC (Platform-wide)

```go
// Initialize root-level RBAC
manager, err := rbac.NewRbacManager(rbac.RbacConfig{
    DataDir: "./data",
    Level:   rbac.RbacLevelRoot,
})
if err != nil {
    log.Fatal(err)
}
defer manager.Close()

// Assign admin role to user
manager.AddRoleForUser("user_123", "admin")

// Check permission
allowed, _ := manager.Enforce("user_123", "/api/users", "delete")
fmt.Println("Can delete users:", allowed) // true (admin has * permission)
```

---

## App Level RBAC (Single Application)

```go
// Initialize app-level RBAC for "gsearch"
manager, err := rbac.NewRbacManager(rbac.RbacConfig{
    DataDir: "./data",
    Level:   rbac.RbacLevelApp,
    AppName: "gsearch",
})
if err != nil {
    log.Fatal(err)
}

// Add custom policy for this app
manager.AddPolicy("researcher", "/api/search/*", "read")
manager.AddRoleForUser("user_456", "researcher")
```

---

## Company Level RBAC (Multi-tenant)

```go
// Initialize company-level RBAC
manager, err := rbac.NewRbacManager(rbac.RbacConfig{
    DataDir:     "./data",
    Level:       rbac.RbacLevelCompany,
    AppName:     "aibridge",
    CompanySlug: "acme-corp",
})
if err != nil {
    log.Fatal(err)
}

// Assign role within company domain
manager.AddRoleForUserInDomain("user_789", "manager", "acme-corp")

// Check permission with domain
allowed, _ := manager.EnforceWithDomain("user_789", "acme-corp", "/api/projects", "write")
```

---

## Common Operations

### Check Permission

```go
allowed, err := manager.Enforce("user_123", "/api/documents/42", "write")
if err != nil {
    log.Printf("Enforcement error: %v", err)
}
if allowed {
    // Grant access
}
```

### Get User Roles

```go
roles, err := manager.GetRolesForUser("user_123")
if err != nil {
    log.Fatal(err)
}
for _, role := range roles {
    fmt.Println("Role:", role)
}
```

### List All Policies

```go
policies, err := manager.GetAllPolicies()
if err != nil {
    log.Fatal(err)
}
for _, policy := range policies {
    fmt.Printf("Policy: %s can %s on %s\n", policy[0], policy[2], policy[1])
}
```
