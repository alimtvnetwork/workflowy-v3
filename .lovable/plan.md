# Plan — Drive the Spec to 100% AI-Readability

> **Updated:** 2026-04-20 (UTC+8) · **Owner:** Lovable AI · **Round 2 readiness:** **99/100 (A+)** — exceeds 98/100 goal ✅
> **Audit report:** [`spec/21-ai-readiness-audit-round-2.md`](../spec/21-ai-readiness-audit-round-2.md)

## Goal
Make `spec/**` so unambiguous that a fresh AI session, reading only the spec + `mem://`, can rebuild the product with **<1% blind-handoff failure** and **zero clarifying questions** on any single feature file.

## Success criteria (definition of "100%")
1. Every spec file ≤400 lines (no monoliths).
2. Zero broken inbound links; zero numbering collisions; all header guards green.
3. Every feature file declares: **Inputs · Outputs · Edge Cases · Acceptance Tests · Component Contract**.
4. Every spec section has a `data-testid` map → component path (resolves audit A-16).
5. Spec ↔ memory consistency: no contradictions (Tailwind v3/v4, dep versions, etc.).
6. CI enforces all hygiene rules + file-length cap automatically (no manual policing).
7. AI-readiness score ≥98/100 measured by re-running the audit script.

---

## Priority bands

### 🔴 CRITICAL — blocks blind handoff (do this iteration)

**C-1. Finish AUD-L-01 mega-file splits.** ✅ COMPLETE — all 4 mega-files decomposed.
- ✅ C-1.1 Split `spec/15-wp-plugin-how-to/07-reference-implementations.md` (858) — done 2026-04-19
- ✅ C-1.2 Split `spec/15-wp-plugin-how-to/04-logging-and-error-handling.md` (833) — done 2026-04-19
- ✅ C-1.3 Split `spec/16-generic-cli/20-terminal-output-design.md` (821) — done 2026-04-19
- ✅ C-1.4 Split `spec/02-coding-guidelines/04-php/01-enums.md` (782) — done 2026-04-19

**C-2. Add a regression guard so length-bloat never returns.** ✅ COMPLETE — done 2026-04-19
- ✅ C-2.1 Created `scripts/spec-hygiene/05-check-file-length.mjs` (fail >800, warn >400; excludes `spec-index.md`, `99-consistency-report.md`, `98-changelog.md`).
- ✅ C-2.2 Wired into `scripts/spec-hygiene/00-run-all.mjs`.
- ✅ C-2.3 Documented in `spec/01-spec-authoring-guide/12-file-length-cap.md`. Initial baseline: 0 hard-cap violations, 43 soft warnings (M-1/H-1 backlog).

**C-3. Resolve the spec ↔ memory Tailwind contradiction (audit A-12).** ✅ COMPLETE — done 2026-04-19
- ✅ C-3.1 Decision: **Tailwind v4** (verified `tailwindcss@^4.2.2` + `@tailwindcss/vite@^4.2.2` in package.json).
- ✅ C-3.2 Updated `mem://design/theme` with explicit v4 rule + SSOT pointer. Core memory (`mem://index.md`) already correct.
- ✅ C-3.3 Created `spec/32-ui-design/03-design-system/03-tailwind-version-ssot.md` (authoritative; overrides all conflicting references).

**C-4. Lock the toolchain in spec (audit A-11).** ✅ COMPLETE — done 2026-04-19
- ✅ C-4.1 Created `spec/02-coding-guidelines/01-cross-language/30-pinned-dependency-matrix.md` (React 19, TS 6, Vite 8, Tailwind v4, axios pin, lucide-react, etc.) with forbidden categories and add-dep workflow.
- ✅ C-4.2 Updated `mem://architecture/tech-stack` to point at the SSOT and pin React 19 / TS 6 / Router v7.

---

### 🟠 MAJOR — large readability wins

**M-1. Trim the next length tier (700-line files → subfolders).**
- ✅ M-1.1 `spec/06-seedable-config-architecture/01-fundamentals.md` (731) — done 2026-04-19 (split into 10 files)
- ✅ M-1.2 `spec/02-coding-guidelines/consolidated-review-guide.md` (721) — done 2026-04-19 (split into 16 files)
- ✅ M-1.3 `spec/15-wp-plugin-how-to/11-frontend-and-template-patterns.md` (711) — done 2026-04-19 (split into 11 files)
- ✅ M-1.4 `spec/14-self-update-app-update/09-release-versioning.md` (700) — done 2026-04-19 (split into 11 files) — **M-1 COMPLETE**

