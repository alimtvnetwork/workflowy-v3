# TypeScript EntityStatus Enum — `src/lib/enums/entity-status.ts`

> **Version**: 2.0.0
> **Last updated**: 2026-04-25
> **Tracks**: Issue #10 (`spec/23-how-app-issues-track/10-domain-status-magic-strings.md`)

---

## Purpose

Typed enum for general entity lifecycle states — projects, plugins, shares, resources, and any domain object that can be active, inactive, drafted, or archived. Replaces `entity.status === 'active'` magic strings in frontend specs.

---

## Reference Implementation

```typescript
// src/lib/enums/entity-status-type.ts

export const EntityStatus = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
  Draft: "DRAFT",
  Archived: "ARCHIVED",
} as const;

export type EntityStatus = (typeof EntityStatus)[keyof typeof EntityStatus];
```

> **Convention** (per [`20-enums-index.md`](../../20-enums-index.md) §1 rule 9): canonical TS enum shape is `as const` object + derived union (Strategy B). The `enum` keyword and bare literal unions are forbidden. See [TS Overview](./00-overview.md#canonical-enum-shape-strategy-b--as-const--derived-union).

---

## Usage Patterns

### Status Comparisons

```typescript
// ❌ WRONG: Magic string
if (plugin.status === 'active') { ... }

// ✅ CORRECT: Enum constant
if (plugin.status === EntityStatus.Active) { ... }
```

### Conditional Rendering

```typescript
// ❌ WRONG
{share.status !== 'active' && 'opacity-60'}

// ✅ CORRECT
{share.status !== EntityStatus.Active && 'opacity-60'}
```

### Type Definitions

```typescript
// ❌ WRONG
interface Project {
  status: 'active' | 'inactive' | 'draft' | 'archived';
}

// ✅ CORRECT
interface Project {
  status: EntityStatus;
}
```

### Default Values

```typescript
// ❌ WRONG
const DEFAULT_STATUS = 'active';

// ✅ CORRECT
const DEFAULT_STATUS = EntityStatus.Active;
```

---

## Consuming Spec Files

| Spec File | Pattern Replaced |
|-----------|-----------------|
| `05-features/06-ai-integration/08-ai-chat-ui.md` | `slot.status === 'active'` |
| `05-features/25-ai-enhancements/06-04-sharing-ui.md` | `share.status !== 'active'` |
| `05-features/25-ai-enhancements/06-01-sharing-architecture.md` | `share.Status != "active"` |
| `13-wp-plugin/05-wp-plugin-publish/02-frontend/28-remote-plugins.md` | `plugin.status === 'active'` |
| `07-database-design/03b-seed-data.md` | `Status: "active"` seed values |

---

## Cross-Language Parity

| Feature | Go | TypeScript |
|---------|-----|-----------|
| Package | `pkg/enums/entitystatus` | `src/lib/enums/entity-status-type.ts` |
| Type | `byte` iota | `as const` object + derived union |
| Values | `Active`, `Inactive`, `Draft`, `Archived` | Same |

---

## Cross-References

- Issue #10 — Domain Status Magic Strings <!-- external: spec/23-how-app-issues-track/10-domain-status-magic-strings.md -->
- [HttpMethod Enum](./05-http-method-enum.md) — Sibling enum spec
- [TypeScript Standards](./08-typescript-standards-reference/00-overview.md) — Parent spec
- [TS Overview — Strategy B](./00-overview.md#canonical-enum-shape-strategy-b--as-const--derived-union)

---

*EntityStatus enum v2.0.0 — 2026-04-25 — migrated to `as const` + derived union (AUDIT-05).*
