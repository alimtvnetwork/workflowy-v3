# Verbose Logging — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8) — populated from scaffold (polish #3, A-26 wave-2). v0.1.0 was auto-generated stub.
> **Status:** Curated — 8 testable criteria
> **Scope:** ⚠️ **Out-of-scope for the current stack** (parent generic-CLI folder is Go-tooling). Preserved as canonical SSOT for any future Go CLI tool.
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-VERBOSELOGGING-01` … `AT-VERBOSELOGGING-08`

---

## Criteria

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-VERBOSELOGGING-01` | The verbose-logging API exposes a single Logger interface with the documented level set (`Debug`, `Info`, `Warn`, `Error`); custom levels are forbidden. | [`01-design-and-api.md`](./01-design-and-api.md) |
| `AT-VERBOSELOGGING-02` | Logger initialization happens **once** at process boot; subcommands receive an injected logger and MUST NOT call `NewLogger` themselves. | [`02-init-and-log-format.md`](./02-init-and-log-format.md) |
| `AT-VERBOSELOGGING-03` | Log format is the documented structured form (key=value or JSON) with required fields `Ts`, `Level`, `Msg`, `Component`; ad-hoc `fmt.Println` for diagnostics is forbidden. | [`02-init-and-log-format.md`](./02-init-and-log-format.md) |
| `AT-VERBOSELOGGING-04` | Each command follows the documented command-pattern wrapper that emits a `Started`/`Finished` pair with elapsed time at `Info` level (or `Debug` if `--quiet`). | [`03-command-pattern.md`](./03-command-pattern.md) |
| `AT-VERBOSELOGGING-05` | Release-pipeline log points (`04-release-pipeline-log-points.md`) MUST appear in the order documented; missing a documented log point in a release run is a defect. | [`04-release-pipeline-log-points.md`](./04-release-pipeline-log-points.md) |
| `AT-VERBOSELOGGING-06` | Logger constants (level names, env var names, default file paths) live in the constants reference and are not duplicated inline. | [`05-constants-and-library-usage.md`](./05-constants-and-library-usage.md) + [`../15-constants-reference.md`](../15-constants-reference.md) |
| `AT-VERBOSELOGGING-07` | Verbose mode is opt-in via the global `--verbose` / `-v` flag and the `LOG_LEVEL` env var; default level is `Info`. | [`01-design-and-api.md`](./01-design-and-api.md), [`02-init-and-log-format.md`](./02-init-and-log-format.md) |
| `AT-VERBOSELOGGING-08` | Logging MUST NOT log secrets (API keys, tokens, passwords); a secret-redaction step runs before any log line is emitted — Code Red on bypass. | [`02-init-and-log-format.md`](./02-init-and-log-format.md) + `mem://constraints/coding-guidelines` |

---

## Verification

```bash
grep -rn "AT-VERBOSELOGGING-" spec/16-generic-cli/16-verbose-logging/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) — Generic CLI rollup
- `mem://constraints/backend-runtime-deferred` — Why this folder is out-of-scope for the current stack

---

*Populated 2026-04-26 (polish #3, A-26 wave-2) — replaces scaffold; marked out-of-scope-for-current-stack but preserved as reference SSOT.*
