# Go Implementation — DbManager

> **Updated:** 2026-04-19

---

## DbManager Interface

```go
package splitdb

import (
    // ALLOWED: database infrastructure layer — manages raw SQLite connection pooling and dynamic DB routing
    "database/sql"
    "fmt"
    "path/filepath"
    "sync"
    "time"
    
    _ "github.com/mattn/go-sqlite3"
    "pkg/pathutil"
)

type DbManager struct {
    rootDb    *sql.DB
    dataDir   string
    openDbs   map[string]*sql.DB
    mu        sync.RWMutex
}

type Project struct {
    ProjectId  int64
    Slug        string
    DisplayName string
    Path        string
    Status      string
    CreatedAt   time.Time
    UpdatedAt   time.Time
}

type Database struct {
    DatabaseId  int64
    ProjectId   int64
    Type         string
    EntityId     string
    Path         string
    SizeBytes    int64
    RecordCount  int64
    Status       string
    CreatedAt    time.Time
    UpdatedAt    time.Time
    LastAccessed *time.Time
}
```

---

## NewDbManager

```go
// NewDbManager creates a new split database manager
func NewDbManager(dataDir string) apperror.Result[*DbManager] {
    if err := pathutil.EnsureDir(dataDir, 0755); err != nil {
        return nil, apperror.Wrap(
            err,
            ErrDbDirCreate,
            "create data directory",
        ).WithContext("dir", dataDir)
    }
    
    rootPath := filepath.Join(dataDir, "root.db")
    rootDb, err := sql.Open("sqlite3", rootPath)
    if err != nil {
        return nil, apperror.Wrap(
            err,
            ErrDbOpen,
            "open root database",
        ).WithPath(rootPath)
    }
    
    manager := &DbManager{
        rootDb:  rootDb,
        dataDir: dataDir,
        openDbs: make(map[string]*sql.DB),
    }
    
    if err := manager.initRootSchema(); err != nil {
        return nil, err
    }
    
    return manager, nil
}
```

---

## GetOrCreateDb

```go
// GetOrCreateDb returns a database, creating it if it doesn't exist
func (m *DbManager) GetOrCreateDb(projectSlug, dbType, entityId string) apperror.Result[*sql.DB] {
    m.mu.Lock()
    defer m.mu.Unlock()
    
    // Check if already open
    key := fmt.Sprintf("%s/%s/%s", projectSlug, dbType, entityId)
    if db, ok := m.openDbs[key]; ok {
        return db, nil
    }
    
    // Ensure project exists
    project, err := m.getOrCreateProject(projectSlug)
    if err != nil {
        return nil, err
    }
    
    // Get or create database record
    dbPath := m.buildDbPath(projectSlug, dbType, entityId)
    dbRecord, err := m.getOrCreateDatabase(project.ProjectId, dbType, entityId, dbPath)
    if err != nil {
        return nil, err
    }
    
    // Ensure directory exists
    dir := filepath.Dir(filepath.Join(m.dataDir, dbRecord.Path))
    if err := pathutil.EnsureDir(dir, 0755); err != nil {
        return nil, apperror.Wrap(
            err,
            ErrDbDirCreate,
            "create database directory",
        ).WithContext("dir", dir)
    }
    
    // Open the database
    fullPath := filepath.Join(m.dataDir, dbRecord.Path)
    db, err := sql.Open("sqlite3", fullPath)
    if err != nil {
        return nil, apperror.Wrap(
            err,
            ErrDbOpen,
            "open database",
        ).WithPath(fullPath)
    }
    
    m.openDbs[key] = db
    
    // Update last accessed
    m.updateLastAccessed(dbRecord.DatabaseId)
    
    return db, nil
}
```

---

## ListDatabases & Close

```go
// ListDatabases returns all databases for a project
func (m *DbManager) ListDatabases(projectSlug string) apperror.Result[[]Database] {
    query := `
        SELECT D.DatabaseId, D.ProjectId, D.Type, D.EntityId, D.Path, 
               D.SizeBytes, D.RecordCount, D.Status, D.CreatedAt, D.UpdatedAt
        FROM Database D
        JOIN Project P ON D.ProjectId = P.ProjectId
        WHERE P.Slug = ? AND D.Status = 'active'
    `
    
    rows, err := m.rootDb.Query(query, projectSlug)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var dbs []Database
    for rows.Next() {
        var db Database
        if err := rows.Scan(
            &db.DatabaseId, &db.ProjectId, &db.Type, &db.EntityId, &db.Path,
            &db.SizeBytes, &db.RecordCount, &db.Status, &db.CreatedAt, &db.UpdatedAt,
        ); err != nil {
            return nil, err
        }
        dbs = append(dbs, db)
    }
    
    return dbs, nil
}

// Close closes all open databases
func (m *DbManager) Close() error {
    m.mu.Lock()
    defer m.mu.Unlock()
    
    for _, db := range m.openDbs {
        db.Close()
    }
    m.openDbs = make(map[string]*sql.DB)
    
    return m.rootDb.Close()
}
```

---

*Go implementation — v3.2.0 — 2026-04-19*
