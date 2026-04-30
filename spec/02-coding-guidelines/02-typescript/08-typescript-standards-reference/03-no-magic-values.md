# 3. No Magic Strings, No Magic Numbers

> **Parent:** [00-overview.md](./00-overview.md)

---

## Rule 3.1: All string literals used as identifiers MUST come from constants or enums (gate **G-NS-NO-DEPRECATED-ALIAS**)

```typescript
// ❌ FORBIDDEN — magic strings
if (status === "connected") { ... }
if (action === "self-update") { ... }
toast.success("Cleanup complete");

// ✅ REQUIRED — constants or enums
const enum ConnectionStatus {
  Connected = "connected",
  Disconnected = "disconnected",
  Unknown = "unknown",
}

const enum SnapshotAction {
  Create = "create",
  Restore = "restore",
  Delete = "delete",
  Export = "export",
  Import = "import",
  Cleanup = "cleanup",
}

if (status === ConnectionStatus.Connected) { ... }
if (action === SnapshotAction.Create) { ... }
```

---

## Rule 3.2: All numeric literals with semantic meaning MUST be named constants (gate **G-NS-NO-DEPRECATED-ALIAS**)

```typescript
// ❌ FORBIDDEN — magic numbers
staleTime: 60_000,
const limit = 25;
setTimeout(fn, 5000);

// ✅ REQUIRED
const STALE_TIME_MS = 60_000 as const;
const DEFAULT_PAGE_SIZE = 25 as const;
const POLLING_INTERVAL_MS = 5_000 as const;

staleTime: STALE_TIME_MS,
const limit = DEFAULT_PAGE_SIZE;
setTimeout(fn, POLLING_INTERVAL_MS);
```

---

## Rule 3.3: String unions MUST be proper enums with PascalCase values (gate **G-NS-NO-DEPRECATED-ALIAS**)

```typescript
// ❌ FORBIDDEN — inline string unions
status: "success" | "failed" | "partial";
type: "publish" | "snapshot" | "plugin" | "config" | "connection";

// ❌ FORBIDDEN — named type aliases (still string unions)
type PublishStatus = "success" | "failed" | "partial";

// ✅ REQUIRED — proper enums with Type suffix and PascalCase values
enum PublishStatusType {
  Success = "Success",
  Failed = "Failed",
  Partial = "Partial",
}

enum ActivityType {
  Publish = "Publish",
  Snapshot = "Snapshot",
  Plugin = "Plugin",
  Config = "Config",
  Connection = "Connection",
}
```

**Rule:** Never use string union types (`"a" | "b"`) — always use proper `enum` with PascalCase values and a `Type` suffix on the enum name.
