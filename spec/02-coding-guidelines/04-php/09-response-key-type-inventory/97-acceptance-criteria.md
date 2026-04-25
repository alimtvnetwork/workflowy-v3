# Response Key Type Inventory — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 13 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-RESPONSEKEYTYPEINVENTORY-01` … `AT-RESPONSEKEYTYPEINVENTORY-13`

> Inventory SSOT for `RiseupAsia\Enums\ResponseKeyType` — 176 cases × 11 topic files. Mirrored to Go (`backend/internal/enums/response_key/variant.go`) and TS (`src/lib/constants.ts`).

---

## Criteria

### Inventory completeness & casing

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESPONSEKEYTYPEINVENTORY-01 | The inventory documents **exactly 176** cases as of v2.1.0 — adding/removing a case is a minor-version bump and MUST update this overview AND the corresponding topic file. | [`00-overview.md`](./00-overview.md) "Total cases" |
| AT-RESPONSEKEYTYPEINVENTORY-02 | Every case value uses **PascalCase** (e.g., `'Success'`, `'SnapshotId'`, `'DeletedByPolicy'`); single-word keys are PascalCase too (`'Success'` not `'success'`). | [`00-overview.md`](./00-overview.md) "Value Casing Convention" |
| AT-RESPONSEKEYTYPEINVENTORY-03 | The 11 topic files (`01` … `11`) collectively cover all 176 cases with **zero overlap and zero gaps**; a hygiene check sums case counts per file and asserts equality with the overview total. | [`00-overview.md`](./00-overview.md), `01-envelope-and-collections.md` … `11-providers-and-misc.md` |

### Cross-language mirror integrity

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESPONSEKEYTYPEINVENTORY-04 | The PHP enum (`includes/Enums/ResponseKeyType.php`), the Go variant (`backend/internal/enums/response_key/variant.go`), and the TS constant map (`src/lib/constants.ts`) MUST contain the exact same 176 case identifiers — divergence is a Code-Red bug. | [`00-overview.md`](./00-overview.md) header refs |
| AT-RESPONSEKEYTYPEINVENTORY-05 | Each case value (the PascalCase string) is **byte-identical** across PHP/Go/TS; a case-sensitive diff between the three sources MUST yield zero differences. | [`00-overview.md`](./00-overview.md) |
| AT-RESPONSEKEYTYPEINVENTORY-06 | The Go enum implements all mandatory methods from the Go enum spec (`String`, `Label`, `IsValid`, `Parse`, `MarshalJSON`, `UnmarshalJSON`, etc.). | [`../../03-golang/01-enum-specification/02-required-methods/97-acceptance-criteria.md`](../../03-golang/01-enum-specification/02-required-methods/97-acceptance-criteria.md) |

### Topic-file structure

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESPONSEKEYTYPEINVENTORY-07 | Each topic file (01–11) is **<200 lines** (per the AUD-L-01 split rule that produced this folder); a topic file exceeding 200 lines MUST be split further. | [`00-overview.md`](./00-overview.md) "Split per AUD-L-01" |
| AT-RESPONSEKEYTYPEINVENTORY-08 | Each topic file lists, for every case it owns: the case name, the producing endpoint(s), and the consuming surface(s) (frontend tab, log line, etc.); cases without a producer OR a consumer are flagged for removal. | [`01-envelope-and-collections.md`](./01-envelope-and-collections.md) … [`11-providers-and-misc.md`](./11-providers-and-misc.md) |
| AT-RESPONSEKEYTYPEINVENTORY-09 | Topic files group cases by **domain** (envelope, files/pagination, domain entities, cleanup/lifecycle, logs, temporal, scheduler, snapshot/manifest, stats/options, progress/cleanup-internal, providers); a case in the wrong topic file is a doc bug. | [`00-overview.md`](./00-overview.md) "Topic Index" |

### Usage policy

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESPONSEKEYTYPEINVENTORY-10 | All response payloads in PHP/Go MUST use `ResponseKeyType` (or its language mirror) — string-literal keys in `wp_send_json_*` / Go `json.Marshal` of map literals are forbidden. | [`00-overview.md`](./00-overview.md), [`../05-response-array-standard.md`](../05-response-array-standard.md) |
| AT-RESPONSEKEYTYPEINVENTORY-11 | Adding a new response key REQUIRES (a) adding the case to the PHP enum, (b) regenerating the Go variant, (c) regenerating the TS constant map, (d) appending to the appropriate topic file; missing any step fails review. | [`00-overview.md`](./00-overview.md) |
| AT-RESPONSEKEYTYPEINVENTORY-12 | Deprecated cases MUST be marked (not deleted) for at least one minor version with a deprecation note in the topic file AND a `@deprecated` tag in the PHP enum docblock. | [`00-overview.md`](./00-overview.md) |

### Verification

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESPONSEKEYTYPEINVENTORY-13 | A repeatable script verifies (a) PHP/Go/TS case identifier parity, (b) PascalCase casing, (c) topic-file coverage of all 176 cases, (d) no string-literal response keys outside the enum; the script MUST be wired into `scripts/spec-hygiene/00-run-all.mjs`. | [`00-overview.md`](./00-overview.md), [`scripts/spec-hygiene/00-run-all.mjs`](../../../../scripts/spec-hygiene/00-run-all.mjs) |

---

## Verification

```bash
# String-literal response keys in PHP (heuristic)
rg -nP "wp_send_json\w*\(\s*\[\s*'\w" includes/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../07-php-standards-reference/97-acceptance-criteria.md`](../07-php-standards-reference/97-acceptance-criteria.md) — PHP standards
- [`../../03-golang/01-enum-specification/02-required-methods/97-acceptance-criteria.md`](../../03-golang/01-enum-specification/02-required-methods/97-acceptance-criteria.md) — Go enum methods
- [`../../01-cross-language/27-types-folder-convention/97-acceptance-criteria.md`](../../01-cross-language/27-types-folder-convention/97-acceptance-criteria.md) — Types folder convention
- [`spec/20-enums-index.md`](../../../20-enums-index.md) — Enum registry

---

*Curated 2026-04-25 — closes A-21 (batch 10). Replaces v0.1.0 stub.*
