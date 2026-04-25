# 13 — Data Contracts

> **Version:** 1.0.0 · **Created:** 2026-04-25 (UTC+8) · **Status:** ✅ Authored (contract spec — runtime-agnostic)
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Constraint:** `mem://constraints/backend-runtime-deferred` (memory-only reference)

---

## Scope

Defines the **data shapes** the Search Popover produces and consumes. Schema tables are the normative contract; the TypeScript reference block at the end is illustrative for future implementers.

> ⚠️ No storage adapter is specified. Persistence (Saved Searches, Recent Searches) is delegated to whichever backend the user selects post-spec.

---

## 1. `SearchQuery` — the parsed query state

The single in-memory object representing the current search.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID) | ✓ | Stable id for the query session; regenerated on popover open |
| `rawInput` | `string` | ✓ | Verbatim text in the header input, including uncommitted trailing chars |
| `tokens` | `SearchToken[]` | ✓ | Ordered list of committed tokens |
| `freeText` | `string` | ✓ | Trailing free-text portion not yet tokenized (may be empty) |
| `activeTab` | `TabId` | ✓ | One of: `scope` \| `mentions` \| `dates` \| `history` \| `people` \| `more` |
| `quickActions` | `QuickActionState` | ✓ | Toggle states (see § 4) |
| `parseErrors` | `ParseError[]` | ✓ | Empty when query is valid |
| `createdAt` | `string` (ISO 8601) | ✓ | Popover open time |

---

## 2. `SearchToken` — one committed filter chip

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (nanoid) | ✓ | Stable id for React keys + edit operations |
| `keyword` | `Keyword` | ✓ | One of the 13 keywords (see [`06-query-grammar.md`](./06-query-grammar.md) § 2) or `null` for standalone shortcuts |
| `value` | `string` | ✓ | Raw value; empty string for valueless tokens (`me`, `today`) |
| `negated` | `boolean` | ✓ | `true` when prefixed with `-` |
| `displayLabel` | `string` | ✓ | Pre-rendered chip label (`"is: completed"`, `"@alice"`, `"-date: today"`) |
| `parsedValue` | `ParsedValue` | ✓ | Type-discriminated parsed form (see § 3) |
| `source` | `'typed' \| 'picker' \| 'paste' \| 'saved'` | ✓ | Origin of token (analytics + edit affordance) |

---

## 3. `ParsedValue` — discriminated union

Each token's `value` is parsed into one of:

| Discriminator | Shape | Used by keywords |
|---------------|-------|------------------|
| `{ kind: 'date', iso: string }` | ISO date string | `date:`, `date-before:`, `date-after:`, `created:`, `changed:` |
| `{ kind: 'date-relative', token: string }` | `today` \| `tomorrow` \| `yesterday` \| `this-week` \| ... | Same date keywords + standalones |
| `{ kind: 'day-of-week', day: 0..6 }` | 0=Sun, 6=Sat | `day-of-week:` |
| `{ kind: 'user', handle: string, userId?: string }` | `@`-handle, optional resolved id | `@user`, `me`, `others` |
| `{ kind: 'enum', value: string }` | One of an allowed set | `is:`, `has:` |
| `{ kind: 'scope', nodeId: string, label: string }` | Scope reference | `in:` |
| `{ kind: 'text', value: string }` | Quoted or bare string | `text:`, `link:` |
| `{ kind: 'color', value: string }` | Named color from Phase 5 palette | `highlight:` |

---

## 4. `QuickActionState`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `includeCompleted` | `boolean` | `false` | Show items marked complete |
| `includeMirrors` | `boolean` | `true` | Show mirrored instances |
| `expandAllMatches` | `boolean` | `true` | Auto-expand ancestors of matches |
| `pinned` | `boolean` | `false` | Popover stays open after Escape |

---

## 5. `ParseError`

| Field | Type | Description |
|-------|------|-------------|
| `tokenId` | `string \| null` | Offending token id, or `null` for global errors |
| `code` | `'unknown-keyword' \| 'invalid-date' \| 'invalid-enum' \| 'unbalanced-quote' \| 'too-long'` | Error code |
| `message` | `string` | Human-readable, localized |
| `range` | `[number, number]` | Char offsets in `rawInput` |

---

