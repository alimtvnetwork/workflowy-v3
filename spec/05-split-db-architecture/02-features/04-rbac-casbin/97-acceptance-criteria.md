# RBAC Casbin — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-RBACCASBIN-01` … `AT-RBACCASBIN-16`

---

## Criteria

### Architecture & model (files 01, 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RBACCASBIN-01 | RBAC uses Casbin **RBAC-with-domains** (`rbac_with_domains` model) — single-domain models are forbidden because the system is multi-tenant by design. | [`01-architecture.md`](./01-architecture.md), [`02-model-configuration.md`](./02-model-configuration.md) |
| AT-RBACCASBIN-02 | Casbin model file lives under `configs/rbac/model.conf` and is loaded once at boot via `NewEnforcer`; reloading per-request is forbidden (perf bug). | [`02-model-configuration.md`](./02-model-configuration.md) |
| AT-RBACCASBIN-03 | The Casbin policy adapter reads from the dedicated **Auth DB** in the split-DB layout; mixing policies into Domain or Root is forbidden. | [`01-architecture.md`](./01-architecture.md), [`../../01-fundamentals/97-acceptance-criteria.md`](../../01-fundamentals/97-acceptance-criteria.md) |

### Database schema (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RBACCASBIN-04 | The `casbin_rule` table schema MUST match §03 exactly (`Ptype`, `V0`…`V5` PascalCase columns + `(Ptype, V0, V1)` index); divergence breaks the adapter. | [`03-database-schema.md`](./03-database-schema.md) |
| AT-RBACCASBIN-05 | Policy mutations MUST flush the in-memory enforcer cache atomically (`LoadPolicy()` after every persisted mutation); stale cache after a write is a Code-Red authorization bug. | [`03-database-schema.md`](./03-database-schema.md), [`04-go-implementation.md`](./04-go-implementation.md) |

### Go implementation & middleware (files 04, 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RBACCASBIN-06 | The Go enforcer wrapper exposes only the documented surface (`Allow(sub, dom, obj, act)`, `AddRoleForUser`, `RemoveRoleForUser`); calling the raw Casbin enforcer in business code is forbidden. | [`04-go-implementation.md`](./04-go-implementation.md) |
| AT-RBACCASBIN-07 | The HTTP middleware MUST run BEFORE the handler and short-circuit with `403 Forbidden` + canonical envelope on deny; running after the handler is a Code-Red OWASP bug. | [`05-http-middleware.md`](./05-http-middleware.md), [`../../../15-wp-plugin-how-to/14-rest-api-conventions/97-acceptance-criteria.md`](../../../15-wp-plugin-how-to/14-rest-api-conventions/97-acceptance-criteria.md) |
| AT-RBACCASBIN-08 | The middleware extracts `subject` from the authenticated session (NOT from request body/query); accepting client-supplied subject is a Code-Red privilege-escalation bug. | [`05-http-middleware.md`](./05-http-middleware.md) |

### Usage examples & roles (files 06, 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RBACCASBIN-09 | Every example in §06 MUST pass against the reference policy seed; CI doc-test verifies allow/deny outcomes match comments. | [`06-usage-examples.md`](./06-usage-examples.md) |
| AT-RBACCASBIN-10 | Role definitions in §07 are the SSOT — adding a new role requires updating §07 first; ad-hoc roles introduced in code without §07 entry fail review. | [`07-role-definitions.md`](./07-role-definitions.md) |
| AT-RBACCASBIN-11 | Role names use **PascalCase singular** (`Admin`, `Editor`, `Viewer`); plural or snake_case role names are forbidden. | [`07-role-definitions.md`](./07-role-definitions.md), [`../../../02-coding-guidelines/01-cross-language/01-issues-and-fixes-log/01-naming-violations.md`](../../../02-coding-guidelines/01-cross-language/01-issues-and-fixes-log/01-naming-violations.md) |

### Best practices (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RBACCASBIN-12 | Authorization decisions MUST be logged at INFO with `subject`, `domain`, `object`, `action`, `decision`; missing fields breaks audit. | [`08-best-practices.md`](./08-best-practices.md) |
| AT-RBACCASBIN-13 | Permission grants/revokes are append-only audit events in the History DB (NOT in-place updates only); losing the audit trail is a Code-Red compliance bug. | [`08-best-practices.md`](./08-best-practices.md) |
| AT-RBACCASBIN-14 | Wildcard permissions (`*` on object or action) require an explicit code-review approval marker in the policy comment; un-reviewed wildcards fail merge. | [`08-best-practices.md`](./08-best-practices.md) |

### Split-DB integration (file 09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RBACCASBIN-15 | The Casbin adapter opens its own pool against the Auth DB; sharing the Domain/Root pool is forbidden (per `01-fundamentals` per-DB pool rule). | [`09-split-db-integration.md`](./09-split-db-integration.md) |
| AT-RBACCASBIN-16 | Domain isolation: an enforcer call with `dom = tenant_a` MUST NOT match a policy with `dom = tenant_b` (verified by a CI integration test); cross-tenant leakage is a Code-Red multi-tenant bug. | [`09-split-db-integration.md`](./09-split-db-integration.md) |

---

## Verification

```bash
# Wildcard permissions without review marker
rg -nP "casbin_rule.*['\"]\\*['\"]" includes/ db/ | grep -v 'reviewed-by:'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../01-fundamentals/97-acceptance-criteria.md`](../../01-fundamentals/97-acceptance-criteria.md) — Split-DB fundamentals
- [`../05-user-scoped-isolation/97-acceptance-criteria.md`](../05-user-scoped-isolation/97-acceptance-criteria.md) — User-scoped isolation
- [`../../../15-wp-plugin-how-to/14-rest-api-conventions/97-acceptance-criteria.md`](../../../15-wp-plugin-how-to/14-rest-api-conventions/97-acceptance-criteria.md) — REST envelope on deny

---

*Curated 2026-04-25 — closes A-25 (batch 14). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
