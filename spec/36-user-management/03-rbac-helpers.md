# RBAC Helpers — Sub-Spec

> **Version:** 1.0.0
> **Created:** 2026-04-30 (UTC+8)
> **Status:** Active — closes §"Pending Sub-Specs" row #03 in [`./00-overview.md`](./00-overview.md).
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Sibling:** [`./02-auth-flow.md`](./02-auth-flow.md) (auth happens BEFORE RBAC; this sub-spec assumes a valid `userId`).
> **Backend:** WordPress plugin + PHP 8.1 + SQLite per `mem://constraints/backend-runtime-deferred`.

---

## Keywords

`rbac` · `has-role` · `require-role` · `security-definer` · `authorization` · `capability-check` · `role-cache` · `auth-helper`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present (parent) | ✅ |
| AI Confidence assigned | ✅ High |
| Ambiguity assigned | ✅ Low |
| Keywords present | ✅ |
| Scoring table present | ✅ |
| Health Score | 92% (A−) |

> **Confidence rationale:** Authoritative — operationalises FR-6 + AT-USERMANAGEMENT-04..06 from parent. Zero new normative MUSTs introduced.

---

## AI Contract (inherits from parent)

This sub-spec **does not introduce new normative MUSTs**. It defines the public API surface for the central RBAC helper required by:

- [`./00-overview.md`](./00-overview.md) FR-5 ("All RBAC checks via central `hasRole`"), FR-6, §"Anti-Patterns" rows 2/5/6, §"Worked Example" §2–§4.
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) `AT-USERMANAGEMENT-04`, `-05`, `-06`.
- [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) `AT-USERMANAGEMENT-04..06` linter commands.

**Expected AI output:**
- PHP class `Auth\Rbac` under `wp-plugin/src/Auth/Rbac.php`.
- SQLite security-definer-equivalent function `has_role` (since SQLite has no `SECURITY DEFINER`, see §4 for the WP-plugin-equivalent pattern).
- React hook `useHasRole(role)` under `src/hooks/useHasRole.ts` — UI-rendering only, never used for elevation.

---

## 1. Public API Surface

### 1.1 PHP backend (load-bearing)

```php
namespace WorkFlowy\Auth;

final class Rbac {
  public static function hasRole(int $userId, AppRole $role): bool;
  public static function requireRole(int $userId, AppRole $role): void;  // throws DomainError(USR-36-02) on miss
  public static function rolesOf(int $userId): array;                     // returns AppRole[]
  public static function grantRole(int $actorId, int $targetId, AppRole $role): void;  // admin-only; emits ActivityEvent
  public static function revokeRole(int $actorId, int $targetId, AppRole $role): void; // admin-only; emits ActivityEvent
}
```

| Method | Bound by |
|---|---|
| `hasRole` | `AT-USERMANAGEMENT-05`, `-06` (DB query, NOT session cache) |
| `requireRole` | parent §"Worked Example" §2 (load-bearing PHP example) |
| `rolesOf` | `EP-ME-ROLES` endpoint contract in parent §"Worked Example" §1 |
| `grantRole` / `revokeRole` | parent §"Anti-Patterns" row 6 (`G-36-NO-SELF-ROLE`); `AT-USERMANAGEMENT-14` (audit emission) |

### 1.2 React frontend (UI-rendering only)

```ts
// src/hooks/useHasRole.ts
export function useHasRole(role: AppRole): boolean;
// Returns the cached value from /me/roles (per-request memo). NEVER used for elevation —
// elevation MUST be re-checked server-side via Rbac::hasRole on every privileged action.
```

> **Forbidden uses of `useHasRole`** [gate: G-36-CLIENT-NO-ROLE]:
> - Gating destructive actions client-side (always re-check server-side).
> - Persisting to `localStorage` / `sessionStorage` / `IndexedDB`.
> - Embedding in JWT/session payload.

---

## 2. Behavioural Contract

### 2.1 `hasRole(userId, role)`

