# Common AI Mistakes — Enum Usage

> **Version:** 3.2.0  
> **Updated:** 2026-04-20
> **Purpose:** Enum usage and magic string elimination

---

## Mistake #12: Magic String Status Comparisons

**Frequency:** Medium  
**Rule:** AH-EN3

```typescript
// ❌ AI GENERATES THIS
if (status === 'active') { ... }
if (connection.status === 'connected') { ... }

// ✅ CORRECT — use typed enums
if (status === EntityStatus.Active) { ... }
if (connection.status === ConnectionStatus.Connected) { ... }
```

---

## Detection Pattern

Watch for these signals in AI output:
- String literals in conditional expressions
- Lowercase string values (`'active'`, `'pending'`, `'error'`)
- Comparisons against hardcoded status strings

---

## Fix Strategy

1. Check [`spec/20-enums-index.md`](../../../20-enums-index.md) for existing enum
2. If exists: replace string with enum constant
3. If missing: add to appropriate domain enum table per [`spec/19-glossary.md`](../../../19-glossary.md)

---

## Cross-References

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../../20-enums-index.md`](../../../20-enums-index.md) — Universal enum registry
- [`../../03-golang/01-enum-specification/00-overview.md`](../../03-golang/01-enum-specification/00-overview.md) — Go enum patterns

---

*Enum usage mistakes v3.2.0 — 2026-04-20*
