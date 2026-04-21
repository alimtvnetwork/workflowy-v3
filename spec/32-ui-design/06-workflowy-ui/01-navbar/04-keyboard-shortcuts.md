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
| `⌘K` | `Ctrl+K` | Open search overlay | Global |
| `⌥←` | `Alt+←` | Focus history: back | Global, when back stack non-empty |
| `⌥→` | `Alt+→` | Focus history: forward | Global, when forward stack non-empty |
| `⌘⇧H` | `Ctrl+Shift+H` | Go to home root | Global |
| `Esc` | `Esc` | Close right panel / search overlay if open | When overlay/panel open |

---

## Conflict rules

| Conflict | Resolution |
|----------|------------|
| `⌘K` while editing a bullet's text | Open search overlay (search wins; editing pauses). |
| `Alt+←` while a text input has selection | Browser default (move cursor). Focus-history shortcut suppressed inside text inputs. |
| `Esc` while a slash menu is open | Close slash menu first. Right panel/search overlay close on a second `Esc`. |

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
