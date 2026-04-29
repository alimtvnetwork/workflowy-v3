# 01 — Email-to-WorkFlowy

> **Version:** 1.0.0
> **Status:** DEFERRED (post-v1; spec authored, not implemented)
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-54

---

## Purpose

Allow any node to receive content via email. Each node exposes an opt-in inbound address; messages sent to that address are appended as child nodes.

---

## Address Format

```
<node-slug>+<token>@in.<app-domain>
```

| Segment | Purpose | Constraint |
|---------|---------|------------|
| `node-slug` | Human-readable hint (display only) | 1–32 chars, lowercase, `[a-z0-9-]` |
| `token` | Cryptographic identifier | 24 chars, base32, generated server-side |
| `in.<app-domain>` | Inbound MX subdomain | Single domain across the app |

Only the `token` is authoritative. Slug mismatches are accepted (slug is decorative).

---

## Per-Node UI

Reachable from the bullet context menu → **Email to this node** (img-54).

| Element | Behavior |
|---------|----------|
| **Status toggle** | Off by default. Toggling on calls back-end to mint the token. |
| **Address display** | Read-only, with copy-to-clipboard button |
| **Allow-list** | Whitelist of permitted sender email addresses (see [03-allowlist-security.md](./03-allowlist-security.md)) |
| **Format selector** | One of: `plain-text` (default), `markdown`, `html-stripped` |
| **Attachment policy** | One of: `ignore` (default), `link-only` |
| **Rotate token** | Invalidates old address; mints new one |
| **Disable** | Revokes token; preserves allow-list for re-enable |

---

## Inbound Processing Pipeline

| Step | Action | Failure mode |
|------|--------|--------------|
| 1 | MX receives mail to `*+<token>@in.<app-domain>` | Bounce 550 if domain mismatch |
| 2 | Resolve token → owner node | Bounce 550 if token unknown / disabled |
| 3 | Verify SPF + DKIM + sender allow-list | Bounce 550 if any check fails |
| 4 | Strip signatures, quoted replies, tracking pixels | Best-effort heuristics |
| 5 | Apply format conversion (plain / markdown / html-stripped) | Fall back to plain-text on parse error |
| 6 | Append as child node under owner; subject becomes node content; body becomes single child | Atomic insert; on conflict retry once |
| 7 | Emit notification in owner's Mentions feed | Non-blocking |

---

## Subject & Body Mapping

| Email field | Node mapping |
|-------------|--------------|
| Subject | New child node `content` (truncated to 200 chars) |
| Body | Grandchild node under the subject node |
| Multi-paragraph body | One grandchild per paragraph (separator: blank line) |
| Empty subject | Node content = first 80 chars of body |
| Empty body | Subject becomes leaf node (no grandchildren) |

---

## Edge Cases

- **Message > 1 MB** — Reject with bounce 552; suggest link-only attachments.
- **Reply chains** — Only the most recent quoted block is stripped; older quotes preserved.
- **HTML-only mail** — Convert to plain text via tag-stripping; preserve `<a href>` as Markdown links.
- **Disabled node** — Bounce 550 with reason `node_email_disabled`.
- **Trashed node** — Bounce 550 with reason `node_in_trash`.
- **Rate limit** — 60 inbound msgs / token / hour; over-limit messages bounce 421 (try later).

---

## Settings Surface

In **Settings → Integrations → Email-to-WorkFlowy**:

- Global enable / disable (defaults to disabled per workspace)
- Default format for new tokens
- Default attachment policy
- Bounce log (last 30 days)

---

## Related

- [`00-overview.md`](./00-overview.md) — Phase 9 parent
- [`02-linkedin-import.md`](./02-linkedin-import.md) — Sibling integration (deferred)
- [`03-allowlist-security.md`](./03-allowlist-security.md) — Sender verification rules
- [`../06-sidebar/02-special-nodes.md`](../06-sidebar/02-special-nodes.md) — Inbox special node
- [`../08-app-shell/01-app-menu.md`](../08-app-shell/01-app-menu.md) — Settings entry point
