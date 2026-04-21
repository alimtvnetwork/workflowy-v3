# What's New Panel

> **Parent:** [`00-overview.md`](./00-overview.md)  
> **Placement:** Section at bottom of Handbook tab (Option C default)

---

## Placement Options (Decision Needed)

| Option | Location | Trade-off |
|--------|----------|-----------|
| A | Separate third tab | Clean separation; adds tab cognitive load |
| B | Nested inside Handbook | Contextual but hidden until expanded |
| C | Section at Handbook bottom | ✅ **Default** — always visible, scroll-to-reveal |

Current spec follows **Option C** pending user override.

---

## Section Layout (Option C)

```
┌─────────────────────────────────────┐
│  📰 What's New          [Mark Read] │  ← Header + action
├─────────────────────────────────────┤
│  ••• (unread indicator dots)       │
│                                     │
│  [Date badge: Apr 2025]             │
│  ▼ Mirror Links — Now Available!    │
│    Mirror linked nodes across your    │
│    entire WorkFlowy. One change,      │
│    everywhere synced.                 │
│    [👍 234]  [👎 12]  [Learn more →]  │
│                                     │
│  [Date badge: Mar 2025]             │
│  ▶ Board View — Beta                  │
│                                     │
│  ─────────────────────────────────  │
│  [View full history →]              │
└─────────────────────────────────────┘
```

---

## Entry Anatomy

Each What's New entry contains:

| Element | Spec |
|---------|------|
| Date badge | Month Year format, `--muted` background, pill shape |
| Title | H5 bold, collapsible ▶/▼ |
| Body | 2–3 lines max, `--foreground` 14px |
| Screenshot/GIF | 16:9, rounded 8px, shadow, autoplay muted loop |
| Feedback | 👍 / 👎 icon buttons with counts |
| CTA | "Learn more →" link (opens Handbook entry) or "Try it" (triggers feature) |

---

## Read State

| State | Visual |
|-------|--------|
| Unread | Bold title, colored left border (`--accent`), • dot in header |
| Read | Normal weight, no border, counts remain |
| Expanded | ▼ + full body + media + feedback visible |
| Collapsed | ▶ + title only |

---

## Feedback Mechanism

- **👍 / 👎:** Anonymous click, increment counter, disable both buttons after vote.
- **No comments:** Feedback is binary only (avoids moderation complexity).
- **Aggregation:** Counts stored locally until sync backend chosen (Phase 9+).

---

## Pro Upsell Integration

Entries tagged `[Pro]` show gold/yellow badge. Clicking "Learn more" scrolls to WorkFlowy Pro section in Handbook.

Example:
```
[Pro] Unlimited Mirrors — New!
Break the 100-mirror limit with Pro.
[👍 89] [👎 3] [Upgrade →]
```

---

## Data Source

Static JSON shipped with bundle:

```json
{
  "version": "2025.04.15",
  "entries": [
    {
      "id": "mirror-links-2025-04",
      "date": "2025-04-15",
      "title": "Mirror Links — Now Available!",
      "body": "Mirror linked nodes across your entire WorkFlowy...",
      "media": "mirror-demo.gif",
      "isPro": false,
      "handbookRef": "03-advanced-features/02-mirroring.md",
      "votes": { "up": 234, "down": 12 }
    }
  ]
}
```

Runtime-agnostic: no API required for display; voting deferred until backend chosen.

---

## Empty State

If no entries (or all marked read + hidden):
```
📭 You're all caught up!
Check back later for new features and improvements.
```

---

## Cross-References

- Phase 8 [`08-app-shell/01-app-menu.md`](../08-app-shell/01-app-menu.md) — "What's New" badge on app menu icon when unread entries exist
- Phase 3 [`01-handbook-content.md`](./01-handbook-content.md) — Handbook sections referenced by `handbookRef`
