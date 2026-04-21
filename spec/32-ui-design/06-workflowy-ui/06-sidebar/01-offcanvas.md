# Sidebar Offcanvas Behavior

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-60, 61, 62
> **Component:** shadcn `Sidebar` with `collapsible="offcanvas"`

---

## States

| State | Visual | Trigger to enter |
|-------|--------|------------------|
| Closed (default) | Hidden, only ≡ button visible in navbar | Initial load |
| Open | Slides in from left edge, 280px wide | ≡ click OR `⌘L` |
| Hover-preview | Small floating card next to ≡ | Hover on ≡ when closed |

---

## Open Animation

| Property | Value |
|----------|-------|
| Direction | Left → right slide |
| Width | 280px (desktop), 100vw (mobile — Phase 10 deferred) |
| Duration | 200ms |
| Easing | `ease-out` |
| Backdrop | Semi-transparent scrim (`--background/60`), 8px blur |
| z-index | 40 (below modals at z-50, above content) |

---

## Close Triggers

| Trigger | Behavior |
|---------|----------|
| Click ≡ button again | Toggle close |
| `⌘L` / Ctrl+L | Toggle close |
| `Esc` key | Close |
| Click on backdrop scrim | Close |
| Click sidebar item that navigates | Close (after navigation) |
| Click sidebar item that's a destination only (e.g., expand) | Stay open |

---

## Layout (when Open)

```
┌──────────────────────────────────┐
│  [Avatar] User Name           ⚙  │  ← Header
├──────────────────────────────────┤
│  📅  Today                       │
│  🏠  Home                        │
│  📥  Inbox                  [3]  │  ← Counter badge
│  📝  Drafts                      │
│  💬  Mentions               [1]  │
│  📅  Calendar                    │
│  🗑  Trash                       │
├──────────────────────────────────┤
│  ➕  New node                    │
└──────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Header height | 56px |
| Avatar | 32×32 round |
| Item row | 40px height, 12px horizontal padding |
| Item icon | 20×20, `--muted-foreground`, 12px right margin |
| Item label | 14px, `--foreground` |
| Counter badge | Right-aligned, 11px, `--accent` bg, white text, pill shape |
| Active item | `--accent` background, `--accent-foreground` text |
| Hover | `--muted/60` background |
| Divider | 1px `--border`, 8px vertical margin |

---

## Hover Preview Card (≡ Button)

When sidebar is **closed** and user hovers ≡:

```
┌────────────────────────────────┐
│  [Avatar] User Name            │
│  ─────────────────────────────│
│  📅 Today    🏠 Home           │
│  📥 Inbox(3) 💬 Mentions(1)    │
│  ⌘L to open sidebar             │
└────────────────────────────────┘
```

| Spec | Value |
|------|-------|
| Position | Below ≡ button, 8px gap |
| Width | 240px |
| Delay | 500ms hover delay (avoids accidental triggers) |
| Dismiss | Pointer leaves button OR card |
| Click on item in card | Navigates AND opens full sidebar |
| Animation | 100ms fade-in |

---

## Settings Gear (Header Top-Right)

Clicking ⚙ opens app menu (Phase 8 `01-app-menu.md`).

---

## Sidebar Customization

> **Out of scope for v1.** Default 8 items are fixed. Future versions may allow custom pinned nodes; not in initial spec.

---

## Cross-References

- `02-special-nodes.md` — what each item does
- `03-drag-drop.md` — drop targets defined per item
- Phase 1 [`01-navbar/01-layout.md`](../01-navbar/01-layout.md) — ≡ button placement
