# 14.2 Route Naming Conventions

> **Parent:** [Phase 14 overview](./00-overview.md)

---

### Resource-based naming

Routes follow a **resource/action** pattern using kebab-case:

```
/{resource}                    → List or create
/{resource}/{action}           → Perform action on resource
/{resource}/(?P<id>\d+)        → Single resource by ID
/{resource}/{sub-resource}     → Nested resource
```

### Naming rules

| Rule | ✅ Correct | ❌ Wrong |
|------|-----------|---------|
| Plural nouns for collections | `plugins`, `agents`, `snapshots` | `plugin`, `agent` |
| Kebab-case for multi-word paths | `upload-active`, `sync-manifest` | `uploadActive`, `sync_manifest` |
| Action verbs as path segments | `plugins/enable`, `logs/clear` | `enablePlugin`, `clearLogs` |
| Nested resources use parent prefix | `snapshots/settings`, `agents/plugins` | `snapshot-settings` |
| No file extensions | `/status` | `/status.json` |
| No trailing slashes | `/plugins` | `/plugins/` |

### Standard endpoint categories

Group endpoints by domain. Each group shares a route prefix:

| Category | Prefix | Purpose | Examples |
|----------|--------|---------|----------|
| **System** | (root) | Plugin health, diagnostics | `status`, `openapi`, `opcache-reset` |
| **Plugins** | `plugins/` | Plugin lifecycle management | `plugins`, `plugins/enable`, `plugins/delete` |
| **Sync** | `plugins/sync` | File synchronization | `plugins/sync`, `plugins/sync-manifest` |
| **Content** | (root) | WordPress content management | `posts`, `categories`, `media` |
| **Logs** | `logs/` | Log management and retrieval | `logs`, `logs/status`, `logs/clear` |
| **Diagnostics** | (root) | Error logs, debugging | `error-logs`, `error-sessions` |
| **Agents** | `agents/` | Multi-site agent management | `agents`, `agents/add`, `agents/sync` |
| **Snapshots** | `snapshots/` | Backup and snapshot management | `snapshots/list`, `snapshots/restore` |
| **Cloud Storage** | `cloud-storage/` | Remote storage providers | `cloud-storage/accounts`, `cloud-storage/upload` |
| **Users** | `users/` | User management | `users`, `users/export` |
| **Settings** | (root) | Plugin configuration | `site-settings`, `site-health-summary` |
| **Debug** | `debug/` | Development-only routes | `debug/routes` |

---
