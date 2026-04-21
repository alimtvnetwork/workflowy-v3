# Split DB Architecture: Nexus Flow CLI Examples

> **Version:** 3.1.0  
> **Updated:** 2026-04-16  
> **Status:** Active  
> **Parent:** [00-overview.md](../../00-overview.md)

---

## Overview

Concrete database structure examples for the **Nexus Flow CLI** using the Split DB pattern. All field names use **PascalCase** (no underscores).

---

## Database Structure

```
data/
├── nexusflow.db                                   # ROOT DB
│
└── workflows/
    │
    ├── pipeline-001/
    │   ├── meta.db                                # Pipeline definition
    │   │
    │   ├── executions/
    │   │   ├── 001-exec-abc.db                    # Execution session
    │   │   └── 002-exec-def.db
    │   │
    │   └── checkpoints/
    │       ├── 001-checkpoint-abc.db              # RES checkpoint
    │       └── 002-checkpoint-def.db
    │
    └── pipeline-002/
        └── ...
```

---

## Root DB Schema (`nexusflow.db`)

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
('Execution.Timeout', '30m', 'string', 'seed'),
('Execution.MaxConcurrent', '5', 'int', 'seed'),
('Checkpoint.Enabled', 'true', 'bool', 'seed');

-- Pipelines registry
CREATE TABLE Pipeline (
    PipelineId INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Description TEXT,
    Version TEXT DEFAULT '1.0.0',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status TEXT DEFAULT 'active'
);

-- Counters
CREATE TABLE Counter (
    CounterId INTEGER PRIMARY KEY AUTOINCREMENT,
    PipelineId INTEGER,
    Category TEXT NOT NULL,
    CurrentCount INTEGER DEFAULT 0,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Database registry
CREATE TABLE DbRegistry (
    DbRegistryId INTEGER PRIMARY KEY AUTOINCREMENT,
    PipelineId INTEGER NOT NULL,
    Category TEXT NOT NULL,
    EntityId TEXT NOT NULL,
    SequenceNum INTEGER NOT NULL,
    Path TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status TEXT DEFAULT 'active',
    FOREIGN KEY (PipelineId) REFERENCES Pipeline(PipelineId)
);
```

---

## Execution Session DB (`workflows/pipeline-001/executions/001-{id}.db`)

```sql
CREATE TABLE ExecutionMeta (
    ExecutionMetaId INTEGER PRIMARY KEY AUTOINCREMENT,
    ExecutionId TEXT UNIQUE NOT NULL,
    PipelineId INTEGER NOT NULL,
    Input TEXT,
    Output TEXT,
    StartedAt DATETIME,
    CompletedAt DATETIME,
    DurationMs INTEGER,
    Status TEXT NOT NULL DEFAULT 'pending',
    ErrorMessage TEXT
);

CREATE TABLE BlockExecutions (
    BlockExecutionsId INTEGER PRIMARY KEY AUTOINCREMENT,
    ExecutionId TEXT NOT NULL,
    BlockId TEXT NOT NULL,
    BlockType TEXT NOT NULL,
    Input TEXT,
    Output TEXT,
    StartedAt DATETIME,
    CompletedAt DATETIME,
    DurationMs INTEGER,
    Status TEXT NOT NULL DEFAULT 'pending',
    ErrorMessage TEXT,
    RetryCount INTEGER DEFAULT 0
);

CREATE TABLE BlockLogs (
    BlockLogsId INTEGER PRIMARY KEY AUTOINCREMENT,
    BlockExecutionsId INTEGER NOT NULL,
    Level TEXT NOT NULL,
    Message TEXT NOT NULL,
    Metadata TEXT,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BlockExecutionsId) REFERENCES BlockExecutions(BlockExecutionsId)
);
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Split DB Overview | [../00-overview.md](../../00-overview.md) |
| AI Bridge Examples | [./01-aibridge-examples.md](./01-aibridge-examples.md) |
| GSearch Examples | [./02-gsearch-examples.md](./02-gsearch-examples.md) |
| BRun Examples | [./03-brun-examples.md](./03-brun-examples.md) |
| Reset API Tables | [./05-reset-api-tables.md](./05-reset-api-tables.md) |
| Naming Conventions | [../02-coding-guidelines/01-cross-language/07-database-naming.md](../../../02-coding-guidelines/01-cross-language/07-database-naming.md) |

---

*Nexus Flow CLI example for Split DB pattern.*
