# 12b — Multi-Select Zoom: Virtual Scope (Clarification)


> **Parent:** [`./00-overview.md`](./00-overview.md) — added 2026-04-30 (AUD-REMEDIATE-CRIT-7, F-AUD42-08 closure).

> **API Contract:** See [`spec/31-app/06-endpoints/12-multi-select.md`](../06-endpoints/12-multi-select.md) for the endpoint surface that backs this feature (request/response envelopes, status codes, error shapes). Bidirectional cross-link added 2026-04-30 to close **F-AUD42-04** (App-folder audit Phase 5).


> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Status:** Approved — 2026-04-27
> **Supersedes:** Ambiguity in `12-multi-select.md` §Zoom interaction
> **Owner:** Product
> **Decision context:** Batch 4 clarifications, AI-readiness round 4


## Database Routing

| Database | Tables read/written | Notes |
|---|---|---|
| **Root DB** | — | Zoom is a UI-state operation. |
| **App DB** (per workspace) | `Items` (read subtree for zoomed view) | Read-only. |
| **Cross-DB joins** | **Forbidden.** | — |

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-02** (App-folder audit Phase 4). Mirrors the Root-DB / App-DB split per ADR-0019.

---

## 1. Decision

Zooming with multiple items selected creates an **ephemeral virtual scope** — a transient "view" containing only the selected items as if they shared a virtual parent. Closing the virtual scope returns the user to the original tree position with selection preserved.

---

## 2. Behaviour

| Aspect | Value |
|---|---|
| Persistence | **Ephemeral** — virtual scope is client-only state, not written to DB |
| Virtual parent | Synthetic node `virtual:<sessionId>` with title `"N items"` (e.g., "3 items") |
| Children | The N selected items, in their original tree order (DFS pre-order) |
| Editing inside scope | Edits affect the **real** items (titles, completion, drag within scope) |
| Drag out of scope | Disabled — items can only be reordered within the virtual scope |
| Drag into scope | Disabled — virtual scope has fixed membership for its lifetime |
| Add child | Adds a real child to whichever selected item is hovered (not to the virtual parent) |
| Breadcrumb | Shows: `Home › … › "3 items (virtual)"` with the virtual segment styled distinctly (italic + badge) |
| Exit | Click breadcrumb up-level, press `Esc`, or close virtual scope explicitly |
| Selection on exit | Original N items remain selected in the real tree |

---

## 3. State machine

```
NORMAL ──(zoom with N>1 selected)──▶ VIRTUAL_SCOPE
VIRTUAL_SCOPE ──(Esc | breadcrumb up)──▶ NORMAL  (selection preserved)
VIRTUAL_SCOPE ──(zoom into one item I)──▶ NORMAL  (zoomed to I, selection cleared)
VIRTUAL_SCOPE ──(deselect all)──▶ stays in VIRTUAL_SCOPE (membership locked)
```

---

## 4. Edge cases

| Case | Behaviour |
|---|---|
| One of the N items is deleted while in virtual scope | Item disappears from virtual scope; if N drops to 1, auto-collapse to normal zoom on that item; if N drops to 0, exit to NORMAL |
| One of the N items is a mirror peer; peer group edited elsewhere | Content updates live in virtual scope (peer-group sync) |
| User shares an item from inside virtual scope | Standard share flow; virtual parent itself is not shareable |
| User opens Board / Dashboard view inside virtual scope | Renders the N items as cards/columns; virtual parent acts as the container |
| Refresh / navigation away | Virtual scope is lost (ephemeral); user returns to last persisted scope |

---

## 5. Acceptance tests

| ID | Given | When | Then |
|---|---|---|---|
| AT-MZ-01 | 3 items selected (A, B, C) at different tree depths | User presses zoom hotkey | Virtual scope opens with A, B, C as siblings under "3 items" |
| AT-MZ-02 | In virtual scope of {A, B, C} | User edits B's title | Real item B's title updates in DB |
| AT-MZ-03 | In virtual scope of {A, B, C} | User presses Esc | Returns to normal view; A, B, C still selected |
| AT-MZ-04 | In virtual scope of {A, B, C} | User deletes A and B | Scope auto-collapses to normal zoom on C |
| AT-MZ-05 | In virtual scope of {A, B, C} | User tries to drag A out of scope | Drag is rejected (no-drop cursor) |
| AT-MZ-06 | In virtual scope of {A, B, C} | User refreshes page | Returns to last persisted scope (not virtual); A,B,C no longer selected |

---

## 6. Non-goals

- ❌ Persistent virtual scopes (saved views) — future
- ❌ Sharing a virtual scope as a unit — future
- ❌ Cross-account virtual scopes — never (security boundary)

