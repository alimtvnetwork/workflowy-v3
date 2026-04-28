# PowerShell Integration — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Normative companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md).
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P19.

---

## `AT-POWERSHELLINTEGRATION-01` — Runner invokes pwsh, never legacy `powershell.exe`

| Linter command | `rg -nP "\bpowershell(\.exe)?\b" linter-scripts/ scripts/ \| rg -v "pwsh"` |
|---|---|
| **Expected exit code** | `1` (no matches). |
| **Negative** | A single `powershell.exe` invocation MUST fail the legacy-shell gate. |
| **Test name** | `AT-POWERSHELLINTEGRATION-01_pwsh_only` |

## `AT-POWERSHELLINTEGRATION-02` — `linter-scripts/run.ps1` exits non-zero on lint failure

| Given | A PHP file with a deliberate `phpcs` violation. |
|---|---|
| **When** | `pwsh -File linter-scripts/run.ps1 -Targets src/bad.php`. |
| **Then** | Exit code `≥ 1`; stderr contains the AT-id of the violated rule (e.g. `AT-PHP-FORBID-11`). |

## `AT-POWERSHELLINTEGRATION-03` — Config schema is JSON-Schema 2020-12

| Linter command | `node -e "const s=require('./spec/10-powershell-integration/schemas/config.schema.json'); process.exit(s.\$schema.endsWith('2020-12/schema')?0:1)"` |
|---|---|
| **Expected exit code** | `0`. |

## `AT-POWERSHELLINTEGRATION-04` — Firewall rule list is idempotent

| Given | Rules from `05-firewall-rules.md` already applied. |
|---|---|
| **When** | The apply script runs a second time. |
| **Then** | Exit `0`; stdout contains `unchanged: <N>` and `added: 0`. |
| **Negative** | A second run that re-creates rules MUST fail idempotency. |

## `AT-POWERSHELLINTEGRATION-05` — Runner writes structured envelope to stdout

| When | `pwsh -File linter-scripts/run.ps1 -EmitJson` completes. |
|---|---|
| **Then** | Last stdout line parses as JSON envelope: `{ "Status":"success"|"error", "Attributes":{"Duration":<ms>,"Tool":"phpcs"|"eslint"|…}, "Results":{…}, "Errors":[…] }`. |
| **Negative** | Mixed log + JSON on the same line MUST fail; envelope MUST be the final line only. |

## `AT-POWERSHELLINTEGRATION-06` — CI/CD handoff signal file

| Given | `03a-cicd-and-handoff.md` flow. |
|---|---|
| **When** | The runner finishes. |
| **Then** | File `artifacts/handoff.json` exists containing `{"Status":"success","NextStep":"deploy"|"halt","Sha":"<git sha>"}`. |

## `AT-POWERSHELLINTEGRATION-07` — Multi-site deployment per host

| Given | `25-multi-site-deployment.md` config with 3 hosts. |
|---|---|
| **When** | Deploy script runs. |
| **Then** | One invocation per host (3 total); failures isolated (one host failing MUST NOT abort the others); summary envelope contains `Results.Hosts[*].{Host,Status,Duration}`. |

## `AT-POWERSHELLINTEGRATION-08` — Error codes use the registered range

| Linter command | `rg -nP "Write-Error.*-ErrorAction" linter-scripts/ \| rg -oP "PS-\d{4}" \| sort -u` |
|---|---|
| **Expected** | All codes match `^PS-(1\d{3})$` (range `1000–1999` per `spec/03-error-manage/03-error-code-registry/`). |
| **Negative** | Any `PS-2xxx` or unprefixed numeric code MUST fail the registry gate. |

## `AT-POWERSHELLINTEGRATION-09` — Template/project drift detector

| Linter command | `pwsh -File linter-scripts/run.ps1 -Mode CompareTemplate` |
|---|---|
| **Expected exit code** | `0` when `07-template-vs-project-differences.md` matrix matches actual diff; `2` with diff envelope on mismatch. |

## `AT-POWERSHELLINTEGRATION-10` — WP-plugin boundary not crossed

| Linter command | `rg -nP "Invoke-WebRequest.*wp-json" linter-scripts/` |
|---|---|
| **Expected exit code** | `1` (PowerShell layer MUST NOT call WP REST endpoints directly per `08-wp-plugin-boundary.md`). |
| **Negative** | Any direct `wp-json` HTTP call from `linter-scripts/` MUST fail the boundary gate. |

---

## Verification

```bash
grep -c "^## \`AT-POWERSHELLINTEGRATION-" spec/10-powershell-integration/97a-acceptance-criteria-fixtures.md
# expected: 10
node scripts/spec-hygiene/00-run-all.mjs
```

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Source AT prose
- [`08-wp-plugin-boundary.md`](./08-wp-plugin-boundary.md) — Runtime boundary
- [`spec/03-error-manage/03-error-code-registry/`](../03-error-manage/03-error-code-registry/) — Error code ranges
