# Ambiguity #29 — G-32.4 banner-comment vs per-entry rationale strictness

**Date logged:** 2026-04-27
**Context:** F-future-G32c (G-32 v4.0.0 — allow-list rationale gate)
**Status:** Logged for later review (no-questions mode active)

## Question

The G-32.4 sub-check accepts a rationale as either:

(a) a trailing inline `// …` on the entry's line, OR
(b) a single `// …` comment line **immediately above** the entry
    (no blank-line gap between).

It does **NOT** treat a "category banner" comment that sits above a
*group* of entries as covering the whole group. So this layout fails:

```js
const REVERSE_EXEMPT = new Set([
  // Historic / explicitly-rejected names mentioned in §"Indexes
  // intentionally NOT created" — suppressed by name.
  "IdxItem_Content",        // ✅ first sibling: comment is directly above
  "IdxItem_CreatedAt",      // ❌ second sibling: blank "comment-above" check fails
  "IdxComment_AuthorUserId",// ❌ third sibling: same
]);
```

The runner caught this exact pattern on first run — 4 entries shared a
banner comment but the gate flagged 3 of them as unrationaled.

## Why I picked the strict interpretation

Two options:

1. **Strict (chosen)**: every entry must have its own visible
   rationale (inline OR directly-above). Banner comments become
   *additional* context but do not satisfy the rule alone.
2. **Lenient**: a single contiguous `//` block before the *first* entry
   in a group covers all subsequent entries until the next blank line
   or `//` block.

Picked strict because:

- A new author scanning the allow-list sees the rationale right next
  to the entry; no need to scroll up to a banner.
- Banners can drift from reality if siblings are added later that
  don't actually fit the original category.
- Inline rationales force the author to type *something specific* per
  entry, raising the cost of casual additions.
- The lenient form would require defining "group" boundaries, which
  is non-trivial when comments and entries interleave freely.

## Cost of the strict rule

Slightly more verbose source code: the F-future-G32c migration had to
expand 4 banner-covered entries to inline rationales:

```js
"IdxItem_Content",         // §"Indexes NOT created" — FTS5 ships in Phase 2
"IdxItem_CreatedAt",       // §"Indexes NOT created" — order is by FractionalIndex
"IdxComment_AuthorUserId", // §"Indexes NOT created" — "all my comments" not MVP
"IdxItem_MirrorOfItemId",  // dropped by M-117 (legacy Mirror table)
"IdxMirror_SourceItemId",  // dropped by M-117 (legacy Mirror table)
"IdxMirror_MirrorItemId",  // dropped by M-117 (legacy Mirror table)
```

Three of those repeat the same `// dropped by M-117 (legacy Mirror
table)` text. That's intentional — the gate prefers redundancy to
banner reliance.

## Decision (no-questions mode)

Kept strict. If the allow-lists ever grow to 30+ entries with heavy
banner repetition, revisit as v4.1.0 and add a `// @group: name` /
`// @endgroup` opt-in syntax to mark explicit category coverage.

## Files affected

- `scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs` (v4.0.0 — added G-32.4 + inline rationales for 6 REVERSE_EXEMPT entries)
- `spec/31-app/05-conventions/25-g32-ddl-unique-coverage-gate.md` (v4.0.0)
- `spec/31-app/05-conventions/02-ci-quality-gates.md` (G-32 row updated to "Four-direction check")
