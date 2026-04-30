# WP-Plugin Reference Skeletons (P7)

> **Generated:** 2026-04-30
> **Generator:** [`scripts/spec-hygiene/41-generate-skeletons.mjs`](../../../scripts/spec-hygiene/41-generate-skeletons.mjs)
> **Source:** [`spec/contract.json`](../../contract.json)
> **Status:** Active reference (auto-regenerated; do NOT hand-edit `*.generated.php`)

---

## AI Contract

**Purpose** — Provide ready-to-copy PHP 8.1+ skeleton classes (enums + REST route registrar) derived from the canonical contract. While spec-only mode is active, these files are normative samples that demonstrate the exact shape a WP-plugin implementer MUST follow.

**Audience** — WP-plugin implementer (when spec-only mode exits) + reviewer.

**Expected AI Output** —
- [`php/Enums.generated.php`](./php/Enums.generated.php) — one PHP `enum: string` per contract enum (22 enums)
- [`php/RestRoutes.generated.php`](./php/RestRoutes.generated.php) — `register_rest_route` calls + handler stubs for every endpoint (48 endpoints)

**Out of Scope** —
- Business logic in handlers (every stub returns 501 `NotImplemented` with the API envelope)
- Authentication beyond `is_user_logged_in()` — extend per [`36-user-management/`](../../36-user-management/00-overview.md)
- DB layer — covered separately by [`19-micro-orm-and-root-db/`](../19-micro-orm-and-root-db/00-overview.md)

**Definition of Done** —
- Every enum in `spec/contract.json` MUST have a matching `case` in `Enums.generated.php`
- Every endpoint in `spec/contract.json` MUST have a matching `register_rest_route` call in `RestRoutes.generated.php`
- `node scripts/spec-hygiene/41-generate-skeletons.mjs` exits 0

---

## Generated files

| File | Contents | Lines (approx.) |
|------|----------|-----------------|
| `php/Enums.generated.php` | 22 PHP `enum: string` declarations | ~135 |
| `php/RestRoutes.generated.php` | `RestRoutes` class with register() + 48 handler stubs | ~596 |

---

## Verification

```bash
node scripts/spec-hygiene/41-generate-skeletons.mjs
diff -q spec/15-wp-plugin-how-to/skeletons/php/Enums.generated.php /tmp/expected-enums.php
```

---

## Related

- [`../../22-contract-json.md`](../../22-contract-json.md) — Source contract schema
- [`../../32-ui-design/skeletons/00-overview.md`](../../32-ui-design/skeletons/00-overview.md) — Sibling TS skeletons
- [`../14-rest-api-conventions/00-overview.md`](../14-rest-api-conventions/00-overview.md) — REST API conventions

---

*Created 2026-04-28 — closes P7 for the PHP side.*
