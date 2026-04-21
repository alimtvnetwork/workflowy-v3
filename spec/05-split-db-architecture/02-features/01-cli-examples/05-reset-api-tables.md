# Split DB Architecture: Reset API Tables

> **Version:** 3.1.0  
> **Updated:** 2026-04-16  
> **Status:** Active  
> **Parent:** [00-overview.md](../../00-overview.md)

---

## Overview

Reset API tables shared across all CLIs using the Split DB pattern. All field names use **PascalCase** (no underscores).

---

## ResetRequests Table Schema

All CLI root databases include the following table for 2-step reset confirmation:

```sql
CREATE TABLE ResetRequests (
    ResetRequestsId INTEGER PRIMARY KEY AUTOINCREMENT,                           -- rst_{uuid}
    Scope TEXT NOT NULL,                           -- "all", "app", "cache", etc.
    AppName TEXT,                                  -- For app-scoped resets
    RequestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt DATETIME NOT NULL,                   -- RequestedAt + 5 minutes
    AffectedItems TEXT,                            -- JSON: preview of deletion
    ConfirmedAt DATETIME,
    CancelledAt DATETIME,
    CompletedAt DATETIME,
    Status TEXT DEFAULT 'pending',                 -- pending, confirmed, expired, cancelled, completed
    DeletedCount INTEGER,
    FreedBytes INTEGER,
    ErrorMessage TEXT
);

CREATE INDEX IdxResetStatus ON ResetRequests(Status, ExpiresAt);
CREATE INDEX IdxResetApp ON ResetRequests(AppName);
```

---

## Reset Scopes by CLI

| CLI | Available Scopes |
|-----|------------------|
| AI Bridge | `all`, `app`, `chat`, `rag`, `search`, `seo` |
| GSearch | `all`, `cache`, `history` |
| BRun | `all`, `runs`, `profile:{name}` |
| Nexus Flow | `all`, `executions`, `pipeline:{id}`, `checkpoints` |

---

## API Endpoints (All CLIs)

```
POST /api/v1/reset/request
  Request:  { "Scope": "<scope>", "AppName": "<app>" }
  Response: { "ResetId": "rst_abc123", "ExpiresAt": "...", "AffectedItems": {...} }

POST /api/v1/reset/confirm
  Request:  { "ResetId": "rst_abc123" }
  Response: { "Status": "completed", "DeletedDatabases": 87, "FreedBytes": 524288000 }

POST /api/v1/reset/cancel
  Request:  { "ResetId": "rst_abc123" }
  Response: { "Status": "cancelled" }
```

---

## Example: AI Bridge Reset Flow

### Step 1: Request

```json
POST /api/v1/reset/request
{
  "Scope": "app",
  "AppName": "myproject"
}

// Response
{
  "ResetId": "rst_abc123def456",
  "Scope": "app",
  "AppName": "myproject",
  "ExpiresAt": "2026-02-02T10:35:00Z",
  "AffectedItems": {
    "ChatSessions": 12,
    "RagDocuments": 45,
    "SearchCaches": 30,
    "SeoJobs": 5,
    "TotalDatabases": 92,
    "TotalBytes": 524288000
  },
  "Message": "Review affected items and confirm within 5 minutes"
}
```

### Step 2: Confirm (within 5 minutes)

```json
POST /api/v1/reset/confirm
{
  "ResetId": "rst_abc123def456"
}

// Response
{
  "Status": "completed",
  "Scope": "app",
  "AppName": "myproject",
  "DeletedDatabases": 92,
  "FreedBytes": 524288000,
  "Duration": "2.3s"
}
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Split DB Overview | [../00-overview.md](../../00-overview.md) |
| AI Bridge Examples | [./01-aibridge-examples.md](./01-aibridge-examples.md) |
| GSearch Examples | [./02-gsearch-examples.md](./02-gsearch-examples.md) |
| BRun Examples | [./03-brun-examples.md](./03-brun-examples.md) |
| Nexus Flow Examples | [./04-nexusflow-examples.md](./04-nexusflow-examples.md) |
| Reset API Standard | [../02-reset-api-standard.md](../02-reset-api-standard.md) |
| Naming Conventions | [../02-coding-guidelines/01-cross-language/07-database-naming.md](../../../02-coding-guidelines/01-cross-language/07-database-naming.md) |

---

*Reset API tables shared across all CLIs using Split DB pattern.*
