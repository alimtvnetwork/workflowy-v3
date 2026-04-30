# Implementation Checklist (per-phase pre-flight)


> **Parent:** [`./00-overview.md`](./00-overview.md) — added 2026-04-30 (AUD-REMEDIATE-CRIT-7, F-AUD42-08 closure).

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8) — created in spec-only mode as P1.1 hand-off prep
> **Purpose:** A per-phase pre-flight checklist the next AI session runs **before writing the first line of code** in each phase of [`01-implementation-phases.md`](./01-implementation-phases.md). Locks the SPEC-ONLY → BUILD transition contract.

---

## How to use this file

1. Before starting any phase `Px.y`, open this file and walk every checkbox in the matching `## Phase Px — Checklist` section.
2. Every box must be ✅ or have a documented exemption in the same commit.
3. **Do not skip ahead** — each phase assumes its predecessors' checklists are green.
4. After a phase completes, update its row in [`01-implementation-phases.md`](./01-implementation-phases.md) and bump the `package.json` minor version.

---

## Phase 0 — SPEC-ONLY exit gate (one-time)

Run this **once**, the moment the user says `exit spec-only`.

| # | Check | Source |
|---|-------|--------|
| 0.1 | User has explicitly said `exit spec-only` (verbatim) in the current chat | `mem://constraints/spec-only-mode` |
| 0.2 | Memory file `mem://constraints/spec-only-mode` is updated to mark the constraint lifted (with date + authorizing message) | `mem://constraints/spec-only-mode` |
| 0.3 | Backend runtime decision is recorded as **WordPress plugin (PHP + SQLite)** | `mem://constraints/backend-runtime-deferred` (S003 closed 2026-04-25) |
| 0.4 | All 18 hygiene scripts pass on the `spec/` tree | `scripts/spec-hygiene/00-run-all.mjs` |
| 0.5 | `package.json` version is recorded as the **pre-build baseline** in `.lovable/plans/00-active.md` | Plan file |

---

## Phase P1 — Core Outliner — Checklist

Source feature list: [`01-implementation-phases.md`](./01-implementation-phases.md) §Phase 1.

### P1.1 Bootstrap