## 6. `SavedSearch` (UI contract — storage deferred)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✓ | Stable id |
| `name` | `string` (≤ 60 chars) | ✓ | User-given label |
| `query` | `SearchQuery` | ✓ | Snapshot at save time |
| `createdAt` | `string` (ISO) | ✓ | — |
| `lastUsedAt` | `string` (ISO) | ✓ | Updated on load |
| `pinned` | `boolean` | ✓ | Sort priority |

> Storage contract is **TBD** — the implementer will provide a `SavedSearchStore` interface (CRUD methods) when backend is chosen.

---

## 7. `SearchResult` — outline-level filter result

| Field | Type | Description |
|-------|------|-------------|
| `nodeId` | `string` | Matching node id |
| `matchedFields` | `('content' \| 'note' \| 'tag' \| 'mention' \| 'link')[]` | Where the match occurred |
| `matchRanges` | `Record<field, [number, number][]>` | Char offsets per field for `<mark>` wrapping |
| `score` | `number` (0..1) | Relevance score (impl-defined; UI sorts descending) |
| `ancestorIds` | `string[]` | Path to root, used for transient expansion |

---

## 8. Event contracts (popover → host)

The popover emits these events; the host wires them to outline behavior.

| Event | Payload | When |
|-------|---------|------|
| `query:change` | `SearchQuery` | After 80ms debounce |
| `query:commit` | `SearchQuery` | On Enter or token commit |
| `query:clear` | `void` | Clear button or `⌘⌫` |
| `result:focus` | `{ nodeId: string, matchIndex: number }` | Up/Down cycling |
| `saved:load` | `SavedSearch` | Click in Saved Searches list |
| `saved:save` | `{ name: string, query: SearchQuery }` | Save button |
| `popover:open` / `popover:close` | `{ trigger: 'hotkey' \| 'click' }` | — |

---

## 9. TypeScript reference (illustrative — NOT to be copied as-is)

```ts
// Reference only — implementer adapts to chosen runtime/storage.
type TabId = 'scope' | 'mentions' | 'dates' | 'history' | 'people' | 'more';

type Keyword =
  | 'date' | 'date-before' | 'date-after' | 'day-of-week'
  | 'changed' | 'created'
  | 'is' | 'has' | 'in'
  | 'text' | 'link' | 'highlight';

type ParsedValue =
  | { kind: 'date'; iso: string }
  | { kind: 'date-relative'; token: string }
  | { kind: 'day-of-week'; day: 0|1|2|3|4|5|6 }
  | { kind: 'user'; handle: string; userId?: string }
  | { kind: 'enum'; value: string }
  | { kind: 'scope'; nodeId: string; label: string }
  | { kind: 'text'; value: string }
  | { kind: 'color'; value: string };

interface SearchToken {
  id: string;
  keyword: Keyword | null;
  value: string;
  negated: boolean;
  displayLabel: string;
  parsedValue: ParsedValue;
  source: 'typed' | 'picker' | 'paste' | 'saved';
}

interface QuickActionState {
  includeCompleted: boolean;
  includeMirrors: boolean;
  expandAllMatches: boolean;
  pinned: boolean;
}

interface ParseError {
  tokenId: string | null;
  code: 'unknown-keyword' | 'invalid-date' | 'invalid-enum' | 'unbalanced-quote' | 'too-long';
  message: string;
  range: [number, number];
}

interface SearchQuery {
  id: string;
  rawInput: string;
  tokens: SearchToken[];
  freeText: string;
  activeTab: TabId;
  quickActions: QuickActionState;
  parseErrors: ParseError[];
  createdAt: string;
}

interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  createdAt: string;
  lastUsedAt: string;
  pinned: boolean;
}

interface SearchResult {
  nodeId: string;
  matchedFields: Array<'content' | 'note' | 'tag' | 'mention' | 'link'>;
  matchRanges: Record<string, [number, number][]>;
  score: number;
  ancestorIds: string[];
}
```

---

## 10. Constraints

- All ids are opaque strings; no assumptions about format beyond uniqueness.
- All dates are ISO 8601 strings in UTC; the UI converts to user's locale (Malaysia default UTC+8).
- `rawInput` ≤ **2000 chars**; longer inputs are truncated with a `too-long` parse error.
- `tokens.length` ≤ **40** per query; excess tokens are rejected at commit time.

---

## Acceptance Criteria refs

`AT-WF02-TOK-09..12` (token shape), `AT-WF02-RES-13..14` (result contract), `AT-WF02-EXT-19` (saved-search shape).