**M-2. Standardize feature-file template across `spec/31-app/01-features/`.**
- ✅ M-2.1 Authored `spec/01-spec-authoring-guide/13-feature-file-template.md` (5 mandatory sections: Inputs · Outputs · Edge Cases · Acceptance Tests · Component Contract) — done 2026-04-19
- M-2.2 Retrofit each of 13 feature files to template (one atomic task per file). **Progress: 13/13 ✅ COMPLETE** (2026-04-19)
- M-2.4 Flip feature-shape checker to STRICT mode by default ✅ COMPLETE (2026-04-19) — emergency bypass via `SPEC_FEATURE_SHAPE_STRICT=0`
- ✅ M-2.3 Added `scripts/spec-hygiene/06-check-feature-shape.mjs` (WARN mode during M-2.2 rollout; flip to STRICT via `SPEC_FEATURE_SHAPE_STRICT=1` once 13/13 comply) — done 2026-04-19

**M-3. Add component-contract map (resolves audit A-16). ✅ COMPLETE (2026-04-19)**
- ✅ M-3.1 Generated `spec/32-ui-design/01-architecture/05-component-contract-map.md` — 152 surfaces across 13 features, 129 unique component paths. (Filename uses `05-` prefix because `01-04` slots were already taken; sequential numbering preserved.)
- ✅ M-3.2 Generator script `scripts/spec-hygiene/07-extract-contract-map.mjs` — wired into `00-run-all.mjs`. Validates that every AT ID referenced in a Component Contract row exists in the same file's `## Acceptance Tests` table.

**M-4. Add concurrency / LWW spec (resolves audit A-18). ✅ COMPLETE (2026-04-19)**
- ✅ M-4.1 New file `spec/31-app/01-features/14-concurrency-and-sync.md` (15 ATs, 12 component-contract rows). Field-level LWW + server-stamped UTC ms + tie-break by higher `userId` + 5 s Undo on "Restored remote change" banner. CRDT/OT explicitly deferred to Phase 3.
- ✅ M-4.2 Added 7 new concurrency edge-case rows to `spec/31-app/03-edge-cases/01-edge-cases.md` (clock skew, offline replay, deleted-by-peer, NTP backward jump, split-state move, stale tab, identical-ms tie-break).

---

### 🟡 HIGH — completeness & cross-reference quality

- **H-1.** Trim 600-line files (originally 13 files: 600–694 lines). One atomic task per file, same split pattern.
  - ✅ H-1.1 `01-cli-examples.md` (694) → 5-file subfolder — done 2026-04-19
  - ✅ H-1.2 `02-boolean-standards.md` (693) → 8-file subfolder — done 2026-04-19
  - ✅ H-1.3 `05-helpers-responses-and-integration.md` (685) → 9-file subfolder, 7 inbound links — done 2026-04-19
  - ✅ H-1.4 `02-debugging-go.md` (654) → 9-file subfolder, 2 inbound + 1 path-depth fix — done 2026-04-19
  - ✅ H-1.5 `03-debugging-typescript.md` (652) → 10-file subfolder, 2 inbound links — done 2026-04-19
  - ✅ H-1.6 `01-registry.md` (652) → 6-file subfolder, 8 inbound links — done 2026-04-20
- **H-1.** Trim 600-line files (originally 13 files: 600–694 lines). One atomic task per file, same split pattern.
  - ✅ H-1.1 `01-cli-examples.md` (694) → 5-file subfolder — done 2026-04-19
  - ✅ H-1.2 `02-boolean-standards.md` (693) → 8-file subfolder — done 2026-04-19
  - ✅ H-1.3 `05-helpers-responses-and-integration.md` (685) → 9-file subfolder, 7 inbound links — done 2026-04-19
  - ✅ H-1.4 `02-debugging-go.md` (654) → 9-file subfolder, 2 inbound + 1 path-depth fix — done 2026-04-19
  - ✅ H-1.5 `03-debugging-typescript.md` (652) → 10-file subfolder, 2 inbound links — done 2026-04-19
  - ✅ H-1.6 `01-registry.md` (652) → 6-file subfolder, 8 inbound links — done 2026-04-20
  - ✅ H-1.7 `05-user-scoped-isolation.md` (648) → 7-file subfolder, 6 inbound links — done 2026-04-20
  - ✅ H-1.8 `19-micro-orm-and-root-db.md` (643) → 9-file subfolder, 4 inbound links — done 2026-04-20
  - ✅ H-1.9 `05-validation-data-seeding.md` (607) → 7-file subfolder, 7 inbound links — done 2026-04-20
  - ✅ H-1.11 `04-rbac-casbin.md` (599) → 9-file subfolder, 8 inbound links — done 2026-04-20
