# 4. Go Implementation

> **Parent:** [00-overview.md](./00-overview.md)

---

## Installation

```bash
go get github.com/casbin/casbin/v2
go get github.com/casbin/gorm-adapter/v3
go get gorm.io/driver/sqlite
go get gorm.io/gorm
```

---

## RBAC Manager

```go
package rbac

import (
    "fmt"
    "path/filepath"
    "sync"

    "github.com/casbin/casbin/v2"
    gormadapter "github.com/casbin/gorm-adapter/v3"
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

// RbacLevel defines the scope of RBAC enforcement
type RbacLevel string

const (
    RbacLevelRoot    RbacLevel = "root"
    RbacLevelApp     RbacLevel = "app"
    RbacLevelCompany RbacLevel = "company"
)

// RbacManager handles role-based access control
type RbacManager struct {
    enforcer *casbin.Enforcer
    adapter  *gormadapter.Adapter
    level    RbacLevel
    dataDir  string
    mu       sync.RWMutex
}

// RbacConfig defines configuration for RBAC initialization
type RbacConfig struct {
    DataDir     string
    Level       RbacLevel
    AppName     string    // Required for App/Company level
    CompanySlug string    // Required for Company level
    ModelPath   string    // Path to RBAC model file (optional, uses default)
    AutoMigrate bool      // Auto-create tables (default: true)
}

// NewRbacManager creates a new RBAC manager
func NewRbacManager(cfg RbacConfig) apperror.Result[*RbacManager] {
    // Determine database path based on level
    dbPath := buildRbacDbPath(cfg)
    
    // Open SQLite with GORM
    db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
        Logger: logger.Default.LogMode(logger.Silent),
    })
    if err != nil {
        return nil, apperror.Wrap(
            err,
            ErrDbOpen,
            "open rbac database",
        ).WithPath(dbPath)
    }
    
    // Create GORM adapter
    adapter, err := gormadapter.NewAdapterByDb(db)
    if err != nil {
        return nil, apperror.Wrap(
            err,
            ErrRbacAdapterCreate,
            "create GORM adapter for RBAC",
        )
    }
    
    // Determine model path
    modelPath := cfg.ModelPath
    if modelPath == "" {
        modelPath = filepath.Join(cfg.DataDir, "rbac_model.conf")
    }
    
    // Create enforcer
    enforcer, err := casbin.NewEnforcer(modelPath, adapter)
    if err != nil {
        return nil, apperror.Wrap(
            err,
            ErrRbacEnforcerCreate,
            "create casbin enforcer",
        ).WithPath(modelPath)
    }
    
    // Enable auto-save for policy changes
    enforcer.EnableAutoSave(true)
    
    // Load policies from database
    if err := enforcer.LoadPolicy(); err != nil {
        return nil, apperror.Wrap(
            err,
            ErrRbacPolicyLoad,
            "load RBAC policies",
        )
    }
    
    return &RbacManager{
        enforcer: enforcer,
        adapter:  adapter,
        level:    cfg.Level,
        dataDir:  cfg.DataDir,
    }, nil
}

func buildRbacDbPath(cfg RbacConfig) string {
    switch cfg.Level {
    case RbacLevelRoot:
        return filepath.Join(cfg.DataDir, "rbac.db")
    case RbacLevelApp:
        return filepath.Join(cfg.DataDir, cfg.AppName, "rbac.db")
    case RbacLevelCompany:
        return filepath.Join(cfg.DataDir, cfg.AppName, "companies", cfg.CompanySlug, "rbac.db")
    default:
        return filepath.Join(cfg.DataDir, "rbac.db")
    }
}

// Enforce checks if a user has permission to perform an action on a resource
func (m *RbacManager) Enforce(sub, obj, act string) apperror.Result[bool] {
    m.mu.RLock()
    defer m.mu.RUnlock()
    return m.enforcer.Enforce(sub, obj, act)
}

// EnforceWithDomain checks permission with domain (for company-scoped RBAC)
func (m *RbacManager) EnforceWithDomain(sub, dom, obj, act string) apperror.Result[bool] {
    m.mu.RLock()
    defer m.mu.RUnlock()
    return m.enforcer.Enforce(sub, dom, obj, act)
}

// AddRoleForUser assigns a role to a user
func (m *RbacManager) AddRoleForUser(user, role string) apperror.Result[bool] {
    m.mu.Lock()
    defer m.mu.Unlock()
    return m.enforcer.AddRoleForUser(user, role)
}

// AddRoleForUserInDomain assigns a role to a user within a domain
func (m *RbacManager) AddRoleForUserInDomain(user, role, domain string) apperror.Result[bool] {
    m.mu.Lock()
    defer m.mu.Unlock()
    return m.enforcer.AddRoleForUserInDomain(user, role, domain)
}

// RemoveRoleForUser removes a role from a user
func (m *RbacManager) RemoveRoleForUser(user, role string) apperror.Result[bool] {
    m.mu.Lock()
    defer m.mu.Unlock()
    return m.enforcer.DeleteRoleForUser(user, role)
}

// GetRolesForUser returns all roles for a user
func (m *RbacManager) GetRolesForUser(user string) apperror.Result[[]string] {
    m.mu.RLock()
    defer m.mu.RUnlock()
    return m.enforcer.GetRolesForUser(user)
}

// GetUsersForRole returns all users with a specific role
func (m *RbacManager) GetUsersForRole(role string) apperror.Result[[]string] {
    m.mu.RLock()
    defer m.mu.RUnlock()
    return m.enforcer.GetUsersForRole(role)
}

// AddPolicy adds a permission policy
func (m *RbacManager) AddPolicy(sub, obj, act string) apperror.Result[bool] {
    m.mu.Lock()
    defer m.mu.Unlock()
    return m.enforcer.AddPolicy(sub, obj, act)
}

// RemovePolicy removes a permission policy
func (m *RbacManager) RemovePolicy(sub, obj, act string) apperror.Result[bool] {
    m.mu.Lock()
    defer m.mu.Unlock()
    return m.enforcer.RemovePolicy(sub, obj, act)
}

// HasRole checks if a user has a specific role
func (m *RbacManager) HasRole(user, role string) apperror.Result[bool] {
    m.mu.RLock()
    defer m.mu.RUnlock()
    roles, err := m.enforcer.GetRolesForUser(user)
    if err != nil {
        return false, err
    }
    for _, r := range roles {
        if r == role {
            return true, nil
        }
    }
    return false, nil
}

// GetAllRoles returns all defined roles
func (m *RbacManager) GetAllRoles() apperror.Result[[]string] {
    m.mu.RLock()
    defer m.mu.RUnlock()
    return m.enforcer.GetAllRoles()
}

// GetAllPolicies returns all defined policies
func (m *RbacManager) GetAllPolicies() apperror.Result[[][]string] {
    m.mu.RLock()
    defer m.mu.RUnlock()
    return m.enforcer.GetPolicy()
}

// ReloadPolicy reloads policies from database
func (m *RbacManager) ReloadPolicy() error {
    m.mu.Lock()
    defer m.mu.Unlock()
    return m.enforcer.LoadPolicy()
}

// Close closes the RBAC manager
func (m *RbacManager) Close() error {
    // GORM adapter doesn't have explicit close
    return nil
}
```

---

## Error Constants

```go
const (
    ErrDbOpen            = "DB_OPEN_FAILED"
    ErrRbacAdapterCreate = "RBAC_ADAPTER_CREATE"
    ErrRbacEnforcerCreate = "RBAC_ENFORCER_CREATE"
    ErrRbacPolicyLoad    = "RBAC_POLICY_LOAD"
)
```
