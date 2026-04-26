# TypeScript ConnectionStatus Enum — `src/lib/enums/connection-status.ts`

> **Version**: 2.0.0
> **Last updated**: 2026-04-25
> **Tracks**: Issue #10 (`spec/23-how-app-issues-track/10-domain-status-magic-strings.md`)

---

## Purpose

Typed enum for WebSocket, SSE, and service connection lifecycle states. Replaces `connection.status === 'connected'` magic strings in frontend specs.

---

## Reference Implementation

```typescript
// src/lib/enums/connection-status-type.ts

export const ConnectionStatus = {
  Connected: "CONNECTED",
  Disconnected: "DISCONNECTED",
  Connecting: "CONNECTING",
  Reconnecting: "RECONNECTING",
  Error: "ERROR",
} as const;

export type ConnectionStatus = (typeof ConnectionStatus)[keyof typeof ConnectionStatus];
```

> **Convention** (per [`20-enums-index.md`](../../20-enums-index.md) §1 rule 9): canonical TS enum shape is `as const` object + derived union (Strategy B). The `enum` keyword and bare literal unions are forbidden. See [TS Overview](./00-overview.md#canonical-enum-shape-strategy-b--as-const--derived-union).

---

## Usage Patterns

### Status Comparisons

```typescript
// ❌ WRONG: Magic string
if (connection.status === 'connected') { ... }

// ✅ CORRECT: Enum constant
if (connection.status === ConnectionStatus.Connected) { ... }
```

### Conditional Rendering

```typescript
// ❌ WRONG
{wsStatus === 'disconnected' && <ReconnectBanner />}

// ✅ CORRECT
{wsStatus === ConnectionStatus.Disconnected && <ReconnectBanner />}
```

### Type Definitions

```typescript
// ❌ WRONG
interface WebSocketState {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
}

// ✅ CORRECT
interface WebSocketState {
  status: ConnectionStatus;
}
```

---

## Consuming Spec Files

| Spec File | Pattern Replaced |
|-----------|-----------------|
| `05-features/05-voice-input/06-voice-session-manager.md` | `connection.status === 'connected'` |
| `01-general-spec/09-api-integration/02-websocket-patterns-api-integration.md` | WebSocket connection status checks |
| `05-features/27-automation-pipeline/24-collaboration.md` | Participant connection state |
| `08-roadmap-overview/05-gap-analysis.md` | Connection status references |
| `16-ai-transcribe-cli/02-frontend/01-testing-ui.md` | Recording connection status |

---

## Cross-Language Parity

| Feature | Go | TypeScript |
|---------|-----|-----------|
| Package | `pkg/enums/connectionstatus` | `src/lib/enums/connection-status-type.ts` |
| Type | `byte` iota | `as const` object + derived union |
| Values | `Connected`, `Disconnected`, `Connecting`, `Reconnecting`, `Error` | Same |

---

## Cross-References

- Issue #10 — Domain Status Magic Strings <!-- external: spec/23-how-app-issues-track/10-domain-status-magic-strings.md -->
- [HttpMethod Enum](./05-http-method-enum.md) — Sibling enum spec
- [TypeScript Standards](./08-typescript-standards-reference/00-overview.md) — Parent spec
- [TS Overview — Strategy B](./00-overview.md#canonical-enum-shape-strategy-b--as-const--derived-union)

---

*ConnectionStatus enum v2.0.0 — 2026-04-25 — migrated to `as const` + derived union (AUDIT-05).*
