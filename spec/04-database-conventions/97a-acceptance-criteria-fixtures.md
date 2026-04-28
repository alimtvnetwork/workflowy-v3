# Database Conventions — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Normative companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) and [`06-rest-api-format/97-acceptance-criteria.md`](./06-rest-api-format/97-acceptance-criteria.md).
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P2c.

---

## Purpose

Provides one concrete I/O fixture per acceptance-criterion row in the database-conventions tree. Fixtures here are deterministic Given/When/Then cells with literal SQL, ORM, and JSON payloads so that any AI implementer can author the corresponding test without re-interpreting prose.

Coverage:

- `AT-DATABASECONVENTIONS-01..13` (13 rows)
- `AT-RESTAPIFORMAT-01..11` (11 rows)

**Total: 24 fixtures.**

---

## Section A — `AT-DATABASECONVENTIONS-*`

### `AT-DATABASECONVENTIONS-01` — Table names PascalCase singular

| Slot | Value |
|------|-------|
| **Given** | Migration file `migrations/2026_04_25_create_users.sql` is staged. |
| **When** | Run linter: `node scripts/spec-hygiene/00-run-all.mjs` over migrations + `pragma table_list` of built SQLite. |
| **Then** | Linter exits `0` only when every table name matches `/^[A-Z][A-Za-z0-9]*$/` AND is grammatically singular (whitelist: `User`, `Item`, `LogEntry`); names like `users`, `user_roles`, `Items` cause exit `1`. |
| **Side effects** | none |
| **Negative assertion** | No table named `users`, `user_roles`, `items`, or `Items` may exist. |

### `AT-DATABASECONVENTIONS-02` — Column names PascalCase, identical to JSON key

| Slot | Value |
|------|-------|
| **Given** | Table `User(Id TEXT, Email TEXT, CreatedAt TEXT)`; ORM struct serializes a single row. |
| **When** | `GET /wp-json/workflowy/v1/users/usr_01HXYZ` returns one row. |
| **Response envelope** | ```json
{ "Status":"OK", "Attributes":{"Count":1}, "Results":{ "User":{ "Id":"usr_01HXYZ", "Email":"a@b.io", "CreatedAt":"2026-04-28T03:00:00Z" } } }
``` |
| **Then** | Every key in `Results.User` is character-for-character identical to its column name. |
| **Side effects** | none |
| **Negative assertion** | No `id`, `email`, `created_at`, `createdAt` keys appear anywhere in the payload. |

### `AT-DATABASECONVENTIONS-03` — FK columns named `<ReferencedTable>Id`

| Slot | Value |
|------|-------|
| **Given** | Schema defines `Item(Id TEXT PK, ParentId TEXT REFERENCES Item(Id), UserId TEXT REFERENCES User(Id))`. |
| **When** | `pragma foreign_key_list('Item')` is inspected by `scripts/spec-hygiene/00-run-all.mjs`. |
| **Then** | Every FK column matches `/^[A-Z][A-Za-z0-9]*Id$/`; index names follow `IX_<Table>_<Column>` and constraints `FK_<Table>_<RefTable>`. |
| **Side effects** | none |
| **Negative assertion** | No FK column named `parent_id`, `parentID`, `user`, or `userid`. |

### `AT-DATABASECONVENTIONS-04` — Mandatory audit columns

| Slot | Value |
|------|-------|
| **Given** | New table `Note` is created without `Id`, `CreatedAt`, `UpdatedAt`. |
| **When** | Migration test runs `pragma table_info('Note')`. |
| **Then** | Test fails with message `MISSING_AUDIT_COLUMNS: Id, CreatedAt, UpdatedAt`. Soft-deleted tables additionally require `DeletedAt`. |
| **Side effects** | CI build red. |
| **Negative assertion** | Migration MUST NOT be merged without all four columns where soft-delete applies. |

### `AT-DATABASECONVENTIONS-05` — Enum columns store underlying value + CHECK

| Slot | Value |
|------|-------|
| **Given** | Enum `ItemType` (string-backed) with variants `Bullet`, `Task`, `Header`. |
| **When** | Inserting `INSERT INTO Item(Id, ItemType) VALUES ('itm_01','Banana')`. |
| **Then** | SQLite raises `CHECK constraint failed: ItemType` (exit code `1`); valid values succeed. |
| **Side effects** | No row inserted on rejection. |
| **Negative assertion** | No INTEGER column may store a string-backed enum value. |

### `AT-DATABASECONVENTIONS-06` — Nullable columns require justification

