# Terminology & Concepts

> **Updated:** 2026-04-19

---

## Database Terminology

| Term | Meaning | Example Path |
|------|---------|--------------|
| **Root DB** | Global registry, settings, app list | `data/aibridge.db` |
| **Settings DB** | Configuration (seeded + user) | Inside Root DB |
| **App DB** | Application-scoped metadata | `data/{appName}/search.db` |
| **Session DB** | Per-session isolated storage | `data/{appName}/ai/chat/001-{id}.db` |
| **Cache DB** | Cached results with TTL | `data/{appName}/rag/cache/search/001-{slug}.db` |
| **Document DB** | RAG chunks + embeddings | `data/{appName}/rag/documents/001-{id}.db` |

---

## Hierarchical Structure Examples

### 2-Layer Structure (Simple)

```
data/
├── root.db                              # Root registry
└── {project-slug}/
    ├── config.db                        # Project config
    ├── cache.db                         # Project cache
    └── logs.db                          # Project logs
```

### 3-Layer Structure (Standard - Most Common)

```
data/
├── root.db                              # Root registry database
├── {project-slug}/
│   ├── history/                         # History databases folder
│   │   ├── {file-slug}.db               # Per-file history
│   │   ├── {file-slug-2}.db
│   │   └── ...
│   ├── cache/                           # Cache databases folder
│   │   └── search-cache.db
│   ├── config/                          # Config databases
│   │   └── settings.db
│   ├── chat/                            # Chat session databases
│   │   ├── {session-id}.db
│   │   └── ...
│   ├── voice/                           # Voice recording databases
│   │   └── {recording-id}.db
│   └── search/                          # Search index databases
│       └── {index-id}.db
└── {project-slug-2}/
    └── ...
```

### 4-Layer Structure (Complex - With Categories)

```
data/
├── root.db                              # Root registry database
├── {project-slug}/
│   ├── ai/                              # AI category
│   │   ├── chat/                        # Chat type
│   │   │   ├── {session-id}.db
│   │   │   └── ...
│   │   ├── embeddings/                  # Embeddings type
│   │   │   └── {model-id}.db
│   │   └── prompts/                     # Prompts type
│   │       └── {template-id}.db
│   ├── workflow/                        # Workflow category
│   │   ├── history/                     # History type
│   │   │   └── {file-slug}.db
│   │   └── queue/                       # Queue type
│   │       └── {queue-id}.db
│   └── search/                          # Search category
│       ├── indices/                     # Indices type
│       │   └── {index-id}.db
│       └── cache/                       # Cache type
│           └── {query-hash}.db
└── {project-slug-2}/
    └── ...
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         SPLIT DATABASE ARCHITECTURE (v2.0)                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                              ┌─────────────────┐                                     │
│                              │    ROOT.DB      │                                     │
│                              │   (Registry +   │                                     │
│                              │    Logging)     │                                     │
│                              └────────┬────────┘                                     │
│                                       │                                              │
│           ┌───────────────────────────┼───────────────────────────┐                  │
│           │                           │                           │                  │
│           ▼                           ▼                           ▼                  │
│  ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐            │
│  │  PROJECT-A/     │       │  PROJECT-B/     │       │  PROJECT-C/     │            │
│  └────────┬────────┘       └────────┬────────┘       └────────┬────────┘            │
│           │                         │                         │                     │
│   ┌───────┴───────┐                ...                       ...                    │
│   │       │       │                                                                 │
│   ▼       ▼       ▼                                                                 │
│  ai/   workflow/ search/     ← Categories (optional 4-layer)                        │
│   │                                                                                 │
│   ├── chat/                  ← Types                                                │
│   │    │                                                                            │
│   │    ├── session-001.db    ← Entity DBs                                           │
│   │    └── session-002.db                                                           │
│   │                                                                                 │
│   └── embeddings/                                                                   │
│        └── gpt-4.db                                                                 │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                           IMPORT / EXPORT                                     │   │
│  │  ┌─────────────┐    ZIP     ┌─────────────┐    UNZIP    ┌─────────────┐      │   │
│  │  │ project-a/  │ ────────►  │ project-a   │ ──────────► │ project-a/  │      │   │
│  │  │ (folder)    │            │ .zip        │             │ (restored)  │      │   │
│  │  └─────────────┘            └─────────────┘             └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

*Terminology & concepts — v3.2.0 — 2026-04-19*
