# TypeScript ExecutionStatus Enum — `src/lib/enums/execution-status.ts`

> **Version**: 2.0.0
> **Last updated**: 2026-04-25
> **Tracks**: Issue #10 (`spec/23-how-app-issues-track/10-domain-status-magic-strings.md`)

---

## Purpose

Typed enum for all execution lifecycle states — pipeline runs, instruction execution, build processes, code generation chains, and any task that transitions through idle → running → terminal states. Eliminates `status === 'running'` magic strings across frontend specs.

---

## Reference Implementation

```typescript
// src/lib/enums/execution-status-type.ts

export const ExecutionStatus = {
  Idle: "IDLE",
  Running: "RUNNING",
  Paused: "PAUSED",
  Completed: "COMPLETED",
  Failed: "FAILED",
  Cancelled: "CANCELLED",
} as const;

export type ExecutionStatus = (typeof ExecutionStatus)[keyof typeof ExecutionStatus];
```

> **Convention** (per [`20-enums-index.md`](../../20-enums-index.md) §1 rule 9): canonical TS enum shape is `as const` object + derived union (Strategy B). The `enum` keyword and bare literal unions are forbidden. See [TS Overview](./00-overview.md#canonical-enum-shape-strategy-b--as-const--derived-union).

---

## Usage Patterns

### Status Comparisons

```typescript
// ❌ WRONG: Magic string
if (execution.status === 'running') { ... }

// ✅ CORRECT: Enum constant
if (execution.status === ExecutionStatus.Running) { ... }
```

### Conditional Rendering

```typescript
// ❌ WRONG
{chain.status !== 'running' && <ChainSummary chain={chain} />}

// ✅ CORRECT
{chain.status !== ExecutionStatus.Running && <ChainSummary chain={chain} />}
```

### Type Definitions

```typescript
// ❌ WRONG: Union of magic strings
interface ExecutionResult {
  status: 'pending' | 'running' | 'success' | 'failed';
}

// ✅ CORRECT: Enum-typed
interface ExecutionResult {
  status: ExecutionStatus;
}
```

### Terminal State Helpers

```typescript
const TERMINAL_STATES = new Set([
  ExecutionStatus.Completed,
  ExecutionStatus.Failed,
  ExecutionStatus.Cancelled,
]);

function isTerminal(status: ExecutionStatus): boolean {
  return TERMINAL_STATES.has(status);
}
```

---

## Consuming Spec Files

| Spec File | Pattern Replaced |
|-----------|-----------------|
| `05-features/06-ai-integration/08-ai-chat-ui.md` | `slot.status === 'loading'/'idle'` |
| `05-features/25-ai-enhancements/05-03-message-display.md` | `execution.status === 'success'/'failed'` |
| `05-features/09-knowledge-memory/11-knowledge-memory-ui.md` | `job.status === 'running'/'completed'/'failed'` |
| `05-features/27-automation-pipeline/10-react-flow-canvas.md` | `executionState?.status === 'RUNNING'` |
| `05-features/25-ai-enhancements/03-02-plan-execution.md` | Plan execution status checks |
| `20-shared-cli-frontend/15-hooks-library.md` | `Status === 'running'/'error'` |
| `09-gsearch-cli/02-frontend/05-ui-patterns.md` | Execution status checks |

---

## Cross-Language Parity

| Feature | Go | TypeScript |
|---------|-----|-----------|
| Package | `pkg/enums/executionstatus` | `src/lib/enums/execution-status-type.ts` |
| Type | `byte` iota | `as const` object + derived union |
| Values | `Idle`, `Running`, `Paused`, `Completed`, `Failed`, `Cancelled` | Same |

---

## Cross-References

- Issue #10 — Domain Status Magic Strings <!-- external: spec/23-how-app-issues-track/10-domain-status-magic-strings.md -->
- [HttpMethod Enum](./05-http-method-enum.md) — Sibling enum spec
- [TypeScript Standards](./08-typescript-standards-reference/00-overview.md) — Parent spec
- [TS Overview — Strategy B](./00-overview.md#canonical-enum-shape-strategy-b--as-const--derived-union)
- [Master Coding Guidelines §8](../01-cross-language/15-master-coding-guidelines/00-overview.md) — Magic strings zero tolerance

---

*ExecutionStatus enum v2.0.0 — 2026-04-25 — migrated to `as const` + derived union (AUDIT-05).*