| Slot | Value |
|------|-------|
| **Given** | Migration adds column `Item.ArchivedAt TEXT NULL` without a `-- nullable: <reason>` comment. |
| **When** | `scripts/spec-hygiene/00-run-all.mjs` parses migration files. |
| **Then** | Linter fails with `UNJUSTIFIED_NULLABLE: Item.ArchivedAt`; passes once the `-- nullable: archive is optional` comment is added. |
| **Side effects** | none |
| **Negative assertion** | Default-NULL columns without justification MUST NOT pass CI. |

### `AT-DATABASECONVENTIONS-07` — ORM struct fields match column names exactly

| Slot | Value |
|------|-------|
| **Given** | Go struct `type User struct { Id string \`json:"Id"\`; Email string \`json:"Email"\` }`. |
| **When** | `go vet ./...` plus custom check `scripts/spec-hygiene/00-run-all.mjs` cross-references `pragma table_info('User')` columns vs struct field names. |
| **Then** | Cross-check exits `0` only when set equality holds; mismatched casing or extra/missing fields cause exit `1`. |
| **Side effects** | none |
| **Negative assertion** | No `json:"email"` or `json:"id"` lower-case tags. |

### `AT-DATABASECONVENTIONS-08` — Views follow table naming + are documented

| Slot | Value |
|------|-------|
| **Given** | View `CREATE VIEW ItemWithCounts AS …` exists. |
| **When** | Hygiene script scans `sqlite_master` for `type='view'` and looks for matching `### View: ItemWithCounts` block in `03-orm-and-views.md`. |
| **Then** | Missing documentation fails CI with `UNDOCUMENTED_VIEW: ItemWithCounts`. |
| **Side effects** | none |
| **Negative assertion** | View names like `item_with_counts` or `vw_items` MUST NOT exist. |

### `AT-DATABASECONVENTIONS-09` — Forward + rollback migration tests

| Slot | Value |
|------|-------|
| **Given** | Empty SQLite file `:memory:`. |
| **When** | CI runs `npm run migrate:up && npm run migrate:down && npm run migrate:up`. |
| **Then** | All three commands exit `0`; final `pragma user_version` equals the head migration number. |
| **Side effects** | Temporary SQLite file deleted. |
| **Negative assertion** | A migration without a `down.sql` peer file MUST fail the CI gate. |

### `AT-DATABASECONVENTIONS-10` — Fixtures load via documented seeder

| Slot | Value |
|------|-------|
| **Given** | Test file `tests/feature/items.test.ts` needs an authored `User` row. |
| **When** | Test calls `seed('user.basic')` which reads `tests/fixtures/user.basic.json`. |
| **Then** | Test passes; ad-hoc `db.exec("INSERT INTO User …")` inside test bodies is flagged by `rg -n "INSERT INTO" tests/` and fails CI. |
| **Side effects** | Fixture row inserted within the test transaction; rolled back on teardown. |
| **Negative assertion** | No raw `INSERT` statements may appear inside `tests/` outside `tests/fixtures/seeder.ts`. |

### `AT-DATABASECONVENTIONS-11` — Diagrams reflect live schema

| Slot | Value |
|------|-------|
| **Given** | `05-relationship-diagrams.md` references table `Item` with column `ParentId`. |
| **When** | Hygiene script `scripts/spec-hygiene/00-run-all.mjs` parses Mermaid blocks and cross-checks against introspected schema. |
| **Then** | Missing column or table in diagram fails CI with `DIAGRAM_DRIFT: Item.ParentId not in live schema`. |
| **Side effects** | none |
| **Negative assertion** | Hand-drawn ASCII diagrams that bypass parser MUST NOT replace Mermaid. |

### `AT-DATABASECONVENTIONS-12` — REST keys PascalCase end-to-end (rollup)

> Detail covered in Section B (`AT-RESTAPIFORMAT-01..11`).

| Slot | Value |
|------|-------|
| **Given** | Any REST endpoint returns a non-empty body. |
| **When** | Contract test pipes the JSON through `jq 'paths(scalars)'` and asserts every key segment matches `/^[A-Z][A-Za-z0-9]*$/`. |
| **Then** | Test passes; one camelCase or snake_case key fails the assertion. |
| **Side effects** | none |
| **Negative assertion** | The string `"camelCase"` or `"snake_case"` MUST NOT match any key in any sample under `06-rest-api-format/`. |

### `AT-DATABASECONVENTIONS-13` — Split-DB partition + replication documented

