# /plan.md — WorkFlowy Implementation Roadmap (Handoff Edition)

> **Version:** 2.0.0
> **Updated:** 2026-04-21 (UTC+8)
> **Audience:** Any AI agent (Claude, GPT, Gemini, Lovable, Cursor) picking up this project cold.
> **Companion:** `.lovable/plan.md` — Lovable-internal active spec roadmap. This file is the **public handoff**; cross-link, do not duplicate.
> **Reading order before touching any code:**
> 1. `.lovable/overview.md`
> 2. `.lovable/strictly-avoid.md`
> 3. `.lovable/memory/index.md` (and the files it references)
> 4. **This file** — pick a task from §3 *Next Task Selection*
> 5. `spec/00-overview.md` for architecture detail

---

## 1. Project at a glance

- **Product:** WorkFlowy — outliner / hierarchical task manager (web SPA)
- **Stack:** Vite + React 18 + TypeScript 5 + Tailwind CSS v4 + shadcn/ui + SQLite (runtime TBD — see S003)
- **Forbidden:** Go, PHP, Postgres, Supabase (open-source DB; use **Lovable Cloud** for managed backend), Next.js, Vue, Svelte, Angular
- **Current code state:** scaffold only — `src/pages/Home.tsx` is a placeholder, `src/components/layout/AppLayout.tsx` is a stub
- **Spec readiness:** 99/100 (round 2 audit). See `.lovable/reports/01-ai-readiness-report.md`.

## 2. Phase backlog (prioritized, dependency-aware)

### Phase 1 — Frontend foundation (UNBLOCKED, ready now)

| ID | Task | Objective | Dependencies | Expected outputs | Acceptance |
|----|------|-----------|--------------|------------------|------------|
| P1.1 | **Bootstrap project** | Confirm Vite + Tailwind v4 + shadcn baseline aligns with `spec/02-coding-guidelines/` | none | `package.json` minor bump; ESLint config matches strict-TS rules | `npm run dev` boots; lint passes |
| P1.2 | **Design-system tokens** | Author HSL token set in `src/index.css` `@theme` block per `spec/32-ui-design/03-design-system/` | P1.1 | `src/index.css` tokens; `tailwind.config.ts` semantic mappings; light + dark variants | All shadcn components render with tokens (no hardcoded colors) |
| P1.3 | **App shell** | Replace stub `AppLayout.tsx` with NavBar + Sidebar + Content per `spec/31-app/01-features/03-layout-structure.md` | P1.2 | `AppLayout.tsx`, `NavBar.tsx`, `Sidebar.tsx`, `ContentArea.tsx` (each ≤300 lines) | Layout matches Workflowy reference screenshots; responsive 320px–1920px |
| P1.4 | **Outliner tree (in-memory)** | Recursive bullet list with expand/collapse; pure Zustand state, no persistence | P1.3 | `useOutlineStore.ts`, `OutlineNode.tsx`, `BulletRow.tsx` | 250-item view renders <16ms; expand/collapse works |
| P1.5 | **Keyboard nav** | Tab/Shift+Tab indent, Enter sibling, arrow traversal per `spec/31-app/01-features/05-interactions.md` | P1.4 | Hotkey hook; arrow algorithm util | All 8 keyboard ATs pass |
| P1.6 | **Drag-and-drop reorder** | Drop zones (top 25% / center 50% / bottom 25%) per spec | P1.4 | DnD adapter; visual drop indicator | Move within parent + cross-parent works |
| P1.7 | **Multi-select + bulk** | Shift/Cmd-click range; bulk delete/indent | P1.5 | Selection store slice | All multi-select ATs pass |

### Phase 2 — Persistence (BLOCKED on S003)

| ID | Task | Blocker | Notes |
|----|------|---------|-------|
| P2.1 | Choose runtime (Lovable Cloud vs sql.js vs frontend-only) | S003 | Recommend **Lovable Cloud** |
| P2.2 | Schema migration (Items, Mirrors, Templates, Trash) | P2.1, S002 | PascalCase columns |
| P2.3 | Auth (email + Google) | P2.1 | Lovable Cloud built-in |
| P2.4 | Offline queue + LWW sync | P2.2 | Spec'd in `spec/31-app/01-features/14-concurrency-and-sync.md` |

