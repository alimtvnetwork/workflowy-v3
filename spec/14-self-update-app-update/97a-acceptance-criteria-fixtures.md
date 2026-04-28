# Self-Update / App-Update — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Concrete companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md). Replaces P20 stub seed.
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P21.

---

## `AT-SELFUPDATEAPPUPDATE-01` — Updater compares semver strictly greater

| Given | Running binary reports `1.4.0`; remote manifest `Version=1.4.0`. |
|---|---|
| **When** | `app update --check` is executed. |
| **Then** | Exit `0`; envelope `{ "Status":"success", "Results":{"UpdateAvailable":false,"Local":"1.4.0","Remote":"1.4.0"} }`. With `Remote=1.3.9` → same `false`. With `Remote=1.4.1` → `UpdateAvailable:true`. |
| **Negative** | Equal versions reported as `UpdateAvailable:true` MUST fail. |
| **Test name** | `at_selfupdateappupdate_01_strict_semver_greater` |

## `AT-SELFUPDATEAPPUPDATE-02` — Deploy path is CWD-independent

| Given | Binary at `/opt/app/bin/app`; CWD = `/tmp`. |
|---|---|
| **When** | `app update --print-deploy-path` runs. |
| **Then** | Stdout = `/opt/app/bin/app` (resolved via `/proc/self/exe` on Linux, `_NSGetExecutablePath` on macOS, `GetModuleFileNameW` on Windows). Result identical when CWD = `/`. |
| **Negative** | A path containing `/tmp` (echo of CWD) MUST fail. |

## `AT-SELFUPDATEAPPUPDATE-03` — Rename-first atomic deploy

| Given | Live binary at `/opt/app/bin/app` v1.4.0; new binary downloaded to `/opt/app/bin/app.new`. |
|---|---|
| **When** | Updater finalises the upgrade. |
| **Then** | Sequence MUST be: (1) `rename(/opt/app/bin/app, /opt/app/bin/app.old)`, (2) `rename(/opt/app/bin/app.new, /opt/app/bin/app)`. Both `rename(2)` calls atomic on same filesystem. `app.old` retained until cleanup gate (AT-05). |
| **Negative** | A `cp + truncate` sequence MUST fail (non-atomic, breaks on partial write). |

## `AT-SELFUPDATEAPPUPDATE-04` — Hand-off re-exec is clean

| Given | Old process holds an open listener on `:8080`. |
|---|---|
| **When** | Updater triggers hand-off via `execve` of the new binary. |
| **Then** | Listener fd is passed via `LISTEN_FDS=1` env (systemd socket-activation protocol); new process inherits and resumes serving; `lsof -i :8080` shows exactly one process; no `EADDRINUSE`. |
| **Negative** | Two processes bound to `:8080` simultaneously, or any 5xx during hand-off, MUST fail. |

## `AT-SELFUPDATEAPPUPDATE-05` — Cleanup gated on healthcheck

| Given | New binary running; healthcheck endpoint `GET /healthz`. |
|---|---|
| **When** | Cleanup runs. |
| **Then** | `curl -fsS http://localhost:8080/healthz` returns `200` with envelope `{"Status":"success","Results":{"Healthy":true}}` 3 consecutive times (5s apart) BEFORE `unlink(/opt/app/bin/app.old)`. On any failure: `rename(app.old → app)` rollback. |
| **Negative** | Deleting `app.old` before health passes MUST fail. |

## `AT-SELFUPDATEAPPUPDATE-06` — SHA-256 verification before rename-into-place

| Given | Manifest declares `Sha256="abc123…"` for the asset; downloaded file's actual sha256 = `def456…`. |
|---|---|
| **When** | Updater runs verification step. |
| **Then** | Updater aborts with envelope `{"Status":"error","Errors":[{"Code":"UPD-2103","Message":"checksum mismatch","Details":{"Expected":"abc123…","Actual":"def456…"}}]}`; no `rename` is invoked; partial file deleted. |
| **Negative** | Any `rename(app.new → app)` call when checksums diverge is **Code Red** and MUST fail. |

## `AT-SELFUPDATEAPPUPDATE-07` — Manifest schema strict

| Given | Manifest JSON. |
|---|---|
| **When** | Updater parses it. |
| **Then** | Required keys exactly: `Version, Channel, Url, Sha256, MinPreviousVersion` (PascalCase). Missing key OR extra key OR camelCase variant → reject with `UPD-2104 manifest_schema_violation`. Channel ∈ `{stable, beta, rc}`. |
| **Negative** | A manifest with an extra `notes` key parsed as success MUST fail. |

## `AT-SELFUPDATEAPPUPDATE-08` — Release-versioning rollup link

| Linter command | `rg -nP "AT-RELEASEVERSIONING-\d+" spec/14-self-update-app-update/09-release-versioning/97-acceptance-criteria.md \| wc -l` |
|---|---|
| **Expected** | `≥ 5` (rollup section is non-empty and discoverable). |
| **Negative** | Empty `09-release-versioning/97-acceptance-criteria.md` MUST fail. |

## `AT-SELFUPDATEAPPUPDATE-09` — Cross-compilation matrix matches platform list

| Given | Documented platforms in `10-cross-compilation.md` = `{linux/amd64, linux/arm64, darwin/amd64, darwin/arm64, windows/amd64}`. |
|---|---|
| **When** | Release pipeline finishes. |
| **Then** | GitHub Release contains exactly these 5 binary assets (each plus its `.sha256` sidecar = 10 files). |
| **Negative** | Missing `darwin/arm64` MUST fail; an undocumented `freebsd/amd64` asset MUST also fail (matrix is closed). |

## `AT-SELFUPDATEAPPUPDATE-10` — Idempotent install scripts

| When | `curl -fsSL <install-url> \| sh` is executed twice on a host already at the latest version. |
|---|---|
| **Then** | Second run exits `0` with stdout containing `already up to date`; no file mtime changes under `/opt/app/`; no network downloads after the manifest fetch (`curl -v` shows manifest 200 then exit). |
| **Negative** | Re-download or rename on the second run MUST fail the idempotency gate. |

---

## Verification

```bash
grep -c "^## \`AT-SELFUPDATEAPPUPDATE-" spec/14-self-update-app-update/97a-acceptance-criteria-fixtures.md
# expected: 10
node scripts/spec-hygiene/00-run-all.mjs
```

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Source AT prose
- [`08-checksums-verification.md`](./08-checksums-verification.md) — SHA-256 verification SSOT
- [`spec/03-error-manage/03-error-code-registry/`](../03-error-manage/03-error-code-registry/) — `UPD-2xxx` range
- [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md) — Envelope SSOT