| Slot | Value |
|------|-------|
| **Given** | Dataset `UserContent` is sharded per user. |
| **When** | Reviewer opens `07-split-db-pattern.md` and `spec/05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md`. |
| **Then** | Both files state explicitly: partition key = `UserId`, replication = `none (per-user file)`, consistency = `single-writer`. Missing any of the three fails the spec-hygiene `xref` check. |
| **Side effects** | none |
| **Negative assertion** | A new dataset MUST NOT be added to the split-DB pattern without filling all three fields. |

---

## Section B — `AT-RESTAPIFORMAT-*`

### `AT-RESTAPIFORMAT-01` — Top-level JSON keys PascalCase

| Slot | Value |
|------|-------|
| **Given** | Endpoint registered: `GET /wp-json/workflowy/v1/items`. |
| **When** | Contract test issues request and parses response. |
| **Response envelope** | ```json
{ "Status":"OK", "Attributes":{"Count":2}, "Results":{ "Items":[ {"Id":"itm_01","Content":"a"}, {"Id":"itm_02","Content":"b"} ] } }
``` |
| **Then** | Every key at every depth matches `/^[A-Z][A-Za-z0-9]*$/`. |
| **Side effects** | none |
| **Negative assertion** | No `status`, `data`, `items` (lowercase) anywhere. |

### `AT-RESTAPIFORMAT-02` — PascalCase recurses into nested objects + arrays

| Slot | Value |
|------|-------|
| **Given** | Endpoint returns nested `Item.Children[].Metadata.LastEditor.Name`. |
| **When** | Contract test walks the JSON via DFS. |
| **Response envelope** | ```json
{ "Status":"OK", "Attributes":{"Count":1}, "Results":{ "Item":{ "Id":"itm_01", "Children":[ { "Id":"itm_02", "Metadata":{ "LastEditor":{ "Name":"Ann" } } } ] } } }
``` |
| **Then** | Every key encountered passes the PascalCase regex. |
| **Side effects** | none |
| **Negative assertion** | No mixed casing inside arrays of objects (e.g. `lastEditor`). |

### `AT-RESTAPIFORMAT-03` — Column → key identity

| Slot | Value |
|------|-------|
| **Given** | Table `Item` has columns `Id, Content, ParentId, CreatedAt`. |
| **When** | `GET /wp-json/workflowy/v1/items/itm_01` returns one row. |
| **Response envelope** | ```json
{ "Status":"OK", "Attributes":{"Count":1}, "Results":{ "Item":{ "Id":"itm_01", "Content":"hello", "ParentId":"itm_root", "CreatedAt":"2026-04-28T03:00:00Z" } } }
``` |
| **Then** | `Object.keys(Results.Item)` is a subset of the live `pragma table_info('Item')` column names with identical spelling. |
| **Side effects** | none |
| **Negative assertion** | No key in `Results.Item` is absent from the table or differs in casing. |

### `AT-RESTAPIFORMAT-04` — Six core verbs + outcomes documented

| Slot | Value |
|------|-------|
| **Given** | File `02-rest-samples.md`. |
| **When** | Hygiene script greps for `### Sample:` headings. |
| **Then** | Exactly the six samples `list`, `get-one`, `create`, `update`, `delete`, `error` are present; missing one fails CI with `MISSING_REST_SAMPLE: <name>`. |
| **Side effects** | none |
| **Negative assertion** | No sample bundle named `bulk` or `patch` substitutes for the six required ones. |

### `AT-RESTAPIFORMAT-05` — Samples are complete copy-paste JSON

