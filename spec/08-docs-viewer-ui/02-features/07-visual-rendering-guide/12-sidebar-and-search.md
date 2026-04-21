# Sidebar Navigation & Search

> **Version:** 3.2.0  
> **Updated:** 2026-04-19

---

## Sidebar Structure

The docs sidebar (`DocsSidebar`) is a collapsible panel rendered using the shadcn `Sidebar` component with `collapsible="icon"`. It contains a header with branding + search, and a scrollable body with either the file tree or search results.

```
┌─────────────────────────────┐
│  📖  Spec Docs              │  ← SidebarHeader
│  ┌─────────────────────┐    │
│  │ 🔍 Search docs...   │    │  ← Input with Search icon
│  └─────────────────────┘    │
├─────────────────────────────┤
│  Specifications             │  ← SidebarGroupLabel
│                             │
│  ▶ 📁 Spec Authoring Guide  │  ← Collapsed folder
│  ▼ 📁 Coding Guidelines     │  ← Expanded folder
│     📄 Overview              │     ← File (active)
│     📄 Cross Language        │
│  ▶ 📁 Error Management      │
│  ...                        │
│                             │
└─────────────────────────────┘
```

---

## File Tree Component (`SpecTreeNav`)

The tree uses recursive rendering with `SidebarMenu` / `SidebarMenuSub` for indentation:

| Element | Component | Icon | Style |
|---------|-----------|------|-------|
| Folder (closed) | `Collapsible` + `SidebarMenuButton` | `Folder` (Lucide) | `text-muted-foreground` |
| Folder (open) | Same, `open=true` | `FolderOpen` (Lucide) | `text-primary` |
| Chevron | Inside button | `ChevronRight` | `h-3.5 w-3.5`, rotates 90° when open |
| File | `SidebarMenuButton` | `FileText` (Lucide) | `text-muted-foreground` |
| Active file | Same, `isActive=true` | Same | shadcn active state (primary bg) |

### Folder Expand Logic

```typescript
// Initial open state:
// - depth === 0 → always open (top-level folders)
// - activePath starts with folder's path → auto-expand to show active file
const isActiveInSubtree = activePath?.startsWith(node.path + "/");
const [open, setOpen] = useState(isActiveInSubtree || depth === 0);
```

### Chevron Animation

```css
/* Chevron rotates smoothly on expand/collapse */
.chevron {
  transition: transform 200ms;
}
.chevron[data-open="true"] {
  transform: rotate(90deg);
}
```

---

## Search Filtering

When the search input has text, the tree is replaced by a flat results list:

```
┌─────────────────────────────┐
│  📖  Spec Docs              │
│  ┌─────────────────────┐    │
│  │ 🔍 keyboard█         │    │  ← Active search
│  └─────────────────────┘    │
├─────────────────────────────┤
│  Results (3)                │  ← SidebarGroupLabel with count
│                             │
│  📄 Keyboard Navigation     │
│     spec/08-docs-viewer-ui/ │  ← Path shown as subtext
│  📄 Fundamentals            │
│     spec/08-docs-viewer-ui/ │
│  📄 Coding Guidelines Spec  │
│     spec/02-coding-guideli… │
│                             │
└─────────────────────────────┘
```

### Search Logic (`useSpecSearch`)

```typescript
// Filters allFiles (flattened SpecNode[]) by name OR content match
const q = query.toLowerCase();
return allFiles
  .filter(f =>
    f.name.toLowerCase().includes(q) ||
    (f.content && f.content.toLowerCase().includes(q))
  )
  .slice(0, 20); // Cap at 20 results for performance
```

- **Match targets**: File name (always) + file content (if loaded)
- **Case**: Case-insensitive
- **Max results**: 20 (prevents DOM overload for broad queries)
- **Empty query**: Returns `[]` — tree is shown instead

### Search Result Item

| Element | Style |
|---------|-------|
| File name | `font-medium truncate` |
| Path | `text-xs text-muted-foreground truncate` |
| Icon | `FileText` Lucide, `h-3.5 w-3.5 text-muted-foreground` |
| No results | `"No results found"` paragraph, `text-muted-foreground` |

---

## File Selection Behavior

```typescript
// Only files can be selected (folders toggle expand/collapse)
const handleSelect = useCallback((node: SpecNode) => {
  if (node.type !== SpecEntryType.File) return;
  setActiveFile(node);
  setSearchQuery(""); // Clear search on selection
}, []);
```

**Key behaviors:**
- Clicking a **file** sets it as active and clears any search query
- Clicking a **folder** toggles its expand/collapse state (no file selection)
- Search results clicking behaves identically to tree file clicks
- The sidebar uses `ScrollArea` for overflow with `h-[calc(100vh-120px)]`

---

## Sidebar Collapse

The sidebar supports icon-only collapse via shadcn's `collapsible="icon"` mode:
- Branding text and search input hide via `group-data-[collapsible=icon]:hidden`
- Only folder/file icons remain visible in collapsed state
- Toggle via the `SidebarTrigger` button or `Ctrl/Cmd+B` keyboard shortcut

**Sources:** `src/components/docs/DocsSidebar.tsx`, `src/components/SpecTreeNav.tsx`, `src/hooks/useSpecData.ts`

---

*Sidebar & search — v3.2.0 — 2026-04-19*