| Aspect | Rule | Source |
|---|---|---|
| Lookup source | `UserRole` table — never session cache for elevation | `AT-USERMANAGEMENT-06` |
| SQL shape | `SELECT 1 FROM UserRole WHERE UserId = ? AND Role = ? LIMIT 1` | parent §"Worked Example" §3 |
| Return type | `bool` (no nullable, no enum) | strict TS / PHP 8.1 typing |
| Side effects | NONE — read-only | — |
| Cache | NONE at this layer — caller may memoize per-request | per-request memo only; no cross-request cache |
| Failure mode | DB unreachable → throws `ServerError(USR-36-06)` | parent §"Error-code registry" |

### 2.2 `requireRole(userId, role)`

```php
public static function requireRole(int $userId, AppRole $role): void {
  if (!self::hasRole($userId, $role)) {
    throw new DomainError(
      code:    ErrorCode::INSUFFICIENT_ROLE,  // USR-36-02
      message: sprintf('Role %s required.', $role->value),
    );
  }
}
```

Every REST handler that requires authorization MUST call `requireRole` as its first executable line after argument validation. The thrown `DomainError` is caught by the central error-mapping middleware and rendered into the canonical envelope:

```json
{
  "Status": "Error",
  "Errors": [
    { "Code": "USR-36-02", "Message": "Role admin required.", "Field": null }
  ]
}
```

with HTTP 403.

### 2.3 `rolesOf(userId)`

Returns the full set of roles a user holds (a user MAY hold multiple per parent §"App Role Enum"). Empty array = no roles assigned (default `user` is implicit and NOT returned by this query — query strictly returns `UserRole` table contents).

### 2.4 `grantRole` / `revokeRole`

| Rule | Enforcement |
|---|---|
| `actorId !== targetId` — self-mutation forbidden | gate `G-36-NO-SELF-ROLE`; throws `ClientError(USR-36-05)` if violated |
| Caller must have `admin` role | internal `requireRole($actorId, AppRole::Admin)` precondition |
| Mutation MUST be wrapped in a transaction with the corresponding `ActivityEvent` insert | `AT-USERMANAGEMENT-14`; gate `G-USER-ADMIN-ACTION-AUDITED` |
| Idempotent on `grantRole` (existing pair → no-op, no duplicate row) | `UNIQUE(UserId, Role)` constraint on `UserRole` |

---

## 3. Capability Resolution (Roles → Capabilities)

The capability matrix in [`./00-overview.md`](./00-overview.md) §"Roles & Permissions Matrix" is the SSOT [gate: G-USER-CAPABILITY-MATRIX-SSOT]. RBAC code MUST resolve a capability check via:

```php
public static function can(int $userId, Capability $cap): bool {
  return match (true) {
    self::hasRole($userId, AppRole::Admin)     => CapabilityMatrix::adminCaps()->contains($cap),
    self::hasRole($userId, AppRole::Editor)    => CapabilityMatrix::editorCaps()->contains($cap),
    self::hasRole($userId, AppRole::User)      => CapabilityMatrix::userCaps()->contains($cap),
    default                                     => false,
  };
}
```

The `CapabilityMatrix::*Caps()` factories are **generated** from `00-overview.md` by `scripts/spec-hygiene/07-extract-contract-map.mjs --capabilities` (per `AT-USERMANAGEMENT-04` linter command). Hand-edited capability maps fail the gate.

### 3.1 Closed `Capability` enum

| Value | Source row in matrix |
|---|---|
| `ReadOwnItems` | row 1 |
| `WriteOwnItems` | row 2 |
| `MirrorOrTemplateOwn` | row 3 |
| `EditSharedAsInvitee` | row 4 |
| `ManageShareInvites` | row 5 |
| `ReviewFeedback` | row 6 |
| `ViewActivityAudit` | row 7 |
| `BulkPurgeTrash` | row 8 |

Adding a row to the matrix WITHOUT adding a `Capability` enum value (or vice-versa) MUST fail `scripts/spec-hygiene/07-extract-contract-map.mjs --capabilities` with `CAP_NOT_IN_MATRIX: <name>`.

---

## 4. Security-Definer Equivalent for SQLite

PostgreSQL's `SECURITY DEFINER` does not exist in SQLite. The WP-plugin-equivalent pattern that satisfies parent §"Worked Example" §3 + Anti-Pattern row 5 (`G-36-HAS-ROLE-DEFINER`) is:

