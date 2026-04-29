# 01 — PWA Installation & Manifest

> **Version:** 1.0.0
> **Status:** DEFERRED (post-v1; spec authored, not implemented)
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-57

---

## Goal

Ship WorkFlowy as an installable Progressive Web App so users can launch it from the home screen / dock without going through a browser tab. **No native iOS or Android binaries.**

---

## Manifest Requirements

| Field | Value | Notes |
|-------|-------|-------|
| `name` | `WorkFlowy` | Full name |
| `short_name` | `WorkFlowy` | ≤ 12 chars; used on home screen |
| `start_url` | `/` | Workspace root after install |
| `scope` | `/` | Whole app |
| `display` | `standalone` | No browser chrome |
| `orientation` | `any` | Portrait + landscape |
| `theme_color` | `hsl(var(--background))` | Matches active theme |
| `background_color` | `hsl(var(--background))` | Splash screen |
| `icons` | 192×192, 256×256, 384×384, 512×512 (PNG) + 512×512 maskable | Required by Lighthouse |
| `categories` | `["productivity", "utilities"]` | App-store-style hint |
| `lang` | `en` | Launch language; localized later |

---

## Install Prompt UX

| Trigger | Behavior |
|---------|----------|
| Browser fires `beforeinstallprompt` | Capture event; do **not** show immediately |
| User completes 3 sessions OR creates 10 nodes | Show in-app install banner (top of content area) |
| User dismisses banner | Re-show after 14 days |
| User accepts banner | Call captured event's `prompt()` |
| Install succeeds (`appinstalled` event) | Toast "WorkFlowy installed"; suppress banner forever |

The banner uses the same component family as other top-of-page banners (no custom modal).

---

## Service Worker Scope

| Asset | Cache strategy |
|-------|----------------|
| App shell (HTML, JS, CSS bundles) | `cache-first` with version-keyed SW |
| Static images, fonts | `cache-first` |
| API calls (when backend exists) | `network-first` with offline fallback |
| User-generated content | Persisted via the chosen offline-resilience layer (see `mem://features/offline-resilience`) |

Service worker version-keyed by build hash; old caches purged on activate.

---

## Offline Behavior

When offline:

- Last-loaded outline tree remains fully editable.
- New node creates / edits / re-orders queue locally and replay on reconnect (per `mem://features/offline-resilience`).
- Search runs against the cached tree only (no remote query).
- Status pill in nav bar: `Online` / `Offline` / `Syncing…`

---

## Edge Cases

- **iOS Safari** — Install via "Add to Home Screen" (no `beforeinstallprompt`). Detect iOS; show a one-time tooltip pointing at the share button with steps.
- **Desktop Chrome / Edge** — Install prompt appears in URL bar; in-app banner is the secondary trigger.
- **Firefox / Safari desktop** — No PWA install. Banner suppressed; app still works as a normal web app.
- **Update available** — SW detects new version → toast "Update ready · Reload"; user controls when to reload.

---

## Related

- [`00-overview.md`](./00-overview.md) — Phase 10 parent
- [`02-share-target.md`](./02-share-target.md) — OS-level share integration
- [`03-mobile-gestures.md`](./03-mobile-gestures.md) — Touch interaction model
