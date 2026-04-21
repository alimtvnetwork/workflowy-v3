# 6. Privacy & GDPR Compliance

> **Parent:** [User-Scoped Isolation overview](./00-overview.md)

---

## User Data Export

```go
// ExportUserData creates a GDPR-compliant data export
func (m *UserDbManager) ExportUserData(userId, outputPath string) error {
    dbs, err := m.ListUserDatabases(userId)
    if err != nil {
        return err
    }

    // Create zip with all user data
    zipFile, _ := pathutil.Create(outputPath)
    defer zipFile.Close()
    zipWriter := zip.NewWriter(zipFile)
    defer zipWriter.Close()

    for _, db := range dbs {
        fullPath := filepath.Join(m.dataDir, db.Path)
        writer, _ := zipWriter.Create(db.Path)
        file, _ := pathutil.Open(fullPath)
        io.Copy(writer, file)
        file.Close()
    }

    return nil
}
```

---

## User Data Deletion (Right to be Forgotten)

```go
// DeleteAllUserData permanently removes all user data
func (m *UserDbManager) DeleteAllUserData(appName, userId string, companySlug ...string) error {
    // Export before deletion (audit trail)
    exportPath := filepath.Join(m.dataDir, "exports", userId+"-final.zip")
    m.ExportUserData(userId, exportPath)

    // Delete all user databases
    return m.DeleteUserData(appName, userId, companySlug...)
}
```
