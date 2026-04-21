# Quick Add Modal

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Hotkey:** `⌘⇧N` (Cmd+Shift+N on macOS, Ctrl+Shift+N elsewhere)

---

## Purpose

Lightweight global capture modal — adds a node to Inbox without disrupting the current view. Optimized for speed (open → type → submit < 3 seconds).

---

## Trigger

| Trigger | Behavior |
|---------|----------|
| Hotkey `⌘⇧N` | Opens modal from any context (incl. while editing) |
| "+ New node" button in sidebar | Opens modal |
| Click [+] in Today view empty state | Opens modal pre-set to "Today" target |

---

## Layout

```
┌──────────────────────────────────────┐
│  ➕ Quick Add to Inbox          [✕]   │  ← Header
├──────────────────────────────────────┤
│                                      │
│  [textarea: type your note...]       │  ← Auto-focused
│                                      │
│                                      │
│  📥 Inbox ▾    [+ Add another]  [↵] │  ← Footer
└──────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Modal width | 560px desktop, 92vw mobile (Phase 10) |
| Modal max-height | 60vh |
| Backdrop | `--background/60`, 8px blur |
| Border radius | 12px |
| z-index | 50 |
| Animation | 150ms ease-out fade + 8px slide-up |
| Position | Centered horizontally, 20vh from top |

---

## Textarea

| Property | Value |
|----------|-------|
| Min rows | 3 |
| Max rows | 12 (then scroll) |
| Auto-focus | YES, on open |
| Placeholder | "Type your note..." |
| Font | Inter 16px |
| Markdown shortcuts | YES (Phase 5) |
| Slash menu | NO (out of scope for Quick Add — keeps it fast) |

---

## Target Picker (`📥 Inbox ▾`)

Default target = **Inbox**. Click chevron to change:

| Target Option | Behavior |
|---------------|----------|
| Inbox (default) | Append to Inbox special node |
| Today | Append + set `date = today` |
| Drafts | Append + set `isDraft = true` |
| Last visited node | Append as child of most-recently-zoomed node |

Selection persists for the duration of the modal session only (resets to Inbox on close/reopen).

---

## Submit Behaviors

| Action | Behavior |
|--------|----------|
| Click [↵] button | Submit, close modal |
| Press Enter (no modifier) | Submit, close modal |
| Press Shift+Enter | Insert newline in textarea (multi-line note) |
| Press ⌘Enter | Submit, **keep modal open**, clear textarea (rapid capture) |
| Click [+ Add another] | Same as ⌘Enter |
| Press Esc | Discard input + close modal (with unsaved-warning toast if content) |

---

## Multi-Submit Mode (⌘Enter / + Add another)

After rapid-capture submit:
- Modal stays open.
- Textarea clears + refocuses.
- A small toast appears at bottom: "Added '<first 32 chars>' ✓ — total: N items".
- Counter persists until modal closes.

---

## Validation

| Case | Behavior |
|------|----------|
| Empty submit | [↵] disabled; Enter does nothing |
| Whitespace-only | Trimmed to empty → disabled |
| Content > 5000 chars | Soft warning: "Long note — consider splitting"; submit still allowed |
| Network/sync failure (future) | Toast: "Saved locally; will sync when online." |

---

## Esc with Unsaved Content

If user presses Esc while textarea has content:

```
Discard your note?
[Cancel]  [Discard]
```

Default focus on Cancel (avoids accidental loss).

---

## Result Confirmation

After submit (and modal close):
- Toast at bottom-left: "Added to Inbox" with [Open Inbox] action.
- Toast auto-dismisses after 4s.
- If multi-submit: "Added 3 items to Inbox" with action.

---

## Markdown / Formatting in Quick Add

Quick Add supports inline markdown shortcuts (`**bold**`, etc.) but NOT block-level conversion (no `# ` heading triggers). The captured node is always a plain Bullet — convert later if needed.

---

## Out of Scope (deferred)

| Feature | Deferred to |
|---------|-------------|
| PWA share-target intent ("Share to WorkFlowy" from any app) | Phase 10 |
| Email-to-Quick-Add (forward email to private address) | Phase 9 |
| Voice input | Post-v1 |
| Mobile native modal layout | Phase 10 |

---

## Cross-References

- Phase 6 [`06-sidebar/02-special-nodes.md`](../06-sidebar/02-special-nodes.md) — Inbox target
- Phase 5 [`05-editor/06-markdown-shortcuts.md`](../05-editor/06-markdown-shortcuts.md) — Inline shortcuts
- Phase 1 [`01-navbar/04-keyboard-shortcuts.md`](../01-navbar/04-keyboard-shortcuts.md) — `⌘⇧N` registered
