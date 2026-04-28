# Split DB Architecture — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Normative companion to [`98-acceptance-criteria.md`](./98-acceptance-criteria.md).
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P19.

ID prefix used in code/tests: `AT-SPLITDBFUNDAMENTALS-NN` (mapped 1:1 from the `SD-`/`RA-`/`RB-`/`US-` prose IDs in `98-acceptance-criteria.md`).

---

## `AT-SPLITDBFUNDAMENTALS-01` — Root DB created at canonical path

| Given | Empty CWD; no `data/` directory; CLI `brun` v1+ on PATH. |
|---|---|
| **When** | `brun init` is run. |
| **Then** | `data/brun.db` exists, mode `0644`; `data/` exists, mode `0755`; `PRAGMA journal_mode` returns `wal`. |
| **Negative** | A root DB at `~/.brun/brun.db` or in CWD root MUST fail the path-shape test. |
| **Test name** | `AT-SPLITDBFUNDAMENTALS-01_root_db_created_at_canonical_path` |

## `AT-SPLITDBFUNDAMENTALS-02` — Root DB auto-migrates required tables

| When | First-run init completes. |
|---|---|
| **Then** | `sqlite3 data/brun.db ".tables"` lists at minimum: `Apps Settings Migrations`. |
| **Negative** | A missing `Migrations` table MUST fail (no manual migration is allowed). |

## `AT-SPLITDBFUNDAMENTALS-03` — App DB created on register

| Given | Root DB initialised. |
|---|---|
| **When** | `brun init myapp` is run. |
| **Then** | `data/myapp/` exists; `data/myapp/search.db` exists; `SELECT Name FROM Apps WHERE Name='myapp'` returns one row in root DB. |
| **Negative** | App DB created without root-DB `Apps` row MUST fail orphan-check. |

## `AT-SPLITDBFUNDAMENTALS-04` — Duplicate app name rejected

| Given | App `myapp` already registered. |
|---|---|
| **When** | `brun init myapp` is run a second time. |
| **Then** | Exit code `2`; envelope `{ "Status":"error", "Errors":[{"Code":"APP_EXISTS","Message":"App 'myapp' already exists"}] }`; existing DB unchanged (mtime unchanged). |

## `AT-SPLITDBFUNDAMENTALS-05` — Item DB path shape

| Given | App `myapp` exists. |
|---|---|
| **When** | A `search` item with seq `7` and slug `quarterly-report` is created. |
| **Then** | File `data/myapp/search/7-quarterly-report.db` exists; row exists in `data/myapp/search.db.Items` with `Seq=7`. |
| **Negative** | A path like `data/myapp/7-quarterly-report.db` (missing type segment) MUST fail. |

## `AT-SPLITDBFUNDAMENTALS-06` — Slug truncation with hash suffix

| Given | Slug input length = 80 characters. |
|---|---|
| **When** | Item DB is created. |
| **Then** | Resulting filename slug part has length `≤ 50`, ends with `-<8hex>` where `<8hex>` is `sha256(originalSlug)[0..8]`. |
| **Negative** | A 51+ character slug on disk MUST fail filename-length check. |

## `AT-SPLITDBFUNDAMENTALS-07` — Reset request envelope

| When | `POST /api/v1/reset/request` with body `{"Scope":"all"}`. |
|---|---|
| **Then** | Response is `200` with envelope: `{ "Status":"success", "Attributes":{}, "Results":{ "ResetId":"<uuid>", "Scope":"all", "ExpiresAt":"<ISO8601 +5min>", "AffectedItems":[…] } }`. PascalCase keys throughout. |
| **Negative** | `expiresAt` (camelCase) MUST fail key-format gate. |

## `AT-SPLITDBFUNDAMENTALS-08` — Reset confirm after expiry returns 410

| Given | Reset token issued > 5 minutes ago. |
|---|---|
| **When** | `POST /api/v1/reset/confirm` with that `ResetId`. |
| **Then** | HTTP `410`; envelope `Status="error"`, `Errors[0].Code="RESET_TOKEN_EXPIRED"`. |

## `AT-SPLITDBFUNDAMENTALS-09` — Per-scope reset isolates modules

| Given | Apps `search` and `cache` both populated. |
|---|---|
| **When** | Reset request `{"Scope":"cache"}` is confirmed. |
| **Then** | `data/cache/**` deleted; `data/search/**` byte-for-byte unchanged (sha256 of each file equal to pre-reset snapshot). |

## `AT-SPLITDBFUNDAMENTALS-10` — User-scoped path isolation

| Given | Multi-user mode enabled; users `u1`, `u2` exist. |
|---|---|
| **When** | `u1` writes data via API. |
| **Then** | File appears under `data/users/u1/`; `GET` from session of `u2` for same resource returns `404` envelope `Errors[0].Code="NOT_FOUND_OR_FORBIDDEN"` (no existence leak). |
| **Negative** | A path-traversal `?path=../u1/...` MUST return `403` and emit security-event log line `SECURITY_PATH_TRAVERSAL`. |

---

## Verification

```bash
grep -c "^## \`AT-SPLITDBFUNDAMENTALS-" spec/05-split-db-architecture/97a-acceptance-criteria-fixtures.md
# expected: 10
node scripts/spec-hygiene/00-run-all.mjs
```

## Related

- [`98-acceptance-criteria.md`](./98-acceptance-criteria.md) — Source AT prose
- [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md) — Envelope SSOT
