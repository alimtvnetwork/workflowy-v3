# Usage Examples

> **Updated:** 2026-04-19

---

## History Database Pattern

```go
// Get history database for a specific file
historyDb, err := manager.GetOrCreateDb("my-project", "history", "readme-md")
if err != nil {
    return err
}

// Create history table if not exists
_, err = historyDb.Exec(`
    CREATE TABLE IF NOT EXISTS Version (
        VersionId INTEGER PRIMARY KEY AUTOINCREMENT,
        Content TEXT NOT NULL,
        Hash TEXT NOT NULL,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        Author TEXT
    )
`)
```

---

## Cache Database Pattern

```go
// Get cache database for search results
cacheDb, err := manager.GetOrCreateDb("my-project", "cache", "search")
if err != nil {
    return err
}

// Create cache table if not exists
_, err = cacheDb.Exec(`
    CREATE TABLE IF NOT EXISTS SearchCache (
        SearchCacheId INTEGER PRIMARY KEY AUTOINCREMENT,
        QueryHash TEXT UNIQUE NOT NULL,
        Results TEXT NOT NULL,          -- JSON encoded
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        ExpiresAt DATETIME NOT NULL
    )
`)
```

---

*Usage examples — v3.2.0 — 2026-04-19*
