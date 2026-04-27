# CI Quality Gates — Convention SSOT

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Closes:** A-30 (CI gate cluster — first of A-30..A-35)

---

## Overview

This document is the **Single Source of Truth** for *what* must pass before any change to the spec or to code can land. It defines the contract for the hygiene-script suite under `scripts/spec-hygiene/`, the exit-code convention every gate must follow, when each gate runs (local pre-commit vs. CI), and how a new gate is added without breaking the runner.

The runner is `scripts/spec-hygiene/00-run-all.mjs`, invoked via `bun run spec:check`. CI must run this command on every push and every pull request.

---

## User Story

As a contributor (human or AI), I want a single deterministic command that tells me whether my change satisfies every hygiene rule, so that I never merge a PR that silently rots the spec or introduces drift between code and SSOT.

---

## Inputs

| Input | Source | Notes |
|-------|--------|-------|
| `spec/**/*.md` | Repository | All markdown specs |
| `src/types/index.ts` | Repository | Read by `15-check-enums-in-sync.mjs` |
| `src/index.css` | Repository | Read by `16-check-tailwind-tokens.mjs` (`@theme` block) |
| `src/**/*.{ts,tsx}` | Repository | Scanned for token references by gate 16 |
| Git working tree state | `git status` | Pre-commit hook only — not used by CI |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Per-gate stdout | ❌ | Console | Each gate prints its own pass/fail summary |
| Aggregated exit code | ❌ | Process exit | `0` ⇒ all green, `1` ⇒ one or more failed |
| Auto-generated `spec/spec-index.md` | ✅ | Filesystem | Written by gate 04 on every run |
| Auto-generated TOCs | ✅ | Filesystem | Written by gate 11 |
| Generated AT-stub files | ✅ | Filesystem | Written by gate 13 only when missing |

---

## Gate Catalogue

The runner executes these in order. Each gate is independent: a failure in one does **not** short-circuit the rest.

| ID | Script | Type | Enforces |
|----|--------|------|----------|
| G-01 | `01-check-numbering.mjs` | Hard | `NN-name.md` filename convention |
| G-02 | `02-check-headers.mjs` | Hard | Required H1 + frontmatter shape |
| G-03 | `03-check-links.mjs` | Hard | All relative `[...](...)` links resolve |
| G-04 | `04-generate-index.mjs` | Generator | Rewrites `spec/spec-index.md` |
| G-05 | `05-check-file-length.mjs` | Hard | Files ≤ defined max lines |
| G-06 | `06-check-feature-shape.mjs` | Hard | Feature files contain mandatory sections |
| G-07 | `07-extract-contract-map.mjs` | Generator | Builds the component-contract map |
| G-08 | `08-check-acceptance-coverage.mjs` | Hard | Every AT-id is referenced from at least one feature file |
| G-09 | `09-check-xrefs.mjs` | Hard | Cross-references are bidirectional |
| G-10 | `10-fix-related-blocks.mjs` | Generator | Normalizes `## Related` blocks |
| G-11 | `11-generate-auto-toc.mjs` | Generator | Rewrites `00-overview.md` TOCs |
| G-12 | `12-check-required-files.mjs` | Hard | Every editable folder has `00-overview.md` + `99-consistency-report.md` |
| G-13 | `13-generate-at-stubs.mjs` | Generator | Creates AT-stub files for new feature folders |
| G-15 | `15-check-enums-in-sync.mjs` | Hard | Spec enums equal TypeScript enums (currently ItemType) |
| G-16 | `16-check-tailwind-tokens.mjs` | Hard | Every `bg-*` / `text-*` token in `src/**` resolves in `@theme` |
| G-22 | `22-check-error-code-catalogue.mjs` | Hard *(reserved — algorithm SSOT exists, not yet implemented)* | Every `ERR_*` literal in source has a catalogue row; HttpStatus parity per emitter — see [`15-g22-error-code-catalogue-gate.md`](./15-g22-error-code-catalogue-gate.md) |
| G-23 | `23-check-audit-log-coverage.mjs` | Hard *(reserved — algorithm SSOT exists, not yet implemented)* | Two-axis: every `Audit::action()` shorthand resolves to a taxonomy row; every mutation handler emits `AuditLog::write` per non-error return path — see [`16-g23-audit-log-coverage-gate.md`](./16-g23-audit-log-coverage-gate.md) |
| G-24 | `24-check-role-escalation-coverage.mjs` | Hard *(reserved — algorithm SSOT exists, not yet implemented)* | Four-axis: role-mutation gating (30-line window), break-glass containment, 24h ExpiresAt static bound, test-file parity for `Auth/Escalation/` — see [`17-g24-role-escalation-coverage-gate.md`](./17-g24-role-escalation-coverage-gate.md) |

