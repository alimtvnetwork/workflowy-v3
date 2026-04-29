# Role-Escalation Policy — SSOT

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8)
> **Status:** Active — runtime-agnostic contract
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Closes:** A-40 (role-escalation policy SSOT)
> **Companion:** [`09-audit-log-policy.md`](./09-audit-log-policy.md), [`../01-features/15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md)

---

## Purpose

`15-roles-and-permissions.md` defines **what** each role can do.
This file defines **how** a higher role is granted, transferred, expired, or revoked — the **lifecycle and control plane** for privileged access.

Three problems this SSOT closes:

1. **No SSOT for grant approval flow.** Single-actor grants of `Admin` / `Owner` are a privilege-escalation surface.
2. **No expiry contract.** Today, `Admin` grants live forever; this violates least-privilege.
3. **No revocation propagation contract.** Sessions, tokens, and event-bus subscribers must fail closed within bounded time.

---

## Scope

| In scope | Out of scope |
|----------|--------------|
| Grant / revoke / transfer of `WorkspaceRole` (`Owner`, `Admin`) | Item-level grants (`View`, `Edit`, `Admin`) — see `15-roles-and-permissions.md` |
| Just-in-time (JIT) elevation requests | Public-link toggling — see `08-share-dialog.md` |
| Expiry, renewal, and auto-revoke timers | Authentication (login, MFA, password) |
| Dual-control / two-person rule for sensitive grants | RBAC on REST endpoints (already covered by `Auth::hasRole`) |
| Revocation propagation deadlines | Audit-log payload schema — see `09-audit-log-policy.md` |

---

## 1 — Grant Classes

| Class | Roles in scope | Example | Approval rule |
|-------|---------------|---------|---------------|
| **L0 — Self-service** | `Member` (workspace invite) | Owner/Admin invites a teammate | Single-actor (inviter only) |
| **L1 — Privileged** | `Admin` (workspace) | Owner promotes Member → Admin | Single-actor (Owner only) + audit + email notify |
| **L2 — Sensitive** | `Owner` transfer | Current Owner transfers ownership to user X | **Dual-control** (see §3) |
| **L3 — Emergency** | `Admin` (JIT, ≤ 4 h) | Support agent needs temporary Admin to debug | **Dual-control** + auto-expiry + tamper-evident audit |

> **Forbidden:** No code path may grant `Owner` synchronously without dual-control. No code path may grant permanent `Admin` without going through L1.

---

## 2 — Lifecycle States

```
                       ┌──────────┐
       request ───────▶│ Pending  │── approve ──┐
                       └────┬─────┘             ▼
                            │ deny         ┌──────────┐
                            ▼              │  Active  │
                       ┌──────────┐        └────┬─────┘
                       │ Denied   │             │
                       └──────────┘             ├── expire (timer) ──▶ Expired
                                                ├── revoke ──────────▶ Revoked
                                                └── transfer ────────▶ (new Active row)
```

| State | Persisted? | Visible in UI? | TTL |
|-------|-----------|----------------|-----|
| `Pending` | ✅ Root DB `RoleEscalationRequest` | ✅ Approver inbox | 24 h, then auto-`Denied` |
| `Denied` | ✅ (kept for audit) | ❌ | Retained 365 d (audit floor) |
| `Active` | ✅ Root DB `WorkspaceMember` | ✅ Members table | Per §4 |
| `Expired` | ✅ (kept for audit) | ❌ | Retained 365 d |
| `Revoked` | ✅ (kept for audit) | ❌ | Retained 365 d |

---

## 3 — Dual-Control Rule (L2 / L3)

A sensitive grant requires **two distinct human actors**, neither of whom is the grantee:

| Actor | Role required | Distinctness rule |
|-------|--------------|-------------------|
| **Requester** | `Admin` or `Owner` | MUST NOT equal grantee (gate `G-24-DC-REQUESTER-DISTINCT`) |
| **Approver** | `Owner` (for L2) / any other `Admin` or `Owner` (for L3) | MUST NOT equal requester AND MUST NOT equal grantee (gate `G-24-DC-APPROVER-DISTINCT`) |

### Anti-collusion constraints

1. Requester and Approver MUST have logged in from **different sessions** (different `SessionId`) — same session → reject with `ERR_ESCALATION_SAME_SESSION` (gate `G-24-DC-DIFFERENT-SESSION`).
2. Approval window: 30 minutes from request creation. Stale requests auto-deny.
3. Approval action MUST re-confirm the approver's password OR a fresh MFA challenge (≤ 5 min old) (gate `G-24-DC-FRESH-AUTH`).
4. The grantee MUST be notified by email **before** the grant becomes `Active` (≥ 60 s grace window for "this wasn't me — cancel" link) (gate `G-24-DC-GRANTEE-PRENOTIFY`).

### Bypass — break-glass

A workspace `Owner` MAY perform an L3 emergency grant **single-handed** if:
- They check the "Break-glass" box (UI explicit).
- A `Critical`-severity audit row is written with reason text (≥ 20 chars).
- Email is sent to **all** other Owners + Admins immediately.
- The grant TTL is forced to ≤ 1 hour (cannot be extended).

This is the **only** sanctioned single-actor path to `Admin`. Any other code path that bypasses dual-control is a bug.

---

## 4 — Expiry & Renewal

| Grant class | Default TTL | Maximum TTL | Renewable? |
|-------------|-------------|-------------|------------|
| L0 `Member` | ∞ (until removed) | ∞ | N/A |
| L1 `Admin` (standing) | 90 days | 365 days | ✅ Owner re-confirms |
| L2 `Owner` transfer | ∞ (atomic swap) | ∞ | N/A |
| L3 `Admin` JIT | 4 hours | 24 hours | ❌ — must re-request |
| L3 break-glass | 1 hour | 1 hour | ❌ |

### Renewal contract

- Renewal of L1 standing `Admin` is itself an L1 action — single-actor (Owner only) + audit row `ROLE_RENEW`.
- Backend MUST send renewal-reminder email at T-7d and T-1d (gate `G-24-RENEW-REMINDER`).
- On expiry, the `WorkspaceMember` row is **moved** to `WorkspaceMemberHistory`; the user is downgraded to `Member` (not removed from workspace).
- A grant cannot be silently extended — every renewal is a new audit row.

### Expiry timer

- Implemented as a SQLite `WHERE ExpiresAt < ?` sweep run by `wp-cron` every **5 minutes** (configurable, min 1 min, max 15 min).
- Expiry MUST be enforced **at request time** as well — `Auth::hasRole()` MUST treat any row with `ExpiresAt < NOW()` as if it doesn't exist, even if the cron sweep is late (gate `G-24-EXPIRY-AT-REQUEST-TIME`).

---

## 5 — Revocation Propagation Deadlines

When a grant is revoked, every layer that caches authorization MUST invalidate within these bounds (gate `G-24-REVOCATION-PROPAGATION-60S`):

| Layer | Deadline | Mechanism |
|-------|----------|-----------|
| **Database row** | Immediate (synchronous transaction) | `UPDATE WorkspaceMember SET RevokedAt=NOW()` |
| **`Auth::hasRole` in-process cache** | ≤ 30 s | LRU TTL = 30 s (no manual invalidation needed) |
| **Active REST tokens** | ≤ 60 s | `TokenRevocationList` table checked per request |
| **SSE / event-bus subscribers** | ≤ 60 s | `auth:revoked` broadcast on `wf:workspace:{id}` channel |
| **Frontend role badge** | ≤ 60 s | Subscribes to `auth:revoked`; forces `window.location.reload()` |
| **Cached share dialogs** | Next open | No proactive invalidation; relies on fresh fetch |

Any revocation that is not visibly enforced within 60 seconds in all layers is a **P0 bug**.

---

## 6 — Audit Integration

Every state transition emits exactly one audit row using the taxonomy from `09-audit-log-policy.md`:

| Transition | `Action` (taxonomy) | `Severity` | Mandatory `Context` keys |
|------------|---------------------|------------|--------------------------|
| Request created | `AUTHZ.ROLE_REQUEST` | `info` | `RequesterId`, `GranteeId`, `Role`, `Scope`, `Reason` |
| Request approved | `AUTHZ.ROLE_APPROVE` | `info` | `RequestId`, `ApproverId` |
| Request denied (manual) | `AUTHZ.ROLE_DENY` | `info` | `RequestId`, `DenierId`, `Reason` |
| Request denied (timeout) | `AUTHZ.ROLE_DENY_TIMEOUT` | `info` | `RequestId` |
| Grant activated | `AUTHZ.ROLE_GRANT` | `warn` | `RequestId`, `GranteeId`, `Role`, `ExpiresAt` |
| Grant renewed | `AUTHZ.ROLE_RENEW` | `info` | `MemberId`, `OldExpiresAt`, `NewExpiresAt` |
| Grant expired | `AUTHZ.ROLE_EXPIRE` | `info` | `MemberId`, `Role` |
| Grant revoked | `AUTHZ.ROLE_REVOKE` | `warn` | `MemberId`, `RevokerId`, `Reason` |
| Owner transfer | `AUTHZ.OWNER_TRANSFER` | `error` | `FromUserId`, `ToUserId`, `WorkspaceId` |
| Break-glass used | `AUTHZ.BREAK_GLASS` | `fatal` | `OwnerId`, `GranteeId`, `Role`, `Reason` |

> All ten action codes MUST be added to `09-audit-log-policy.md` §Action Taxonomy in its next minor version (`v1.1.0`) (gate `G-24-AUDIT-TAXONOMY-COUPLING`).

---

## 7 — Hygiene Gate G-24 (proposed)

| Property | Value |
|----------|-------|
| Gate ID | `G-24` |
| Script | `scripts/spec-hygiene/24-check-role-escalation-coverage.mjs` *(numeric prefix matches gate ID; original `14-` slot taken by `split-oversized-files.mjs`)* |
| Trigger | Pre-commit + CI |
| Exit codes | `0` ok · `1` violation · `2` runner error |

**Checks:**

1. Every code path that mutates `WorkspaceMember.WorkspaceRole` to `Admin` or `Owner` is preceded by a call to `Escalation::approve()` or `Escalation::breakGlass()`.
2. No call to `Escalation::breakGlass()` exists outside `src/Auth/Escalation.php`.
3. Every `RoleEscalationRequest` insert has a matching `ExpiresAt` ≤ 24 h.
4. Every PHP file under `src/Auth/Escalation/` has a sibling `*Test.php`.

Drift output format mirrors G-22 / G-23 (one finding per line, `file:line code message`). Algorithm SSOT: [`17-g24-role-escalation-coverage-gate.md`](./17-g24-role-escalation-coverage-gate.md).

---

## 8 — Acceptance Tests `AT-ESCAL-01..12`

| ID | Given | When | Then |
|----|-------|------|------|
| `AT-ESCAL-01` | Owner promotes Member → Admin (L1) | Single approval | Grant active in ≤ 1 s; audit row `ROLE_GRANT`; renewal reminder scheduled T-7d |
| `AT-ESCAL-02` | Admin tries to promote Member → Admin | Submit | Rejected `ERR_ROLE_FORBIDDEN`; only Owner may grant Admin |
| `AT-ESCAL-03` | Owner-transfer requested by Owner A → user B | A approves and B is the same session | Rejected `ERR_ESCALATION_SAME_SESSION` |
| `AT-ESCAL-04` | Owner-transfer requested; second Owner approves from a different session | Approval submitted within 30 min | Atomic swap; A becomes Member; B becomes Owner; audit `OWNER_TRANSFER` |
| `AT-ESCAL-05` | L3 JIT request created | 31 minutes pass with no approval | Auto-denied; audit `ROLE_DENY_TIMEOUT` |
| `AT-ESCAL-06` | L3 JIT grant active | Grantee acts at T = 3 h 59 m 59 s | Allowed |
| `AT-ESCAL-07` | L3 JIT grant active | Grantee acts at T = 4 h 0 m 1 s | Denied (`Auth::hasRole` returns false even before cron sweep) |
| `AT-ESCAL-08` | Admin grant revoked | Frontend role badge | Reloads within 60 s via `auth:revoked` broadcast |
| `AT-ESCAL-09` | Owner uses break-glass | Reason field 5 chars | Rejected `ERR_BREAKGLASS_REASON_TOO_SHORT` (min 20) |
| `AT-ESCAL-10` | Owner uses break-glass with valid reason | Submit | Grant ≤ 1 h; `Critical` audit; emails sent to all other Owners/Admins |
| `AT-ESCAL-11` | Renewal reminder T-1d | Cron runs | Email sent; second reminder NOT sent if Owner already renewed |
| `AT-ESCAL-12` | Grant expired in DB but cron sweep delayed | User makes request | `Auth::hasRole` denies; sweep cleans the row on next run |

---

## 9 — Storage Schema (Root DB)

```sql
CREATE TABLE RoleEscalationRequest (
    RequestId       INTEGER PRIMARY KEY AUTOINCREMENT,
    WorkspaceId     INTEGER NOT NULL,
    RequesterId     INTEGER NOT NULL,
    GranteeId       INTEGER NOT NULL,
    Role            TEXT    NOT NULL,             -- 'Admin' | 'Owner'
    Scope           TEXT    NOT NULL,             -- 'Workspace' (item-scope is L0/single-actor)
    Reason          TEXT    NOT NULL,             -- ≥ 20 chars for L3/break-glass
    GrantClass      TEXT    NOT NULL,             -- 'L1' | 'L2' | 'L3' | 'BREAK_GLASS'
    State           TEXT    NOT NULL,             -- 'Pending' | 'Active' | 'Denied' | 'Expired' | 'Revoked'
    ApproverId      INTEGER NULL,                 -- NULL until approved
    RequesterSession TEXT   NOT NULL,
    ApproverSession  TEXT   NULL,
    CreatedAt       TEXT    NOT NULL,
    DecidedAt       TEXT    NULL,
    ExpiresAt       TEXT    NULL,                 -- when Active will become Expired
    RevokedAt       TEXT    NULL,
    UNIQUE (WorkspaceId, GranteeId, State)        -- only one Active grant per (workspace, user)
);

CREATE INDEX idx_REQ_state_expires
  ON RoleEscalationRequest (State, ExpiresAt);
```

Migration ID: planned `M-014` (next free slot after current migrations sequence).

---

## 10 — Cross-References

| Reference | Location |
|-----------|----------|
| Parent overview | [`00-overview.md`](./00-overview.md) |
| Roles & capabilities | [`../01-features/15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md) |
| Audit-log SSOT | [`09-audit-log-policy.md`](./09-audit-log-policy.md) |
| Error catalogue | [`../../03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md`](../../03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) |
| `Auth::hasRole` contract | [`../01-features/15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md) §PHP Authorization Helper |

---

## 11 — Keywords

`role-escalation` · `dual-control` · `break-glass` · `JIT` · `privilege` · `expiry` · `revocation` · `G-24`

---

## 12 — Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-26 | Initial SSOT — closes A-40. 4 grant classes, dual-control, expiry timers, revocation deadlines, G-24 gate, 12 ATs. |
| 1.0.1 | 2026-04-27 | §7 path correction — implementation slot moved from `14-` (collision with `split-oversized-files`) to `24-` (matches gate ID). Algorithm SSOT linked: [`17-g24-role-escalation-coverage-gate.md`](./17-g24-role-escalation-coverage-gate.md). |
