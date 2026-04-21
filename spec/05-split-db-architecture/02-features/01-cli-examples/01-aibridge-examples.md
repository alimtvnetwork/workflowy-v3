# Split DB Architecture: AI Bridge CLI Examples

> **Version:** 3.1.0  
> **Updated:** 2026-04-16  
> **Status:** Active  
> **Parent:** [00-overview.md](../../00-overview.md)

---

## Overview

Concrete database structure examples for the **AI Bridge CLI** using the Split DB pattern. All field names use **PascalCase** (no underscores).

---

## Database Structure

```
data/
├── aibridge.db                                    # ROOT DB
│
└── myproject/                                     # APP FOLDER
    │
    ├── search.db                                  # Search metadata DB
    │
    ├── rag/
    │   ├── cache/
    │   │   └── search/
    │   │       ├── 001-golang-patterns-abc123.db  # Cached search results
    │   │       └── 002-react-hooks-def456.db
    │   │
    │   └── documents/
    │       ├── 001-readme-md.db                   # RAG chunks for README.md
    │       └── 002-main-go.db                     # RAG chunks for main.go
    │
    ├── ai/
    │   └── chat/
    │       ├── 001-chat-xyz789.db                 # Chat session + messages
    │       └── 002-chat-abc123.db
    │
    └── settings/
        └── config.db                              # App-level settings override
```

---

## Root DB Schema (`aibridge.db`)

```sql
-- Settings table (seeded from config.seed.json)
CREATE TABLE Setting (
    SettingId INTEGER PRIMARY KEY AUTOINCREMENT,
    Key TEXT UNIQUE NOT NULL,
    Value TEXT NOT NULL,
    ValueType TEXT DEFAULT 'string',
    Source TEXT DEFAULT 'user',
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default settings from seed
INSERT INTO Setting (Key, Value, ValueType, Source, Description) VALUES
('Search.Cache.TtlDays', '5', 'int', 'seed', 'Search cache TTL in days'),
('Search.Cache.MaxEntries', '1000', 'int', 'seed', 'Max cached entries per app'),
('Rag.ChunkSize', '512', 'int', 'seed', 'Default chunk size in tokens'),
('Rag.ChunkOverlap', '50', 'int', 'seed', 'Chunk overlap in tokens');

-- Applications registry
CREATE TABLE Application (
    ApplicationId INTEGER PRIMARY KEY AUTOINCREMENT,
    AppName TEXT UNIQUE NOT NULL,
    DisplayName TEXT NOT NULL,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastAccessed DATETIME,
    Status TEXT DEFAULT 'active'
);

-- Sequence counters
CREATE TABLE Counter (
    CounterId INTEGER PRIMARY KEY AUTOINCREMENT,
    ApplicationId INTEGER NOT NULL,
    Category TEXT NOT NULL,
    SubCategory TEXT NOT NULL,
    CurrentCount INTEGER DEFAULT 0,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ApplicationId) REFERENCES Application(ApplicationId),
    UNIQUE(ApplicationId, Category, SubCategory)
);

-- Database registry
CREATE TABLE DbRegistry (
    DbRegistryId INTEGER PRIMARY KEY AUTOINCREMENT,
    ApplicationId INTEGER NOT NULL,
    Category TEXT NOT NULL,
    SubCategory TEXT NOT NULL,
    EntityId TEXT NOT NULL,
    SequenceNum INTEGER NOT NULL,
    Path TEXT NOT NULL,
    DisplayName TEXT,
    SizeBytes INTEGER DEFAULT 0,
    RecordCount INTEGER DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastAccessed DATETIME,
    ExpiresAt DATETIME,
    Status TEXT DEFAULT 'active',
    FOREIGN KEY (ApplicationId) REFERENCES Application(ApplicationId)
);
```

---

## Chat Session DB Schema (`data/{app}/ai/chat/001-{id}.db`)

