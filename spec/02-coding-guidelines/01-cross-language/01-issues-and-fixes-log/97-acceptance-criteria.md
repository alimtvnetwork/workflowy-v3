# Issues & Fixes Log — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8) — populated from scaffold (polish #3, A-26 wave-1). v0.1.0 was auto-generated stub.
> **Status:** Curated — 11 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Purpose:** Lock the historical-violation log as the SSOT for "what we already proved must never regress."

---

## ID Range

`AT-ISSUESANDFIXESLOG-01` … `AT-ISSUESANDFIXESLOG-11`

---

## Criteria

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-ISSUESANDFIXESLOG-01` | The folder MUST contain exactly the 6 topic files named in `00-overview.md` Topic Index (`01-naming-violations.md` … `06-type-safety.md`); no monolith file >200 lines is reintroduced. | [`00-overview.md`](./00-overview.md) §Topic Index + AUD-L-01 split note |
| `AT-ISSUESANDFIXESLOG-02` | Naming Violations §01–§04 enumerate at least 4 historical issues with for each: ❌ pre-fix snippet, ✅ post-fix snippet, root cause, and the prevention rule that now blocks recurrence. | [`01-naming-violations.md`](./01-naming-violations.md) |
| `AT-ISSUESANDFIXESLOG-03` | Database Casing §05–§08 reaffirm the **PascalCase Golden Rule** for SQL column identifiers and JSON envelope keys; any snake_case example MUST appear only in the ❌ column. | [`02-database-casing.md`](./02-database-casing.md) + `04-database-conventions/06-rest-api-format/` |
| `AT-ISSUESANDFIXESLOG-04` | Boolean & Negation §09–§11 require positive prefixes (`isX`, `hasX`, `canX`) and ban `if (!x)` in business logic; cross-links to `01-cross-language/12-no-negatives.md` and the `isDefined` guard. | [`03-boolean-and-negation.md`](./03-boolean-and-negation.md) + `mem://constraints/coding-guidelines` |
| `AT-ISSUESANDFIXESLOG-05` | Enum Standard Violations §12–§14 require enum drift detection; the canonical enum SSOT is [`spec/20-enums-index.md`](../../../20-enums-index.md) and drift is enforced by `scripts/spec-hygiene/15-check-enums-in-sync.mjs`. | [`04-enum-standards.md`](./04-enum-standards.md) + `spec/20-enums-index.md` |
| `AT-ISSUESANDFIXESLOG-06` | Formatting Violations §15–§17 enforce K&R braces, ≤15 logical lines per function, and zero nested `if`s; aligned with `01-cross-language/04-code-style/` and the strict-TS memory rule. | [`05-formatting.md`](./05-formatting.md) + `mem://constraints/coding-guidelines` |
| `AT-ISSUESANDFIXESLOG-07` | Type Safety Violations §18–§19 forbid `any`, untyped `Function`/`Object`, and unsafe `as` casts; `unknown` + narrowing helpers are the only escape hatch. | [`06-type-safety.md`](./06-type-safety.md) + `02-typescript/08-typescript-standards-reference/02-zero-any-policy.md` |
| `AT-ISSUESANDFIXESLOG-08` | Each topic file MUST stay under **200 lines** (post-split budget set by AUD-L-01); a hygiene check or manual review is run before any new issue is appended. | [`00-overview.md`](./00-overview.md) §AUD-L-01 split note |
| `AT-ISSUESANDFIXESLOG-09` | Summary Statistics table in `00-overview.md` MUST equal the count of issues actually documented in the 6 topic files (no orphaned counters). | [`00-overview.md`](./00-overview.md) §Summary Statistics |
| `AT-ISSUESANDFIXESLOG-10` | Every issue entry includes a **prevention rule** that maps to either an automated check (script in `scripts/spec-hygiene/`) or a load-bearing rule cited in the relevant standards-reference file. | All 6 topic files |
| `AT-ISSUESANDFIXESLOG-11` | The log is **historical reference only** — it never re-defines a rule that is also defined in a standards-reference file; it links to the SSOT instead. Duplicated normative text is a defect. | All 6 topic files + `02-typescript/08-typescript-standards-reference/`, `04-php/07-php-standards-reference/`, `03-golang/04-golang-standards-reference/` |

---

## Verification

```bash
# Topic file budget
for f in spec/02-coding-guidelines/01-cross-language/01-issues-and-fixes-log/0[1-6]-*.md; do
  lines=$(wc -l < "$f")
  test "$lines" -gt 200 && echo "OVER 200 LINES: $f ($lines)"
done

# Hygiene
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent index
- [`spec/20-enums-index.md`](../../../20-enums-index.md) — Enum SSOT
- [`spec/02-coding-guidelines/01-cross-language/12-no-negatives.md`](../12-no-negatives.md) — Positive guards SSOT
- [`spec/02-coding-guidelines/01-cross-language/04-code-style/`](../04-code-style/00-overview.md) — Formatting rules

---

*Populated 2026-04-26 (polish #3, A-26 wave-1) — closes the in-scope stub for the cross-language Issues & Fixes Log.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
