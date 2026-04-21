# Drag-Drop Semantics (B2 RESOLVED)

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Decision:** Move by default; hold **⌥ (Alt)** to mirror — locked 2026-04-21.

---

## Resolution Summary

**B2 was:** Should dragging a node onto a sidebar item MOVE it or MIRROR it?

**Resolved:** **Hybrid (Option C)** —
- Drag with no modifier → **MOVE**
- Drag with ⌥ (Alt) held → **MIRROR**

This matches the "hold ⌥ to mirror" Pro-tip already specified in Phase 3 Handbook content.

---

## Drag Sources

A drag operation begins when the user:
- Mousedown + drag on a bullet **dot** (Phase 4 anatomy spec).
- Multi-select then drag any selected dot (drags all selected).
- Touch long-press + drag (deferred to Phase 10).

---

## Drag Visual Feedback

| Element | Treatment |
|---------|-----------|
| Source row | Opacity 0.5 during drag |
| Cursor | `grabbing` (default) or `copy` (⌥ held) |
| Drag ghost | Mini card showing first 32 chars of dragged content; if multi, shows "N items" |
| Modifier indicator | Small badge on ghost: "MOVE" (default) or "MIRROR" (⌥) |

---

## Drop Targets

### In-tree targets
| Target | Drop Position | Visual Highlight |
|--------|---------------|------------------|
| Above a row | Top edge | 2px line `--accent` above row |
| Below a row | Bottom edge | 2px line `--accent` below row |
| Onto a row (center) | As child | Row background `--accent/30` |

### Sidebar special-node targets

When pointer enters a sidebar item bounding box (during drag):

| Sidebar Item | Drop Behavior (no modifier) | Drop Behavior (⌥) |
|--------------|------------------------------|---------------------|
| Today | Move to Today (sets `date = today`) | Mirror into Today |
| Home | Move to root (last child of root) | Mirror to root |
| Inbox | Move to Inbox (last child) | Mirror to Inbox |
| Drafts | Move + set `isDraft = true` | Mirror + draft |
| Mentions | ❌ Forbidden (cursor `not-allowed`) | ❌ Forbidden |
| Calendar | Move + open date picker for assignment | Mirror + assign date |
| Trash | Move to Trash (= soft delete) | ❌ Forbidden (mirror to trash makes no sense) |
| + New node | ❌ Forbidden | ❌ Forbidden |

Highlight on valid drop target: background `--accent`, border 2px `--accent`, scale 1.02.
On forbidden target: cursor `not-allowed`, no highlight, slight red tint.

---

## Modifier Detection

| Platform | Modifier | Detection |
|----------|----------|-----------|
| macOS | ⌥ Option | `event.altKey === true` |
| Windows/Linux | Alt | `event.altKey === true` |

Modifier can be pressed/released **mid-drag**; visual feedback updates in real-time.

---

## Multi-Select Drag

When N nodes are selected:
- All N nodes drag together as one ghost.
- Ghost shows "N items" with first item's preview.
- Drop target receives all N nodes preserving relative order.
- Mirror mode (⌥) creates N mirrors at target.

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Drag onto self | No-op, drag cancels |
| Drag onto own descendant | ❌ Forbidden, cursor `not-allowed` |
| Drag mirror onto Mentions | ❌ Forbidden (Mentions is read-only) |
| Drop while modifier flipped at last moment | Behavior matches modifier state at drop event |
| Drag node with active comments | Comments travel with node (move) or stay with original (mirror) |
| Drag while Esc pressed mid-drag | Drag cancels, no change |

---

## Confirmation Dialogs

| Action | Confirmation Required? |
|--------|------------------------|
| Move to Trash via drag | NO — undoable |
| Move 50+ items at once | YES — "Move N items to <destination>?" |
| Mirror into ancestor of source | NO — but flagged with warning toast: "Mirror created in ancestor; cycle prevented." |

---

## Undo

Every drag operation is **one undo step**:
- ⌘Z reverts the move/mirror.
- For mirror: ⌘Z removes the mirror but keeps the original (mirror is purely additive).

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Drag start latency | < 50ms |
| Drop target highlight update | < 16ms (60fps) |
| Drop commit | < 100ms |
| Undo of drop | < 100ms |

---

## Cross-References

- Phase 4 [`04-bullet/01-anatomy.md`](../04-bullet/01-anatomy.md) — Dot is the drag handle
- Phase 5 [`05-editor/03-item-types.md`](../05-editor/03-item-types.md) — Mirror item type
- Phase 3 [`03-right-panel/01-handbook-content.md`](../03-right-panel/01-handbook-content.md) — "Pro tip: ⌥ to mirror"
- `02-special-nodes.md` — drop target table per sidebar item
