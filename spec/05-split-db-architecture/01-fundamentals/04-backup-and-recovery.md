# Backup & Recovery

> **Updated:** 2026-04-19

---

## Incremental Backup

```go
// BackupProject creates a backup of all databases for a project
func (m *DbManager) BackupProject(projectSlug, backupDir string) error {
    dbs, err := m.ListDatabases(projectSlug)
    if err != nil {
        return err
    }
    
    timestamp := time.Now().Format("20060102-150405")
    projectBackupDir := filepath.Join(backupDir, projectSlug, timestamp)
    pathutil.EnsureDir(projectBackupDir, 0755)
    
    for _, db := range dbs {
        srcPath := filepath.Join(m.dataDir, db.Path)
        dstPath := filepath.Join(projectBackupDir, filepath.Base(db.Path))
        
        // Use SQLite backup API for consistency
        if err := m.backupDb(srcPath, dstPath); err != nil {
            return apperror.Wrap(
                err,
                ErrDbBackupFailed,
                "backup database",
            ).WithContext("path", db.Path)
        }
    }
    
    return nil
}
```

---

## Point-in-Time Recovery

```go
// RestoreProject restores databases from a backup
func (m *DbManager) RestoreProject(projectSlug, backupPath string) error {
    // Close all open databases for this project
    m.closeProjectDbs(projectSlug)
    
    // Restore from backup
    return filepath.Walk(backupPath, func(path string, info os.FileInfo, err error) error {
        if err != nil || info.IsDir() || stringutil.IsMissingSuffix(path, ".db") {
            return err
        }
        
        relPath := strings.TrimPrefix(path, backupPath)
        dstPath := filepath.Join(m.dataDir, projectSlug, relPath)
        
        return copyFile(path, dstPath)
    })
}
```

---

*Backup & recovery — v3.2.0 — 2026-04-19*
