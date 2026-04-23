# Archive — Phase 2 Search Spec v1.0.0

> **Archived:** 2026-04-23 (UTC+8)
> **Superseded by:** [`../00-overview.md`](../00-overview.md) — Phase 2 v2.0.0
> **Reason:** Surface model changed from full-screen overlay to floating popover.

---

## What changed v1 → v2

| Topic | v1 (archived) | v2 (current) |
|-------|---------------|--------------|
| Surface | Full-screen modal overlay with scrim, ~720px panel anchored 12% from top | Floating popover, ~480px wide, `rounded-2xl`, no scrim |
| Results location | Inside the panel (50 eager + lazy, capped 250) | NOT inside; live-filters underlying outline + `<mark>` highlights + footer pill |
| Right-side icons | Single ✕ clear button | Three icons: ⚡ Quick Actions, ⭐ Saved Searches, ⊗ Clear/Close |
| `has:` value picker | Not specified | Inline listbox sub-menu (note/date/file/image/video/tweet) |
| Quick chips | `today`, `tomorrow`, `me`, `others` | + `yesterday`, `this/next/last week/month` |
| Pin search | Not specified | New (`⌘.` keeps popover open on blur) |
| Saved searches | Deferred to post-v1 | First-class UI; storage adapter TBD per backend choice |

## Preserved from v1 (carried into v2)

- Mirror inclusion toggle (img-58) — preserved as Quick Action item.
- Negation prefix `-` — preserved in grammar.
- Multiple `in:` filters → union exception — preserved.
- Full `is:` enum (todo/complete/starred/shared/mirror/template/heading) — preserved.
- `day-of-week:`, `weekday`, `weekend` values — preserved.
- Recent searches list — preserved as Saved-Searches dropdown section.

## Files in this archive

| File | Original location | Notes |
|------|-------------------|-------|
| `01-overlay.md` | `02-search/01-overlay.md` | Full-screen overlay layout (v1) |
| `02-filter-syntax.md` | `02-search/02-filter-syntax.md` | Original EBNF + 12 keywords (v1) |
| `99-consistency-report.md` | `02-search/99-consistency-report.md` | v1 health report |

## Do NOT edit

This folder is read-only history. All future changes go to the v2 files in the parent folder. If a v1 detail needs to be revived, copy it forward into the appropriate v2 file rather than editing here.
