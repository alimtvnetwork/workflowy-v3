# Split DB Architecture: GSearch CLI Examples

> **Version:** 3.1.0  
> **Updated:** 2026-04-16  
> **Status:** Active  
> **Parent:** [00-overview.md](../../00-overview.md)

---

## Overview

Concrete database structure examples for the **GSearch CLI** using the Split DB pattern. All field names use **PascalCase** (no underscores).

---

## Database Structure

```
data/
├── gsearch.db                                     # ROOT DB
│
└── searches/                                      # Search data folder
    │
    ├── search.db                                  # Search history/metadata
    │
    └── cache/
        ├── 001-ai-tools-abc123.db                 # Cached: "AI tools 2026"
        ├── 002-golang-patterns-def456.db          # Cached: "golang patterns"
        └── 003-react-hooks-ghi789.db              # Cached: "react hooks"
```

---

## Root DB Schema (`gsearch.db`)

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
('Cache.TtlDays', '5', 'int', 'seed'),
('Cache.MaxEntries', '500', 'int', 'seed'),
('Search.DefaultEngine', 'google', 'string', 'seed'),
('Search.MaxResults', '10', 'int', 'seed');

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
    SizeBytes INTEGER DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt DATETIME,
    Status TEXT DEFAULT 'active'
);
```

---

## Search History DB (`searches/search.db`)

```sql
CREATE TABLE SearchLog (
    SearchLogId INTEGER PRIMARY KEY AUTOINCREMENT,
    Query TEXT NOT NULL,
    QueryHash TEXT NOT NULL,
    SearchType TEXT NOT NULL,
    Engine TEXT NOT NULL,
    SearchedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    DurationMs INTEGER,
    ResultCount INTEGER DEFAULT 0,
    CacheHit BOOLEAN DEFAULT FALSE,
    CacheDbPath TEXT,
    CacheExpiresAt DATETIME,
    Status TEXT DEFAULT 'completed'
);

CREATE INDEX IdxSearchLogHash ON SearchLog(QueryHash);
CREATE INDEX IdxSearchLogTime ON SearchLog(SearchedAt DESC);
```

---

## Cache DB Schema (`searches/cache/001-{slug}.db`)

```sql
CREATE TABLE CacheMeta (
    CacheMetaId INTEGER PRIMARY KEY AUTOINCREMENT,
    Query TEXT NOT NULL,
    QueryHash TEXT NOT NULL,
    SearchType TEXT NOT NULL,
    Engine TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt DATETIME NOT NULL,
    LastAccessed DATETIME,
    AccessCount INTEGER DEFAULT 1,
    TotalResults INTEGER DEFAULT 0,
    Status TEXT DEFAULT 'active'
);

CREATE TABLE Result (
    ResultId INTEGER PRIMARY KEY AUTOINCREMENT,
    Rank INTEGER NOT NULL,
    Title TEXT NOT NULL,
    Url TEXT NOT NULL,
    Snippet TEXT,
    Source TEXT,
    Score REAL,
    Metadata TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Split DB Overview | [../00-overview.md](../../00-overview.md) |
| AI Bridge Examples | [./01-aibridge-examples.md](./01-aibridge-examples.md) |
| BRun Examples | [./03-brun-examples.md](./03-brun-examples.md) |
| Nexus Flow Examples | [./04-nexusflow-examples.md](./04-nexusflow-examples.md) |
| Reset API Tables | [./05-reset-api-tables.md](./05-reset-api-tables.md) |
| Naming Conventions | [../02-coding-guidelines/01-cross-language/07-database-naming.md](../../../02-coding-guidelines/01-cross-language/07-database-naming.md) |

---

*GSearch CLI example for Split DB pattern.*