### 4.1 Pattern: PHP-mediated single-callsite

1. The `UserRole` table has **no row-level access control** at the SQLite layer (SQLite has no RLS).
2. Authorization is enforced at the **PHP layer** by routing every read of `UserRole` through `Rbac::hasRole` / `Rbac::rolesOf` — direct `SELECT` from `UserRole` outside the `Auth\Rbac` class is forbidden by gate `G-36-VIA-HAS-ROLE` (PHPStan custom rule).
3. The connection used by `Auth\Rbac::*` is the standard plugin connection — no separate "elevated" connection is required because (a) SQLite has no role-aware connections and (b) the application is single-tenant per user.

### 4.2 Why PostgreSQL's pattern doesn't translate verbatim

The PostgreSQL `SECURITY DEFINER` function (parent §"Worked Example" §3) was preserved in `00-overview.md` as a **pattern reference** because it documents the canonical solution to the RLS-recursion problem. The WP-plugin backend does not use Postgres or RLS — therefore the recursion problem does not arise, and the equivalent guarantee (caller-cannot-bypass-the-helper) is provided by the gate `G-36-VIA-HAS-ROLE` enforced statically at PHPStan time, not at SQL execution time.

> Cross-reference: [`spec/05-split-db-architecture/02-features/04-rbac-casbin/00-overview.md`](../05-split-db-architecture/02-features/04-rbac-casbin/00-overview.md) covers the higher-level authorization framework. This sub-spec covers ONLY the role-membership query primitive.

---

## 5. Forbidden Patterns

The AI MUST NOT [gate: G-36-CLIENT-NO-ROLE, G-36-VIA-HAS-ROLE, G-36-NO-SELF-ROLE]:

| # | Forbidden | Why | Enforcement |
|---|---|---|---|
| 1 | Inline role comparison: `if ($user->role === 'admin')` or `user.role === 'Admin'` | Un-auditable, bypasses central helper, breaks SSOT | `AT-USERMANAGEMENT-05` linter command (rg) |
| 2 | Direct `SELECT … FROM UserRole` outside `Auth\Rbac` class | Bypasses the security-definer-equivalent gate; future schema changes break silently | `G-36-VIA-HAS-ROLE` PHPStan rule |
| 3 | Read role from session payload / JWT claim / cookie content | Stale role survives revocation until token expiry | `G-36-SESSION-MIN`, parent §Anti-Patterns row 4 |
| 4 | Cache `hasRole` result beyond a single REST request | Privilege-elevation race: revoked role still grants access until cache TTL | per-request memo only; no Redis/Memcached/file cache |
| 5 | Allow `grantRole`/`revokeRole` where `actorId === targetId` | Self-elevation = privilege escalation | `G-36-NO-SELF-ROLE` |
| 6 | Hardcode an admin user-id or email in PHP | Lost-credential disaster; no rotation path | `G-36-NO-HARDCODE-ADMIN` (regex) |
| 7 | Use `useHasRole` React hook for destructive action gating | Client-side gates are advisory; server-side `requireRole` is authoritative | code review + parent §Anti-Patterns row 2 |

---

## 6. Worked Example — Endpoint with `requireRole`

```php
// wp-plugin/src/Rest/Admin/PurgeTrashController.php
final class PurgeTrashController extends BaseController {
  public function handle(WP_REST_Request $req): WP_REST_Response {
    $userId = $this->currentUserId();           // from session middleware
    Rbac::requireRole($userId, AppRole::Admin); // ← throws USR-36-02 → HTTP 403 if not admin

    $count = $this->trashService->purgeAll();

    ActivityLog::record(
      eventType:    EventType::TrashPurgedByAdmin,
      actorUserId:  $userId,
      payload:      ['PurgedCount' => $count],
    );

    return $this->envelope(
      status:     'Success',
      attributes: ['PurgedCount' => $count, 'PurgedAt' => Clock::nowIso8601()],
      results:    null,
    );
  }
}
```

