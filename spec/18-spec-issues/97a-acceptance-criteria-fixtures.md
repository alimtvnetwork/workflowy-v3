# Spec Issues — Acceptance Criteria I/O Fixtures

> **Version:** 0.1.0 (P20 stub seed)
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Stub seed — companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md).
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P20.

Each row below references one `AT-*` id from the source acceptance file and
restates the binding I/O contract in the SSOT table format. Stubs have a 🟡
marker; replace with concrete fixtures during the next P2 sweep.

---

## `AT-APP-37` — Stub fixture (P20)

| Given | Conditions described in the prose definition of `AT-APP-37` in [`97-acceptance-criteria.md`](./97-acceptance-criteria.md). |
|---|---|
| **When** | The corresponding action / linter / endpoint described for `AT-APP-37` is invoked. |
| **Then** | Observable outcome matches the prose; if a REST envelope is involved, response uses PascalCase `Status` / `Attributes` / `Results` per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/). |
| **Negative** | The opposite of the documented outcome MUST fail the corresponding test. |
| **Test name** | `at_app_37` |

> 🟡 **P20 stub.** Replace with concrete commands / JSON request + envelope / file paths during the next P2 sweep. Citation count for this AT in spec/ remains satisfied; this fixture is the binding I/O contract.

---

## Verification

```bash
grep -c "^## \`AT-APP-" spec/18-spec-issues/97a-acceptance-criteria-fixtures.md
node scripts/spec-hygiene/00-run-all.mjs
```

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Source AT prose
- [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md) — Format SSOT