> **Note** — `G-14` is reserved (see `14-split-oversized-files.mjs` — operator-only, not part of the runner). `G-17` and `G-18` are reserved for the hotkey-drift check (A-19 follow-up) and the cycle-algorithm SQL drift check (A-38 follow-up) respectively, both already promised in their parent specs. **`G-19`–`G-24` algorithm SSOTs exist** in this folder (`04-`, `06-`, `07-`, `15-`, `16-`, `17-` respectively); pending runner implementation. **`G-25`–`G-28` are reserved** for the session-token, MFA, data-export, and backup/DR policy gates (rows referenced in `11-..14-` policy files); algorithm SSOTs to be authored.

---

## Gate Type Semantics

| Type | Purpose | Effect on exit code | Allowed to write files? |
|------|---------|---------------------|-------------------------|
| **Hard** | Detects drift / violation | Exit 1 ⇒ runner fails | ❌ No |
| **Generator** | Brings derived artifacts up to date | Exit 0 unless write fails | ✅ Yes — must be idempotent |

A generator that produces a diff is still **exit 0**; CI catches the drift via the *next* commit's pre-commit hook (which detects "uncommitted generator output") rather than via the gate itself. This keeps CI fast (no two-pass diff check) while still preventing stale derived files.

---

## Exit-Code Contract

Every gate script **MUST**:

1. Exit `0` on success.
2. Exit `1` on any detected violation.
3. Print a single final line of the form `✅ <gate-name>: <summary>` on success or `❌ <gate-name>: <summary>` on failure.
4. Never `process.exit(N)` with `N > 1` — the runner only distinguishes 0 vs. non-zero.
5. Never throw an uncaught exception — wrap top-level logic in `try/catch` and `console.error` then exit 1.

The runner aggregates: it reports `❌ {N} check(s) failed` and exits 1 if any gate exited non-zero.

---

## When Gates Run

| Trigger | Command | Gates |
|---------|---------|-------|
| Local pre-commit hook | `bun run spec:check` | All gates |
| CI on push | `bun run spec:check` | All gates |
| CI on pull request | `bun run spec:check` | All gates |
| Manual operator (rare) | `node scripts/spec-hygiene/14-split-oversized-files.mjs` | G-14 only — never CI |

There is **one canonical entry point** (`bun run spec:check`). CI must not invoke individual gates — that would let a maintainer silently disable one by editing CI config alone.

---

## Adding a New Gate

1. Create `scripts/spec-hygiene/NN-<purpose>.mjs` where `NN` is the next free two-digit number.
2. Implement the exit-code contract above.
3. Append the script path to the `checks` array in `00-run-all.mjs` (preserve numeric order).
4. Add a row to the **Gate Catalogue** table above with the next free `G-NN` ID.
5. Add an acceptance test in this file's `Acceptance Tests` table.
6. Run `bun run spec:check` — must pass before commit.

---

## Edge Cases

