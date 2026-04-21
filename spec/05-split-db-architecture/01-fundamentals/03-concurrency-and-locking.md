# Concurrency & Locking

> **Updated:** 2026-04-19

---

## SQLite WAL Mode

All databases use Write-Ahead Logging for concurrent access:

```go
func (m *DbManager) configureDb(db *sql.DB) error {
    // Enable WAL mode for concurrent reads
    _, err := db.Exec("PRAGMA journal_mode=WAL")
    if err != nil {
        return err
    }
    
    // Set busy timeout to avoid SQLITE_BUSY errors
    _, err = db.Exec("PRAGMA busy_timeout=5000")
    if err != nil {
        return err
    }
    
    // Enable foreign keys
    _, err = db.Exec("PRAGMA foreign_keys=ON")
    return err
}
```

---

## Connection Pooling

```go
type DbManager struct {
    rootDb    *sql.DB
    dataDir   string
    openDbs   map[string]*sql.DB
    mu        sync.RWMutex
    maxOpen   int           // Max open databases (default: 50)
    maxIdle   int           // Max idle connections per DB (default: 2)
    connLife  time.Duration // Max connection lifetime (default: 1h)
}

func (m *DbManager) getDb(key string) (*sql.DB, bool) {
    m.mu.RLock()
    defer m.mu.RUnlock()
    db, ok := m.openDbs[key]
    return db, ok
}
```

---

*Concurrency & locking — v3.2.0 — 2026-04-19*
