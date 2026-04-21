# 5. Session Management

> **Parent:** [User-Scoped Isolation overview](./00-overview.md)

---

## Session Database Schema

```sql
CREATE TABLE SessionMeta (
    SessionMetaId INTEGER PRIMARY KEY AUTOINCREMENT,
    SessionId TEXT UNIQUE NOT NULL,
    UserId TEXT NOT NULL,
    DeviceInfo TEXT,                           -- JSON: browser, OS, IP
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastActiveAt DATETIME,
    ExpiresAt DATETIME NOT NULL,
    Status TEXT DEFAULT 'active'               -- active, expired, revoked
);

CREATE TABLE SessionActivity (
    SessionActivityId INTEGER PRIMARY KEY AUTOINCREMENT,
    Action TEXT NOT NULL,
    Resource TEXT,
    Metadata TEXT,                             -- JSON
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IdxSessionActivityTimestamp ON SessionActivity(Timestamp DESC);
```

---

## Session Cleanup

```go
// CleanupExpiredSessions removes expired session databases
func (m *UserDbManager) CleanupExpiredSessions() error {
    rows, err := m.rootDb.Query(`
        SELECT Path FROM UserDbRegistry
        WHERE Category = 'sessions' 
        AND ExpiresAt < CURRENT_TIMESTAMP 
        AND Status = 'active'
    `)
    if err != nil {
        return err
    }
    defer rows.Close()

    for rows.Next() {
        var path string
        rows.Scan(&path)
        
        // Close if open
        m.mu.Lock()
        if db, ok := m.openDbs[path]; ok {
            db.Close()
            delete(m.openDbs, path)
        }
        m.mu.Unlock()
        
        // Delete file
        pathutil.Remove(filepath.Join(m.dataDir, path))
    }

    // Update registry
    _, err = m.rootDb.Exec(`
        UPDATE UserDbRegistry 
        SET Status = 'expired', UpdatedAt = CURRENT_TIMESTAMP
        WHERE Category = 'sessions' 
        AND ExpiresAt < CURRENT_TIMESTAMP 
        AND Status = 'active'
    `)
    return err
}
```
