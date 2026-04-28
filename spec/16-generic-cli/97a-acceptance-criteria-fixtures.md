# Generic CLI — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Concrete companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md). Replaces P20 stub seed.
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P22.

---

## `AT-GENERICCLI-01` — `internal/` not importable from outside

| Linter command | `go vet ./... 2>&1 | rg "use of internal package"` |
|---|---|
| **Expected exit code** | `1` (no violations; `go vet` already enforces `internal/` rules). |
| **Negative** | An external module importing `cli/internal/foo` MUST fail `go vet`. |
| **Test name** | `at_genericcli_01_internal_isolation` |

## `AT-GENERICCLI-02` — One file per subcommand, central registry

| Linter command | `ls cmd/*.go | wc -l; rg -c "rootCmd.AddCommand\(" cmd/root.go` |
|---|---|
| **Expected** | File count equals `AddCommand` call count; each `cmd/<name>.go` has matching `<Name>Cmd` exported var. |
| **Negative** | Two subcommands defined in the same file MUST fail. |

## `AT-GENERICCLI-03` — Single flag library SSOT

| Linter command | `rg -nP "\"flag\"\|\"github.com/spf13/pflag\"\|\"github.com/spf13/cobra\"" --type go` |
|---|---|
| **Expected** | All matches resolve to exactly one library across the module (cobra OR stdlib `flag`, not both). |
| **Negative** | Mixed `flag` + `pflag` usage MUST fail. |

## `AT-GENERICCLI-04` — Resolution order: flag > env > file > default

| Given | Default `port=8080`; config file `port=8081`; env `APP_PORT=8082`; CLI flag `--port=8083`. |
|---|---|
| **When** | `app serve --port=8083` runs. |
| **Then** | Effective `port=8083`. Drop the flag → `8082`. Drop the env → `8081`. Drop the file → `8080`. |
| **Negative** | Any other ordering MUST fail the precedence test. |

## `AT-GENERICCLI-05` — `--format text|json` global flag

| Given | Subcommand `app users list`. |
|---|---|
| **When** | Run with `--format=json`. |
| **Then** | Stdout is a single JSON document with envelope `{"Status":"success","Results":{"Users":[…]}}`; with `--format=text` (default) → human table; flag works identically on every subcommand. |
| **Negative** | A subcommand that ignores `--format=json` and prints text MUST fail. |

## `AT-GENERICCLI-06` — Errors → stderr, envelope, non-zero exit

| Given | A subcommand encounters a validation error. |
|---|---|
| **When** | It exits. |
| **Then** | Stdout empty; stderr contains `{"Status":"error","Errors":[{"Code":"CLI-1003","Message":"invalid argument","Details":{"Arg":"--port"}}]}`; exit code `≥ 1`. |
| **Negative** | Exit `0` on error, or error written to stdout, MUST fail. |

## `AT-GENERICCLI-07` — Help auto-generated, no duplication

| Linter command | `rg -nP "Long:\s*\`[\s\S]{200,}\`" cmd/` |
|---|---|
| **Expected exit code** | `1` (no >200-char hand-rolled `Long` strings; help is generated from `Short` + flag metadata). |
| **Negative** | A subcommand whose `--help` text was not derived from registered flags MUST fail. |

## `AT-GENERICCLI-08` — Date format: RFC 3339 in JSON, locale in text

| When | `app users list --format=json` returns a `CreatedAt` field. |
|---|---|
| **Then** | Value matches `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$` (RFC 3339). With `--format=text`, value matches the locale formatter (e.g. `2026-04-28 14:30 PHT`). |
| **Negative** | A Unix epoch number in JSON output MUST fail. |

## `AT-GENERICCLI-09` — Code style: ≤15 logical lines, no nested `if`

| Linter command | `golangci-lint run --enable=funlen,nestif --no-config -- ./...` |
|---|---|
| **Expected exit code** | `0`. |
| **Negative** | A function body with 16+ logical lines OR a nested `if` MUST fail. |

## `AT-GENERICCLI-10` — DB access via per-DB pool

| Linter command | `rg -nP "sql\.Open\(" --type go | rg -v "internal/db/manager"` |
|---|---|
| **Expected exit code** | `1` (only the manager calls `sql.Open`). |
| **Negative** | A handler issuing its own `sql.Open` MUST fail. |

---

## Verification

```bash
grep -c "^## \`AT-GENERICCLI-" spec/16-generic-cli/97a-acceptance-criteria-fixtures.md
# expected: 10
node scripts/spec-hygiene/00-run-all.mjs
```

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Source AT prose
- [`spec/05-split-db-architecture/`](../05-split-db-architecture/00-overview.md) — DB pool pattern
- [`spec/13-cicd-pipeline-workflows/02-go-binary-deploy/`](../13-cicd-pipeline-workflows/02-go-binary-deploy/00-overview.md) — Build/deploy pairing
- [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md) — Envelope SSOT
