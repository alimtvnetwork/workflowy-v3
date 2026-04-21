# Settings Panel

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-58 (Fractal Conversations toggle)
> **Trigger:** App menu → Settings, or hotkey `⌘,`

---

## Layout

```
┌──────────────────────────────────────────┐
│  ⚙ Settings                        [✕]   │  ← Header
├──────────┬───────────────────────────────┤
│ ▼ General │  Appearance                   │
│   Acct    │  ─────────────────────────── │
│   Sync    │  Theme    [☀ Light][🌙][💻]   │
│ ▼ Appear  │  Font size [Small ▾]          │
│ ▼ Editor  │                               │
│   Notif   │  Editor                       │
│ ▼ Adv     │  ─────────────────────────── │
│   About   │  Markdown shortcuts    [✓]   │
│           │  Auto-complete dates   [✓]   │
│           │  Fractal Conversations [✓]   │
│           │                               │
└──────────┴───────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Modal width | 720px desktop, 92vw mobile (Phase 10) |
| Modal height | 80vh, scrollable |
| Sidebar (left) | 200px, sticky |
| Content (right) | flex, 24px padding |
| z-index | 50 |
| Animation | 150ms fade + 8px slide-up |
| Close | ✕, Esc, click outside |

---

## Section Inventory

### General
- **Account** — name, email, avatar (display only in v1; edit post-v1)
- **Language** — English (only option v1, disabled dropdown)
- **Time zone** — auto-detected, override dropdown

### Sync (placeholder, post-v1)
- "Sync coming soon" message
- Currently all data local

### Appearance
- **Theme** — segmented control: Light / Dark / System (default System)
- **Font size** — dropdown: Small (12px body) / Medium (14px, default) / Large (16px) / XL (18px)
- **Reduce motion** — toggle (respects OS `prefers-reduced-motion`)

### Editor
- **Markdown shortcuts** — toggle (default ON) — enables `# `, `> ` etc. (Phase 5)
- **Auto-complete dates** — toggle (default ON) — natural language parsing of `@today`, `@tomorrow`
- **Fractal Conversations** — toggle (default ON) — when OFF, hides Mentions + Drafts sidebar items
- **Default item type** — dropdown: Bullet (default) / To-do / Paragraph
- **Smart quotes** — toggle (default OFF) — converts `"` → `"`/`"`

### Notifications (placeholder)
- "Notifications require sync (post-v1)"
- Settings disabled

### Advanced
- **Storage usage** — shows local DB size (informational)
- **Export all data** — button, downloads `workflowy-export-YYYY-MM-DD.json`
- **Import data** — button, accepts `.opml` or `.json`
- **Reset all settings** — button with confirmation, restores defaults
- **Clear local data** — button with confirmation, wipes everything (danger zone, red)

### About
- App version (e.g., "WorkFlowy 1.0.0")
- Build hash
- Open source licenses link
- Terms of Service link
- Privacy Policy link

---

## Fractal Conversations Toggle Detail

This is the most consequential setting:

| State | Effect |
|-------|--------|
| ON (default) | Mentions + Drafts visible in sidebar (Phase 6) |
| OFF | Mentions + Drafts hidden; existing data preserved |

When toggled OFF:
- Existing mentions/drafts data is NOT deleted.
- Sidebar items hide immediately.
- Counter badges suppressed.

When toggled ON again:
- Items reappear with current counts.
- No data migration needed.

Confirmation when turning OFF if user has unread mentions:
```
You have 3 unread mentions.
Hide Mentions & Drafts anyway?
[Cancel]  [Hide]
```

---

## Persistence

| Setting | Storage Key |
|---------|-------------|
| Theme | `workflowy.theme` |
| Font size | `workflowy.fontSize` |
| Reduce motion | `workflowy.reduceMotion` |
| Markdown shortcuts | `workflowy.markdownShortcuts` |
| Auto-complete dates | `workflowy.autoDate` |
| Fractal Conversations | `workflowy.fractalConv` |
| Default item type | `workflowy.defaultItemType` |
| Smart quotes | `workflowy.smartQuotes` |
| Time zone | `workflowy.timezone` |

All stored in `localStorage`. No backend dependency (runtime-agnostic).

---

## Reset to Defaults

Per-section "Reset" buttons available:
- Each section has small "Reset section" link at bottom-right.
- Advanced → "Reset all settings" wipes ALL preferences (not data).

Confirmation required for any reset action.

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move between settings |
| Space | Toggle checkboxes/switches |
| Esc | Close modal |
| ⌘W | Same as Esc |
| ↑ / ↓ in left sidebar | Navigate sections |

---

## Cross-References

- `02-themes.md` — Theme details
- `03-fonts.md` — Font scale used by Font size setting
- Phase 5 [`05-editor/06-markdown-shortcuts.md`](../05-editor/06-markdown-shortcuts.md) — Toggle controls these
- Phase 6 [`06-sidebar/02-special-nodes.md`](../06-sidebar/02-special-nodes.md) — Fractal Conversations effect
