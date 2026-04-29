# 03 — Allow-List & Sender Security

> **Version:** 1.0.0
> **Status:** DEFERRED (post-v1; spec authored)
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Goal

Prevent unsolicited or spoofed mail from creating nodes via Email-to-WorkFlowy.

---

## Allow-List Rules

| Mode | Behavior | Default |
|------|----------|---------|
| `owner-only` | Only the node owner's verified account email | ✅ Default for new tokens |
| `explicit-list` | Owner provides a list of permitted addresses (max 25) | Opt-in |
| `domain-list` | Owner provides domain wildcards (e.g., `@example.com`, max 10) | Opt-in |
| `open` | Anyone with the token can send | ❌ Disallowed at app level |

`open` mode is intentionally absent — the token is not a sufficient secret on its own, since email addresses are routinely logged by intermediaries.

---

## Authentication Layers

Every inbound message must pass **all** of:

1. **DKIM** — valid signature aligned with `From:` domain.
2. **SPF** — `pass` for the connecting IP.
3. **DMARC** — at least `quarantine` policy honored; `none` is rejected.
4. **Allow-list** — sender's `From:` matches the node's allow-list rule.

Any single failure → bounce 550 with reason code (see table below).

---

## Bounce Reason Codes

| Code | Meaning | User-visible? |
|------|---------|---------------|
| `dkim_fail` | DKIM signature missing or invalid | Logged only |
| `spf_fail` | SPF check failed | Logged only |
| `dmarc_fail` | DMARC policy violated | Logged only |
| `sender_not_allowed` | Sender not in allow-list | Logged + soft-notify owner |
| `node_email_disabled` | Token disabled | Bounced to sender |
| `node_in_trash` | Owner node trashed | Bounced to sender |
| `rate_limited` | > 60 msgs/hour | Bounced to sender |
| `payload_too_large` | > 1 MB | Bounced to sender |

Bounce log surfaces the last 30 days of attempts in **Settings → Integrations → Bounce log**.

---

## Token Lifecycle

| Event | Effect |
|-------|--------|
| Token created | Active immediately; 24-char base32; not displayed after first reveal |
| Token rotated | Old token rejected within 60s; new token replaces it |
| Token disabled | Allow-list preserved; can be re-enabled (mints new token) |
| Owner deletes account | All tokens immediately revoked |
| Node moved to trash | Token auto-disabled; re-enabled if node restored |

---

## Privacy

- Inbound message bodies are stored only as the resulting node tree — original raw email is discarded after processing.
- Bounce log retains only metadata (sender, timestamp, reason) — no body, no subject.
- Owner can purge bounce log on demand.

---

## Related

- [`00-overview.md`](./00-overview.md) — Phase 9 parent
- [`01-email-to-workflowy.md`](./01-email-to-workflowy.md) — Inbound pipeline that enforces these rules
