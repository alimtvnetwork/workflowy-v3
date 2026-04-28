# Error Modal — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the Error Modal subsection. Covers copy formats, React components, error-history persistence, the global-error suppression meta-pattern, and color themes.

ID format: `AT-ERRORMODAL-NN`.

---

## Criteria

### Copy & Components (AT-ERRORMODAL-01..03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORMODAL-01 | Every error displayed in the modal includes: error code, human-readable title, plain-language description, and suggested next action. | [`01-copy-formats/`](./01-copy-formats/00-overview.md) |
| AT-ERRORMODAL-02 | The modal renders via the documented React component contract (props are typed; no `any`); accessible markup uses `role="alertdialog"`. | [`02-react-components/`](./02-react-components/00-overview.md) |
| AT-ERRORMODAL-03 | The full Error Modal reference (state machine, slots, dismissal, focus trap) is implemented exactly as in the canonical reference. | [`03-error-modal-reference/`](./03-error-modal-reference/00-overview.md) |

### Color Themes (AT-ERRORMODAL-04..05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORMODAL-04 | Modal colors come from semantic design tokens; severity (info / warn / error / fatal) maps to documented token names. | [`04-color-themes/`](./04-color-themes/00-overview.md) |
| AT-ERRORMODAL-05 | Both light and dark themes meet WCAG 2.1 AA contrast on every modal surface (background, border, text, button states). | [`04-color-themes/`](./04-color-themes/00-overview.md) |

### History Persistence (AT-ERRORMODAL-06..08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORMODAL-06 | Errors are persisted to the documented client-side store with the documented schema (id, timestamp, code, severity, message, suppressed). | [`05-error-history-persistence.md`](./05-error-history-persistence.md) |
| AT-ERRORMODAL-07 | History retention follows the documented cap (max entries / max age); oldest entries are pruned first. | [`05-error-history-persistence.md`](./05-error-history-persistence.md) |
| AT-ERRORMODAL-08 | The history store survives page reload but is cleared on explicit logout. | [`05-error-history-persistence.md`](./05-error-history-persistence.md) |

### Suppress Global Error (AT-ERRORMODAL-09..10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORMODAL-09 | A request can opt out of the global modal by setting the documented `suppressGlobalError` meta flag; the error still reaches the caller's `catch`. | [`06-suppress-global-error.md`](./06-suppress-global-error.md) |
| AT-ERRORMODAL-10 | Suppressed errors are still recorded in the history store with `suppressed: true`. | [`06-suppress-global-error.md`](./06-suppress-global-error.md) + [`05-error-history-persistence.md`](./05-error-history-persistence.md) |

### Legacy Migration (AT-ERRORMODAL-11..12)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORMODAL-11 | Legacy modal-reference document exists only as a redirect to the canonical `03-error-modal-reference/`. | [`07-error-modal-reference-legacy.md`](./07-error-modal-reference-legacy.md) |
| AT-ERRORMODAL-12 | Legacy color-themes document exists only as a stub pointing to `04-color-themes/`; no live token names are duplicated. | [`08-color-themes-legacy.md`](./08-color-themes-legacy.md) |

---

## Verification

```bash
grep -rn "AT-ERRORMODAL-" spec/03-error-manage/02-error-architecture/04-error-modal/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Subsection overview
- [`../05-response-envelope/`](../05-response-envelope/00-overview.md) — Universal response envelope (errors flow from here)
- [`../06-apperror-package/`](../06-apperror-package/00-overview.md) — `AppError` data model
- [`spec/19-glossary.md`](../../../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../../../20-enums-index.md) — Enum registry

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced auto-generated H-2.1 scaffold.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
