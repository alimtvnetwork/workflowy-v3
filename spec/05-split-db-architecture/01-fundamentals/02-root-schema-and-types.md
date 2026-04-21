# Root Schema & Database Types

> **Updated:** 2026-04-19

---

## Root Database Schema

### Table: Project

```sql
CREATE TABLE Project (
    ProjectId INTEGER PRIMARY KEY AUTOINCREMENT,
    Slug TEXT UNIQUE NOT NULL,
    DisplayName TEXT NOT NULL,
    Path TEXT NOT NULL,                    -- Relative path to project folder
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status TEXT DEFAULT 'active'           -- active, archived, deleted
);

CREATE INDEX IdxProject_Slug ON Project(Slug);
CREATE INDEX IdxProject_Status ON Project(Status);
```

### Table: Database

```sql
CREATE TABLE Database (
    DatabaseId INTEGER PRIMARY KEY AUTOINCREMENT,
    ProjectId INTEGER NOT NULL,
    Type TEXT NOT NULL,                    -- history, cache, config, search, etc.
    EntityId TEXT,                         -- File slug, search ID, etc.
    Path TEXT NOT NULL,                    -- Relative path to .db file
    SizeBytes INTEGER DEFAULT 0,
    RecordCount INTEGER DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastAccessedAt DATETIME,
    Status TEXT DEFAULT 'active',          -- active, archived, deleted
    FOREIGN KEY (ProjectId) REFERENCES Project(ProjectId)
);

CREATE INDEX IdxDatabase_ProjectId ON Database(ProjectId);
CREATE INDEX IdxDatabase_Type ON Database(Type);
CREATE INDEX IdxDatabase_EntityId ON Database(EntityId);
```

### Table: DatabaseStat

```sql
CREATE TABLE DatabaseStat (
    DatabaseStatId INTEGER PRIMARY KEY AUTOINCREMENT,
    DatabaseId INTEGER NOT NULL,
    RecordedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    SizeBytes INTEGER,
    RecordCount INTEGER,
    QueryCount INTEGER DEFAULT 0,
    AvgQueryMs REAL,
    FOREIGN KEY (DatabaseId) REFERENCES Database(DatabaseId)
);

CREATE INDEX IdxDatabaseStat_DatabaseId ON DatabaseStat(DatabaseId);
CREATE INDEX IdxDatabaseStat_RecordedAt ON DatabaseStat(RecordedAt);
```

---

## Database Types

| Type | Purpose | Entity Example | Retention |
|------|---------|----------------|-----------|
| `history` | Version history tracking | File slug | Permanent |
| `cache` | Cached data (search, API) | Cache type | 7-30 days |
| `config` | Configuration/settings | - | Permanent |
| `search` | Search results | Search ID | 30 days |
| `session` | User sessions | Session ID | 24 hours |
| `analytics` | Usage analytics | - | 90 days |
| `logs` | Application logs | Date | 14 days |
| `queue` | Job/task queues | Queue name | Until processed |

---

*Root schema & types — v3.2.0 — 2026-04-19*
