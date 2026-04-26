# TypeScript ExportStatus Enum — `src/lib/enums/export-status.ts`

> **Version**: 2.0.0
> **Last updated**: 2026-04-25
> **Tracks**: Issue #10 (`spec/23-how-app-issues-track/10-domain-status-magic-strings.md`)

---

## Purpose

Typed enum for import/export operation lifecycle states. Replaces `exportStatus === 'completed'` magic strings in frontend specs.

---

## Reference Implementation

```typescript
// src/lib/enums/export-status-type.ts

export const ExportStatus = {
  Pending: "PENDING",
  Processing: "PROCESSING",
  Completed: "COMPLETED",
  Failed: "FAILED",
} as const;

export type ExportStatus = (typeof ExportStatus)[keyof typeof ExportStatus];
```

> **Convention** (per [`20-enums-index.md`](../../20-enums-index.md) §1 rule 9): canonical TS enum shape is `as const` object + derived union (Strategy B). The `enum` keyword and bare literal unions are forbidden. See [TS Overview](./00-overview.md#canonical-enum-shape-strategy-b--as-const--derived-union).

---

## Usage Patterns

### Status Comparisons

```typescript
// ❌ WRONG: Magic string
if (exportStatus === 'completed') { ... }

// ✅ CORRECT: Enum constant
if (exportStatus === ExportStatus.Completed) { ... }
```

### Conditional Rendering

```typescript
// ❌ WRONG
{!isExporting && exportStatus !== 'completed' && <ExportForm />}

// ✅ CORRECT
{!isExporting && exportStatus !== ExportStatus.Completed && <ExportForm />}
```

### Type Definitions

```typescript
// ❌ WRONG
interface ExportState {
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// ✅ CORRECT
interface ExportState {
  status: ExportStatus;
}
```

---

## Consuming Spec Files

| Spec File | Pattern Replaced |
|-----------|-----------------|
| `05-features/03-project-management/02-import-export-ui.md` | `exportStatus === 'completed'/'failed'/'processing'` |
| `05-features/27-automation-pipeline/20-import-export.md` | Import/export status checks |

---

## Cross-Language Parity

| Feature | Go | TypeScript |
|---------|-----|-----------|
| Package | `pkg/enums/exportstatus` | `src/lib/enums/export-status-type.ts` |
| Type | `byte` iota | `as const` object + derived union |
| Values | `Pending`, `Processing`, `Completed`, `Failed` | Same |

---

## Cross-References

- Issue #10 — Domain Status Magic Strings <!-- external: spec/23-how-app-issues-track/10-domain-status-magic-strings.md -->
- [HttpMethod Enum](./05-http-method-enum.md) — Sibling enum spec
- [TypeScript Standards](./08-typescript-standards-reference/00-overview.md) — Parent spec
- [TS Overview — Strategy B](./00-overview.md#canonical-enum-shape-strategy-b--as-const--derived-union)

---

*ExportStatus enum v2.0.0 — 2026-04-25 — migrated to `as const` + derived union (AUDIT-05).*
