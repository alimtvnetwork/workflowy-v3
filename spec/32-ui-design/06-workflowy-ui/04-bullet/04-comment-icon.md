# Comment Icon & Thread Surface

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-46, 48

---

## Affordance

The comment + icon lives in the **top-right of every row**, mirroring the position of the left ⋯ icon.

| State | Visibility |
|-------|------------|
| No comments + not hovered | Hidden |
| No comments + hovered | + icon, `--muted-foreground` |
| Has comments | 💬 icon + count badge, always visible |
| Has unread comments | 💬 icon + dot indicator, color `--accent` |

---

## Click Behavior

| State | Action |
|-------|--------|
| + (no comments) | Opens new-comment composer inline below row |
| 💬 (existing) | Opens thread panel anchored right side |

---

## Comment Composer (Inline)

When + is clicked, a textarea slides down below the row:

```
[⋯] [●] Parent node content
        ┌────────────────────────────────┐
        │ Add a comment...               │
        │                                │
        │                                │
        │ @mention   [Cancel]  [Comment] │
        └────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Width | matches row content width |
| Min height | 80px, expands with content |
| Placeholder | "Add a comment..." |
| Submit | `⌘↵` or [Comment] button |
| Cancel | `Esc` or [Cancel] button |
| @mention | Triggers people picker (Phase 8 sharing model) |
| Markdown | Supported (bold, italic, code, links) |

---

## Thread Panel (Right Overlay)

When 💬 is clicked, a panel slides in from the right edge:

```
┌─────────────────────────────────┐
│  💬 Comments on "<row title>"   │  ← Header
│                            [✕]  │
├─────────────────────────────────┤
│  Avatar  Name · 2h ago          │
│          Comment body text...   │
│          ↳ Reply                │
│                                 │
│  Avatar  You · 5m ago           │
│          Another comment...     │
│                                 │
├─────────────────────────────────┤
│  [Add a comment...]      [Send] │  ← Sticky composer
└─────────────────────────────────┘
```

| Spec | Value |
|------|-------|
| Width | 400px desktop, full overlay mobile (Phase 10) |
| Position | right-anchored, slides 200ms ease-out |
| z-index | 40 (below modals, above content) |
| Close | ✕, `Esc`, click outside, OR navigate away |
| Distinct from Phase 3 right-panel | Yes — different z-index, different width, different content |

---

## Comment Item Anatomy

| Element | Spec |
|---------|------|
| Avatar | 32×32 round, fallback to initials on `--accent` bg |
| Name | 14px bold, `--foreground` |
| Timestamp | 12px, `--muted-foreground`, relative ("2h ago") |
| Body | 14px, `--foreground`, supports markdown |
| Actions | Reply, Edit (own only), Delete (own only), React (👍 ❤️ 🎉) |
| Indent | Replies indent 24px, max 1 level deep |

---

## Notification Behavior

When a comment mentions @you:
- Row gains 💬 with `--accent` dot indicator until read.
- Inbox special node (Phase 6) gains a counter.
- Mentions special node (Phase 6) lists the comment.

If "Fractal Conversations" setting is OFF (Phase 8 `04-settings.md`), Mentions special node is hidden but inbox counter still works.

---

## Empty State

If no comments exist and user opens thread panel intentionally (rare — usually + button is used):
```
💬 No comments yet
Start the conversation below.
```

---

## Permissions

| User Role | Can View | Can Add | Can Edit Own | Can Delete Own | Can Delete Any |
|-----------|----------|---------|--------------|----------------|----------------|
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |
| Commenter | ✅ | ✅ | ✅ | ✅ | ❌ |
| Editor | ✅ | ✅ | ✅ | ✅ | ❌ |
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ |

Roles defined in Phase 8 sharing model.

---

## Cross-References

- Phase 6 [`06-sidebar/02-special-nodes.md`](../06-sidebar/02-special-nodes.md) — Mentions, Inbox special nodes
- Phase 8 [`08-app-shell/04-settings.md`](../08-app-shell/04-settings.md) — Fractal Conversations toggle
