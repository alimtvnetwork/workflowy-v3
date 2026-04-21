# 4. Usage Examples

> **Parent:** [User-Scoped Isolation overview](./00-overview.md)

---

## App-Level User Isolation

```go
// Create manager for app-level user isolation
manager, err := userdb.NewUserDbManager(userdb.UserDbConfig{
    DataDir: "./data",
    AppName: "myapp",
    Scope:   userdb.ScopeLevelApp,
})
if err != nil {
    log.Fatal(err)
}
defer manager.Close()

// Get user's settings database
settingsDb, err := manager.GetUserSettings("myapp", "user_123")
if err != nil {
    log.Fatal(err)
}

// Initialize settings schema
settingsDb.Exec(`
    CREATE TABLE IF NOT EXISTS Setting (
        Key TEXT PRIMARY KEY,
        Value TEXT NOT NULL,
        UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`)

// Save user preference
settingsDb.Exec(`INSERT OR REPLACE INTO Settings (Key, Value) VALUES (?, ?)`,
    "Theme", "dark")
```

---

## Company + User Isolation

```go
// Create manager for company-scoped user isolation
manager, err := userdb.NewUserDbManager(userdb.UserDbConfig{
    DataDir: "./data",
    AppName: "enterprise",
    Scope:   userdb.ScopeLevelCompany,
})
if err != nil {
    log.Fatal(err)
}
defer manager.Close()

// Get user's session database within a company
sessionDb, err := manager.GetUserSession("enterprise", "user_456", "session_abc", "acme-corp")
if err != nil {
    log.Fatal(err)
}

// Use the session database
sessionDb.Exec(`
    CREATE TABLE IF NOT EXISTS SessionData (
        Key TEXT PRIMARY KEY,
        Value TEXT NOT NULL,
        ExpiresAt DATETIME
    )
`)
```