---

## Related

- `spec/31-app/01-features/12-multi-select.md` (parent SSOT)
- `spec/31-app/01-features/05-interactions.md` (zoom hotkey)
- `spec/31-app/01-features/09b-mirror-peer-group-model.md` (peer sync inside scope)

---

## Inputs

- A multi-selection set `{I₁, I₂, …, Iₙ}` with `n > 1` from the live tree.
- A zoom gesture (hotkey or breadcrumb action) issued while the multi-selection is active.
- Subsequent edit/delete/refresh events affecting members of the set.

## Outputs

- An ephemeral client-only virtual scope keyed `virtual:<sessionId>` with title `"N items"`.
- Edits performed inside the scope mutate the **real** items (titles, completion, intra-scope drag); no DB row is created for the virtual parent.
- On exit (Esc / breadcrumb up): selection of the original N items is restored in the real tree.

## Edge Cases

§4 *Edge cases* enumerates all 5 boundary conditions: mid-scope deletion (auto-collapse at n=1, exit at n=0), peer-group sync inside scope, share semantics, Board/Dashboard inside virtual scope, and refresh-loses-scope (ephemeral by design).

## Acceptance Tests

The 6 acceptance tests **AT-MZ-01 … AT-MZ-06** are defined in §5 above. This bare-named heading satisfies G-06; canonical content lives at §5.

| AT ID | Summary | Source |
|-------|---------|--------|
| AT-MZ-01 | Zoom with N>1 selection creates virtual scope | §5 |
| AT-MZ-02 | Mid-scope deletion auto-collapses at n=1 | §5 |
| AT-MZ-03 | Exit at n=0 | §5 |
| AT-MZ-04 | Peer-group sync inside virtual scope | §5 |
| AT-MZ-05 | Board/Dashboard inside virtual scope | §5 |
| AT-MZ-06 | Refresh loses virtual scope (ephemeral) | §5 |

## Component Contract

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Virtual zoom scope store | `src/stores/useZoomStore.ts` | n/a (pure store) | AT-MZ-01, AT-MZ-02, AT-MZ-03 |
| Zoom breadcrumb (virtual) | `src/components/zoom/ZoomBreadcrumb.tsx` | `zoom-breadcrumb-virtual` | AT-MZ-04, AT-MZ-05, AT-MZ-06 |

### Notes

- **State location:** client-only zustand slice (e.g. `useZoomStore.virtualScope`); never persisted, never serialised to URL.
- **Identity:** `virtual:<sessionId>` synthetic node id; not a valid `Items.Id`; FK constraints are bypassed because no DB write occurs.
- **State machine:** as defined in §3; transitions are pure UI events with no DB side-effects.

---

## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: app]`
- **Tables:** nodes (bulk under zoom root)
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.

---

## Architecture Anchors (load-bearing ADRs)

- **ADR-0023 — Loader↔Queue Contract:** Loaders MUST read the local IndexedDB mirror first (≤16 ms p95, never fetch). Mutations MUST write `{mirror, queue_ledger}` in a **single IDB transaction**; the queue worker is the **sole egress** to the WordPress REST surface. SSE frames are read-signals only and MUST NOT enqueue to the FIFO. See `spec/30-architecture/adr/0023-loader-queue-contract.md`.
- **ADR-0017 — Named Error Boundaries:** This feature renders inside **`EditorBoundary`**. A single top-level boundary is **forbidden**. Loader/action errors surface via the matching named boundary; uncaught render errors escalate to `AppErrorBoundary`. See `spec/30-architecture/adr/0017-error-boundaries.md`.
- **ADR-0025 — Realtime is SSE-only:** Cross-tab/cross-client signals arrive via `/stream/page/{id}` and `/stream/user/{id}` (PascalCase frames, `Last-Event-ID` replay). WebSocket / long-poll / 3rd-party push are **forbidden**.

---

## Settings Surface

- **Persisted booleans introduced by this feature:** None.
- **N/A justification:** Composition rule between two interactions — no new settings.
- **Compliance:** Satisfies the MUST in [`00-overview.md:140`](./00-overview.md) by explicit declaration. Any future boolean added here MUST route through `Sanitizer::bool()` and be enumerated in an `OptionNameType` case (see APP-FIX-05).

---

## Backend Write Surface

- **Routes introduced by this feature:** None.
- **N/A justification:** Composition rule — reuses `12-multi-select` bulk routes scoped to zoom subtree.
- **Compliance:** Satisfies F-AUD42-25 (API axis) by explicit declaration. Any future write route added here MUST follow the PascalCase envelope (ADR-0004/0019), egress via queue worker (ADR-0023), and bind to a named error boundary (ADR-0017).
