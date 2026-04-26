# 10. Enum Inventory

> **Parent:** [00-overview.md](./00-overview.md)

---

All standardized TypeScript enums for the frontend. Each enum follows the canonical **`as const` object + derived union** shape (Strategy B) — see [TS Overview](../00-overview.md#canonical-enum-shape-strategy-b--as-const--derived-union) and [`20-enums-index.md` §1 rule 9](../../../20-enums-index.md). The `enum` keyword and bare literal string unions are forbidden for named enums.

| Enum | Values | Spec File | Go Equivalent |
|------|--------|-----------|---------------|
| `HttpMethod` | `Get`, `Head`, `Post`, `Put`, `Patch`, `Delete`, `Options` | [http-method-enum.md](../05-http-method-enum.md) | `pkg/enums/httpmethodtype` |
| `ExecutionStatus` | `Idle`, `Running`, `Paused`, `Completed`, `Failed`, `Cancelled` | [execution-status-enum.md](../03-execution-status-enum.md) | `pkg/enums/executionstatustype` |
| `ConnectionStatus` | `Connected`, `Disconnected`, `Connecting`, `Reconnecting`, `Error` | [connection-status-enum.md](../01-connection-status-enum.md) | `pkg/enums/connectionstatustype` |
| `ExportStatus` | `Pending`, `Processing`, `Completed`, `Failed` | [export-status-enum.md](../04-export-status-enum.md) | `pkg/enums/exportstatustype` |
| `MessageStatus` | `Pending`, `Streaming`, `Completed`, `Error` | [message-status-enum.md](../06-message-status-enum.md) | `pkg/enums/messagestatustype` |
| `EntityStatus` | `Active`, `Inactive`, `Draft`, `Archived` | [entity-status-enum.md](../02-entity-status-enum.md) | `pkg/enums/entitystatustype` |
| `LogLevel` | `Debug`, `Info`, `Warn`, `Error`, `Fatal` | [log-level-enum.md](../10-log-level-enum.md) | `pkg/enums/loglevel` |

**Location:** All frontend enums live in `src/lib/enums/` with kebab-case `-type` suffix (e.g., `src/lib/enums/http-method-type.ts`, `src/lib/enums/connection-status-type.ts`).