- ✅ H-1.12 `02-rag-validation-helpers.md` (597) → 8-file subfolder, 9 inbound links — done 2026-04-20
  - ✅ H-1.13 `08-typescript-standards-reference.md` (591) → 11-file subfolder, 23 inbound links — done 2026-04-20
  - ✅ H-1.14 `09-response-key-type-inventory.md` (565) → 12-file subfolder, 5 inbound links — done 2026-04-20
  - ✅ H-1.15 `02-script-reference.md` (564) → 8-file subfolder, 7 inbound links — done 2026-04-20
  - ✅ H-1.16 `08-color-themes-legacy.md` (558) → collapsed to 37-line redirect stub (canonical 04-color-themes/ already existed) — done 2026-04-20
  - ✅ H-1.17 `01-issues-and-fixes-log.md` (541) → 7-file subfolder, 9 inbound links — done 2026-04-20
  - ✅ H-1.18 `01-error-handling-reference.md` (541) → 5-file subfolder, 16 inbound links — done 2026-04-20
  - ✅ H-1.19 `03-casting-elimination-patterns.md` (505) → 6-file subfolder, 11 inbound links — done 2026-04-20
  - 🎉 **H-1 TIER COMPLETE** — all 19 oversized monoliths split or stubbed (2026-04-20)
- **H-2. Acceptance criteria coverage** ✅ **DONE 2026-04-20**
  - ✅ H-2.1 Scaffolded 18 missing top-level `97-acceptance-criteria.md` files (skipped 2 folders that already had `98-acceptance-criteria.md`) — done 2026-04-20
  - ✅ H-2.2 Built `scripts/spec-hygiene/08-check-acceptance-coverage.mjs` (errors on missing top-level AC, warns on missing subfolder AC ≥4 topic files); wired into `00-run-all.mjs` — done 2026-04-20
  - 📝 Follow-up: 63 subfolder warnings remain (informational) — populate per-subsection AC during next refinement pass
- **H-3.** ✅ Identity-rule test (audit A-17): "Item ID stable across move/mirror/share/restore" covered by AT-INFOMODEL-03..06 in `spec/31-app/01-features/01-information-model.md` — done 2026-04-19 alongside M-2.2 first retrofit.
- **H-4. Cross-reference completeness** ✅ **DONE 2026-04-20**
  - ✅ H-4.1 Every `00-overview.md` ends with a "Related" block (115 auto-fixed by `10-fix-related-blocks.mjs`; 3 already had one).
  - ✅ H-4.2 Every checklist back-links to its parent overview (5 patched manually; 25 already compliant).
  - ✅ Built `scripts/spec-hygiene/09-check-xrefs.mjs` (wired into `00-run-all.mjs`); strict mode via `SPEC_XREF_STRICT=1`.
- **H-5. Glossary & enum index** ✅ **DONE 2026-04-20**
  - ✅ H-5.1 `spec/19-glossary.md` — terminology SSOT (naming, architecture tiers, error handling, coding standards, DB, frontend, spec-system) — done 2026-04-20
  - ✅ H-5.2 `spec/20-enums-index.md` — universal rules + per-language refs + 5 domain enum tables + protocol-driven exemptions + new-enum checklist — done 2026-04-20

---

### 🟢 LOW — polish, automation, future-proofing