### Phase 3 — Advanced features

| ID | Task | Spec |
|----|------|------|
| P3.1 | Mirrors | `spec/31-app/01-features/09-mirrors.md` |
| P3.2 | Board view | `spec/31-app/01-features/07-board-view.md` |
| P3.3 | Templates | `spec/31-app/01-features/13-templates.md` |
| P3.4 | Search (#tag, is:, type:) | `spec/31-app/01-features/05-interactions.md` + Workflowy Phase 2 |
| P3.5 | Sharing dialog | `spec/31-app/01-features/08-share-dialog.md` |
| P3.6 | Today / Trash views | features 10 + 11 |

### Phase 4 — UI polish (Workflowy consolidation Phases 1–8)

Tracked in `.lovable/plans/03-workflowy-spec-consolidation.md`. Spec-only — no code until each phase's spec is published.

### Phase 5 — Hardening

| ID | Task |
|----|------|
| P5.1 | Error modal integration per `spec/03-error-manage/02-error-architecture/04-error-modal/02-react-components/08-integration-guide.md` |
| P5.2 | Activity feed (`spec/34-activity-feed/`) |
| P5.3 | Feedback report (`spec/33-feedback-report/`) |
| P5.4 | User management + roles (`spec/36-user-management/`) |
| P5.5 | Enforcement rules (`spec/35-enforcement-rules/`) |

## 3. Next Task Selection (pick one — ask the user before starting)

The implementing AI MUST present these to the user and wait for selection. Do **not** auto-pick.

| Option | Task | Why now? |
|--------|------|----------|
| **A** | **P1.1 Bootstrap project** | Cleanest starting point; 30-min task; unblocks P1.2 |
| **B** | **P1.2 Design-system tokens** | Visible progress; sets the visual baseline before any feature |
| **C** | **P1.3 App shell** | Highest user-visible delta; replaces today's two stub files |
| **D** | **Resolve S003 (backend runtime)** | Architecture decision; unblocks all of Phase 2 |
| **E** | **Workflowy spec Phase 1 (Navbar)** | Spec-only work; no code; advances `.lovable/plans/03-…` |
| **F** | **Address pending audit findings** (S02 in `.lovable/memory/suggestions/`) | Hygiene; closes 5 known issues in spec 31–36 |

## 4. Process rules (binding for any AI handoff)

1. **Never** edit `spec/` folders 01–17 (read-only).
2. **Never** edit `.release/`.
3. **Bump at least the minor version** in `package.json` on every code change.
4. **Strict TypeScript** — zero `any`, max 3 params, max 15-line functions, max 300-line files.
5. **PascalCase** for DB columns, JSON keys, types, classes, enums.
6. **No flag parameters, no negative booleans, no nested `if`s.**
7. **Suggestions** go in `.lovable/memory/suggestions/NN-slug.md` (one file each — see `.lovable/memory/suggestions/README.md`).
8. **Plans:** keep `.lovable/plan.md` as the active internal roadmap; treat **this file** (`/plan.md`) as the public handoff. Update both when scope changes.
9. **No filler** ("Hope this helps!", "Let me know if…").
10. **Timezone:** Malaysia UTC+8 in all dated entries.

## 5. Cross-references

| Topic | File |
|-------|------|
| AI readiness report | `.lovable/reports/01-ai-readiness-report.md` |
| Lovable-internal active roadmap | `.lovable/plan.md` |
| Workflowy spec consolidation plan | `.lovable/plans/03-workflowy-spec-consolidation.md` |
| Hard prohibitions | `.lovable/strictly-avoid.md` |
| Memory index | `.lovable/memory/index.md` |
| Suggestions contract | `.lovable/memory/suggestions/README.md` |
| Pending issues | `.lovable/pending-issues/` |
| Spec entrypoint | `spec/00-overview.md` |
| Coding rules | `spec/02-coding-guidelines/` |

---

*This file is the single source of truth for "what to build next" when handing off to a new AI session. Keep it current.*
