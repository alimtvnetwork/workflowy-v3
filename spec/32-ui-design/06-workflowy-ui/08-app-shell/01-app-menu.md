# App Menu (⋮)

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-45 (order locked)
> **Trigger:** Click ⋮ in navbar top-right (Phase 1)

---

## Menu Order (LOCKED — from img-45)

| # | Item | Icon | Shortcut | Notes / Submenu |
|---|------|------|----------|-----------------|
| 1 | What's New | 📰 | — | Opens right panel (Phase 3) on What's New section. Badge shown if unread entries. |
| 2 | Learn | 🎓 | — | Opens right panel → Handbook tab |
| 3 | Get Apps | ⤓ | — | External link to download page |
| 4 | — divider — | | | |
| 5 | Pin to home | 📌 | — | Pin current zoomed node as Home (replaces root view) |
| 6 | Share | ↗ | — | Opens share dialog (sharing model — Phase 8 separate doc) |
| 7 | Integrations | 🔌 | — | Submenu: Email-to-Workflowy (Phase 9 — disabled until shipped) |
| 8 | Handbook | 📖 | ⌘/ | Same as Learn (alias) |
| 9 | — divider — | | | |
| 10 | Undo | ↶ | ⌘Z | Disabled if no undo history |
| 11 | Redo | ↷ | ⌘⇧Z | Disabled if no redo |
| 12 | Save now | 💾 | ⌘S | Force-flush autosave (visual reassurance only) |
| 13 | — divider — | | | |
| 14 | Expand all | ▾▾ | — | Recursive expand at current view |
| 15 | Collapse all | ▸▸ | — | Recursive collapse at current view |
| 16 | — divider — | | | |
| 17 | Print | 🖨 | ⌘P | Browser print dialog |
| 18 | Export | ⤓ | — | Submenu: Plain text, Markdown, OPML, JSON |
| 19 | Download all (.zip) | 📦 | — | Full-tree backup |
| 20 | — divider — | | | |
| 21 | Settings | ⚙ | ⌘, | Opens Settings panel (`04-settings.md`) |
| 22 | Help & feedback | ❓ | — | Opens external feedback link |
| 23 | Report a bug | 🐛 | — | Pre-filled bug-report email link |
| 24 | — divider — | | | |
| 25 | Trash | 🗑 | — | Routes to Trash special node (same as sidebar item) |
| 26 | Log out | ⏻ | — | Confirmation: "Log out of WorkFlowy?" |

---

## Visual Treatment

| Element | Token / Style |
|---------|---------------|
| Menu container | `--popover` bg, `--border` 1px, 8px radius, shadow-lg |
| Item row | 36px height, 12px horizontal padding |
| Icon | 16×16, `--muted-foreground` |
| Label | 14px, `--foreground` |
| Shortcut | Right-aligned, 11px monospace, `--muted-foreground` |
| Hover | `--accent` background, `--accent-foreground` text |
| Divider | 1px line `--border`, 4px vertical margin |
| Width | min 240px, max 320px |
| Anchor | Below ⋮ button, right-aligned |

---

## Submenus

Items 7 (Integrations) and 18 (Export) open submenus on hover/click:

### Integrations submenu
- Email-to-Workflowy — disabled until Phase 9 ships, shows "Coming soon"
- LinkedIn — disabled until Phase 9 ships
- Webhooks — post-v1

### Export submenu
- Export as Plain text (.txt)
- Export as Markdown (.md)
- Export as OPML (.opml)
- Export as JSON (.json)

Submenu position: opens to the left (since main menu is right-anchored).

---

## Badges

| Item | Badge Condition |
|------|-----------------|
| What's New | Unread What's New entries (Phase 3) |
| Trash | Counter if items in trash (matches sidebar) |
| Settings | Red dot if any "needs attention" setting (e.g., expired session) |

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| ↑ / ↓ | Move selection (skip dividers) |
| Enter | Confirm |
| Esc | Close menu |
| → | Open submenu (if any) |
| ← | Close submenu |

---

## Disabled States

| Item | Disabled When |
|------|---------------|
| Undo | No undo history |
| Redo | No redo history |
| Save now | Already saved, no pending changes |
| Pin to home | Already at root |
| Integrations submenu items | Until Phase 9 ships |

Disabled items: 40% opacity, no hover effect, cursor `not-allowed`.

---

## Cross-References

- Phase 1 [`01-navbar/01-layout.md`](../01-navbar/01-layout.md) — ⋮ button placement
- Phase 3 [`03-right-panel/`](../03-right-panel/00-overview.md) — Handbook + What's New
- `04-settings.md` — Settings panel