| # | Check | Why |
|---|-------|-----|
| P1.1.1 | Vite + React 18 + TypeScript 5 scaffold matches the pinned versions in `mem://architecture/tech-stack` | Reproducibility |
| P1.1.2 | `tsconfig.json` enables `strict`, `noImplicitAny`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` | `mem://constraints/coding-guidelines` |
| P1.1.3 | ESLint config bans `any`, untyped `Function`/`Object`, nested `if`, function bodies > 15 logical lines, > 3 params, files > 300 lines | `mem://constraints/coding-guidelines` + `spec/02-coding-guidelines/01-cross-language/04-code-style/` |
| P1.1.4 | Tailwind v4 wired via `@tailwindcss/vite`; `src/index.css` has the `@theme` block ready (no tokens yet — that's P1.2) | `mem://design/theme` |
| P1.1.5 | Vitest + `@testing-library/react` + `jsdom` installed and `bun test` green on the seed test | A-08 (already done) |
| P1.1.6 | `.gitignore` and `.lovable/strictly-avoid.md` rules verified — no `.lovable/memories/` (plural), no Go/PHP/Postgres dirs | `.lovable/strictly-avoid.md` |
| P1.1.7 | `package.json` version bumped (minor) and recorded | User pref: "Code changes must bump at least minor version" |

### P1.2 Design-system tokens

| # | Check | Why |
|---|-------|-----|
| P1.2.1 | All semantic tokens (`--background`, `--foreground`, `--primary`, `--accent`, …) defined in `src/index.css @theme` as **HSL** triples | Design critical instructions |
| P1.2.2 | `tailwind.config.ts` exposes the same tokens via `theme.extend.colors` using `hsl(var(--token))` | Design critical instructions |
| P1.2.3 | Light + dark variants both defined (P1 launch theme set) | `mem://design/theme` + B3 from Plan 03 |
| P1.2.4 | Zero raw hex/rgb in any `src/**/*.tsx` file — verified by `scripts/spec-hygiene/16-check-tailwind-tokens.mjs` (or equivalent on `src/`) | Design critical instructions |
| P1.2.5 | `prefers-reduced-motion` is honoured in the global animation tokens | `AT-DOCSVIEWERUI-08` precedent |

### P1.3 App shell

| # | Check | Why |
|---|-------|-----|
| P1.3.1 | `<AppLayout>` wraps `<Outlet/>` with `min-h-screen bg-background text-foreground` | A-06 (already done) |
| P1.3.2 | Navbar slot exists with home / back / forward / breadcrumbs placeholders | `01-implementation-phases.md` §Phase 1 + `mem://design/ui-components` |
| P1.3.3 | Sidebar slot exists (collapsed by default) with favorites / recent / tags placeholders | `mem://design/ui-components` |
| P1.3.4 | `<ToastProvider>` mounted at app root; `useToast()` reachable from any descendant | A-07 (already done) |
| P1.3.5 | Mobile breakpoint behaviour stubbed (sidebar overlay) per `mem://design/theme` breakpoints | `mem://design/theme` |

### P1.4 Authentication (signup / login / logout)

| # | Check | Why |
|---|-------|-----|
| P1.4.1 | Auth runtime is the chosen backend (WordPress plugin) — **never** Supabase, Lovable Cloud, IndexedDB, or sql.js | `mem://constraints/backend-runtime-deferred` |
| P1.4.2 | Roles stored in a separate `user_roles` table; `Auth::hasRole()` PHP helper is the only role-check entry point | `mem://constraints/backend-runtime-deferred` + Plan 08 (AUDIT-01) |
| P1.4.3 | Sessions are server-side; cookies are `HttpOnly` + `Secure` + `SameSite=Lax` | `AT-USERSCOPEDISOLATION-12/13` precedent |
| P1.4.4 | No JWT-in-localStorage; no client-side admin checks | Critical security warning in role spec |

### P1.5 Recursive bullet list + CRUD + Indent/Outdent + Zoom + Autosave

| # | Check | Why |
|---|-------|-----|
| P1.5.1 | Item is the unified `Item` interface (`id`, `parentId`, `content`, `itemType`) per `mem://architecture/data-model` | Memory rule |
| P1.5.2 | 250-item per-view limit enforced | Memory rule |
| P1.5.3 | Fractional sort order used for sibling ordering (no integer rebalance on every move) | `mem://features/editor-core` |
| P1.5.4 | Tab / Shift+Tab indent/outdent has the correct guard (cannot outdent the root) | §Phase 1 + `spec/31-app/02-workflows/` |
| P1.5.5 | Optimistic UI: mutation applies immediately, reverts on server error with toast variant=`error` | §Phase 1 + A-07 |
| P1.5.6 | Autosave is debounced (default 500 ms) with a status indicator (idle / saving / saved / error) | §Phase 1 |
| P1.5.7 | Autosave persistence is local first, then server (offline resilience) per `mem://features/offline-resilience` | Memory rule |

---

## Phase P2 — Rich Editing — Checklist

| # | Check | Why |
|---|-------|-----|
| P2.1 | Text formatting toolbar uses semantic tokens only; no inline color/bg | Design critical instructions |
| P2.2 | "Turn into…" type conversion covers all 12 item types per `mem://features/core-mechanics` | Memory rule |
| P2.3 | Markdown auto-conversion shortcuts run **before** the input event commits to state (no flicker) | UX rule |
| P2.4 | Code blocks use the pinned highlighter version per [`spec/09-code-block-system/11-highlighter-dependency-pin.md`](../../09-code-block-system/11-highlighter-dependency-pin.md) (F-04 / Plan 07) | Plan 07 |
| P2.5 | Notes on items are stored as a separate field on `Item`, not concatenated into `content` | `mem://architecture/data-model` |

---

## Phase P3 — Navigation & Menus — Checklist

| # | Check | Why |
|---|-------|-----|
| P3.1 | Keyboard shortcuts live in a single registry SSOT (one source, one renderer) | `AT-DOCSVIEWERUI-06` precedent |
| P3.2 | Search syntax (`#tag`, `is:`, `type:`) parsed by the documented grammar in `mem://features/search-functionality` | Memory rule |
| P3.3 | Search performance target met: ≤ 100 ms for ≤ 10k items on the dev machine | Memory rule |
| P3.4 | Command palette (⌘K) is a thin wrapper over the same registry as P3.1 | DRY |
| P3.5 | Sidebar favorites / recent / tags are real components (not stubs) by end of P3 | §Phase 3 |

---

## Phase P4 — Collaboration & Advanced — Checklist

| # | Check | Why |
|---|-------|-----|
| P4.1 | Mirror behaviour matches `mem://features/mirroring`: linked instances stay in sync; deleting the original does not delete mirrors but flips `Mirrors.BrokenAt` (sticky) | `AT-APP-32` precedent |
| P4.2 | Board view (Kanban) re-renders without restructuring the underlying tree per `mem://features/board-view` | Memory rule |
| P4.3 | Sharing model: public + invited-user permissions per `mem://features/sharing-model`; admin role gated by `Auth::hasRole('admin')` | Plan 08 |
| P4.4 | Templates serialize to a snapshot with **new** `Item.id`s on apply (no cross-workspace ID leak) per `mem://features/templates` and `AT-APP-29` | `AT-APP-29..31` |
| P4.5 | Trash retention is exactly 30 days per `mem://features/trash-logic`; hard-delete returns HTTP 410 per `AT-APP-54` | Memory + `AT-APP-54` |
| P4.6 | Multi-select Shift/Cmd-click bulk actions per `mem://features/multi-select` | Memory rule |
| P4.7 | Export covers OPML, plain text, JSON, Markdown — and round-trips for JSON | §Phase 4 |

---

## Phase P5 — Polish & Scale — Checklist

| # | Check | Why |
|---|-------|-----|
| P5.1 | Undo/redo stack is bounded (default ≥ 100 actions) and survives focus loss | §Phase 5 |
| P5.2 | Free-tier 250-item limit enforced server-side (not just client-side) | §Phase 5 + memory rule |
| P5.3 | Dark mode parity: every screen verified in both themes; no hardcoded grays | Design critical instructions |
| P5.4 | Mobile responsive: sidebar overlay, touch-friendly drag, ≥ 44 × 44 px tap targets | §Phase 5 + `mem://design/theme` |
| P5.5 | PWA installable; offline-first works for read + edit (sync on reconnect) | §Phase 5 + `mem://features/offline-resilience` |
| P5.6 | Virtualized list active for any view ≥ 200 items (under the 250 cap) | §Phase 5 |
| P5.7 | Accessibility audit: screen-reader landmarks, full keyboard reachability, ARIA on every custom widget, WCAG AA contrast on every token pair | §Phase 5 |

---

## Cross-cutting gates (run at the end of every phase)

| # | Check | Why |
|---|-------|-----|
| X.1 | All hygiene scripts pass (`bun run hygiene` or `node scripts/spec-hygiene/00-run-all.mjs`) | Spec invariants |
| X.2 | All vitest suites green; coverage ≥ the threshold defined in `vitest.config.ts` | Test invariants |
| X.3 | No file > 300 lines in `src/` | `mem://constraints/coding-guidelines` |
| X.4 | No raw hex/rgb in `src/` (semantic tokens only) | Design critical instructions |
| X.5 | `package.json` version bumped at least one minor | User pref |
| X.6 | A short note added to `.lovable/plans/00-active.md` recording the phase outcome | Plan-keeping rule |
| X.7 | If new acceptance criteria were satisfied, mark them in the matching `97-acceptance-criteria.md` (or add a `## Implementation Status` row) | Spec ↔ code parity |

---

## Verification

```bash
# Walk the file
grep -nE '^### P[0-9]\.|^## Phase' spec/31-app/04-roadmap/03-implementation-checklist.md

# Confirm no phase references a forbidden tech
grep -nE 'supabase|lovable cloud|sql\.js|indexeddb|postgres' spec/31-app/04-roadmap/03-implementation-checklist.md && echo "FORBIDDEN TECH MENTIONED"
```

---

## Related

- [`01-implementation-phases.md`](./01-implementation-phases.md) — Phase definitions this checklist gates
- [`02-resolved-decisions.md`](./02-resolved-decisions.md) — Decisions already locked
- [`spec/31-app/97-acceptance-criteria.md`](../97-acceptance-criteria.md) — Canonical acceptance criteria
- `mem://constraints/spec-only-mode` — The gate that opens Phase 0
- `mem://constraints/backend-runtime-deferred` — Backend = WP plugin (S003)
- `mem://constraints/coding-guidelines` — Strict TS rules referenced throughout
- `.lovable/strictly-avoid.md` — Hard prohibitions

---

*Created 2026-04-26 (polish #4, optional-c) — locks the SPEC-ONLY → BUILD transition contract so the next AI session can start P1.1 with zero ambiguity.*
