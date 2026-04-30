# Data-Export Policy — SSOT

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8)
> **Status:** Active — runtime-agnostic contract
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Closes:** A-43 (data-export policy SSOT)
> **Companion:** [`09-audit-log-policy.md`](./09-audit-log-policy.md), [`10-role-escalation-policy.md`](./10-role-escalation-policy.md), [`12-mfa-policy.md`](./12-mfa-policy.md)

---

## Purpose

Multiple specs reference "export your data" as a feature (item-context-menu, account settings, GDPR portability) without pinning the contract. This SSOT defines:

- Allowed export formats and what each contains
- Scope rules (single item, subtree, workspace, account)
- Throttling, MFA-gating, and request lifecycle
- Redaction rules for shared content (other users' grants must not leak)
- Storage, retention, and download URL signing
- Audit and abuse-detection contract

Without this SSOT, an AI implementer will skip MFA on the export endpoint, leak grantee email addresses, or store exports in the public uploads folder.

---

## 1 — Export Scopes

| Scope | What is included | Who can request | Endpoint |
|-------|------------------|-----------------|----------|
| **Item** | A single item's content + note + metadata | Anyone with `View` or higher on the item | `POST /export/item/{ItemId}` |
| **Subtree** | An item plus its entire descendant subtree | `View` or higher on the root | `POST /export/subtree/{ItemId}` |
| **Workspace** | Every item the requester owns or has access to within one workspace | `Member` or higher | `POST /export/workspace/{WorkspaceId}` |
| **Account** | All workspaces, all items, all comments, all metadata for the requesting user (GDPR Art. 20) | Account holder only | `POST /export/account` |

> **Forbidden:** No endpoint may export another user's `Account` scope, even for `Owner`s. GDPR portability is self-only.

---

## 2 — Allowed Formats

| Format | MIME | Purpose | Includes attachments? |
|--------|------|---------|------------------------|
| **JSON** | `application/json` | Round-trip / re-import; canonical | ❌ (URLs only) |
| **OPML** | `text/x-opml` | Outline interchange (compatible with Workflowy, Dynalist) | ❌ |
| **Markdown** | `text/markdown` | Human-readable; one file per top-level item | ❌ (links only) |
| **HTML** | `text/html` | Rendered view; standalone (inline CSS) | ❌ (img URLs) |
| **ZIP bundle** | `application/zip` | Account / Workspace scope only — combines JSON + Markdown + attachments | ✅ |

### Forbidden formats

| Format | Reason |
|--------|--------|
| **CSV** | Lossy for nested structures; misleading for users |
| **XLSX / DOCX / PDF** | Heavyweight rendering; defer to user's own tooling |
| **SQL dump** | Leaks internal schema, IDs, hash chains |

> **Rule:** New formats require a spec amendment AND addition to `Export\FormatRegistry::ALLOWED`.

---

## 3 — Request Lifecycle

```
                ┌──────────────┐
   user ──────▶ │ POST /export │ ─── 202 Accepted ───▶ JobId
                └──────┬───────┘
                       │ enqueue
                       ▼
              ┌─────────────────┐
              │ ExportJob       │  state: 'Queued'
              │  (SQLite row)   │
              └─────────┬───────┘
                        │ wp-cron worker picks up
                        ▼
                  state: 'Running'
                        │
                        ▼
       ┌──────────────────────────────────┐
       │ build artifact in /wp-content/   │
       │   workflowy-exports/{JobId}/     │
       │ encrypt at rest (AES-256-GCM)    │
       └──────────────┬───────────────────┘
                      ▼
              state: 'Ready'
                      │
                      ├── email user with signed download URL
                      ▼
       user GET /export/download/{JobId}?sig=…
                      │
                      ▼ (single use OR ≤ 7 days)
              state: 'Downloaded' or 'Expired'
                      │
                      ▼ (sweep)
              state: 'Purged'  (file deleted; row kept 365 d for audit)
```

### State table

```sql
CREATE TABLE ExportJob (
    JobId         TEXT PRIMARY KEY,         -- uuid v4
    UserId        INTEGER NOT NULL,
    Scope         TEXT NOT NULL,             -- 'Item' | 'Subtree' | 'Workspace' | 'Account'
    ScopeId       TEXT NULL,                 -- ItemId / WorkspaceId; NULL for Account
    Format        TEXT NOT NULL,             -- 'JSON' | 'OPML' | 'Markdown' | 'HTML' | 'ZIP'
    State         TEXT NOT NULL,             -- 'Queued' | 'Running' | 'Ready' | 'Downloaded' | 'Expired' | 'Failed' | 'Purged'
    Bytes         INTEGER NULL,
    ItemCount     INTEGER NULL,
    EncryptionKey BLOB NULL,                 -- AES-256-GCM key, encrypted with WP_AUTH_KEY-derived
    CreatedAt     TEXT NOT NULL,
    ReadyAt       TEXT NULL,
    DownloadedAt  TEXT NULL,
    ExpiresAt     TEXT NOT NULL,             -- 7 days from ReadyAt
    PurgedAt      TEXT NULL,
    FailureReason TEXT NULL
);

CREATE INDEX idx_EXPORT_user_state ON ExportJob (UserId, State);
CREATE INDEX idx_EXPORT_expires    ON ExportJob (ExpiresAt) WHERE State IN ('Ready','Downloaded');
```

Migration `M-016` (next slot after A-42's `M-015`).

---

## 4 — Throttling

| Limit | Value | Bucket |
|-------|-------|--------|
| Account-scope exports | 1 per **24 h** per user | hard cap; 429 with `RetryAfter` header |
| Workspace-scope exports | 3 per **24 h** per user | hard cap |
| Subtree exports | 20 per **1 h** per user | sliding window |
| Item exports | 200 per **1 h** per user | sliding window |
| Concurrent jobs per user | 1 in `Queued` or `Running` at a time | second request → 409 `ERR_EXPORT_IN_PROGRESS` |

Throttle enforcement uses the **same bucket infrastructure** as `08-api-rate-limiting.md` — no parallel implementation.

### Size guards

| Scope | Soft cap | Hard cap |
|-------|----------|----------|
| Item / Subtree / Workspace | warn at **500 MB**; offer to continue | reject at **2 GB** with `ERR_EXPORT_TOO_LARGE` |
| Account | warn at **2 GB**; require explicit "I understand it may be large" | reject at **10 GB`** |
| ZIP attachment count | warn at 10 000 files | reject at 50 000 with `ERR_EXPORT_TOO_MANY_FILES` |

---

## 5 — MFA Gating

Per `12-mfa-policy.md` §6, all `/export/*` endpoints require **MFA freshness ≤ 5 min**:

| Trigger | Behavior |
|---------|----------|
| First request without fresh MFA | 401 `ERR_MFA_STEP_UP_REQUIRED`, `WwwAuthenticate: WF-StepUp purpose="export"` |
| MFA satisfied → request retried | Job created; download URL also requires the SAME `MfaSatisfiedAt` window |
| Download URL clicked with stale MFA | 401 step-up required; URL not consumed |

> **Rule:** The download URL inherits MFA-freshness from the original request; it does NOT bypass MFA just because the JobId is unguessable.

---

## 6 — Redaction Rules

When exporting items the requester has access to but does not **own**, the following fields are **redacted or replaced** in every format:

| Field | Owner sees | Non-owner sees |
|-------|-----------|----------------|
| `CreatedBy.Id` | Real `UserId` | `"redacted"` |
| `CreatedBy.Email` | Email | `null` |
| `CreatedBy.Name` | Name | `"Member"` (or actual public display name if shared workspace) |
| `Grants[]` (other users on the item) | Full list | Empty array |
| `Comments[].AuthorEmail` | Email | `null` |
| `ActivityLog` entries by other users | Full | Removed |
| `MirrorSources[]` pointing outside requester's access | Full URL/ID | `"out-of-scope"` |
| `IntegrityHash` (audit chain) | Never exported | Never exported |

### Always-redacted fields (regardless of scope/owner)

- Hashed PII from `09-audit-log-policy.md` (audit hash chain stays internal).
- Internal numeric `UserId`s of system actors (only public-display names).
- Server-side derived metadata: `EditDistance`, `SearchVector`, `EmbeddingHash`.
- Soft-deleted items past their 30-day window (already trash-purged).

### Self-export disclosure

In `Account` scope, ALL data the user produced is included with NO redaction of the user's own fields. Other users' fields follow the rules above.

---

## 7 — Download URL Signing

| Property | Value |
|----------|-------|
| URL pattern | `/wp-json/workflowy/v1/export/download/{JobId}?sig={base64url}&exp={unix}` |
| `sig` algorithm | HMAC-SHA256 over `JobId\|exp\|UserId` using `WP_AUTH_KEY` derivative |
| `exp` cap | min(`ReadyAt + 7 d`, `now + 24 h`) — whichever is sooner |
| Single-use? | ❌ — re-downloadable until `exp`, but **every download is audited** |
| Bandwidth limit | **20 MB/s** per IP; abusive download triggers `EXPORT.DOWNLOAD_THROTTLED` audit |
| Range requests | ✅ supported (resume of large ZIP downloads) |
| HTTPS only | ✅ — HTTP request returns 426 `ERR_HTTPS_REQUIRED` |

URLs are sent **only via email** to the user's verified address. No in-app display of the signed URL (prevents shoulder-surfing screenshots from leaking long-lived links).

---

## 8 — Encryption at Rest

(gate **G-22-BOUNDARY-ISOLATION**) Export artifacts live in `wp-content/workflowy-exports/{JobId}/payload.{ext}`. They MUST be:

1. Encrypted with **AES-256-GCM**, per-job random key.
2. The job key itself is encrypted with a `WP_AUTH_KEY`-derived KEK and stored in `ExportJob.EncryptionKey`.
3. Decrypted on-the-fly by the download handler (streaming, no temp plaintext file).
(gate **G-22-BOUNDARY-ISOLATION**) 4. The folder MUST have an `.htaccess` denying direct HTTP access:
   ```
   <IfModule mod_authz_core.c>
       Require all denied
   </IfModule>
   <IfModule !mod_authz_core.c>
       Order deny,allow
       Deny from all
   </IfModule>
   ```
5. On `Purged` state, the file is overwritten with zeros before `unlink()` (best-effort).

---

## 9 — Anti-Abuse Rules

| Rule | Enforcement |
|------|-------------|
| Export-as-scraping | ≥ 3 Account-scope requests in 7 days → flag account; admin review required |
| Cross-user enumeration | If a single user requests subtree exports for items owned by ≥ 50 distinct other users in 24 h → block with `ERR_EXPORT_SCRAPING_SUSPECTED` and audit at `error` |
| Service-account abuse | Bot-like User-Agent + ≥ 100 item exports/h → CAPTCHA challenge; if absent, block |
| Recently-revoked grant | If user lost `View` on item X within last 60 s, X is excluded from any in-flight export (real-time check at artifact-build time, not just request time) |
| Trash inclusion | Soft-deleted items appear in exports with `IsDeleted: true` flag for the OWNER only; never for non-owners |

---

## 10 — Hygiene Gate G-27 (proposed)

| Property | Value |
|----------|-------|
| Gate ID | `G-27` |
| Script | `scripts/spec-hygiene/27-check-export-policy-coverage.mjs` *(numeric prefix matches gate ID; original `17-` slot reserved for `check-cross-references.mjs` G-17)* — algorithm SSOT: [`20-g27-export-coverage-gate.md`](./20-g27-export-coverage-gate.md) |
| Trigger | Pre-commit + CI |

**Checks:**

1. Every `/export/*` route file declares `Mfa::requireFreshness(300)` AND `RateLimit::bucket('export', …)`.
2. No code path writes to `wp-content/workflowy-exports/` without calling `Crypto::aesGcmEncrypt()` first.
3. Every JSON/OPML/Markdown/HTML serializer calls `Redactor::redactForViewer($item, $viewerId)` before emitting fields listed in §6.
4. No `Export\FormatRegistry` addition outside `Export/FormatRegistry.php`.
5. The `wp-content/workflowy-exports/` directory has an `.htaccess` shipped in the plugin's install hook.
6. No download URL is ever logged in `Logger::info()` or returned in any non-email response body.

---

## 11 — Audit Integration

| Event | `Action` | `Severity` | Mandatory `Context` |
|-------|----------|------------|---------------------|
| Export requested | `EXPORT.REQUEST` | `info` | `Scope`, `ScopeId`, `Format`, `JobId` |
| Export job started | `EXPORT.START` | `info` | `JobId` |
| Export job ready | `EXPORT.READY` | `info` | `JobId`, `Bytes`, `ItemCount` |
| Export job failed | `EXPORT.FAILURE` | `warn` | `JobId`, `FailureReason` |
| Export downloaded | `EXPORT.DOWNLOAD` | `info` | `JobId`, `IpHash`, `BytesSent` |
| Download throttled | `EXPORT.DOWNLOAD_THROTTLED` | `warn` | `JobId`, `IpHash` |
| Export expired (no download) | `EXPORT.EXPIRED` | `info` | `JobId` |
| Export purged from disk | `EXPORT.PURGE` | `info` | `JobId` |
| Account-scope exported | `EXPORT.ACCOUNT_SELF` | `warn` | `JobId`, `Bytes` |
| Scraping suspected | `EXPORT.SCRAPING_SUSPECTED` | `error` | `DistinctOwnerCount`, `Window` |

> All 10 codes added to the **v1.2.0 audit-log backfill batch** (combined: A-40 = 10, A-41 = 9, A-42 = 11, A-43 = 10 ⇒ **40 codes total**).

---

## 12 — Acceptance Tests `AT-EXPORT-01..14`

| ID | Given | When | Then |
|----|-------|------|------|
| `AT-EXPORT-01` | User has fresh MFA | `POST /export/item/123 {Format:"JSON"}` | 202 with `JobId`; row inserted in `Queued` |
| `AT-EXPORT-02` | Same as above without fresh MFA | Request | 401 `ERR_MFA_STEP_UP_REQUIRED`; `WwwAuthenticate purpose="export"` |
| `AT-EXPORT-03` | User has 1 job already `Queued` | Second request | 409 `ERR_EXPORT_IN_PROGRESS` |
| `AT-EXPORT-04` | User completed 3 workspace exports today | 4th request | 429 `ERR_EXPORT_RATE_LIMITED` with `RetryAfter` header |
| `AT-EXPORT-05` | Subtree size = 600 MB | Request | 200 with warning attribute; user must re-confirm with `?confirmLarge=true` |
| `AT-EXPORT-06` | Subtree size = 2.5 GB | Request | 413 `ERR_EXPORT_TOO_LARGE` |
| `AT-EXPORT-07` | Job ready, user clicks signed URL within 24 h with fresh MFA | GET | 200 stream; `EXPORT.DOWNLOAD` audit with `IpHash`, `BytesSent` |
| `AT-EXPORT-08` | Job ready, signed URL clicked after `exp` | GET | 410 `ERR_EXPORT_EXPIRED` |
| `AT-EXPORT-09` | Non-owner exports a shared subtree containing other grantees | Inspect output | `Grants[]` is empty; `CreatedBy.Email` is `null`; `CreatedBy.Name` is public display only |
| `AT-EXPORT-10` | User exports own Account scope | Inspect output | All own fields intact; other users' PII redacted per §6 |
| `AT-EXPORT-11` | User loses `View` on item X 30 s into a Subtree job | Job completes | X excluded from artifact; `EXPORT.READY` audit shows reduced `ItemCount` |
| `AT-EXPORT-12` | Single user requests 51 distinct-owner subtrees in 24 h | 51st request | Blocked `ERR_EXPORT_SCRAPING_SUSPECTED`; `EXPORT.SCRAPING_SUSPECTED` audit at `error` |
| `AT-EXPORT-13` | Job in `Ready` state for 8 days, never downloaded | Cron runs | State → `Expired` → `Purged`; file overwritten with zeros then unlinked; `EXPORT.EXPIRED`, `EXPORT.PURGE` audits |
| `AT-EXPORT-14` | Direct HTTP request to `/wp-content/workflowy-exports/abc/payload.zip` | Browser GET | 403 from `.htaccess`; never served; not in `Logger::info` |

---

## 13 — Cross-References

| Reference | Location |
|-----------|----------|
| Parent overview | [`00-overview.md`](./00-overview.md) |
| MFA policy (step-up gate) | [`12-mfa-policy.md`](./12-mfa-policy.md) |
| Audit-log SSOT | [`09-audit-log-policy.md`](./09-audit-log-policy.md) |
| Role-escalation SSOT | [`10-role-escalation-policy.md`](./10-role-escalation-policy.md) |
| Session/token lifecycle | [`11-session-token-lifecycle.md`](./11-session-token-lifecycle.md) |
| API rate limiting (shared buckets) | [`08-api-rate-limiting.md`](./08-api-rate-limiting.md) |
| Error catalogue | [`../../03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md`](../../03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) |

---

## 14 — Keywords

`export` · `gdpr` · `data-portability` · `redaction` · `signed-url` · `encryption-at-rest` · `throttle` · `mfa-gated` · `G-27`

---

## 15 — Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-26 | Initial SSOT — closes A-43. 4 scopes (item/subtree/workspace/account), 5 allowed formats (JSON/OPML/Markdown/HTML/ZIP), CSV/XLSX/PDF/SQL banned, async job lifecycle (Queued → Running → Ready → Downloaded/Expired → Purged), MFA-gated 5-min freshness, signed download URLs (HMAC-SHA256, ≤24h+7d cap, email-only delivery), redaction matrix for non-owner fields, AES-256-GCM at rest with `.htaccess` denial, scraping-detection rules (≥50 distinct owners/24h), throttle table (1 Account/24h, 3 Workspace/24h, 20 Subtree/h, 200 Item/h), size guards (2GB hard, 10GB Account hard), G-27 gate, 14 ATs `AT-EXPORT-01..14`, migration `M-016`, 10 new audit codes for v1.2.0 batch (40 total). |
| 1.0.1 | 2026-04-27 | §10 path correction — implementation slot moved from `17-` (reserved for `check-cross-references.mjs` G-17) to `27-` (matches gate ID). Algorithm SSOT linked: [`20-g27-export-coverage-gate.md`](./20-g27-export-coverage-gate.md). |
