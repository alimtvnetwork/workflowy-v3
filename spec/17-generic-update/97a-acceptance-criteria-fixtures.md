# Generic Update — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Concrete companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md). Replaces P20 stub seed.
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P22.

This folder is the **slim subset** of [`spec/14-self-update-app-update/`](../14-self-update-app-update/00-overview.md). Where applicable, fixtures cite the canonical AT and bind the lighter contract.

---

## `AT-GENERICUPDATE-01` — Algorithmic mirror of canonical flow

| Given | The 6-step flow in `01-self-update-overview.md` of this folder. |
|---|---|
| **When** | A linter diffs the step list against `spec/14-self-update-app-update/01-self-update-overview.md`. |
| **Then** | Both contain the same 6 steps in the same order: `check → download → verify → rename-into-place → handoff → cleanup`. |
| **Negative** | Step reorder, addition, or omission in this folder MUST fail the consistency gate. |
| **Test name** | `at_genericupdate_01_algorithmic_mirror` |

## `AT-GENERICUPDATE-02` — CWD-independent path resolution

| Given | Identical to [`AT-SELFUPDATEAPPUPDATE-02`](../14-self-update-app-update/97a-acceptance-criteria-fixtures.md). |
|---|---|
| **Then** | Same outcome: deploy path resolved via `/proc/self/exe` / `_NSGetExecutablePath` / `GetModuleFileNameW`; CWD does not appear in result. |
| **Negative** | CWD echoed in resolved path MUST fail. |

## `AT-GENERICUPDATE-03` — Atomic rename pair

| Given | Identical to [`AT-SELFUPDATEAPPUPDATE-03`](../14-self-update-app-update/97a-acceptance-criteria-fixtures.md). |
|---|---|
| **Then** | Same two-`rename(2)` sequence; old binary preserved. |
| **Negative** | Non-atomic `cp + truncate` MUST fail. |

## `AT-GENERICUPDATE-04` — Reproducible build artifacts

| Given | Two CI runs of the same commit on a clean runner. |
|---|---|
| **When** | Build script `scripts/build.sh` completes on each run. |
| **Then** | `sha256sum build/app-linux-amd64` is byte-identical between runs. Build envelope (when emitted): `{"Status":"success","Results":{"Sha256":"<hex>","BuildSeconds":<n>}}`. |
| **Negative** | Differing sha256 between two clean runs MUST fail reproducibility. |

## `AT-GENERICUPDATE-05` — Hand-off accounting

| Given | Old process holds: 1 listening socket, 2 open file descriptors, 1 pending write buffer. |
|---|---|
| **When** | Hand-off completes. |
| **Then** | New process inherits the listener (`LISTEN_FDS=1`); other fds explicitly closed before `execve`; pending writes flushed (`fsync`) before re-exec. `lsof -p <new-pid>` shows expected fd count. |
| **Negative** | Leaked or unflushed fd MUST fail. |

## `AT-GENERICUPDATE-06` — Healthcheck-gated cleanup with rollback

| Given | New binary booted; healthcheck endpoint defined per `06-cleanup.md`. |
|---|---|
| **When** | Cleanup phase runs. |
| **Then** | Healthcheck must pass 3 consecutive times before `unlink(<old>)`. On failure: `rename(<old>, <live>)` rollback, exit non-zero, envelope `{"Status":"error","Errors":[{"Code":"UPD-2201","Message":"healthcheck failed, rolled back"}]}`. |
| **Negative** | Deleting old binary before health passes MUST fail. |

## `AT-GENERICUPDATE-07` — Console-safe handoff

| Given | Old process attached to a TTY in raw mode with ANSI colour state. |
|---|---|
| **When** | Hand-off prepares to re-exec. |
| **Then** | Before `execve`: TTY restored to cooked mode (`tcsetattr` with original termios), ANSI reset (`\x1b[0m\x1b[?25h`) emitted, cursor visible, scroll region cleared. Post-exec, `stty -a` matches pre-launch snapshot. |
| **Negative** | A user terminal left in raw mode after re-exec MUST fail the console-safety gate. |

## `AT-GENERICUPDATE-08` — Consistency report ≥95/100 before merge

| Linter command | `node scripts/spec-hygiene/42-ai-audit.mjs --section spec/17-generic-update | jq -r '.composite'` |
|---|---|
| **Expected** | Numeric value `≥ 95`. |
| **Negative** | A PR that touches any of the 7 topic files without regenerating `99-consistency-report.md` to ≥95 MUST fail merge. |

## `AT-GENERICUPDATE-09` — README points to canonical folder

| Linter command | `rg -nP "spec/14-self-update-app-update" spec/17-generic-update/README.md` |
|---|---|
| **Expected exit code** | `0` (at least one match). |
| **Negative** | A README with no link to `spec/14-self-update-app-update/` MUST fail. |

## `AT-GENERICUPDATE-10` — Folder is strict subset of canonical

| Linter command | `comm -23 <(ls spec/17-generic-update/*.md | xargs -n1 basename | sort) <(ls spec/14-self-update-app-update/*.md | xargs -n1 basename | sort)` |
|---|---|
| **Expected** | Empty output (no file in `17-` that doesn't exist in `14-`, modulo `README.md` and `99-consistency-report.md`). |
| **Negative** | A novel topic file in `17-` not present in `14-` MUST fail; novel content belongs in the canonical folder. |

---

## Verification

```bash
grep -c "^## \`AT-GENERICUPDATE-" spec/17-generic-update/97a-acceptance-criteria-fixtures.md
# expected: 10
node scripts/spec-hygiene/00-run-all.mjs
```

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Source AT prose
- [`spec/14-self-update-app-update/97a-acceptance-criteria-fixtures.md`](../14-self-update-app-update/97a-acceptance-criteria-fixtures.md) — Canonical fixtures
- [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md) — Envelope SSOT
