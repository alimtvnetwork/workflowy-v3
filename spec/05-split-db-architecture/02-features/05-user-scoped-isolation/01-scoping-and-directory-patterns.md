# 1. Scoping & Directory Patterns

> **Parent:** [User-Scoped Isolation overview](./00-overview.md)

---

## Scoping Hierarchy

The Split DB architecture supports three scoping levels:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           SCOPING HIERARCHY                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   ┌─────────────────┐                                                               │
│   │   ROOT LEVEL    │  data/root.db                                                 │
│   │   (Global)      │  data/{appName}/                                              │
│   └────────┬────────┘                                                               │
│            │                                                                         │
│   ┌────────┴────────┐                                                               │
│   │                  │                                                               │
│   ▼                  ▼                                                               │
│ ┌─────────────┐   ┌─────────────┐                                                   │
│ │  COMPANY    │   │    USER     │                                                   │
│ │   SCOPE     │   │   SCOPE     │                                                   │
│ │             │   │             │                                                   │
│ │ companies/  │   │  users/     │                                                   │
│ │ {company}/  │   │  {userId}/  │                                                   │
│ └──────┬──────┘   └──────┬──────┘                                                   │
│        │                  │                                                          │
│        ▼                  ▼                                                          │
│ ┌─────────────┐   ┌─────────────┐                                                   │
│ │  USER SCOPE │   │  SESSION    │                                                   │
│ │  (Company)  │   │  SCOPE      │                                                   │
│ │             │   │             │                                                   │
│ │ {company}/  │   │ sessions/   │                                                   │
│ │ users/      │   │ {session}/  │                                                   │
│ │ {userId}/   │   │             │                                                   │
│ └─────────────┘   └─────────────┘                                                   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure Patterns

### Pattern 1: App-Level User Isolation

For applications where users are independent (not grouped by company):

```
data/
├── root.db                                    # Global registry
├── {appName}/
│   ├── app.db                                 # App metadata
│   │
│   └── users/
│       ├── {userId-1}/
│       │   ├── settings.db                    # User preferences
│       │   ├── sessions/
│       │   │   └── {sessionId}.db             # User sessions
│       │   ├── history/
│       │   │   └── {historyId}.db             # User activity history
│       │   └── data/
│       │       └── {dataType}/{entityId}.db   # User-owned data
│       │
│       ├── {userId-2}/
│       │   └── ...
│       └── ...
```

### Pattern 2: Company + User Isolation (Enterprise)

For multi-tenant applications with company hierarchy:

```
data/
├── root.db                                    # Global registry
├── {appName}/
│   ├── app.db                                 # App metadata
│   │
│   └── companies/
│       ├── {companySlug-1}/
│       │   ├── company.db                     # Company metadata
│       │   │
│       │   └── users/
│       │       ├── {userId-1}/
│       │       │   ├── settings.db            # User preferences
│       │       │   ├── sessions/
│       │       │   │   └── {sessionId}.db
│       │       │   └── data/
│       │       │       └── ...
│       │       │
│       │       └── {userId-2}/
│       │           └── ...
│       │
│       └── {companySlug-2}/
│           └── ...
```

### Pattern 3: Module-Based User Isolation

For applications with distinct modules:

```
data/
├── root.db                                    # Global registry
├── {appName}/
│   │
│   ├── chat/
│   │   └── users/
│   │       └── {userId}/
│   │           └── {sessionId}.db
│   │
│   ├── rag/
│   │   └── users/
│   │       └── {userId}/
│   │           └── documents/
│   │               └── {docId}.db
│   │
│   └── seo/
│       └── companies/
│           └── {companySlug}/
│               └── users/
│                   └── {userId}/
│                       └── jobs/
│                           └── {jobId}.db
```