- ✅ **L-1.** CI workflow `.github/workflows/spec-hygiene.yml` runs `00-run-all.mjs` + `git diff --exit-code` for `spec-index.md` and component-contract map — done 2026-04-20
- ✅ **L-2.** Pre-commit hook installed by `scripts/install-git-hooks.mjs` (auto-runs via npm `prepare`); copies `scripts/git-hooks/pre-commit` into `.git/hooks/`. Hook runs full hygiene suite when `spec/**` or `scripts/spec-hygiene/**` files are staged. Bypass with `git commit --no-verify`. Idempotent + sandbox-safe (skips when `.git` is a file/missing). New `spec:check` npm script added. — done 2026-04-20
- ✅ **L-3.** Auto-generated TOC — `scripts/spec-hygiene/11-generate-auto-toc.mjs` injects per-folder topic tables between `<!-- AUTO-TOC:START/END -->` sentinels into 92 of 119 overviews (27 folders skipped: <2 topic siblings or pre-authored heading). Wired into `00-run-all.mjs`. Idempotent. — done 2026-04-20
- ✅ **L-4.** Re-ran AI-readiness audit on 2026-04-20 — Round 2 score **99/100 (A+)**, exceeds 98/100 goal. Full report: [`spec/21-ai-readiness-audit-round-2.md`](../spec/21-ai-readiness-audit-round-2.md). Corpus: 1 018 files, 36 070 lines, 0 hard-cap violations, 10 hygiene checks all green.
- ✅ **L-5.** Spec linter exit-on-warn — tightened hard-cap from 800 → 600 lines on 2026-04-20; split last 640-line outlier (`05-apperrtype-enums.md` → 6-file subfolder). 400-line warn level retained.

---

## Round 3 — Optional Polish (post 99/100)

After hitting 99/100 on 2026-04-20, optional follow-up work to push to 100/100:

- **R3-1.** Split remaining 400+ line files (was 20, target 0). Progress: 12/20 on 2026-04-20:
  - `04-database-conventions/06-rest-api-format.md` (492) → 5-file subfolder
  - `02-coding-guidelines/03-golang/01-enum-specification/02-required-methods.md` (489) → 5-file subfolder
  - `01-spec-authoring-guide/00-overview.md` (494 → 156) — extracted 4 sibling files
  - `03-error-manage/01-error-resolution/03-retrospectives/02-retry-debounce-dedup-fixes.md` (474) → 5-file subfolder
  - `02-coding-guidelines/06-ai-optimization/03-common-ai-mistakes.md` (464) → 8-file subfolder
  - `03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/02-apperror-struct.md` (463) → 7-file subfolder
  - `16-generic-cli/16-verbose-logging.md` (455) → 6-file subfolder
  - `02-coding-guidelines/01-cross-language/16-static-analysis/09-ci-pipeline-quality-gate.md` (440) → 7-file subfolder
  - `02-coding-guidelines/01-cross-language/27-types-folder-convention.md` (436) → 5-file subfolder
  - `02-coding-guidelines/01-cross-language/04-code-style/03-blank-lines-and-spacing.md` (405) → 4-file subfolder
  - `02-coding-guidelines/04-php/02-forbidden-patterns.md` (408) → 7-file subfolder
  - `02-coding-guidelines/04-php/03-naming-conventions.md` (416) → 5-file subfolder
- **R3-2.** Populate the 63 subfolder AC warnings with real criteria.
- **R3-3.** Once R3-1 hits 0, flip 400-line warning to error in `05-check-file-length.mjs`.

---

## Atomic task list (executable order)

| # | ID | Task |
|---|----|------|
| 1 | C-1.1 | Split `07-reference-implementations.md` |
| 2 | C-1.2 | Split `04-logging-and-error-handling.md` |
| 3 | C-1.3 | Split `20-terminal-output-design.md` |
| 4 | C-1.4 | Split `01-enums.md` (PHP) |
| 5 | C-2.1+2.2 | Add length checker + wire into runner |
| 6 | C-2.3 | Document cap in authoring guide |
| 7 | C-3.* | Resolve Tailwind v3/v4 — update memory + spec |
| 8 | C-4.* | Pinned dep matrix page + memory update |
| 9 | M-1.1..1.4 | Split 4 × 700-line files |
| 10 | M-2.1 | Author feature-file template |
| 11 | M-2.2 | Retrofit 13 feature files (atomic per file) |
| 12 | M-2.3 | Feature-shape checker |
| 13 | M-3.* | Component-contract map + generator |
| 14 | M-4.* | Concurrency spec + edge cases |
| 15 | H-1.* | Split 8 × 600-line files |
| 16 | H-2.* | Acceptance-criteria backbone |
| 17 | H-3 | Identity-rule acceptance test |
| 18 | H-4.* | Cross-reference completeness |
| 19 | H-5.* | Glossary + enum index |
| 20 | L-1..L-5 | CI, hooks, polish |

---