Three load-bearing properties demonstrated:
1. `requireRole` is the FIRST executable line after auth resolution (no logic between session-resolution and authorization-check).
2. `ActivityLog::record` runs in the SAME transaction as the mutation (atomicity of audit emission per `AT-USERMANAGEMENT-14`).
3. The response envelope is the canonical PascalCase shape; no role information leaks into `Attributes` or `Results`.

---

## 7. Testing Contract

### 7.1 PHPUnit suite naming

Per parent overview gate G-40 (every test name MUST start with the AT id):

| AT | Test class | Critical assertions |
|---|---|---|
| `AT-USERMANAGEMENT-04` | `AT_USERMANAGEMENT_04_capability_matrix_test` | Capability enum value count == matrix row count; `extract-contract-map.mjs --capabilities` exits 0 |
| `AT-USERMANAGEMENT-05` | `AT_USERMANAGEMENT_05_central_hasrole_test` | `rg "user\.role\s*===\s*'(User\|Editor\|Admin)'" src/` returns no hits; `rg "role\s*===" wp-plugin/src/` returns no hits OUTSIDE `Auth/Rbac.php` |
| `AT-USERMANAGEMENT-06` | `AT_USERMANAGEMENT_06_hasrole_queries_db_test` | Stub session cache to claim role; revoke in DB; assert `Rbac::hasRole` returns false |

### 7.2 Vitest suite naming

| AT | Spec file | Critical assertion |
|---|---|---|
| (UI-side of AT-USERMANAGEMENT-05) | `useHasRole.spec.tsx` | Hook never writes to `localStorage`; calling pattern matches per-request memo |

---

## 8. Out of Scope

- **Authentication** (login, MFA, session management) — owned by [`./02-auth-flow.md`](./02-auth-flow.md).
- **Admin UI surfaces** (invite/deactivate/role-change forms) — owned by sibling [`./04-admin-ui.md`](./04-admin-ui.md) (planned).
- **Per-item ACL evaluation** (sharing model) — owned by `mem://features/sharing-model` + [`spec/31-app/01-features/08-share-dialog.md`](../31-app/01-features/08-share-dialog.md).
- **Activity-event schema** — owned by [`spec/34-activity-feed/00-overview.md`](../34-activity-feed/00-overview.md). This sub-spec only mandates THAT events are emitted, not their shape.
- **Higher-level policy engine** (Casbin-style) — owned by [`spec/05-split-db-architecture/02-features/04-rbac-casbin/00-overview.md`](../05-split-db-architecture/02-features/04-rbac-casbin/00-overview.md).

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Parent overview | [`./00-overview.md`](./00-overview.md) |
| Acceptance criteria | [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) |
| Acceptance fixtures | [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) |
| Auth flow (sibling) | [`./02-auth-flow.md`](./02-auth-flow.md) |
| Admin UI (sibling, planned) | [`./04-admin-ui.md`](./04-admin-ui.md) |
| Activity feed (audit emission target) | [`../34-activity-feed/00-overview.md`](../34-activity-feed/00-overview.md) |
| Sharing model | `mem://features/sharing-model` |
| Higher-level RBAC framework | [`../05-split-db-architecture/02-features/04-rbac-casbin/00-overview.md`](../05-split-db-architecture/02-features/04-rbac-casbin/00-overview.md) |

---

## Related

**In this section:**

- [`./00-overview.md`](./00-overview.md) — Parent overview (RBAC matrix, FR-6)
- [`./02-auth-flow.md`](./02-auth-flow.md) — Authentication (precondition for RBAC)
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) — `AT-USERMANAGEMENT-*`

**See also:**

- [`../05-split-db-architecture/02-features/04-rbac-casbin/00-overview.md`](../05-split-db-architecture/02-features/04-rbac-casbin/00-overview.md) — Authorization framework
- [`../34-activity-feed/00-overview.md`](../34-activity-feed/00-overview.md) — Audit emission target

---

*Authored 2026-04-30 — closes §"Pending Sub-Specs" row 03 in [`./00-overview.md`](./00-overview.md). Zero new normative MUSTs; pure operationalisation of FR-6 + AT-USERMANAGEMENT-04..06.*
