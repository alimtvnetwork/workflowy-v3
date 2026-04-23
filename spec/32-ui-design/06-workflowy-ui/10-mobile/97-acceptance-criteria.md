# 97 — Acceptance Criteria — Phase 10 Mobile / PWA

> **Version:** 1.0.0
> **Status:** 🚫 Deferred to post-v1 (criteria locked)
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Coverage Map

| Topic file | AT IDs |
|------------|--------|
| [`01-pwa.md`](./01-pwa.md) | AT-WF10-PWA-01 … 07 |
| [`02-share-target.md`](./02-share-target.md) | AT-WF10-SH-01 … 05 |
| [`03-mobile-gestures.md`](./03-mobile-gestures.md) | AT-WF10-GES-01 … 08 |

---

## PWA Installation

| ID | Criterion |
|----|-----------|
| AT-WF10-PWA-01 | Manifest validates against `display: standalone`, `start_url: /`, scope `/` |
| AT-WF10-PWA-02 | All 5 icon sizes (192/256/384/512 + 512 maskable) ship and pass Lighthouse PWA audit |
| AT-WF10-PWA-03 | In-app install banner appears only after 3 sessions or 10 nodes |
| AT-WF10-PWA-04 | Dismissed banner re-appears after 14 days |
| AT-WF10-PWA-05 | iOS users see one-time "Add to Home Screen" tooltip via share button |
| AT-WF10-PWA-06 | Service worker serves app shell offline within 1.5s on cold start |
| AT-WF10-PWA-07 | Update detection surfaces "Reload" toast; user controls reload |

---

## Share Target

| ID | Criterion |
|----|-----------|
| AT-WF10-SH-01 | Installed PWA registers as share target on Android Chrome and desktop Chrome / Edge |
| AT-WF10-SH-02 | POST to `/share` opens Quick Add modal pre-filled with payload |
| AT-WF10-SH-03 | `title + url` payload creates a single linked node |
| AT-WF10-SH-04 | Multi-line text file payload creates one child node per line, max 50 lines |
| AT-WF10-SH-05 | Image file payloads are rejected at launch with informational toast |

---

## Mobile Gestures

| ID | Criterion |
|----|-----------|
| AT-WF10-GES-01 | Tap bullet zooms into node |
| AT-WF10-GES-02 | Long-press bullet (300ms) opens context menu |
| AT-WF10-GES-03 | Horizontal swipe ≥ 40pt indents or outdents |
| AT-WF10-GES-04 | Pinch-spread maps to zoom-out / zoom-in |
| AT-WF10-GES-05 | All tap targets meet 44×44 pt minimum (WCAG 2.5.5) |
| AT-WF10-GES-06 | Floating action bar pins above the on-screen keyboard |
| AT-WF10-GES-07 | Long-press in edit mode does NOT enter multi-select (allows native text handles) |
| AT-WF10-GES-08 | Drag-reorder maintains ≥ 55fps on mid-tier Android |

---

## Validation Gate

These criteria become testable when:

1. PWA build pipeline ships (Vite PWA plugin or equivalent).
2. Service worker is registered.
3. A physical Android device + iOS device are part of the QA matrix.

Until then this file is the locked acceptance contract.

---

## Related

- [`00-overview.md`](./00-overview.md) — Phase 10 parent
- [`99-consistency-report.md`](./99-consistency-report.md) — Folder health
