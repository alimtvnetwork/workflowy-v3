# Spec — P2g Remainder Acceptance Criteria I/O Fixtures (Sweep)

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Normative companion covering every `97-acceptance-criteria.md` / `98-acceptance-criteria.md` not already paired with a sibling `97a-…` fixture file.
> **Format spec:** [`01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](./01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P2g.

---

## Scope

P2a..P2f delivered fixture files for 9 high-leverage spec sections (31, 32, 33, 34, 35, 36, 02, 04, 07). This file closes the **remaining ~45 rollups** with a sweep that is normative but compact: a per-section **fixture pattern** + cross-reference to the canonical template that applies.

Sections covered by this sweep:

| Section | Rollup count | Fixture pattern |
|---------|--------------|-----------------|
| `01-spec-authoring-guide` | 1 | **Doc-shape** template |
| `03-error-manage/**` | 14 | **Error-envelope** + **lint-shape** templates |
| `05-split-db-architecture/**` | 5 | **Per-user-DB** template |
| `06-seedable-config-architecture/**` | 5 | **Config-validation** template |
| `08-docs-viewer-ui/**` | 4 | **UI-gesture** template (delegates to `32/97a`) |
| `09-code-block-system` | 1 | **UI-gesture** template (delegates to `07/97a`) |
| `10-powershell-integration/**` | 2 | **Linter-script** template |
| `12-consolidated-guidelines` | 1 | **Cross-reference** template |
| `13-cicd-pipeline-workflows/**` | 3 | **CI-job** template |
| `14-self-update-app-update/**` | 2 | **Release-flow** template |
| `15-wp-plugin-how-to/**` | 17 | **WP-plugin** template (delegates to `04/97a` + `02/97a`) |
| `16-generic-cli/**` | 2 | **Linter-script** template |
| `17-generic-update` | 1 | **Release-flow** template |
| `18-spec-issues` | 1 | **Doc-shape** template |
| `11-research` | 1 | **N/A — narrative reference** |

Total: ~60 rollups, ~400 ATs, all subsumed by 8 fixture patterns below.

---

## Fixture pattern catalogue

### Pattern 1 — Doc-shape

> Use when the AT verifies that a documentation file exists, has a required header, or contains a required cross-reference.

| Slot | Value |
|------|-------|
| **Given** | Repo at HEAD. |
| **Linter command** | `node scripts/spec-hygiene/00-run-all.mjs` (which runs `02-check-headers.mjs`, `03-check-links.mjs`, `09-check-xrefs.mjs`, `12-check-required-files.mjs`). |
| **Expected exit code** | `0` |
| **Then** | All required-file gates pass; no broken xrefs. |
| **Negative assertion** | Removing a required `00-overview.md`, `97-acceptance-criteria.md`, or `99-consistency-report.md` MUST cause exit `1`. |

**Applies to:** `01-spec-authoring-guide`, `18-spec-issues`.

### Pattern 2 — Error-envelope

> Use when the AT verifies the universal error response envelope or `AppError` shape.

| Slot | Value |
|------|-------|
| **Given** | Any handler raises `AppError{Type, Code, Message}`. |
| **When** | Request hits the handler. |
| **Response envelope** | ```json
{ "Status":"ERROR", "Attributes":{"Count":0}, "Results":{}, "Errors":[ { "Type":"<AppErrorType>", "Code":"<E_CODE>", "Message":"<human>" } ] }
``` |
| **Then** | `Status === "ERROR"`; `Errors.length >= 1`; every error has `{Type, Code, Message}`; `Code` matches `/^E_[A-Z0-9_]+$/`. |
| **Side effects** | One row in session log with the same `Code` and a request correlation ID. |
| **Negative assertion** | Bare `throw new Error("…")` reaching a handler MUST be wrapped before serialization (no `{ "error": "…" }` shorthand allowed). |

**Applies to:** `03-error-manage/**` (all 14 sub-rollups), incl. modal copy formats, `AppError` package, error-code registry, response envelope, session-based logging.

### Pattern 3 — Per-user-DB

> Use when the AT verifies the split-DB / per-user shard pattern.

| Slot | Value |
|------|-------|
| **Given** | User `usr_42` with per-user file `data/users/usr_42/user.db`. |
| **When** | Any read/write for `usr_42`. |
| **Then** | The opened SQLite handle's filename equals `data/users/usr_42/user.db`; cross-user query attempts MUST resolve to a different file path; path traversal via `../` MUST be rejected by `pathutil`. |
| **Side effects** | none |
| **Negative assertion** | Single shared DB containing rows for multiple users MUST fail the per-user-isolation test (cross-ref `AT-USERMANAGEMENT-16`). |

**Applies to:** `05-split-db-architecture/**` (5 rollups, incl. CLI examples, RBAC casbin, user-scoped isolation).

### Pattern 4 — Config-validation

> Use when the AT verifies seedable-config + RAG-validation shape.

| Slot | Value |
|------|-------|
| **Given** | Config seed file `config/seeds/<name>.yaml`. |
| **When** | `npm run config:validate` parses the seed through its Zod/Valibot schema. |
| **Then** | Valid seed → exit `0`; missing required key → exit `1` with `E_CONFIG_KEY_MISSING: <key>`; type mismatch → `E_CONFIG_TYPE_MISMATCH`. |
| **Side effects** | none |
| **Negative assertion** | Hardcoded default that bypasses the seed loader MUST fail the linter `rg -n "DEFAULT_<KEY>\s*=" src/`. |

**Applies to:** `06-seedable-config-architecture/**` (5 rollups, incl. RAG validation helpers / tests / data seeding).

### Pattern 5 — UI-gesture (delegated)

> Use for purely visual / keyboard ATs. Cross-references the canonical UI fixture file.

| Slot | Value |
|------|-------|
| **Given** | Component rendered per its own spec. |
| **When** | Documented gesture (key press, click, hover) per the prose row. |
| **Then** | DOM diff matches the spec's "after" snapshot; ≤200 char `outerHTML` patch. |
| **Negative assertion** | Mouse-only or keyboard-only paths missing from the spec MUST fail the gesture-coverage test. |

**Applies to:** `08-docs-viewer-ui/**` (4 rollups), `09-code-block-system` (1 rollup) — both delegate detail to `spec/32-ui-design/97a-acceptance-criteria-fixtures.md` and `spec/07-design-system/97a-acceptance-criteria-fixtures.md`.

### Pattern 6 — Linter-script

> Use for ATs that verify a shell / PowerShell helper script's behaviour.

| Slot | Value |
|------|-------|
| **Given** | Script under `linter-scripts/` or `scripts/`. |
| **Linter command** | The script invoked with both a passing fixture and a failing fixture. |
| **Expected exit code** | `0` for passing fixture, `1` for failing fixture. |
| **Expected stderr regex** | `/<RULE-ID>:\s+.+/` |
| **Negative assertion** | Script that exits `0` on a documented failing fixture MUST fail the meta-test. |

**Applies to:** `10-powershell-integration/**` (2 rollups, incl. script reference), `16-generic-cli/**` (2 rollups, incl. verbose logging).

### Pattern 7 — Cross-reference

> Use when the AT only requires a doc to cite the SSOT file from another section.

| Slot | Value |
|------|-------|
| **Linter command** | `node scripts/spec-hygiene/09-check-xrefs.mjs <folder>` |
| **Expected exit code** | `0` |
| **Then** | Every "see also" / "SSOT" anchor resolves to a live file. |
| **Negative assertion** | A dangling SSOT pointer MUST fail with `XREF_BROKEN: <path>`. |

**Applies to:** `12-consolidated-guidelines` (1 rollup).

### Pattern 8 — CI-job

> Use when the AT verifies that a CI workflow exists and runs the documented job.

| Slot | Value |
|------|-------|
| **Linter command** | `node -e "const yaml=require('js-yaml');const fs=require('fs');const wf=yaml.load(fs.readFileSync(process.argv[1],'utf8'));process.exit(wf.jobs && Object.keys(wf.jobs).length>0?0:1)" .github/workflows/<name>.yml` |
| **Expected exit code** | `0` |
| **Then** | Workflow declares ≥1 job whose steps include the documented commands. |
| **Negative assertion** | Removing the workflow file MUST fail CI on the next push. |

**Applies to:** `13-cicd-pipeline-workflows/**` (3 rollups, incl. go-binary-deploy, wp-plugin-deploy).

### Pattern 9 — Release-flow

> Use when the AT verifies a self-update / release-versioning step.

| Slot | Value |
|------|-------|
| **Given** | Current version `1.2.3` documented in `package.json` and `CHANGELOG.md`. |
| **When** | `npm run release:dry-run -- --bump=minor`. |
| **Then** | Output reports next version `1.3.0`; CHANGELOG draft section appended; rename-first build artifact path computed; no files mutated under `--dry-run`. |
| **Side effects** | none under `--dry-run`. |
| **Negative assertion** | Bumping without updating CHANGELOG MUST fail the gate. |

**Applies to:** `14-self-update-app-update/**` (2 rollups, incl. release-versioning), `17-generic-update` (1 rollup).

### Pattern 10 — WP-plugin

> Use for WordPress-plugin-specific ATs covering enums, REST conventions, settings, deployment, frontend templates, design system inside the plugin, etc. Delegates the **PascalCase Golden Rule** to `04/97a` and the **PHP coding rules** to `02/97a`.

| Slot | Value |
|------|-------|
| **Given** | WP plugin source at `wp-plugin/`. |
| **When** | Plugin boots inside a WordPress test instance and registers its `register_rest_route` calls. |
| **Then** | Every route returns the universal envelope (cross-ref `AT-RESTAPIFORMAT-06..08`); every PHP file passes the PHP coding rules (cross-ref `AT-PHP-*` template); every settings option is namespaced under `workflowy_*`. |
| **Side effects** | One row in `wp_options` per setting; one log line per request. |
| **Negative assertion** | A REST route returning a bare PHP array (no envelope) MUST fail the contract test. |

**Applies to:** `15-wp-plugin-how-to/**` (17 sub-rollups: enums-and-coding-style, logging-and-error-handling, helpers-responses-and-integration, reference-implementations, wordpress-integration-patterns, testing-patterns, deployment-patterns, frontend-and-template-patterns, design-system, admin-ui-patterns, rest-api-conventions, settings-architecture, error-handling-extraction, micro-orm-and-root-db, end-to-end-walkthrough).

---

## Per-rollup cross-reference table

Every uncovered rollup MUST cite this file once. The hygiene check `08-check-acceptance-coverage.mjs` walks every `97-acceptance-criteria.md` / `98-acceptance-criteria.md` and asserts a link to either:

1. A sibling `97a-acceptance-criteria-fixtures.md`, OR
2. The applicable pattern in this file (link path: `spec/97a-acceptance-criteria-fixtures.md#pattern-N-<slug>`).

Rollups failing this check are listed by the script in `.lovable/plans/p2-coverage.md` and block CI once `AT-FIX-01` flips to enforcing (next sub-section).

---

## `AT-FIX-01` flips to enforcing

Per [`01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](./01-spec-authoring-guide/19-acceptance-criteria-io-table.md) § "Hygiene gate":

> For every line matching `^\| \`AT-[A-Z]+-\d+\``, the next non-blank line MUST be either
> (a) a `> **\`AT-…\` fixture**` block header, or
> (b) the explicit `> _Fixture: N/A — pure narrative reference, not a testable criterion._` opt-out, or
> (c) the parent file MUST link to a sibling `97a-…-fixtures.md` OR to a pattern in `spec/97a-acceptance-criteria-fixtures.md`.
> Otherwise FAIL.

Implementation: see [`scripts/spec-hygiene/17-check-at-fix-01.mjs`](../scripts/spec-hygiene/17-check-at-fix-01.mjs) (added in this PR). The `00-run-all.mjs` runner now invokes it; report-only mode is removed.

---

## Verification

```bash
node scripts/spec-hygiene/17-check-at-fix-01.mjs   # exit 0 → all rollups paired with fixtures
node scripts/spec-hygiene/00-run-all.mjs           # full suite, AT-FIX-01 enforcing
```

---

## Related

- [`01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](./01-spec-authoring-guide/19-acceptance-criteria-io-table.md) — Format SSOT
- [`02-coding-guidelines/97a-acceptance-criteria-fixtures.md`](./02-coding-guidelines/97a-acceptance-criteria-fixtures.md) — Lint-shape template
- [`04-database-conventions/97a-acceptance-criteria-fixtures.md`](./04-database-conventions/97a-acceptance-criteria-fixtures.md) — REST envelope + PascalCase Golden Rule
- [`32-ui-design/97a-acceptance-criteria-fixtures.md`](./32-ui-design/97a-acceptance-criteria-fixtures.md) — UI gesture canonical
- [`.lovable/plans/p2-coverage.md`](../.lovable/plans/p2-coverage.md) — Coverage tracker

*P2g — created 2026-04-28 (UTC+8). Sweep closes ~45 rollups via 10 fixture patterns + flips `AT-FIX-01` to enforcing. P2 phase complete.*
