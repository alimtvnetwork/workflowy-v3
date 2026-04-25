# 4. Keyboard Shortcuts (Navbar Scope)

> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Reference:** `60-left-menu-button.png`, `65-hotkeys-list.png`

---

## Scope

This file lists shortcuts whose **primary effect is on the navbar or focus navigation**. The full app-wide hotkey table lives in [`../03-right-panel/02-hotkeys.md`](../03-right-panel/02-hotkeys.md) (Phase 3).

---

## Shortcut table

| Shortcut (Mac) | Shortcut (Win/Linux) | Action | Context |
|----------------|----------------------|--------|---------|
| `⌃L` | `Ctrl+L` | Toggle left sidebar offcanvas | Global |
| `⌘/` | `Ctrl+/` | Toggle right-side panel (Handbook/Hotkeys) | Global |
| `⌘K` | `Ctrl+K` | Open Search Popover (canonical — Phase 2 v2.0.0) | Global |
| `⌘F` | `Ctrl+F` | Open Search Popover (legacy alias) | Global |
| `⌥←` | `Alt+←` | Focus history: back | Global, when back stack non-empty |
| `⌥→` | `Alt+→` | Focus history: forward | Global, when forward stack non-empty |
| `⌘⇧H` | `Ctrl+Shift+H` | Go to home root | Global |
| `Esc` | `Esc` | Close right panel / Search Popover if open | When popover/panel open |

> The Search Popover is anchored to the navbar Search button on desktop and renders as a bottom sheet on viewports < 640px (see Phase 2 [`../02-search/09-states-and-edge-cases.md`](../02-search/09-states-and-edge-cases.md) § Mobile).

---

## Conflict rules

| Conflict | Resolution |
|----------|------------|
| `⌘K` while editing a bullet's text | Open Search Popover (search wins; editing pauses, content preserved). |
| `Alt+←` while a text input has selection | Browser default (move cursor). Focus-history shortcut suppressed inside text inputs. |
| `Esc` while a slash menu is open | Close slash menu first. Right panel/Search Popover close on a second `Esc`. |
| `Esc` while Search Popover is `pinned` | Does NOT close (per Phase 2 [`../02-search/04-right-action-icons.md`](../02-search/04-right-action-icons.md) § Pin). |

---

## Discoverability

- Hovering the `≡` left-menu button shows a tooltip card with the shortcut hint (img-60).
- Hovering any right-region icon shows a tooltip with the shortcut.
- All shortcuts are also documented in the right-side Hotkeys panel (Phase 3).

---

## Out of scope

- Bullet-level shortcuts (Tab/Shift+Tab, Enter, ⌘↑/↓ to move) → Phase 4 (`../04-bullet/`) and Phase 5 (`../05-editor/`).
- Quick Add `⌘⇧N` → Phase 7 (`../07-calendar/02-quick-add-modal.md`).
- Slash menu and selection toolbar shortcuts → Phase 5.
- Full ~30-entry hotkey reference → Phase 3 (`../03-right-panel/02-hotkeys.md`).
