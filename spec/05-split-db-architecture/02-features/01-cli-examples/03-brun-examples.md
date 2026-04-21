# Split DB Architecture: BRun CLI Examples

> **Version:** 3.1.0  
> **Updated:** 2026-04-16  
> **Status:** Active  
> **Parent:** [00-overview.md](../../00-overview.md)

---

## Overview

Concrete database structure examples for the **BRun CLI** using the Split DB pattern. All field names use **PascalCase** (no underscores).

---

## Database Structure

```
data/
├── brun.db                                        # ROOT DB
│
└── runs/
    ├── 001-backend-build-abc.db                   # Build run session
    ├── 002-frontend-build-def.db
    └── 003-full-stack-ghi.db
```

---

## Root DB Schema (`brun.db`)

```sql
-- Settings
CREATE TABLE Setting (
    SettingId INTEGER PRIMARY KEY AUTOINCREMENT,
    Key TEXT UNIQUE NOT NULL,
    Value TEXT NOT NULL,
    ValueType TEXT DEFAULT 'string',
    Source TEXT DEFAULT 'seed',
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Setting (Key, Value, ValueType, Source) VALUES
('Runs.KeepCount', '100', 'int', 'seed'),
('Runs.VacuumInterval', '24h', 'string', 'seed');

-- Profiles
CREATE TABLE Profile (
    ProfileId INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT UNIQUE NOT NULL,
    Runtime TEXT NOT NULL,
    Command TEXT,
    WorkDir TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Counters
CREATE TABLE Counter (
    CounterId INTEGER PRIMARY KEY AUTOINCREMENT,
    Category TEXT NOT NULL,
    CurrentCount INTEGER DEFAULT 0,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Database registry
CREATE TABLE DbRegistry (
    DbRegistryId INTEGER PRIMARY KEY AUTOINCREMENT,
    Category TEXT NOT NULL,
    EntityId TEXT NOT NULL,
    SequenceNum INTEGER NOT NULL,
    Path TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status TEXT DEFAULT 'active'
);
```

---

## Run Session DB (`runs/001-{id}.db`)

```sql
CREATE TABLE BuildRun (
    BuildRunId INTEGER PRIMARY KEY AUTOINCREMENT,
    RunId TEXT UNIQUE NOT NULL,
    ProfileName TEXT,
    Runtime TEXT NOT NULL,
    Command TEXT,
    WorkDir TEXT,
    ExitCode INTEGER NOT NULL DEFAULT 0,
    Success BOOLEAN NOT NULL DEFAULT FALSE,
    Stdout TEXT,
    Stderr TEXT,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    DurationMs INTEGER NOT NULL,
    Port INTEGER DEFAULT 0,
    LogPath TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE BuildErrors (
    BuildErrorsId INTEGER PRIMARY KEY AUTOINCREMENT,
    BuildRunId INTEGER NOT NULL,
    File TEXT,
    Line INTEGER DEFAULT 0,
    Column INTEGER DEFAULT 0,
    Message TEXT NOT NULL,
    Severity TEXT NOT NULL,
    Code TEXT,
    StackTrace TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BuildRunId) REFERENCES BuildRun(BuildRunId)
);

CREATE TABLE AssetOperations (
    AssetOperationsId INTEGER PRIMARY KEY AUTOINCREMENT,
    BuildRunId INTEGER NOT NULL,
    Source TEXT NOT NULL,
    Destination TEXT NOT NULL,
    Mode TEXT NOT NULL,
    FilesCopied INTEGER NOT NULL DEFAULT 0,
    FilesSkipped INTEGER NOT NULL DEFAULT 0,
    BytesCopied INTEGER NOT NULL DEFAULT 0,
    DurationMs INTEGER NOT NULL DEFAULT 0,
    Success BOOLEAN NOT NULL DEFAULT FALSE,
    ErrorMsg TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BuildRunId) REFERENCES BuildRun(BuildRunId)
);
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Split DB Overview | [../00-overview.md](../../00-overview.md) |
| AI Bridge Examples | [./01-aibridge-examples.md](./01-aibridge-examples.md) |
| GSearch Examples | [./02-gsearch-examples.md](./02-gsearch-examples.md) |
| Nexus Flow Examples | [./04-nexusflow-examples.md](./04-nexusflow-examples.md) |
| Reset API Tables | [./05-reset-api-tables.md](./05-reset-api-tables.md) |
| Naming Conventions | [../02-coding-guidelines/01-cross-language/07-database-naming.md](../../../02-coding-guidelines/01-cross-language/07-database-naming.md) |

---

*BRun CLI example for Split DB pattern.*
