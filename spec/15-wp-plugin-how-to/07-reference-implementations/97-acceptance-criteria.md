# Reference Implementations — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 13 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-REFERENCEIMPLEMENTATIONS-01` … `AT-REFERENCEIMPLEMENTATIONS-13`

> Reference implementations are **canonical, copy-pasteable** code samples that every new plugin starts from.

---

## Criteria

### Bootstrap & autoloader (files 01, 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REFERENCEIMPLEMENTATIONS-01 | The bootstrap file (`<plugin>/<plugin>.php`) MUST contain only the standard WP plugin header + a single `require_once 'plugin.php'`; business logic in the bootstrap is forbidden. | [`01-bootstrap-file.md`](./01-bootstrap-file.md) |
| AT-REFERENCEIMPLEMENTATIONS-02 | The PSR-4 autoloader is registered before any other code runs; manual `require` of class files outside the autoloader is forbidden. | [`02-autoloader.md`](./02-autoloader.md) |
| AT-REFERENCEIMPLEMENTATIONS-03 | Autoloader namespace MUST match the plugin slug PascalCased (`riseup-asia` → `RiseupAsia\\`); divergence breaks autoload and is a setup bug. | [`02-autoloader.md`](./02-autoloader.md) |

### plugin.php & lifecycle (files 03, 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REFERENCEIMPLEMENTATIONS-04 | `plugin.php` initialises in fixed order: (1) constants, (2) container, (3) services, (4) helpers, (5) hooks; reordering breaks DI and fails review. | [`03-plugin-php.md`](./03-plugin-php.md) |
| AT-REFERENCEIMPLEMENTATIONS-05 | Activator/Deactivator/Uninstall are separate static-class entry points; logic shared between them MUST be extracted into a `LifecycleHelper`. | [`04-activator-deactivator-uninstall.md`](./04-activator-deactivator-uninstall.md) |
| AT-REFERENCEIMPLEMENTATIONS-06 | Uninstall MUST remove ALL plugin tables, options, and files (idempotent — re-running uninstall is a no-op); leaking artifacts is a Code-Red bug. | [`04-activator-deactivator-uninstall.md`](./04-activator-deactivator-uninstall.md) |

### Envelope builder (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REFERENCEIMPLEMENTATIONS-07 | `EnvelopeBuilder::success($data, $meta)` and `EnvelopeBuilder::error($code, $message, $statusCode, $meta)` are the only sanctioned response constructors; direct envelope-array literals in controllers are forbidden. | [`05-envelope-builder.md`](./05-envelope-builder.md), [`../05-helpers-responses-and-integration/97-acceptance-criteria.md`](../05-helpers-responses-and-integration/97-acceptance-criteria.md) |

### ResponseKeyType enum (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REFERENCEIMPLEMENTATIONS-08 | The reference `ResponseKeyType` enum implementation in §06 MUST mirror the inventory in `02-coding-guidelines/04-php/09-response-key-type-inventory/` (176 cases as of v2.1.0); divergence between this reference and the inventory is a doc bug. | [`06-response-key-type-enum.md`](./06-response-key-type-enum.md), [`../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md`](../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md) |

### AI instructions template (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REFERENCEIMPLEMENTATIONS-09 | Every plugin ships an `AI_INSTRUCTIONS.md` at the root (template in §07) covering: project goals, coding standards link, error handling, response envelope, testing expectations, hand-off checklist; missing or stale (>1 minor version old) fails review. | [`07-ai-instructions-template.md`](./07-ai-instructions-template.md) |
| AT-REFERENCEIMPLEMENTATIONS-10 | `AI_INSTRUCTIONS.md` references the cross-language AT files (NOT inlines them); duplication causes drift and is forbidden. | [`07-ai-instructions-template.md`](./07-ai-instructions-template.md), [`../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md`](../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md) |

### Plugin config type example (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REFERENCEIMPLEMENTATIONS-11 | `PluginConfigType` is a typed value-object (PHP `readonly` class) with named properties (NOT an associative array); `array $config` parameters are forbidden in service constructors. | [`08-plugin-config-type-example.md`](./08-plugin-config-type-example.md), [`../../02-coding-guidelines/01-cross-language/27-types-folder-convention/97-acceptance-criteria.md`](../../02-coding-guidelines/01-cross-language/27-types-folder-convention/97-acceptance-criteria.md) |
| AT-REFERENCEIMPLEMENTATIONS-12 | `PluginConfigType` is built once at boot from the seedable-config layer and injected via the container; rebuilding the config per request is forbidden. | [`08-plugin-config-type-example.md`](./08-plugin-config-type-example.md), [`../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md`](../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md) |

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-REFERENCEIMPLEMENTATIONS-13 | Every reference snippet in this folder MUST compile/parse cleanly when copy-pasted into a fresh plugin scaffold; a CI doc-test verifies parseability of every fenced PHP block. | [`00-overview.md`](./00-overview.md) |

---

## Verification

```bash
# Plugin bootstrap should contain only the header + 1 require
rg -nP '^(class|function|namespace)\s' includes/../*.php | grep -v 'plugin\.php\|tests/'

# Direct envelope-array literals in controllers
rg -nP "wp_send_json\w*\(\s*\[\s*'Success'" includes/Controllers/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../05-helpers-responses-and-integration/97-acceptance-criteria.md`](../05-helpers-responses-and-integration/97-acceptance-criteria.md) — Helpers & envelope
- [`../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md`](../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md) — Response key inventory
- [`../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md`](../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md) — Seedable config

---

*Curated 2026-04-25 — closes A-23 (batch 12). Replaces v0.1.0 stub.*