| Slot | Value |
|------|-------|
| **Given** | Each sample is enclosed in a ```json fenced block. |
| **When** | Hygiene script extracts every fenced block and runs `JSON.parse(text)`. |
| **Then** | All blocks parse without error. |
| **Side effects** | none |
| **Negative assertion** | No `…` ellipses, no `<placeholder>`, no inline comments inside the fence. |

### `AT-RESTAPIFORMAT-06` — Universal envelope wraps every response

| Slot | Value |
|------|-------|
| **Given** | Any endpoint, success or failure. |
| **When** | Contract test parses response. |
| **Then** | Top-level object contains exactly the allowed keys: `Status` (mandatory), `Attributes` (mandatory), `Results` (mandatory), and optionally `Navigation`, `Errors`, `MethodsStack`. |
| **Side effects** | none |
| **Negative assertion** | A bare `{ "Items": […] }` payload (no envelope) MUST fail the contract test. |

### `AT-RESTAPIFORMAT-07` — `Data`/`Error` mutual exclusion + `Status` always present

> NOTE: the canonical envelope uses `Results` for success and `Errors` for failure; `Status` is always present. This fixture pins the mutually-exclusive rule.

| Slot | Value |
|------|-------|
| **Given** | Two responses: success and failure. |
| **When** | Contract test inspects each. |
| **Response envelope** | success: ```json
{ "Status":"OK", "Attributes":{"Count":0}, "Results":{} }
```; failure: ```json
{ "Status":"ERROR", "Attributes":{"Count":0}, "Results":{}, "Errors":[ { "Code":"E_NOT_FOUND", "Message":"item not found" } ] }
``` |
| **Then** | Success: `Errors` absent or empty array; `Status === "OK"`. Failure: `Errors.length >= 1`; `Status === "ERROR"`. `Status` MUST be present in both. |
| **Side effects** | none |
| **Negative assertion** | No response sets both `Status:"OK"` AND a non-empty `Errors`. |

### `AT-RESTAPIFORMAT-08` — Unbroken PascalCase end-to-end

| Slot | Value |
|------|-------|
| **Given** | Column `Item.ParentId` (SQLite) → struct field `Item.ParentId` (Go) → JSON key `ParentId` (REST) → TS interface field `ParentId` (frontend). |
| **When** | Hygiene script `scripts/spec-hygiene/00-run-all.mjs` performs a four-layer cross-walk. |
| **Then** | All four spellings match exactly; any drift fails CI with `PASCAL_DRIFT: <layer> <field>`. |
| **Side effects** | none |
| **Negative assertion** | No layer renames the field (e.g. `parent_id` in Go tag, `parentId` in TS interface). |

### `AT-RESTAPIFORMAT-09` — One implementation snippet per documented language

| Slot | Value |
|------|-------|
| **Given** | File `04-language-implementation.md`. |
| **When** | Hygiene script greps for `### Language: Go`, `### Language: PHP`, `### Language: TypeScript`. |
| **Then** | All three headings present; each followed by a fenced code block ≥ 5 lines. Missing one fails CI with `MISSING_LANG_IMPL: <lang>`. |
| **Side effects** | none |
| **Negative assertion** | A heading without a code block MUST NOT satisfy the check. |

### `AT-RESTAPIFORMAT-10` — Per-language tag/enum/type mechanism

| Slot | Value |
|------|-------|
| **Given** | The three snippets from AT-09. |
| **When** | Hygiene script asserts: Go snippet contains `json:"PascalCase"` tag pattern; PHP snippet references `ResponseKeyType` enum; TS snippet declares `interface` with PascalCase fields only. |
| **Then** | All three regexes match. |
| **Side effects** | none |
| **Negative assertion** | A PHP snippet using bare `[ 'id' => $x ]` (lowercase string keys) MUST fail. |

### `AT-RESTAPIFORMAT-11` — URL paths kebab-case, JSON keys PascalCase

| Slot | Value |
|------|-------|
| **Given** | Endpoint `GET /wp-json/workflowy/v1/user-sessions/sess_01`. |
| **When** | Contract test parses both URL and response. |
| **Response envelope** | ```json
{ "Status":"OK", "Attributes":{"Count":1}, "Results":{ "UserSession":{ "Id":"sess_01", "UserId":"usr_01" } } }
``` |
| **Then** | URL path segments match `/^[a-z][a-z0-9-]*$/`; JSON keys match `/^[A-Z][A-Za-z0-9]*$/`. |
| **Side effects** | none |
| **Negative assertion** | No mixing: `/userSessions/…` (camel URL) or `{"user_session":…}` (snake key) MUST fail their respective regex. |

---

## Verification

```bash
grep -rn "AT-DATABASECONVENTIONS-\|AT-RESTAPIFORMAT-" spec/04-database-conventions/97a-acceptance-criteria-fixtures.md
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Prose ATs (DB conventions rollup)
- [`06-rest-api-format/97-acceptance-criteria.md`](./06-rest-api-format/97-acceptance-criteria.md) — Prose ATs (REST API)
- [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md) — Format SSOT
- [`.lovable/plans/p2-coverage.md`](../../.lovable/plans/p2-coverage.md) — Coverage tracker

*P2c — created 2026-04-28 (UTC+8). Closes 24/30 ATs in scope; remaining ~6 in `06-rest-api-format/` subsection live alongside their prose rows once that file is touched.*
