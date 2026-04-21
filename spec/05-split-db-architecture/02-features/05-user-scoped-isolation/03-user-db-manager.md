# 3. User Database Manager (Go)

> **Parent:** [User-Scoped Isolation overview](./00-overview.md)

---

## UserDbManager Implementation

```go
package userdb

import (
    // ALLOWED: database infrastructure layer — manages user-scoped SQLite databases with dynamic routing
    "database/sql"
    "fmt"
    "os"
    "path/filepath"
    "sync"
    "time"

    _ "github.com/mattn/go-sqlite3"
)

// ScopeLevel defines the isolation level
type ScopeLevel string

const (
    ScopeLevelApp     ScopeLevel = "app"
    ScopeLevelCompany ScopeLevel = "company"
)

// UserDbManager manages user-scoped databases
type UserDbManager struct {
    rootDb  *sql.DB
    dataDir string
    scope   ScopeLevel
    openDbs map[string]*sql.DB
    mu      sync.RWMutex
}

// UserDbConfig defines configuration for user database manager
type UserDbConfig struct {
    DataDir string
    AppName string
    Scope   ScopeLevel
}

// NewUserDbManager creates a new user database manager
func NewUserDbManager(cfg UserDbConfig) apperror.Result[*UserDbManager] {
    rootPath := filepath.Join(cfg.DataDir, "root.db")
    rootDb, err := sql.Open("sqlite3", rootPath)
    if err != nil {
        return nil, apperror.Wrap(
            err,
            ErrDbOpen,
            "open root database",
        ).WithPath(rootPath)
    }

    manager := &UserDbManager{
        rootDb:  rootDb,
        dataDir: cfg.DataDir,
        scope:   cfg.Scope,
        openDbs: make(map[string]*sql.DB),
    }

    return manager, nil
}

// GetUserDb returns a database for a specific user
func (m *UserDbManager) GetUserDb(appName, userId, category, entityId string, companySlug ...string) apperror.Result[*sql.DB] {
    m.mu.Lock()
    defer m.mu.Unlock()

    // Build path based on scope
    var dbPath string
    if m.scope == ScopeLevelCompany && len(companySlug) > 0 {
        dbPath = m.buildCompanyUserPath(appName, companySlug[0], userId, category, entityId)
    } else {
        dbPath = m.buildAppUserPath(appName, userId, category, entityId)
    }

    // Check if already open
    key := dbPath
    if db, ok := m.openDbs[key]; ok {
        return db, nil
    }

    // Create directory structure
    fullPath := filepath.Join(m.dataDir, dbPath)
    if err := pathutil.EnsureDir(filepath.Dir(fullPath), 0755); err != nil {
        return nil, apperror.Wrap(
            err,
            ErrDbDirCreate,
            "create user database directory",
        ).WithContext("dir", filepath.Dir(fullPath))
    }

    // Open database
    db, err := sql.Open("sqlite3", fullPath)
    if err != nil {
        return nil, apperror.Wrap(
            err,
            ErrDbOpen,
            "open user database",
        ).WithPath(fullPath)
    }

    // Configure database
    m.configureDb(db)

    // Register in root DB
    m.registerUserDb(userId, category, entityId, dbPath)

    m.openDbs[key] = db
    return db, nil
}

func (m *UserDbManager) buildAppUserPath(appName, userId, category, entityId string) string {
    return filepath.Join(appName, "users", userId, category, entityId+".db")
}

func (m *UserDbManager) buildCompanyUserPath(appName, companySlug, userId, category, entityId string) string {
    return filepath.Join(appName, "companies", companySlug, "users", userId, category, entityId+".db")
}

func (m *UserDbManager) configureDb(db *sql.DB) {
    db.Exec("PRAGMA journal_mode=WAL")
    db.Exec("PRAGMA busy_timeout=5000")
    db.Exec("PRAGMA foreign_keys=ON")
}

func (m *UserDbManager) registerUserDb(userId, category, entityId, path string) error {
    _, err := m.rootDb.Exec(`
        INSERT OR REPLACE INTO UserDbRegistry 
        (UserId, Category, EntityId, Path, SequenceNum, UpdatedAt)
        VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `, userId, category, entityId, path)

    return err
}

// GetUserSettings returns the user's settings database
func (m *UserDbManager) GetUserSettings(appName, userId string, companySlug ...string) apperror.Result[*sql.DB] {
    return m.GetUserDb(appName, userId, "settings", "config", companySlug...)
}

// GetUserSession returns a specific session database
func (m *UserDbManager) GetUserSession(appName, userId, sessionId string, companySlug ...string) apperror.Result[*sql.DB] {
    return m.GetUserDb(appName, userId, "sessions", sessionId, companySlug...)
}

// ListUserDatabases returns all databases for a user
func (m *UserDbManager) ListUserDatabases(userId string) apperror.Result[[]UserDatabase] {
    rows, err := m.rootDb.Query(`
        SELECT UserDbRegistryId, UserId, Category, EntityId, Path, SizeBytes, CreatedAt, LastAccessedAt
        FROM UserDbRegistry
        WHERE UserId = ? AND Status = 'active'
        ORDER BY Category, CreatedAt DESC
    `, userId)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var dbs []UserDatabase
    for rows.Next() {
        var db UserDatabase
        if err := rows.Scan(
            &db.UserDbRegistryId, &db.UserId, &db.Category, &db.EntityId,
            &db.Path, &db.SizeBytes, &db.CreatedAt, &db.LastAccessedAt,
        ); err != nil {
            return nil, err
        }
        dbs = append(dbs, db)
    }
    return dbs, nil
}

// DeleteUserData removes all databases for a user
func (m *UserDbManager) DeleteUserData(appName, userId string, companySlug ...string) error {
    m.mu.Lock()
    defer m.mu.Unlock()

    // Build user directory path
    var userDir string
    if m.scope == ScopeLevelCompany && len(companySlug) > 0 {
        userDir = filepath.Join(m.dataDir, appName, "companies", companySlug[0], "users", userId)
    } else {
        userDir = filepath.Join(m.dataDir, appName, "users", userId)
    }

    // Close any open databases for this user
    for key, db := range m.openDbs {
        if filepath.HasPrefix(key, userDir) {
            db.Close()
            delete(m.openDbs, key)
        }
    }

    // Remove from registry
    _, err := m.rootDb.Exec(`
        UPDATE UserDbRegistry SET Status = 'deleted', UpdatedAt = CURRENT_TIMESTAMP
        WHERE UserId = ?
    `, userId)
    if err != nil {
        return err
    }

    // Remove directory
    return pathutil.RemoveAll(userDir)
}

// UserDatabase represents a user database entry
type UserDatabase struct {
    UserDbRegistryId int64
    UserId          string
    Category         string
    EntityId         string
    Path             string
    SizeBytes        int64
    CreatedAt        time.Time
    LastAccessedAt   *time.Time
}

// Close closes all open databases
func (m *UserDbManager) Close() error {
    m.mu.Lock()
    defer m.mu.Unlock()

    for _, db := range m.openDbs {
        db.Close()
    }
    m.openDbs = make(map[string]*sql.DB)

    return m.rootDb.Close()
}
```
