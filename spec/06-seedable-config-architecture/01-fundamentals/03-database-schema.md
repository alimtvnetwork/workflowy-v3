# Database Schema

> **Parent:** [00-overview.md](./00-overview.md)

All table and column names use **PascalCase** per `spec/02-coding-guidelines/01-cross-language/07-database-naming.md`.

---

## Table: ConfigMeta

```sql
CREATE TABLE ConfigMeta (
    ConfigMetaId INTEGER PRIMARY KEY AUTOINCREMENT,
    SeedVersion TEXT NOT NULL,
    CurrentVersion TEXT NOT NULL,
    LastSeededAt DATETIME,
    ChangelogUpdatedAt DATETIME,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Table: Setting

```sql
CREATE TABLE Setting (
    SettingId INTEGER PRIMARY KEY AUTOINCREMENT,
    Category TEXT NOT NULL,
    Key TEXT NOT NULL,
    Value TEXT NOT NULL,           -- JSON encoded
    Type TEXT NOT NULL,
    AddedInVersion TEXT,           -- Version when setting was added
    ModifiedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(Category, Key)
);

CREATE INDEX IdxSettingsCategory ON Setting(Category);
```

---

## Table: SettingHistory

```sql
CREATE TABLE SettingHistory (
    SettingsHistoryId INTEGER PRIMARY KEY AUTOINCREMENT,
    SettingId INTEGER NOT NULL,
    OldValue TEXT,
    NewValue TEXT NOT NULL,
    ChangedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    ChangedBy TEXT,                -- user, system, seed
    Version TEXT,                  -- Version at time of change
    FOREIGN KEY (SettingId) REFERENCES Setting(SettingId)
);

CREATE INDEX IdxHistorySetting ON SettingHistory(SettingId);
CREATE INDEX IdxHistoryChanged ON SettingHistory(ChangedAt);
```