```sql
-- Session metadata
CREATE TABLE SessionMeta (
    SessionMetaId INTEGER PRIMARY KEY AUTOINCREMENT,
    SessionId TEXT UNIQUE NOT NULL,
    Title TEXT,
    ModelCategory TEXT NOT NULL,
    ModelUsed TEXT,
    BackendUsed TEXT,
    RagEnabled BOOLEAN DEFAULT FALSE,
    RagSources TEXT,
    MessageCount INTEGER DEFAULT 0,
    TotalTokens INTEGER DEFAULT 0,
    TotalToolCalls INTEGER DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastMessageAt DATETIME,
    Status TEXT DEFAULT 'active'
);

-- Messages (conversation history)
CREATE TABLE Message (
    MessageId INTEGER PRIMARY KEY AUTOINCREMENT,
    SequenceNum INTEGER NOT NULL,
    Role TEXT NOT NULL,
    Content TEXT NOT NULL,
    Tokens INTEGER,
    Model TEXT,
    RagContext TEXT,
    RagChunkIds TEXT,
    Metadata TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    CompletedAt DATETIME
);

-- Tool calls
CREATE TABLE ToolCalls (
    ToolCallsId INTEGER PRIMARY KEY AUTOINCREMENT,
    MessageId INTEGER NOT NULL,
    ToolName TEXT NOT NULL,
    Arguments TEXT,
    Result TEXT,
    ResultType TEXT,
    StartedAt DATETIME,
    CompletedAt DATETIME,
    DurationMs INTEGER,
    Status TEXT NOT NULL DEFAULT 'pending',
    ErrorMessage TEXT,
    FOREIGN KEY (MessageId) REFERENCES Message(MessageId)
);
```

---

## API to DB Mapping

| Endpoint | Action | Target DB |
|----------|--------|-----------|
| `POST /api/v1/chat/sessions` | Create session | Creates `data/{app}/ai/chat/{seq}-{id}.db` |
| `GET /api/v1/chat/sessions?appName=X` | List sessions | Reads from `aibridge.db` → DbRegistry |
| `GET /api/v1/chat/sessions/:id` | Get session | Reads `data/{app}/ai/chat/{seq}-{id}.db` → SessionMeta |
| `POST /api/v1/chat/sessions/:id/messages` | Send message | Writes to `data/{app}/ai/chat/{seq}-{id}.db` → Messages + ToolCalls |
| `GET /api/v1/chat/sessions/:id/messages` | Get messages | Reads `data/{app}/ai/chat/{seq}-{id}.db` → Messages |

---

## JSON Transport Examples

### Create Session Request

```json
{
  "AppName": "myproject",
  "Title": "Code Review Session",
  "ModelCategory": "coding",
  "RagEnabled": true,
  "RagSources": ["001-readme-md", "002-main-go"]
}
```

### Send Message Request

```json
{
  "Role": "user",
  "Content": "Explain the main function in main.go",
  "Metadata": {
    "ClientVersion": "1.0.0",
    "Timestamp": "2026-02-02T10:30:00Z"
  }
}
```

### Message Response

```json
{
  "Id": "msg-xyz789",
  "SessionId": "001-chat-abc123",
  "SequenceNum": 3,
  "Role": "assistant",
  "Content": "The main function initializes the application...",
  "Tokens": 245,
  "Model": "codellama:13b",
  "RagContext": [
    {
      "ChunkId": "chunk-001",
      "Content": "func main() { ... }",
      "Similarity": 0.92
    }
  ],
  "CreatedAt": "2026-02-02T10:30:05Z",
  "CompletedAt": "2026-02-02T10:30:12Z"
}
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Split DB Overview | [../00-overview.md](../../00-overview.md) |
| GSearch Examples | [./02-gsearch-examples.md](./02-gsearch-examples.md) |
| BRun Examples | [./03-brun-examples.md](./03-brun-examples.md) |
| Nexus Flow Examples | [./04-nexusflow-examples.md](./04-nexusflow-examples.md) |
| Reset API Tables | [./05-reset-api-tables.md](./05-reset-api-tables.md) |
| Naming Conventions | [../02-coding-guidelines/01-cross-language/07-database-naming.md](../../../02-coding-guidelines/01-cross-language/07-database-naming.md) |

---

*Primary CLI example for Split DB pattern.*
