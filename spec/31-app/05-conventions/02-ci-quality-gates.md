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
| G-25 | `25-check-token-lifecycle-coverage.mjs` | Hard *(reserved — algorithm SSOT exists, not yet implemented)* | Five-axis: browser-storage prohibition, issuance audit pairing, revocation audit pairing, refresh-cookie path-scoping, refresh-cookie `HttpOnly`/`Secure`/`SameSite=Strict` hardening — see [`18-g25-token-lifecycle-coverage-gate.md`](./18-g25-token-lifecycle-coverage-gate.md) |
| G-26 | `26-check-mfa-policy-coverage.mjs` | Hard *(reserved — algorithm SSOT exists, not yet implemented)* | Five-axis: forbidden-literal prohibition (`'sms'`/`'email_otp'`/`'voice'`/`'remember_mfa'`/`MFA_DISABLED`/`bypass_mfa`), mutation-route freshness declaration, step-up-map bidirectional parity, factor-registry static containment, recovery-code argon2id hash strength — see [`19-g26-mfa-coverage-gate.md`](./19-g26-mfa-coverage-gate.md) |
| G-27 | `27-check-export-policy-coverage.mjs` | Hard *(reserved — algorithm SSOT exists, not yet implemented)* | Six-axis: `/export/*` route MFA(300)+rate-limit hardening, `workflowy-exports/` write paired with `Crypto::aesGcmEncrypt()` ≤30 lines, serializer redaction precedence over §6 fields, `FormatRegistry::ALLOWED` mutations contained, install-hook `.htaccess` deny-directive presence, signed-URL leak prevention (Email-only sink) — see [`20-g27-export-coverage-gate.md`](./20-g27-export-coverage-gate.md) |
| G-28 | `28-check-backup-policy-coverage.mjs` | Hard *(reserved — algorithm SSOT exists, not yet implemented)* | Seven-axis: SQLite `\SQLite3::backup()`-only enforcement (no `cp`/`copy()`/`rsync` of `*.sqlite`), tarball `Crypto::aesGcmEncrypt()` ≤30 lines before object-storage upload, S3Client config hardening (3-key conjunction: `'encryption' => 'AES256'` + `'acl' => 'private'` + `https://` endpoint), sensitive-file exclusion (no `wp-config.php`/`auth_key`/`secret`/`password` in tarballs), restore integrity verification (`PRAGMA integrity_check` AND `AuditChain::reWalk` ≤50 lines before `Restore\Engine::swap`), drill-scheduler 90-day cadence presence, bidirectional schedule↔cron parity — see [`21-g28-backup-coverage-gate.md`](./21-g28-backup-coverage-gate.md) |
| G-29 | `29-check-endpoint-matrix-coverage.mjs` | Hard *(implemented 2026-04-27)* | Bidirectional parity between every `EP-*` symbol declared in `spec/31-app/06-endpoints/*.md` and every row of `spec/31-app/06-endpoints/16-endpoint-at-matrix.md`. No orphan endpoints (declared but unmatrixed) and no phantom matrix rows (matrixed but undeclared). Each matrixed endpoint MUST cite ≥1 AT ID. See [`22-g29-endpoint-matrix-coverage-gate.md`](./22-g29-endpoint-matrix-coverage-gate.md) |
| G-30 | `30-check-at-citation-validity.mjs` | Hard *(implemented 2026-04-27; scope extended same day; G-30.2 advisory added 2026-04-27; advisory promoted to default-on 2026-04-27; G-30.2 promoted WARN→ERROR v1.5.0; G-30.3 meta sub-check added v1.6.0 — all same day)* | **G-30.1 (ERROR)**: every `AT-*` ID cited under three consumer scopes — `spec/31-app/06-endpoints/**/*.md`, `spec/31-app/02-workflows/**/*.md`, and `spec/31-app/07-db-diagram/04-feature-slices.md` — MUST be declared somewhere under `spec/31-app/**` (closed table-row, backticked range, or open-prefix placeholder). Catches typos and invented prefixes (e.g. `AT-MGP-*`). **G-30.2 (ERROR, v1.5.0)**: open-prefix declarations whose citations are 100% covered by closed declarations OR have zero usage MUST be removed (or allow-listed in `REDUNDANCY_ALLOWLIST`). Drained 5→0 in v1.3.0 (F27), default-on WARN in v1.4.0 (F28), promoted to ERROR in v1.5.0 (F-future-G30-A). Emergency bypass: `G30_REDUNDANT_ENFORCE=0` env var; `--warn-redundant-only` CLI flag restores WARN-only for one-off audits. **G-30.3 (ERROR, v1.6.0)**: meta — every entry in `REDUNDANCY_ALLOWLIST` MUST carry a rationale comment (trailing inline `// …` or contiguous `// …` lines immediately above). Algorithm ported verbatim from G-31.5 / G-32.4. 41 entries, 0 unrationaled. Negative-tested. See [`23-g30-at-citation-validity-gate.md`](./23-g30-at-citation-validity-gate.md) |
| G-31 | `31-check-workflow-xref-reciprocity.mjs` | Hard *(v2.0.0 implemented 2026-04-27; G-31.3 promoted v2.1.0; G-31.4 promoted v2.2.0; G-31.2 promoted v2.3.0; G-31.5 meta added v2.4.0; G-31.6 island advisory added v2.5.0; G-31.7 heading-normalisation advisory added v2.6.0; G-31.7 drained v2.6.1; G-31.6 drained v2.7.0 — all same day)* | **Multi-scope reciprocity check + meta + 2 advisories** — 5 ERROR sub-checks at 0 violations + 2 WARN sub-checks (0 islands after v2.7.0 drain + 0 heading-drift after v2.6.1 drain). **G-31.1 (workflows, ERROR, v1.0.0)**: cross-flow links in `## Related` of `02-workflows/NN-*-flow.md` MUST be reciprocated. **G-31.2 (features, ERROR, v2.3.0)**: same on `01-features/NN[a-z]?-*.md`; accepts `## Related`/`## Cross-References`/`## See also`; drained 30→0 programmatically. **G-31.3 (endpoints, ERROR, v2.1.0)**: same on `06-endpoints/NN[a-z]?-*.md`; drained 8→0. **G-31.4 (db-diagram, ERROR, v2.2.0)**: same on `07-db-diagram/NN-*.md`; drained 6→0. **G-31.5 (meta, ERROR, v2.4.0)**: every entry in each per-scope exemption Set (12 Sets total: 4 reciprocity + 4 island + 4 heading) MUST carry a rationale comment. Algorithm ported verbatim from G-32.4. **G-31.6 (islands, WARN, v2.5.0+v2.7.0)**: per-scope advisory flagging files with **zero outgoing AND zero incoming** cross-sibling references; opt-out via `*_ISLAND_EXEMPT` Set. v2.7.0 drained the 14 initial islands via per-file triage: 5 features `*b` addendum slices allow-listed (semantic peer is the parent SSOT, not a sibling) and 9 endpoint UI-surface pages allow-listed (cross-references point out-of-scope to features/db-diagram, not to sibling endpoints). Final state: 0 islands across all 4 scopes. **G-31.7 (heading-drift, WARN, v2.6.0+v2.6.1)**: per-scope advisory flagging files using a non-canonical related-section H2 (workflows + features canonical = `## Related`; endpoints + db-diagram canonical = `## Cross-References`); opt-out via `*_HEAD_EXEMPT` Set. v2.6.1 drained the 3 initial drift files via per-file triage. Final state: 0 drift across all 4 scopes. Reciprocity logic still accepts all variants. WARN-only — does not fail CI; permanent-WARN by design (judgement may legitimately vary). WARN-then-ERROR staged rollout is complete for the 4 reciprocity scopes; G-31.6/7 are permanent-WARN. See [`24-g31-workflow-xref-reciprocity-gate.md`](./24-g31-workflow-xref-reciprocity-gate.md) |
| G-32 | `32-check-ddl-unique-coverage.mjs` | Hard *(v5.0.0 implemented 2026-04-27; promoted from F26 prototype `/tmp/audit_unique.mjs`)* | **Five-direction check.** **G-32.1 (forward, UNIQUE-only)**: every `UNIQUE` declaration in `01-root-schema.sql` and `02-app-schema.sql` MUST be documented in `06-indexes.md`. **G-32.2 (reverse)**: every `Idx*` / `sqlite_autoindex_*` identifier in backticks in `06-indexes.md` MUST resolve to an explicit `CREATE [UNIQUE] INDEX`, a UNIQUE-implied autoindex, or a documented alias. **G-32.3 (forward, all CREATE INDEX, v3.0.0)**: every `CREATE INDEX` (UNIQUE OR plain) across all 3 SQL files MUST appear in `06-indexes.md` by its DDL name OR its prose-alias name. **G-32.4 (meta, v4.0.0)**: every entry in `COVERAGE_EXEMPT` / `REVERSE_EXEMPT` / `NONUNIQUE_EXEMPT` MUST carry a rationale comment (trailing inline `//` OR a `//` line directly above; no blank-line gap). **G-32.5 (parity, v5.0.0)**: for every `CREATE [UNIQUE] INDEX` block, the matching doc row in `06-indexes.md` MUST mention every column from the DDL `(cols)` list (case-sensitive identifier match in backticked content, with column-alias resolution via `sql/00-overview.md` §Naming Bridge), the literal `UNIQUE` token if applicable, and the word `partial` plus the verbatim `WHERE` predicate if applicable. Catches the F26 drift classes plus **fabricated index names** (G-32.2), **undocumented non-UNIQUE indexes** (G-32.3 — caught `IdxMirrorGroup_CanonicalItemId` on first run), **rationale-free allow-list entries** (G-32.4 — caught 4 `REVERSE_EXEMPT` siblings sharing a banner-style category comment on first run), and **column / UNIQUE / predicate drift on the right-named row** (G-32.5 — caught `IdxMirrorMember_MirrorGroupId`'s prose-alias column reference on first run; resolved by adding column-alias resolution rather than allow-listing). See [`25-g32-ddl-unique-coverage-gate.md`](./25-g32-ddl-unique-coverage-gate.md) |

> **Note** — `G-14` is reserved (see `14-split-oversized-files.mjs` — operator-only, not part of the runner). `G-17` and `G-18` are reserved for the hotkey-drift check (A-19 follow-up) and the cycle-algorithm SQL drift check (A-38 follow-up) respectively, both already promised in their parent specs. **`G-19`–`G-28` algorithm SSOTs exist** in this folder (`04-`, `06-`, `07-`, `15-`, `16-`, `17-`, `18-`, `19-`, `20-`, `21-` respectively); pending runner implementation. **`G-29`, `G-30`, `G-31`, and `G-32` are fully implemented** as `scripts/spec-hygiene/29-check-endpoint-matrix-coverage.mjs`, `30-check-at-citation-validity.mjs`, `31-check-workflow-xref-reciprocity.mjs`, and `32-check-ddl-unique-coverage.mjs`. **Orphan-gate cluster complete** — no further G-2X reservations pending.

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
