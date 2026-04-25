# Error Modal Copy Formats — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-COPYFORMATS-01` … `AT-COPYFORMATS-14`

---

## Criteria

### Format inventory & defaults

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COPYFORMATS-01 | Exactly **9** documented formats exist (compact, full, full+backend-logs, error.log.txt, log.txt, error.log+delegated, envelope JSON, session diagnostics, generator reference); adding/removing a format is a doc-bump event. | [`00-overview.md`](./00-overview.md) "File Index" |
| AT-COPYFORMATS-02 | The **Compact Report** is the DEFAULT for the modal Copy button — main-click MUST NOT trigger an API call; it builds entirely from `CapturedError`. | [`01-compact-report.md`](./01-compact-report.md) |
| AT-COPYFORMATS-03 | The **Full Bundle (ZIP)** download contains exactly three artifacts: `report.md` + `error.log.txt` + `log.txt` (per the table in §00). | [`00-overview.md`](./00-overview.md) "Format Overview" |

### Compact Report (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COPYFORMATS-04 | Compact Report renders the canonical Markdown sections in fixed order: header → frontend snapshot → backend error → delegated info (if present) → session linkage; sections without data are omitted, NOT shown empty. | [`01-compact-report.md`](./01-compact-report.md) |
| AT-COPYFORMATS-05 | Delegated server info in the Compact Report is built from `CapturedError` fields (no API roundtrip); the format is identical to `06-error-log-with-delegated-info.md`. | [`01-compact-report.md`](./01-compact-report.md), [`06-error-log-with-delegated-info.md`](./06-error-log-with-delegated-info.md) |

### Full Report family (files 02–03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COPYFORMATS-06 | Full Report contains all sections of Compact Report PLUS frontend stack, backend stack, request/response envelope, and session sub-tabs. | [`02-full-report.md`](./02-full-report.md) |
| AT-COPYFORMATS-07 | Full Report + Backend Logs is the only Markdown format that triggers an async fetch (`GET /api/v1/logs/error`); failures degrade gracefully to the Full Report without backend log block. | [`03-full-report-with-backend-logs.md`](./03-full-report-with-backend-logs.md) |

### Raw log files (files 04–06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COPYFORMATS-08 | `error.log.txt` is fetched verbatim from `GET /api/v1/logs/error`; the modal MUST NOT post-process the bytes (no reformatting, no truncation, no redaction beyond what the backend already applied). | [`04-error-log-txt.md`](./04-error-log-txt.md) |
| AT-COPYFORMATS-09 | `log.txt` is fetched verbatim from `GET /api/v1/logs/full` with the same no-post-processing rule. | [`05-full-log-txt.md`](./05-full-log-txt.md) |
| AT-COPYFORMATS-10 | The "delegated" variant (file 06) appends a fixed-format downstream-server block; the block is OMITTED entirely (not shown empty) when no delegation occurred. | [`06-error-log-with-delegated-info.md`](./06-error-log-with-delegated-info.md) |

### JSON formats (files 07–08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COPYFORMATS-11 | Envelope Error Response JSON conforms to the canonical envelope shape from `01-error-handling-reference/`; key order is documented and stable. | [`07-envelope-error-response.md`](./07-envelope-error-response.md), [`../../01-error-handling-reference/97-acceptance-criteria.md`](../../01-error-handling-reference/97-acceptance-criteria.md) |
| AT-COPYFORMATS-12 | Session Diagnostics JSON is the literal payload returned by the session-diagnostics endpoint; the modal does NOT synthesize fields client-side. | [`08-session-diagnostics.md`](./08-session-diagnostics.md), [`../../07-logging-and-diagnostics/02-session-based-logging/97-acceptance-criteria.md`](../../07-logging-and-diagnostics/02-session-based-logging/97-acceptance-criteria.md) |

### Generator reference & consistency

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COPYFORMATS-13 | The generator code reference (file 09) lists the exact source file + function name responsible for each of the 8 user-facing formats; cross-ref hygiene resolves every reference. | [`09-generator-code-reference.md`](./09-generator-code-reference.md) |
| AT-COPYFORMATS-14 | The folder's `99-consistency-report.md` summarizes the consistency between format samples; an unresolved consistency issue blocks the spec from "stable" status. | [`99-consistency-report.md`](./99-consistency-report.md) |

---

## Verification

```bash
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../03-error-modal-reference/97-acceptance-criteria.md`](../03-error-modal-reference/97-acceptance-criteria.md) — Modal reference
- [`../02-react-components/97-acceptance-criteria.md`](../02-react-components/97-acceptance-criteria.md) — React components
- [`../../01-error-handling-reference/97-acceptance-criteria.md`](../../01-error-handling-reference/97-acceptance-criteria.md) — Cross-stack handling

---

*Curated 2026-04-25 — closes A-20 (batch 9). Replaces v0.1.0 stub.*
