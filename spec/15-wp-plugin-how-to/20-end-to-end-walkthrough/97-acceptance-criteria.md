# End-To-End Walkthrough — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 18 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-ENDTOENDWALKTHROUGH-01` … `AT-ENDTOENDWALKTHROUGH-18`

> The walkthrough is a **build-along-with-me** reference plugin. Every step MUST be reproducible from a fresh `wp-content/plugins/` checkout.

---

## Criteria

### Scope, structure, bootstrap, autoloader (files 01–04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENDTOENDWALKTHROUGH-01 | The "what we're building" scope (§01) MUST be a single named feature with a 1-paragraph user story; multi-feature mega-walkthroughs are forbidden. | [`01-what-were-building.md`](./01-what-were-building.md) |
| AT-ENDTOENDWALKTHROUGH-02 | The folder structure (§02) matches the canonical layout in `02-folder-structure.md` exactly — `includes/`, `templates/`, `assets/`, `tests/`, `data/`; deviations require a §02 update first. | [`02-folder-structure.md`](./02-folder-structure.md), [`../07-reference-implementations/97-acceptance-criteria.md`](../07-reference-implementations/97-acceptance-criteria.md) |
| AT-ENDTOENDWALKTHROUGH-03 | Bootstrap file (§03) contains only the WP plugin header + a single `require_once 'plugin.php'`; logic in the bootstrap fails review. | [`03-bootstrap-file.md`](./03-bootstrap-file.md) |
| AT-ENDTOENDWALKTHROUGH-04 | Autoloader (§04) is PSR-4, registered before any other code; manual `require` of class files outside the autoloader is forbidden. | [`04-autoloader.md`](./04-autoloader.md) |

### Enums, logger, traits, plugin.php (files 05–08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENDTOENDWALKTHROUGH-05 | Every enum introduced in §05 ships with `label()`, `values()`, `tryFromOrThrow()`; missing any of the trio fails review. | [`05-enums.md`](./05-enums.md), [`../02-enums-and-coding-style/97-acceptance-criteria.md`](../02-enums-and-coding-style/97-acceptance-criteria.md) |
| AT-ENDTOENDWALKTHROUGH-06 | The `FileLogger` (§06) writes to a plugin-scoped log path, rotates by both size + age, and emits the canonical 5-field entry; deviations are a Code-Red observability bug. | [`06-file-logger.md`](./06-file-logger.md), [`../04-logging-and-error-handling/97-acceptance-criteria.md`](../04-logging-and-error-handling/97-acceptance-criteria.md) |
| AT-ENDTOENDWALKTHROUGH-07 | Core helper traits (§07) are stateless, narrowly-scoped (single responsibility per trait), and tested in isolation; god-traits with multiple responsibilities are forbidden. | [`07-core-traits-helpers.md`](./07-core-traits-helpers.md) |
| AT-ENDTOENDWALKTHROUGH-08 | `plugin.php` (§08) initialises in the fixed order: constants → container → services → helpers → hooks; reordering breaks DI and fails review. | [`08-plugin-php.md`](./08-plugin-php.md), [`../07-reference-implementations/97-acceptance-criteria.md`](../07-reference-implementations/97-acceptance-criteria.md) |

### Routes & migrations (files 09, 10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENDTOENDWALKTHROUGH-09 | Route registration (§09) uses the single `endpoints.json`-driven loop; bespoke `register_rest_route` calls per route are forbidden. | [`09-route-registration.md`](./09-route-registration.md), [`../14-rest-api-conventions/97-acceptance-criteria.md`](../14-rest-api-conventions/97-acceptance-criteria.md) |
| AT-ENDTOENDWALKTHROUGH-10 | Migrations (§10) are versioned, idempotent, and run via `MigrationRunner`; ad-hoc `dbDelta` outside the runner fails review. | [`10-database-migration.md`](./10-database-migration.md), [`../08-wordpress-integration-patterns/97-acceptance-criteria.md`](../08-wordpress-integration-patterns/97-acceptance-criteria.md) |

### Feature handler & admin settings (files 11–13)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENDTOENDWALKTHROUGH-11 | Feature handler traits (§11) are composed onto thin controllers (controllers = wiring only, traits = behaviour); fat controllers fail review. | [`11-feature-handler-traits.md`](./11-feature-handler-traits.md) |
| AT-ENDTOENDWALKTHROUGH-12 | Admin settings page (§12) follows the §13 admin-UI 3-region layout; off-spec layouts fail review. | [`12-admin-settings-page.md`](./12-admin-settings-page.md), [`../13-admin-ui-patterns/97-acceptance-criteria.md`](../13-admin-ui-patterns/97-acceptance-criteria.md) |
| AT-ENDTOENDWALKTHROUGH-13 | Settings registration (§13) uses the SSOT settings registry from §15-settings-architecture; raw `add_settings_section` is forbidden. | [`13-admin-settings-registration.md`](./13-admin-settings-registration.md), [`../15-settings-architecture/97-acceptance-criteria.md`](../15-settings-architecture/97-acceptance-criteria.md) |

### Tests, uninstall, coverage matrix, final checklist (files 14–17)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENDTOENDWALKTHROUGH-14 | Tests (§14) cover: enum parsing, route happy + error path, migration up/down, settings save+load, SafeExecute fallback; missing any case fails review. | [`14-tests.md`](./14-tests.md), [`../09-testing-patterns/97-acceptance-criteria.md`](../09-testing-patterns/97-acceptance-criteria.md) |
| AT-ENDTOENDWALKTHROUGH-15 | Uninstall cleanup (§15) removes ALL plugin tables, options, transients, files, cron events; leaking artifacts is a Code-Red lifecycle bug. | [`15-uninstall-cleanup.md`](./15-uninstall-cleanup.md) |
| AT-ENDTOENDWALKTHROUGH-16 | The phase-coverage matrix (§16) maps each walkthrough section to the parent spec phase; an unmapped section is a doc bug. | [`16-phase-coverage-matrix.md`](./16-phase-coverage-matrix.md) |
| AT-ENDTOENDWALKTHROUGH-17 | The final checklist (§17) is the merge gate for any walkthrough revision: bootstrap+autoloader green, all enums tested, routes registered via JSON, migrations idempotent, settings via registry, uninstall idempotent, all tests green. | [`17-final-checklist.md`](./17-final-checklist.md) |

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENDTOENDWALKTHROUGH-18 | Every code block in this walkthrough MUST parse cleanly when copy-pasted (CI doc-test verifies); broken snippets are a Code-Red onboarding bug. | [`00-overview.md`](./00-overview.md) |

---

## Verification

```bash
# Section files must exist
for n in 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17; do
  ls spec/15-wp-plugin-how-to/20-end-to-end-walkthrough/${n}-*.md > /dev/null || echo "MISSING: $n"
done

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../07-reference-implementations/97-acceptance-criteria.md`](../07-reference-implementations/97-acceptance-criteria.md) — Reference patterns
- [`../09-testing-patterns/97-acceptance-criteria.md`](../09-testing-patterns/97-acceptance-criteria.md) — Test expectations
- [`../15-settings-architecture/97-acceptance-criteria.md`](../15-settings-architecture/97-acceptance-criteria.md) — Settings registry
- [`../14-rest-api-conventions/97-acceptance-criteria.md`](../14-rest-api-conventions/97-acceptance-criteria.md) — REST registration

---

*Curated 2026-04-25 — closes A-24 (batch 13). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
