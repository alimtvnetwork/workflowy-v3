# 02 — Share Target API

> **Version:** 1.0.0
> **Status:** DEFERRED (post-v1; spec authored, not implemented)
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Goal

Once installed as a PWA, WorkFlowy appears in the OS share sheet so users can send text, URLs, or images from any other app directly into a node.

---

## Manifest Entry

```json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        { "name": "files", "accept": ["image/*", "text/*"] }
      ]
    }
  }
}
```

---

## /share Route Behavior

| Step | Action |
|------|--------|
| 1 | Service worker intercepts POST to `/share` |
| 2 | Parse FormData → `{ title, text, url, files[] }` |
| 3 | If app already open, navigate to **Quick Add modal** pre-filled with payload |
| 4 | If app cold-started, deferred-open Quick Add after first paint |
| 5 | User chooses target node (default: Inbox) and confirms |
| 6 | Node created with mapped content (see Mapping table) |
| 7 | Toast "Added to <node-name>" |

---

## Payload Mapping

| Share field | Node mapping |
|-------------|--------------|
| `title` only | Single node, content = title |
| `text` only | Single node, content = first 200 chars; remainder as child note |
| `url` only | Single node, content = URL; rendered as link badge |
| `title` + `url` | Single node, content = title with link to URL |
| `title` + `text` + `url` | Parent node = title; children = text excerpt + URL link |
| `files[]` (image) | Skipped at launch — show toast "Image sharing coming soon"; payload discarded |
| `files[]` (text) | Read as UTF-8; create one child node per non-empty line (max 50 lines) |

---

## Edge Cases

- **No payload** — Open Quick Add empty.
- **Payload > 64 KB** — Truncate text portion; toast warning.
- **Multiple files** — Process first matching text file; ignore rest.
- **Share while logged out** — Defer payload to local storage; replay after login.
- **Sharing to a trashed Inbox** — Auto-restore Inbox node before insert.

---

## Platform Coverage

| Platform | Status |
|----------|--------|
| Android Chrome (PWA installed) | ✅ Full support |
| Desktop Chrome / Edge (PWA) | ✅ Full support |
| iOS Safari | ❌ Not supported by browser |
| Firefox | ❌ Not supported by browser |

When unsupported, the app does not advertise as a share target — no UI surface to expose.

---

## Related

- [`00-overview.md`](./00-overview.md) — Phase 10 parent
- [`01-pwa.md`](./01-pwa.md) — Manifest + install prompt
- [`../07-calendar/02-quick-add-modal.md`](../07-calendar/02-quick-add-modal.md) — Quick Add modal reused as share-target sink
