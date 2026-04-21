# Logging, Benefits & References

> **Updated:** 2026-04-19

---

## Structured Logging

All database operations are logged with structured context for debugging and audit:

```go
type DbLogger struct {
    logger *slog.Logger
}

func NewDbLogger(output io.Writer) *DbLogger {
    return &DbLogger{
        logger: slog.New(slog.NewJsonHandler(output, &slog.HandlerOptions{
            Level: slog.LevelDebug,
        })),
    }
}

func (l *DbLogger) Info(msg string, args ...any) {
    l.logger.Info(msg, args...)
}

func (l *DbLogger) Debug(msg string, args ...any) {
    l.logger.Debug(msg, args...)
}

func (l *DbLogger) Warn(msg string, args ...any) {
    l.logger.Warn(msg, args...)
}

func (l *DbLogger) Error(msg string, args ...any) {
    l.logger.Error(msg, args...)
}
```

---

## Operation Logging

```go
// GetOrCreateDb with logging
func (m *DbManager) GetOrCreateDb(projectSlug, dbType, entityId string) apperror.Result[*sql.DB] {
    startTime := time.Now()
    
    m.logger.Debug("GetOrCreateDb called",
        "project", projectSlug,
        "type", dbType,
        "entity", entityId,
    )
    
    db, err := m.doGetOrCreateDb(projectSlug, dbType, entityId)
    
    duration := time.Since(startTime)
    
    if err != nil {
        m.logger.Error("GetOrCreateDb failed",
            "project", projectSlug,
            "type", dbType,
            "entity", entityId,
            "error", err,
            "duration_ms", duration.Milliseconds(),
        )
        return nil, err
    }
    
    m.logger.Info("Database ready",
        "project", projectSlug,
        "type", dbType,
        "entity", entityId,
        "duration_ms", duration.Milliseconds(),
        "cached", cached,
    )
    
    return db, nil
}
```

---

## Log Levels by Operation

| Operation | Success Level | Failure Level |
|-----------|---------------|---------------|
| GetOrCreateDb | INFO | ERROR |
| ListDatabases | DEBUG | WARN |
| Export | INFO | ERROR |
| Import | INFO | ERROR |
| Backup | INFO | ERROR |
| Archive/Purge | INFO | ERROR |
| Query Stats | DEBUG | WARN |

---

## Log Format Examples

```json
// Successful operation
{
  "time": "2026-02-01T10:30:00Z",
  "level": "INFO",
  "msg": "Database ready",
  "project": "my-project",
  "type": "history",
  "entity": "readme-md",
  "duration_ms": 12,
  "cached": false
}

// Export operation
{
  "time": "2026-02-01T10:35:00Z",
  "level": "INFO",
  "msg": "Export complete",
  "project": "my-project",
  "output": "/backups/my-project-2026-02-01.zip",
  "files_count": 15,
  "total_size_bytes": 1048576,
  "duration_ms": 250
}

// Error with context
{
  "time": "2026-02-01T10:40:00Z",
  "level": "ERROR",
  "msg": "Import failed",
  "zip": "/imports/invalid.zip",
  "error": "zip: not a valid zip file",
  "project": "new-project"
}
```

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Isolation** | Each entity has its own database, preventing table bloat |
| **Performance** | Smaller databases = faster queries |
| **Scalability** | Add new entities without affecting existing ones |
| **Backup** | Backup individual databases or folders |
| **Cleanup** | Easy to archive/delete unused databases |
| **Debugging** | Inspect specific databases in isolation |
| **Portability** | Easy import/export via zip files |
| **Auditability** | Structured logging for all operations |

---

## Applicable Projects

This pattern is used by:

| Project | Usage |
|---------|-------|
| Spec Management | File history, search cache |
| GSearch CLI | Search results, cache |
| BRun CLI | Build artifacts, logs |
| AI Bridge | Conversation history, chat DBs |
| Nexus Flow | Workflow state, execution history |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Seedable Config | [Seedable Config Architecture](../../06-seedable-config-architecture/00-overview.md) |

---

*Logging, benefits & references — v3.2.0 — 2026-04-19*
