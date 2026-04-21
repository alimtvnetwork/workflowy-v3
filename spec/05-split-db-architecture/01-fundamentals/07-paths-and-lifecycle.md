# File Paths & Lifecycle

> **Updated:** 2026-04-19

---

## File Path Convention

| Component | Pattern | Example |
|-----------|---------|---------|
| Root DB | `{data}/root.db` | `data/root.db` |
| Project Folder | `{data}/{project-slug}/` | `data/my-project/` |
| Type Folder | `{project}/{type}/` | `data/my-project/history/` |
| Entity DB | `{type}/{entity-slug}.db` | `data/my-project/history/readme-md.db` |

---

## Slug Generation

```go
func GenerateSlug(name string) string {
    // Convert to lowercase
    slug := strings.ToLower(name)
    // Replace spaces and special chars with hyphens
    slug = regexp.MustCompile(`[^a-z0-9]+`).ReplaceAllString(slug, "-")
    // Remove leading/trailing hyphens
    slug = strings.Trim(slug, "-")
    return slug
}
```

---

## Database Creation Flow

1. Check if project exists in root.db, create if not
2. Check if database record exists, create if not
3. Create directory structure if needed
4. Open SQLite database file
5. Initialize schema (caller responsibility)

---

## Database Cleanup

```go
// Archive databases not accessed in 30 days
func (m *DbManager) ArchiveStale(maxAge time.Duration) error {
    cutoff := time.Now().Add(-maxAge)
    
    _, err := m.rootDb.Exec(`
        UPDATE Database 
        SET Status = 'archived', UpdatedAt = CURRENT_TIMESTAMP
        WHERE LastAccessedAt < ? AND Status = 'active'
    `, cutoff)
    
    return err
}

// Delete archived databases older than retention period
func (m *DbManager) PurgeArchived(retention time.Duration) error {
    cutoff := time.Now().Add(-retention)
    
    // Get databases to delete
    rows, _ := m.rootDb.Query(`
        SELECT Path FROM Database 
        WHERE Status = 'archived' AND UpdatedAt < ?
    `, cutoff)
    defer rows.Close()
    
    for rows.Next() {
        var path string
        rows.Scan(&path)
        pathutil.Remove(filepath.Join(m.dataDir, path))
    }
    
    // Remove records
    _, err := m.rootDb.Exec(`
        DELETE FROM Database 
        WHERE Status = 'archived' AND UpdatedAt < ?
    `, cutoff)
    
    return err
}
```

---

*File paths & lifecycle — v3.2.0 — 2026-04-19*
