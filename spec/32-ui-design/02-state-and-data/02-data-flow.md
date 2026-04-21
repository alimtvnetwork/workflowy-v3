# Data Flow Patterns

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

### 5.1 Optimistic Updates

When the user types or makes a change:
1. Update the local cache immediately (instant UI feedback)
2. Buffer the change in the pending changes map
3. After 1.5 seconds of inactivity, send the update to the server
4. On success: remove from pending changes
5. On error: revert the local cache, show an error toast, and retry up to 3 times

### 5.2 Zoom Navigation

When the user clicks a bullet dot, breadcrumb, or search result:
1. Push the current zoom state to the history stack
2. Set the new item as the zoomed root
3. Update the URL to reflect the new item
4. Fetch the new item's children
5. Fetch the ancestor path for breadcrumbs
6. Re-render the content area with the new root

### 5.3 Mirror Creation

When the user creates a mirror via "Mirror To…":
1. Location picker opens
2. User selects a target parent
3. A mirror reference record is created (source item + target parent)
4. The target parent's children list is refreshed (cache invalidation)
5. Confirmation toast is shown

### 5.4 Mirror Editing

When the user edits content on a mirrored item:
1. The edit goes directly to the canonical source item (there's only one copy of the data)
2. All visible instances of that item automatically show the updated content (same cache entry)
3. Real-time subscriptions push the change to other connected clients

### 5.5 Board View Drag

When a card is dragged between columns:
1. Optimistically move the card in the local cache
2. Update the card's parent to the new column
3. Update the card's sort order for its new position
4. On error: revert the cache and show an error toast

### 5.6 Real-time Sync

The app subscribes to live database changes filtered by the current user:
- On new item created: refresh the parent's children, animate the new item in
- On item updated: merge changes into cache (skip if the change originated locally)
- On item deleted: remove from cache, animate out
- Also subscribe to mirror and comment changes for badge updates

---
