# 97 — Acceptance Criteria — Phase 9 Integrations

> **Version:** 1.0.0
> **Status:** 🚫 Deferred to post-v1 (criteria locked, validation gated on backend choice)
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Coverage Map

| Topic file | AT IDs |
|------------|--------|
| [`01-email-to-workflowy.md`](./01-email-to-workflowy.md) | AT-WF09-EM-01 … 08 |
| [`02-linkedin-import.md`](./02-linkedin-import.md) | AT-WF09-LI-01 … 04 |
| [`03-allowlist-security.md`](./03-allowlist-security.md) | AT-WF09-SEC-01 … 06 |

---

## Email-to-WorkFlowy

| ID | Criterion |
|----|-----------|
| AT-WF09-EM-01 | Bullet context menu shows "Email to this node" entry |
| AT-WF09-EM-02 | Toggling status on mints a 24-char base32 token and displays full address |
| AT-WF09-EM-03 | Inbound mail to a valid token appends a child node whose content matches the email subject |
| AT-WF09-EM-04 | Body paragraphs become grandchild nodes, one per blank-line-separated paragraph |
| AT-WF09-EM-05 | Empty subject falls back to first 80 chars of body |
| AT-WF09-EM-06 | Token rotation invalidates the old token within 60 seconds |
| AT-WF09-EM-07 | Trashing the owner node auto-disables the token |
| AT-WF09-EM-08 | > 60 messages/hour to one token bounces with code `rate_limited` |

---

## LinkedIn Import

| ID | Criterion |
|----|-----------|
| AT-WF09-LI-01 | Settings exposes "Connect LinkedIn" with scope `r_liteprofile r_emailaddress` only |
| AT-WF09-LI-02 | Successful import creates a parent "LinkedIn Profile" node with the documented sub-tree |
| AT-WF09-LI-03 | OAuth token is discarded after import — no persistent connection record stored |
| AT-WF09-LI-04 | Re-import requires explicit append-vs-overwrite choice |

---

## Allow-List & Security

| ID | Criterion |
|----|-----------|
| AT-WF09-SEC-01 | Default mode for new tokens is `owner-only` |
| AT-WF09-SEC-02 | `open` mode is unreachable from any UI surface |
| AT-WF09-SEC-03 | DKIM, SPF, DMARC, and allow-list checks all run; any single failure bounces 550 |
| AT-WF09-SEC-04 | Bounce log surfaces last 30 days with sender + timestamp + reason (no body) |
| AT-WF09-SEC-05 | Account deletion revokes all tokens within the same transaction |
| AT-WF09-SEC-06 | Owner can purge bounce log on demand from Settings |

---

## Validation Gate

These criteria become testable when:

1. Backend runtime is chosen (see `mem://constraints/backend-runtime-deferred`).
2. MX subdomain `in.<app-domain>` is provisioned.
3. LinkedIn developer app is registered with read-only scopes.

Until then this file is the locked acceptance contract — do not modify without re-opening Blocker D-1.

---

## Related

- [`00-overview.md`](./00-overview.md) — Phase 9 parent
- [`99-consistency-report.md`](./99-consistency-report.md) — Folder health
