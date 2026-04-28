# Generic CLI — Acceptance Criteria (rollup)

> **Version:** 2.0.0
> **Updated:** 2026-04-26 (UTC+8) — populated from scaffold (polish #3, A-26 wave-2). v1.0.0 was scaffold.
> **Status:** Curated rollup — 14 testable criteria
> **Scope:** ⚠️ **Out-of-scope for the current stack** (Generic CLI is a Go-binary tooling pattern; the WP plugin runtime does not ship a CLI to end users — admin actions live in WP-Admin per [`spec/15-wp-plugin-how-to/13-admin-ui-patterns/`](../15-wp-plugin-how-to/13-admin-ui-patterns/00-overview.md)). Preserved as canonical SSOT for any future Go CLI tool.
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-GENERICCLI-01` … `AT-GENERICCLI-14`

---

## Criteria

### Architecture

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-GENERICCLI-01` | Project structure follows the documented layout (`cmd/`, `internal/`, `pkg/`); business logic lives under `internal/` and is reachable only via subcommands, never via a top-level package import from outside. | [`02-project-structure.md`](./02-project-structure.md) |
| `AT-GENERICCLI-02` | Subcommands follow the documented pattern: one file per subcommand, each registers via the central command registry; nested subcommands use the same pattern recursively. | [`03-subcommand-architecture.md`](./03-subcommand-architecture.md) |
| `AT-GENERICCLI-03` | Flag parsing uses a single library SSOT (no mix of stdlib `flag` + `cobra` + `pflag`); short and long flag names follow the conventions in `04-flag-parsing.md`. | [`04-flag-parsing.md`](./04-flag-parsing.md) |
| `AT-GENERICCLI-04` | Configuration resolution order is: CLI flag > env var > config file > built-in default. The order is deterministic and documented. | [`05-configuration.md`](./05-configuration.md) |

### Output & UX

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-GENERICCLI-05` | Output formatting supports at minimum `text` (default, human) and `json` (machine); the format flag is global and respected by every subcommand. | [`06-output-formatting.md`](./06-output-formatting.md) |
| `AT-GENERICCLI-06` | Errors are printed to stderr with the documented envelope (Code, Message, optional Details); `0` exit code is reserved for success only. | [`07-error-handling.md`](./07-error-handling.md) |
| `AT-GENERICCLI-07` | The help system is auto-generated from subcommand metadata; manual help text duplication is forbidden. | [`09-help-system.md`](./09-help-system.md) |
| `AT-GENERICCLI-08` | Date formatting follows the documented canonical form (RFC 3339 in machine output, locale-friendly in text output) per `14-date-formatting.md`. | [`14-date-formatting.md`](./14-date-formatting.md) |

### Code & data

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-GENERICCLI-09` | Code style follows `08-code-style.md` (which inherits from the cross-language guidelines: ≤15 logical lines, no nested `if`, positive booleans, K&R braces). | [`08-code-style.md`](./08-code-style.md) + `mem://constraints/coding-guidelines` |
| `AT-GENERICCLI-10` | Database access (when present) goes through the documented per-DB pool pattern; raw `sql.Open` outside the manager is forbidden. | [`10-database.md`](./10-database.md) + [`spec/05-split-db-architecture/`](../05-split-db-architecture/00-overview.md) |
| `AT-GENERICCLI-11` | Constants live in the constants reference (`15-constants-reference.md`) and the categorical catalog (`15b-constants-category-catalog.md`); inline magic values are forbidden. | [`15-constants-reference.md`](./15-constants-reference.md), [`15b-constants-category-catalog.md`](./15b-constants-category-catalog.md) |

### Build, test, deploy

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-GENERICCLI-12` | Build/deploy follows `11-build-deploy.md` and is consistent with [`spec/13-cicd-pipeline-workflows/02-go-binary-deploy/`](../13-cicd-pipeline-workflows/02-go-binary-deploy/00-overview.md). | [`11-build-deploy.md`](./11-build-deploy.md) |
| `AT-GENERICCLI-13` | Tests follow the documented patterns in `12-testing.md`; the contributors checklist (`13-checklist.md`) is enforced on every PR. | [`12-testing.md`](./12-testing.md), [`13-checklist.md`](./13-checklist.md) |

### Subfolders

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-GENERICCLI-14` | Verbose-logging behaviour, terminal output design, progress tracking, and batch execution are owned by their respective subfolders/files; this rollup delegates to: [`16-verbose-logging/97-acceptance-criteria.md`](./16-verbose-logging/97-acceptance-criteria.md), [`20-terminal-output-design/`](./20-terminal-output-design/00-overview.md), [`17-progress-tracking.md`](./17-progress-tracking.md), [`18-batch-execution.md`](./18-batch-execution.md). | All listed sources |

---

## Verification

```bash
grep -rn "AT-GENERICCLI-" spec/16-generic-cli/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`16-verbose-logging/97-acceptance-criteria.md`](./16-verbose-logging/97-acceptance-criteria.md) — Curated child
- [`spec/15-wp-plugin-how-to/13-admin-ui-patterns/`](../15-wp-plugin-how-to/13-admin-ui-patterns/00-overview.md) — **Active** WP-Admin equivalent (current stack)
- `mem://constraints/backend-runtime-deferred` — Why this folder is out-of-scope for the current stack

---

*Populated 2026-04-26 (polish #3, A-26 wave-2) — replaces scaffold; marked out-of-scope-for-current-stack but preserved as reference SSOT.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../97a-acceptance-criteria-fixtures.md`](../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
