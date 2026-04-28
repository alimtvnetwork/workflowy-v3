# WordPress Integration Patterns — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-WORDPRESSINTEGRATIONPATTERNS-01` … `AT-WORDPRESSINTEGRATIONPATTERNS-16`

---

## Criteria

### Admin pages & settings (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WORDPRESSINTEGRATIONPATTERNS-01 | Admin pages register via `add_menu_page`/`add_submenu_page` once, on the `admin_menu` hook only; registering on `init` or `plugins_loaded` is forbidden. | [`01-admin-pages-and-settings.md`](./01-admin-pages-and-settings.md) |
| AT-WORDPRESSINTEGRATIONPATTERNS-02 | Capability slugs MUST be the documented per-plugin custom capability (NOT `manage_options`); shipping `manage_options` outside the WP-superadmin page is a privilege-escalation bug. | [`01-admin-pages-and-settings.md`](./01-admin-pages-and-settings.md), [`../15-settings-architecture/97-acceptance-criteria.md`](../15-settings-architecture/97-acceptance-criteria.md) |

### AJAX handlers (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WORDPRESSINTEGRATIONPATTERNS-03 | Every `wp_ajax_*` handler verifies BOTH a nonce AND a capability before any side effect; missing either is a Code-Red OWASP bug. | [`02-ajax-handlers.md`](./02-ajax-handlers.md) |
| AT-WORDPRESSINTEGRATIONPATTERNS-04 | AJAX handlers respond exclusively via `EnvelopeBuilder`; raw `wp_send_json_*` outside the envelope contract is forbidden. | [`02-ajax-handlers.md`](./02-ajax-handlers.md), [`../05-helpers-responses-and-integration/97-acceptance-criteria.md`](../05-helpers-responses-and-integration/97-acceptance-criteria.md) |

### WP-Cron (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WORDPRESSINTEGRATIONPATTERNS-05 | Cron events register via `register_activation_hook` and unregister via `register_deactivation_hook`; orphaned cron events surviving deactivation are a Code-Red lifecycle bug. | [`03-wp-cron.md`](./03-wp-cron.md) |
| AT-WORDPRESSINTEGRATIONPATTERNS-06 | Cron callbacks MUST be wrapped in `SafeExecute` and emit a structured log entry on every run (start/finish/error); silent cron failures are forbidden. | [`03-wp-cron.md`](./03-wp-cron.md), [`../04-logging-and-error-handling/97-acceptance-criteria.md`](../04-logging-and-error-handling/97-acceptance-criteria.md) |

### File uploads (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WORDPRESSINTEGRATIONPATTERNS-07 | Uploads validate (a) MIME via `wp_check_filetype_and_ext`, (b) extension whitelist, (c) max-size enum-driven cap; relying solely on user-supplied MIME header is forbidden. | [`04-file-upload-handling.md`](./04-file-upload-handling.md) |
| AT-WORDPRESSINTEGRATIONPATTERNS-08 | Uploaded files MUST land in the plugin-scoped uploads subdir (NOT the WP root or `wp-content/uploads/` root); cross-plugin upload pollution fails review. | [`04-file-upload-handling.md`](./04-file-upload-handling.md) |

### Migrations & seeding (files 05, 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WORDPRESSINTEGRATIONPATTERNS-09 | Migrations are versioned (`001_create_x.php`), idempotent, and run via a single `MigrationRunner` invoked on activation + admin-init guard; ad-hoc `dbDelta` calls in business code are forbidden. | [`05-database-migrations.md`](./05-database-migrations.md) |
| AT-WORDPRESSINTEGRATIONPATTERNS-10 | Seeders are explicitly opt-in (env flag or admin button) — they MUST NOT run on activation in production; auto-seeding live data is a Code-Red bug. | [`06-database-seeding.md`](./06-database-seeding.md), [`../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md`](../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md) |

### Transient caching (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WORDPRESSINTEGRATIONPATTERNS-11 | Transient keys are namespaced `riseup_<plugin>_<cache>_<hash>` and MUST declare an explicit TTL (no `0` for non-expiring); orphaned transients across uninstall fail review. | [`07-transient-caching.md`](./07-transient-caching.md) |
| AT-WORDPRESSINTEGRATIONPATTERNS-12 | Cache reads use `get_transient` then fall back to a single typed loader (read-through pattern); double-fetch + race conditions are forbidden. | [`07-transient-caching.md`](./07-transient-caching.md) |

### External HTTP (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WORDPRESSINTEGRATIONPATTERNS-13 | All outbound HTTP goes through `wp_remote_*` wrapped by an `HttpClient` helper using `HttpConfigType`; raw `curl_exec` or `file_get_contents($url)` is forbidden. | [`08-external-http-requests.md`](./08-external-http-requests.md), [`../05-helpers-responses-and-integration/97-acceptance-criteria.md`](../05-helpers-responses-and-integration/97-acceptance-criteria.md) |
| AT-WORDPRESSINTEGRATIONPATTERNS-14 | Outbound requests log `requestId`, target host, HTTP status, and elapsed-ms; missing any field breaks observability. | [`08-external-http-requests.md`](./08-external-http-requests.md) |

### plugin.php integration & enum inventory (files 09, 10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WORDPRESSINTEGRATIONPATTERNS-15 | Hook registration in `plugin.php` follows fixed order: filters before actions, registration before dispatch; reordering breaks deterministic boot. | [`09-plugin-php-integration.md`](./09-plugin-php-integration.md), [`../07-reference-implementations/97-acceptance-criteria.md`](../07-reference-implementations/97-acceptance-criteria.md) |
| AT-WORDPRESSINTEGRATIONPATTERNS-16 | Every WP-integration enum (cron schedules, capability map, hook priorities) is listed in §10 and mirrored in `spec/20-enums-index.md`; divergence between the two is a registry bug. | [`10-enum-inventory.md`](./10-enum-inventory.md), [`../../20-enums-index.md`](../../20-enums-index.md) |

---

## Verification

```bash
# manage_options outside superadmin pages
rg -nP "'manage_options'" includes/ | grep -v 'SuperAdmin\|tests/'

# raw curl/file_get_contents on URLs
rg -nP '\b(curl_exec|file_get_contents)\s*\(' includes/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../05-helpers-responses-and-integration/97-acceptance-criteria.md`](../05-helpers-responses-and-integration/97-acceptance-criteria.md) — Envelope + HttpConfigType
- [`../04-logging-and-error-handling/97-acceptance-criteria.md`](../04-logging-and-error-handling/97-acceptance-criteria.md) — Logging
- [`../15-settings-architecture/97-acceptance-criteria.md`](../15-settings-architecture/97-acceptance-criteria.md) — Capability map

---

*Curated 2026-04-25 — closes A-24 (batch 13). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