## Recommended execution cadence
1. **This run:** C-1.1 (one mega-file, proven-safe).
2. **Next 3 runs:** C-1.2 → C-1.3 → C-1.4 (finish AUD-L-01).
3. **Then:** C-2 (regression guard) before M-1 starts.
4. **Then:** C-3 + C-4 (small, decision-driven).
5. **Then:** M-1 → M-2 → M-3 → M-4.
6. **Then:** H-* and L-*.

## Decisions I need from you
1. **Tailwind v3 or v4?** (blocks C-3)
2. **One-at-a-time** (safe, current cadence) **or bulk 4 in one run** (faster, heavier review)?
3. **Component-contract map (M-3): auto-generated from JSDoc, or hand-written first** with generator later?

## Out of scope (deliberately)
Building the actual product (audit A-01..A-10). This plan is **spec-only**. A separate product-build plan starts once spec hits ≥98/100.

---

## Workflowy Spec Consolidation — 8 Phases (started 2026-04-21)

> **Scope lock:** edits ONLY in `spec/` folders ≥18 (primarily `31-app/`, `32-ui-design/`). Folders 01–17 are read-only.
> **Source material:** user product dump 2026-04-21 + 10 screenshots in `.lovable/references/workflowy-screenshots/` (more arriving in next 2–3 sessions).
> **User decisions:** sequential 1→8 · headings H1–H5 · Handbook EN-only at launch · default palette derived from img-47.

| Phase | Status | Target files | Summary |
|-------|--------|--------------|---------|
| 0 — Capture & log | ✅ Done 2026-04-21 | `.lovable/references/`, `suggestions.md`, `plan.md` | Save 10 screenshots, log initiative & open questions |
| 1 — Navbar & breadcrumb | ⏳ Pending user "go" | `spec/32-ui-design/01-architecture/02-navbar.md` (new) | Left 3-dot, back/forward, home, absolute breadcrumb path, search, add-collab, today, favorite-star, complete-toggle, right 3-dot |
| 2 — Search bar | ⏳ Pending | `spec/32-ui-design/01-architecture/03-search-bar.md` (new) | Tabs (globe/@/📅/🕐/👥/⋯), filter syntax (date/changed/created/me/others/is/has/in/text/link/highlight), jump-to (Enter / ⌘K) |
| 3 — App menu + Handbook + Hotkeys | ⏳ Pending | `spec/32-ui-design/01-architecture/04-app-menu.md`, `spec/31-app/01-features/15-handbook.md`, `16-hotkeys.md` | Right 3-dot menu items (img-45), searchable handbook (EN), hotkeys panel |
| 4 — Bullet affordances + 3-dot context menu | ⏳ Pending | `spec/32-ui-design/04-editor/06-bullet-affordances.md` (new), extend `spec/31-app/01-features/06-item-context-menu.md` | Arrow visible only when children exist (img-49); full context-menu list (img-46); focused-item top menu (img-48) |
| 5 — Slash menu + selection toolbar | ⏳ Pending | `spec/32-ui-design/04-editor/07-slash-menu.md`, `08-selection-toolbar.md` (new) | `/` insert menu, H1–H5 (extend), selection toolbar B/U/I/S/link/color (img-47), text + highlight palettes |
| 6 — Left main panel | ⏳ Pending | `spec/32-ui-design/01-architecture/05-left-panel.md` (new) | Single main button, hover tooltip, click opens workspace browser |
| 7 — Today/Favorites + account connections | ⏳ Pending | `spec/31-app/01-features/17-today-and-favorites.md`, `18-account-connections.md` (new) | Star = favorite, LinkedIn first integration |
| 8 — Consolidation | ⏳ Pending | `spec/31-app/00-overview.md`, `spec/32-ui-design/00-overview.md`, both `99-consistency-report.md`, `spec/spec-index.md` + `mem://design/ui-components` | Refresh indexes, consistency reports, memory references |

### Open questions (capture for future sessions)
1. Exact hex values for Text + Highlight palettes (img-47 has 11 swatches each).
2. Full keymap for Hotkeys panel (only ⌘Z/⇧⌘Z/⌘S/⌘P shown so far).
3. Seed list for "What's New" entries at launch.
4. LinkedIn scope: read-only profile vs OAuth posting?
5. Remaining ~20 screenshots — likely cover board view, share dialog, mirror, today, trash, settings.

### Pending screenshots (user to upload across next 2–3 sessions)
- App menu sub-screens (Settings, Integrations, Trash, Export)
- Mirror creation flow
- Share dialog
- Board view
- Today view
- Mobile responsive states

