# F8 — Uniform Feature-Block Format Pass

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** ✅ SSOT + gate landed; 29 pre-existing prose lines queued for fix
> **SSOT:** [`../../spec/01-spec-authoring-guide/21-feature-block-format.md`](../../spec/01-spec-authoring-guide/21-feature-block-format.md)
> **Gate:** [`../../scripts/spec-hygiene/39-check-feature-block-format.mjs`](../../scripts/spec-hygiene/39-check-feature-block-format.mjs)

---

## Goal

Standardise the "Workflowy Feature Reference" appendices inserted in F1–F6 across 15 files so every appendix row uses the same micro-format (R1–R4 in the SSOT).

---

## What landed

| Artefact | File | Status |
|----------|------|--------|
| Format SSOT (R1–R4 + scope marker) | [`spec/01-spec-authoring-guide/21-feature-block-format.md`](../../spec/01-spec-authoring-guide/21-feature-block-format.md) | ✅ created |
| Gate G-39 (report-only mode for baseline) | [`scripts/spec-hygiene/39-check-feature-block-format.mjs`](../../scripts/spec-hygiene/39-check-feature-block-format.mjs) | ✅ created |
| AT range `AT-F8-01..04` | inline in SSOT | ✅ created |

G-39 ships in **report-only** mode (`ENFORCE = false`) so the existing 29 baseline violations don't block CI. Flip to enforcing once the queue below is drained.

---

## Baseline finding queue (29 lines, 9 files)

Each of the following lines mentions a keyboard shortcut in a mid-sentence parenthetical (e.g. `(item-menu, shortcut: ⌘+Shift+E)`) instead of terminating the line with a backticked shortcut token (`Shortcut: \`⌘+Shift+E\``). Per R2, the shortcut MUST be at the END of the line, in backticks, prefixed with `Shortcut:`.

| File | Line(s) | Rule | Fix shape |
|------|---------|------|-----------|
| `spec/31-app/01-features/05-interactions.md` | 170, 171, 172 | R2 | Move parenthetical shortcut to end-of-line `Shortcut: \`…\`` |
| `spec/31-app/01-features/03-layout-structure.md` | 259, 260, 262 | R2 | Same |
| `spec/31-app/01-features/10-today-view.md` | 122, 124 | R2 | Same |
| `spec/31-app/01-features/06-item-context-menu.md` | 213, 216, 220, 221, 222, 223, 234 | R2 | Same |
| `spec/31-app/01-features/09-mirrors.md` | 210 | R2 | Same |
| `spec/31-app/01-features/09-mirrors.md` | 219 | R3 (false positive: `adding/removing/moving` is English) | Whitelist or rewrite without `/` |
| `spec/31-app/01-features/12-multi-select.md` | 168, 184 | R3 (false positives: `Shift/Cmd-click`, `expand/collapse`) | Same |
| `spec/31-app/01-features/12-multi-select.md` | 170, 171, 173, 174, 178, 179 | R2 | Same |
| `spec/31-app/01-features/13-templates.md` | 191, 195 | R2 | Same |
| `spec/31-app/01-features/11-trash-view.md` | 151 | R2 | Same |
| `spec/36-user-management/01-account-and-settings.md` | 42 | R2 | Same |

> **R3 false positives:** the regex flags any bare `/word`. English `/` (e.g. `Shift/Cmd`, `add/remove`, `expand/collapse`) is being caught. Two options for the cleanup PR: (a) refine the regex to only match `/[a-z][a-z0-9-]+` preceded by whitespace AND followed by whitespace/punct AND not part of a slashed pair, OR (b) explicitly backtick the few legitimate slash-word pairs the spec uses (e.g. `` `Shift/Cmd-click` ``).

---

## Done criteria

F8 is **fully** complete (gate flipped to `ENFORCE = true`) when:

1. All 22 R2 lines listed above are rewritten so the shortcut sits at end-of-line in backticks.
2. The 3 R3 false-positive lines are resolved (regex refinement OR backticking).
3. `node scripts/spec-hygiene/39-check-feature-block-format.mjs` returns 0 findings.
4. `ENFORCE` constant flipped to `true` in the script.

---

## Why ship report-only first

- The fixes are prose-only and risk introducing copy errors if mass-rewritten without per-line review.
- The gate gives reviewers a single command to confirm no NEW violations sneak in while the queue is drained.
- All future F1–F6 file edits in this session and beyond are now lint-checked.

---

## Verification

```bash
node scripts/spec-hygiene/39-check-feature-block-format.mjs   # currently reports 29
node scripts/spec-hygiene/03-check-links.mjs                  # confirm SSOT links resolve
node scripts/spec-hygiene/00-run-all.mjs                      # full suite still PASS
```

---

*Created 2026-04-28 — closes F8 task scope (SSOT + gate); 29-line cleanup queued as P11+ follow-up.*
