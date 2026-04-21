# State Management

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

### 4.1 Local State (client-side only, not persisted to server)

| State | Purpose |
|-------|---------|
| Current zoomed item ID | Which item is the root of the current view |
| Zoom history stack + index | For back/forward navigation |
| Sidebar open/closed | Sidebar visibility |
| Focused item ID | Which bullet currently has the cursor |
| Expand/collapse state per item | Supplements server-stored collapse state for local-only UI overrides |
| Text selection info | Current selection range and position for the formatting toolbar |
| Undo/redo stacks | History of reversible actions |
| Drag state | Source item, drop target, and drop position during drag operations |
| Search overlay open/closed | Search visibility |
| Command palette open/closed | Command palette visibility |
| View mode per item | "list" or "board" for the current zoomed item |
| Pending unsaved changes | Buffer of changes waiting to be saved |

### 4.2 Server State (fetched from database, cached locally)

| Data | Cache Duration | Purpose |
|------|---------------|---------|
| Children of a parent item | 30 seconds | Renders the nested item tree |
| Single item details | 30 seconds | Item properties when needed individually |
| Ancestor path for an item | 60 seconds | Breadcrumb navigation |
| User profile | 5 minutes | Display name, avatar, plan, preferences |
| Favorites list | 60 seconds | Sidebar favorites section |
| Comments for an item | 30 seconds | Comment thread display |
| Share settings for an item | 60 seconds | Share dialog |
| User's tags | 5 minutes | Sidebar tags section |
| Trash items | 60 seconds | Trash view |
| Search results | 10 seconds | Search overlay results |
| Today's items | 30 seconds | Today view |
| Mirror references for an item | 30 seconds | Mirror badge and source info |

### 4.3 Custom Hooks

| Hook | Purpose |
|------|---------|
| useItems | Fetch and cache children of a parent item, with real-time subscription |
| useItemMutation | Create, update, delete, and move items with optimistic updates |
| useZoom | Manage zoom navigation with history (back, forward, home, zoom to) |
| useBreadcrumbs | Fetch the ancestor path for breadcrumb display |
| useKeyboardShortcuts | Register and handle all global keyboard shortcuts |
| useAutoSave | Debounced save with status tracking (saving, last saved, pending count, errors) |
| useUndoRedo | Manage the undo/redo action history stack |
| useDragReorder | Handle drag-and-drop item reordering |
| useSearch | Debounced search with results |
| useItemContext | Provide all available actions for a specific item (complete, delete, move, mirror, etc.) |
| useTextSelection | Track text selection for the formatting toolbar |
| useExpandCollapse | Manage expand/collapse state with expand-all and collapse-all support |
| useMirror | Mirror-specific data and operations for an item |
| useRealtime | Subscribe to live database changes for instant sync |
| useFavorites | Bookmark/unbookmark operations |
| useAuth | Authentication state and operations (login, logout, signup) |
| useOnlineStatus | Track network connectivity for offline handling |

---
