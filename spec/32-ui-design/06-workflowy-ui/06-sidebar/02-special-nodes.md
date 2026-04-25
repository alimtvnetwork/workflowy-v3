# Special Nodes (Sidebar Items)

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-60, 62

---

## Default Order (LOCKED)

| # | Item | Icon | Route | Behavior on click |
|---|------|------|-------|-------------------|
| 1 | Today | 📅 | `/today` | Phase 7 Today view |
| 2 | Home | 🏠 | `/` | Root node |
| 3 | Inbox | 📥 | `/inbox` | Inbox special node |
| 4 | Drafts | 📝 | `/drafts` | Drafts special node |
| 5 | Mentions | 💬 | `/mentions` | Mentions special node |
| 6 | Calendar | 📅 | `/calendar` | Phase 7 Calendar picker |
| 7 | Trash | 🗑 | `/trash` | Trash special node |
| 8 | + New node | ➕ | (action) | Opens Quick Add modal (Phase 7) |

---

## Per-Item Specifications

### 1. Today
- Routes to Phase 7 Today view.
- Counter badge shows count of items dated today (incl. starred for today).
- Re-orderable by user (drag within Today view, persists order).

### 2. Home
- Routes to root node `id = 'root'` (zoomed out fully).
- No counter.
- Default landing page for new users.

### 3. Inbox
- Special node where Quick Add (Phase 7) appends nodes.
- Counter badge = unprocessed item count (items not yet moved out).
- Visual: bullets here render with subtle "📥" prefix until moved.
- **Drop target:** YES — see `03-drag-drop.md`.

### 4. Drafts
- Holds nodes the user explicitly marks as drafts.
- **How to mark as draft:** right-click node → "Send to Drafts" (no global hotkey — `⌘⇧S` is reserved for Phase 2 Saved Searches when the Search Popover is open).
- Counter badge = total draft count.
- Hidden when "Fractal Conversations" setting is OFF (Phase 8).

### 5. Mentions
- Aggregates all comments/nodes that @mention the current user.
- Counter badge = unread mentions.
- Click on mention navigates to source node (zoomed in).
- Hidden when "Fractal Conversations" setting is OFF.

### 6. Calendar
- Routes to Phase 7 Calendar Picker view.
- Shows month grid with date markers (found dates from search).
- No counter.

### 7. Trash
- Holds deleted nodes for **30 days** (per `mem://features/trash-logic`).
- After 30 days, items auto-purge (no recovery).
- Counter badge = total trashed item count.
- Items in Trash show:
  - Original location breadcrumb
  - Days remaining ("28 days left")
  - [Restore] button per item
  - "Empty Trash" button at top (confirmation required)

### 8. + New node
- **Action button**, not a navigation target.
- Click opens Quick Add modal (Phase 7 `02-quick-add-modal.md`).
- Hotkey equivalent: `⌘⇧N`.
- Visually distinct: outlined button style, `--primary` accent.

---

## Counters / Badges

| Item | Counter Source |
|------|----------------|
| Today | Items where `date = today` (or starred-for-today) |
| Inbox | Items in Inbox not yet moved/archived |
| Drafts | Items with `isDraft = true` |
| Mentions | Unread @-mentions |
| Trash | Total trashed items |

Counters update live (no manual refresh).

---

## Visibility Rules (Phase 8 Settings Integration)

| Setting | Effect |
|---------|--------|
| Fractal Conversations: **ON** (default) | All 8 items visible |
| Fractal Conversations: **OFF** | Hide **Drafts** + **Mentions**; remaining 6 items renumber |

When hidden items are restored, the original order is preserved.

---

## Drag-Drop Targets

All 8 items can be drop targets EXCEPT "+ New node" (it's an action, not a destination). Drag semantics defined in `03-drag-drop.md`.

| Item | Drop Behavior |
|------|---------------|
| Today | Move/mirror to Today view |
| Home | Move/mirror to root level |
| Inbox | Move/mirror to Inbox |
| Drafts | Convert to draft + move to Drafts |
| Mentions | ❌ Not a drop target (read-only aggregation) |
| Calendar | Special: assign date (= today by default) |
| Trash | Move to Trash (= delete) |
| + New node | ❌ Not a drop target |

---

## Empty States

| Item | Empty State Message |
|------|---------------------|
| Today | "Nothing scheduled for today. ✨" |
| Inbox | "Your inbox is empty. Use ⌘⇧N to add a quick note." |
| Drafts | "No drafts yet." |
| Mentions | "No mentions. You're all caught up." |
| Trash | "Trash is empty." |