1. A generator gate writes files but the user has uncommitted manual edits to those files → generator overwrites; pre-commit hook then shows a non-empty `git status`, blocking commit until the user re-stages.
2. CI runs on a shallow clone missing `src/types/index.ts` (e.g. docs-only PR) → G-15 must `console.warn` and exit 0; never fail because of missing optional inputs.
3. A new contributor adds a hygiene script but forgets to register it in `00-run-all.mjs` → invisible to the runner; G-12 must list registered scripts and warn when an unregistered `NN-*.mjs` exists in the folder.
4. Two gates write to the same generated file (e.g. both touch `spec/spec-index.md`) → forbidden; the catalogue assigns one owner per output.
5. A gate takes > 30 s → must print a progress line at least every 5 s so CI does not appear hung.
6. Network unavailable → no gate may make network requests. All gates are hermetic against the working copy.
7. Running on Windows path separators → all gates use `node:path` `posix` joins for spec paths to keep output portable.

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-CIGATE-01 | Working tree is clean and all gates pass | `bun run spec:check` | Exits 0; final line `✅ All spec-hygiene checks passed` | `cigate-all-green` |
| AT-CIGATE-02 | A spec file with a broken relative link is committed | `bun run spec:check` | G-03 prints `❌`; runner exits 1 | `cigate-broken-link` |
| AT-CIGATE-03 | `src/types/index.ts` enum drifts from spec | `bun run spec:check` | G-15 prints drift; runner exits 1 | `cigate-enum-drift` |
| AT-CIGATE-04 | A `tw-*` token in `src/components/Foo.tsx` is missing from `@theme` | `bun run spec:check` | G-16 prints unresolved token; runner exits 1 | `cigate-token-drift` |
| AT-CIGATE-05 | A new `NN-*.mjs` script exists in `scripts/spec-hygiene/` but is missing from `00-run-all.mjs` | `bun run spec:check` | G-12 (or successor) emits warning; runner still exits 1 if any hard gate failed | `cigate-unregistered-script` |
| AT-CIGATE-06 | A generator produces a non-empty diff | `git status` post-run | Modified files listed; pre-commit hook blocks commit | `cigate-generator-diff` |
| AT-CIGATE-07 | A gate throws an uncaught exception | Runner observes exit code | Treats as failure; prints script name + exit 1 | `cigate-script-exception` |
| AT-CIGATE-08 | CI workflow on GitHub runs on push to main | Workflow log inspected | Single `bun run spec:check` step; no individual gate invocations | `cigate-single-entrypoint` |

---

## Component Contract

> **Aspirational paths** — files below are the agreed implementation targets, not yet present.

| Concern | Path | Function |
|---------|------|----------|
| Runner | `scripts/spec-hygiene/00-run-all.mjs` | Iterates registered gates; aggregates exit code |
| GitHub Actions workflow | `.github/workflows/spec-check.yml` | Single step: `bun install && bun run spec:check` |
| Pre-commit hook installer | `scripts/install-git-hooks.mjs` | Installs hook that runs `bun run spec:check` |
| Hook body | `.husky/pre-commit` (or equivalent) | Calls `bun run spec:check`; blocks commit on exit 1 |
| Registered-script audit | `scripts/spec-hygiene/12-check-required-files.mjs` (extension) | Add check that every `NN-*.mjs` is in `00-run-all.mjs` |

---

## Cross-References

| Topic | Link |
|-------|------|
| Convention overview | [00-overview.md](./00-overview.md) |
| Axios version pinning (sibling convention) | [01-axios-version-control.md](./01-axios-version-control.md) |
| Hotkey drift gate (G-17) | [`../01-features/05a-hotkey-table.md`](../01-features/05a-hotkey-table.md) |
| Cycle-algorithm drift gate (G-18) | [`../01-features/09a-mirror-cycle-detection.md`](../01-features/09a-mirror-cycle-detection.md) |
| Coding guidelines | `mem://constraints/coding-guidelines` |
