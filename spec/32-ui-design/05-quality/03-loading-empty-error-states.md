# Loading, Empty, and Error States

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

Every view and data-dependent component MUST define what the user sees during loading, when data is empty, and when an error occurs.

### 11.1 Loading States

| View / Component | Loading Behavior |
|-----------------|-----------------|
| Home / Item View | Skeleton loader: 6–8 gray pulsing lines mimicking bullet item rows at varied widths. No spinner. |
| Sidebar | Skeleton blocks for favorites, recent, and tags sections. |
| Search Overlay | Subtle spinner inside the search input area while results load. No skeleton for results. |
| Board View | Skeleton columns (3 placeholder columns with 2–3 skeleton cards each). |
| Settings Menu | Autosave timestamp shows "Checking…" until status is resolved. |
| Share Dialog | Shared users list shows skeleton rows until loaded. |
| Trash View | Skeleton list of 4–5 placeholder rows. |
| Comments | Skeleton rows within the comment panel. |
| Breadcrumbs | Placeholder shimmer bar (~200px) until ancestor path loads. |
| Location Picker | Tree browser area shows skeleton indented rows (5–6 lines). Search input is immediately interactive. |

### 11.2 Empty States

| View / Component | Empty State |
|-----------------|------------|
| Home (new user) | Centered message: "Start typing to create your first item" with subtle fade-in animation. Single empty bullet with blinking cursor. |
| Item View (no children) | Single empty bullet below the item title, ready for input. No message needed. |
| Sidebar — Favorites | Muted text: "No favorites yet". |
| Sidebar — Recent | Muted text: "No recent items". |
| Sidebar — Tags | Muted text: "No tags yet". |
| Search — no results | Centered muted text: "No items found". |
| Search — empty query | Show last 5 recently visited items under a "Recent" header. |
| Board — empty column | Column shows only the "+ Add card" button. |
| Board — no columns | Message: "Add child items to use Board view." with a "+ Add item" button. |
| Trash — empty | Centered muted text: "Trash is empty" with a subtle icon. |
| Comments — none | Muted text: "No comments yet. Start the conversation." |
| Templates — none | Muted text: "No templates saved yet." |
| Today View — no items | Muted text: "Nothing scheduled for today." |
| Location Picker — no search results | Muted text: "No matching items." below the search input. |

### 11.3 Error States

| Scenario | Behavior |
|----------|----------|
| Page-level data fetch failure | Full-page error boundary showing: error icon, "Something went wrong" message, "Try again" button that retries the failed query, and a "Go home" fallback link. |
| Component-level fetch failure | Inline error message within the component area: "Failed to load. Tap to retry." Clicking retries the query. |
| Network offline | Persistent amber banner at top: "You're offline. Changes will sync when reconnected." All editing continues with local-only state. |
| Auth session expired | Redirect to login. After re-login, prompt: "Restore unsaved changes?" |
| Save failure | Toast: "Failed to save. Retrying…" with auto-retry (3 attempts). After 3 failures: persistent toast "Changes not saved. Check your connection." with manual retry button. |
| Item not found (404) | "This item doesn't exist or you don't have access." with "Go home" button. |
| Permission denied | "You don't have permission to view this item." with "Go home" button. |
| Rate limited | Toast: "Too many requests. Please wait a moment." with automatic retry after cooldown. |

### 11.4 Error Boundary Strategy

- A top-level error boundary wraps the entire app to catch catastrophic React render errors.
- Each major content section (Content Area, Sidebar, Board View) has its own error boundary so a failure in one section doesn't crash the whole app.
- Error boundaries show the component-level error state (§11.3) and offer a retry action.
