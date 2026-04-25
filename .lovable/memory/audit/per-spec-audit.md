# Per-Spec Audit Report

> **Date:** 2026-04-25 (UTC+8)
> **Project version:** v0.37.0
> **Mode:** SPEC-ONLY (implementation = P1.1 scaffold, 962 LOC)
> **Coverage:** 30 specs (20 live-audited via Gemini · 10 placeholders for quota-blocked retries, scored from prior validated rounds)
> **Output:** `.lovable/memory/audit/per-spec-audit.{json,md}`

---

## 📊 Aggregate Rubric (avg across 30 specs)

| Dimension | Weight | Score |
|-----------|--------|-------|
| Completeness | 25% | **88/100** |
| Consistency | 25% | **86/100** |
| Alignment | 20% | **69/100** |
| Clarity | 15% | **91/100** |
| Maintainability | 10% | **87/100** |
| Test Coverage | 5% | **80/100** |
| **Weighted overall** | — | **81/100** |

---

## 🚨 Top Drift Findings (severity × impact, top 15)

### 1. Backend runtime constraint violation in `package.json`

- **Spec:** `spec/31-app/00-overview.md`
- **Type:** spec-says-code-doesnt · **Severity:** 9/10 · **Impact:** 10/10 · **Weighted:** 90
- **Evidence:** Spec L9 'Backend runtime is WordPress plugin (PHP 8.1+ + SQLite via PDO). No Node, Postgres, Supabase...' but `package.json` explicitly includes `vite`, `@vitejs/plugin-react-swc`, `@tanstack/react-query` which are Node.js/frontend build tools and libraries, implicitly assuming a non-PHP direct backend interaction or a headless CMS setup.
- **Proposed correction:** This is a fundamental architectural contradiction. Reconcile `spec/31-app/00-overview.md#L9` with the chosen implementation stack. If Node.js/Vite is intended for the frontend, the spec should clarify this and distinguish it from the backend runtime. If 'No Node' means the entire stack, then the current `package.json` is a direct violation.

Option 1 (Clarify Spec): Amend spec L9 to explicitly state Node.js/Vite for frontend, PHP for backend API.
```diff
--- a/spec/31-app/00-overview.md
+++ b/spec/31-app/00-overview.md
@@ -38,7 +38,7 @@
 | L8 | Roles live in a **separate table** (never on profile/users). All authorization checks go through a single PHP helper `Auth::hasRole($userId, $role)` (server-side, never client-trusted). | `01-features/15-roles-and-permissions.md` |
 | L9 | Backend runtime is **WordPress plugin (PHP 8.1+ + SQLite via PDO)**. No Node, Postgres, Supabase. Realtime is delivered via WP-native **Server-Sent Events (SSE)** with a 5 s poll fallback — never WebSockets, never Postgres LISTEN/NOTIFY. | `mem://constraints/backend-runtime-deferred` |
 | L9 | Backend runtime is **WordPress plugin (PHP 8.1+ + SQLite via PDO)**. No Node, Postgres, Supabase. Frontend runtime is Node.js/Vite. Realtime is delivered via WP-native **Server-Sent Events (SSE)** with a 5 s poll fallback — never WebSockets, never Postgres LISTEN/NOTIFY. |
 ```

Option 2 (Align Code to Spec): If 'No Node' truly means no Node.js anywhere, then the entire `package.json` and build setup needs to be replaced with a PHP-only templating/build system, which is unlikely for a modern SPA.

### 2. Core Item Rendering Components Missing

- **Spec:** `spec/31-app/01-features/04-page-content-area.md`
- **Type:** spec-says-code-doesnt · **Severity:** 9/10 · **Impact:** 10/10 · **Weighted:** 90
- **Evidence:** Section '3.1 Bullet Item Structure' and 'Component Contract' list many components like `ItemRow.tsx`, `ExpandToggle.tsx`, `BulletDot.tsx`, `MirrorBadge.tsx`, `HoverActions.tsx`, etc. The provided implementation bundle does not contain any of these core components; it's limited to layout, routing, and a `ToastContext`.
- **Proposed correction:** This is acknowledged by the spec. Implement `src/components/tree/ItemRow.tsx` and its direct children (`ExpandToggle`, `BulletDot`) as the absolute minimum to begin rendering outlines. This is the top priority for P1.1 development.

### 3. Most Interaction Behaviors Not Implemented

- **Spec:** `spec/31-app/01-features/05-interactions.md`
- **Type:** spec-says-code-doesnt · **Severity:** 9/10 · **Impact:** 10/10 · **Weighted:** 90
- **Evidence:** The spec details 15+ keyboard/pointer interactions (Enter, Backspace, Tab, Cmd+Arrows, Click, Drag, Cmd+Enter), 5 zoom interactions, 7 search behaviors, and 7 autosave triggers. The current codebase only implements a basic routing structure, a Toast notification system, and a hotkey registry (without actual handler integration). None of the core item manipulation or navigation behaviors are present in `App.tsx`, `AppLayout.tsx`, `Home.tsx`, or `NotFound.tsx`.
- **Proposed correction:** This is expected for P1.1 scaffold. No immediate correction needed for the spec, but the implementation should begin to add item-related components and interaction handlers as planned per the 'Component Contract' section.

### 4. Markdown Auto-Conversion (typed shortcuts) completely unimplemented

- **Spec:** `spec/31-app/02-workflows/01-keyboard-shortcuts.md`
- **Type:** spec-says-code-doesnt · **Severity:** 9/10 · **Impact:** 10/10 · **Weighted:** 90
- **Evidence:** Section 11.6 'Markdown Auto-Conversion (typed shortcuts)' outlines 9 distinct text transformation features. The current `HOTKEYS` registry and overall scaffold demonstrate no logic for these features.
- **Proposed correction:** This is a major feature. Create a new `src/lib/markdown-autocompletion.ts` (or similar) to handle these transformations. Add corresponding `HotkeyId` entries if these 'shortcuts' are event-driven rather than purely text-based. Update `spec/31-app/02-workflows/01-keyboard-shortcuts.md` to cross-reference the future implementation file in its `specRef` field once created.

### 5. Missing Implementation: Bullet Item

- **Spec:** `spec/32-ui-design/01-architecture/03-component-hierarchy.md`
- **Type:** spec-says-code-doesnt · **Severity:** 9/10 · **Impact:** 9/10 · **Weighted:** 81
- **Evidence:** Spec §3.4 meticulously describes the 'Bullet Item' component with 9 sub-elements (indent spacer, expand/collapse, bullet dot, content editor, note editor, inline badges, child count, hover actions, add button). This core component is not present in the current scaffold, which only has a placeholder 'Home' page.
- **Proposed correction:** This is a core, unimplemented feature. The spec provides excellent detail for future implementation. The `Home.tsx` refers to 'Start typing to create your first item', which directly implies the need for bullet items.

### 6. PascalCase for all DB table & column names

- **Spec:** `spec/19-glossary.md`
- **Type:** spec-says-code-doesnt · **Severity:** 8/10 · **Impact:** 9/10 · **Weighted:** 72
- **Evidence:** Spec: 'PascalCase (...) Mandatory for (...) all DB table & column names.' Impl: `src/types/index.ts` defines `ItemType` with lowercase values (e.g., 'bullet', 'h1') which are explicitly described as needing to match 'DB column convention'. This contradicts PascalCase for DB column names.
- **Proposed correction:** spec/19-glossary.md: Revise the PascalCase definition under 'Naming Conventions' to explicitly allow lowercase/snake_case for enum values that map to DB columns or types, or mandate PascalCase for `ItemType` values themselves to match the spec. Given v13 migration, the latter is more likely correct.

Option 1 (Revise Spec):
```diff
--- a/spec/19-glossary.md
+++ b/spec/19-glossary.md
@@ -21,7 +21,7 @@
 | Term | Definition |
 |------|-----------|
 | **camelCase** | First word lowercase, subsequent words capitalised (e.g., `pluginSlug`). Mandatory for all variable names, function arguments, log context keys (PHP/Go/TS). |
-| **PascalCase** | All words capitalised (e.g., `PluginSlug`). Mandatory for class names, type names, exported Go identifiers, **all DB table & column names**, and enum constant names. |
+| **PascalCase** | All words capitalised (e.g., `PluginSlug`). Mandatory for class names, type names, exported Go identifiers, **all DB table & column names (except for `ItemType` enum values)**, and enum constant names. |
 | **snake_case** | Words separated by underscores (e.g., `plugin_slug`). **PROHIBITED** project-wide except inside protocol-driven enums (HTTP headers, content types, etc.) and WordPress hook callbacks. |
 | **kebab-case** | Words separated by hyphens (e.g., `plugin-slug`). Used only for URL slugs, file names, CSS classes, and directory names. |
 | **SCREAMING_SNAKE_CASE** | All uppercase with underscores. Reserved for compile-time constants in PHP only (e.g., `class-level const FATAL_TYPES`). |
```
OPTION 2 (Implement PascalCase for ItemType):
```diff
--- a/src/types/index.ts
+++ b/src/types/index.ts
@@ -30,19 +30,19 @@
  * NOTE: `dashboard` is a VIEW, not an item type — do not add it here.
  */
 export type ItemType =
-  | "bullet"
-  | "h1"
-  | "h2"
-  | "h3"
-  | "paragraph"
-  | "todo"
-  | "numbered"
-  | "board"
-  | "quote"
-  | "code"
-  | "divider"
-  | "mirror";
+  | "Bullet"
+  | "H1"
+  | "H2"
+  | "H3"
+  | "Paragraph"
+  | "Todo"
+  | "Numbered"
+  | "Board"
+  | "Quote"
+  | "Code"
+  | "Divider"
+  | "Mirror";
```

### 7. Missing spec for `ToastVariant` enum

- **Spec:** `spec/20-enums-index.md`
- **Type:** missing-spec · **Severity:** 9/10 · **Impact:** 8/10 · **Weighted:** 72
- **Evidence:** The `ToastVariant` type (`success`, `error`, `info`, `warning`) is defined and used in `src/contexts/ToastContext.tsx` and `src/components/ui/Toaster.tsx`, but it is not listed in Section 3, 'Universal Domain Enums', nor in Section 4 'Protocol-Driven Enums' of `spec/20-enums-index.md`. This is a core UI/App enum.
- **Proposed correction:** spec/20-enums-index.md:
Add `ToastVariant` to Section 3.1 "Status & Result" or a new appropriate subsection, including its cases (`success`, `error`, `info`, `warning`) and 'Used For' description.

### 8. Unimplemented Core Features (AT-APP-01, 02, 03, 04, 05)

- **Spec:** `spec/31-app/97-acceptance-criteria.md`
- **Type:** spec-says-code-doesnt · **Severity:** 8/10 · **Impact:** 9/10 · **Weighted:** 72
- **Evidence:** Spec criteria AT-APP-01 through AT-APP-05 define fundamental aspects of the information model (root Item, immutable Item.id, unified Item type, fractional indexing, virtualization). The current scaffold (`src/types/index.ts`) only defines the types for `Item` and related structures, but no actual implementation of these behaviors or data structures exists.
- **Proposed correction:** No immediate correction needed for the spec in 'SPEC-ONLY' mode. This finding serves as a flag for future implementation. The `Item` interface in `src/types/index.ts` should be robustly implemented following these criteria.

### 9. Unimplemented Context Menu, Multi-select, Trash, Roles & Permissions, Mirrors & Sharing Features

- **Spec:** `spec/31-app/97-acceptance-criteria.md`
- **Type:** spec-says-code-doesnt · **Severity:** 8/10 · **Impact:** 9/10 · **Weighted:** 72
- **Evidence:** Criteria AT-APP-15 through AT-APP-25 cover significant features like context menus, multi-select, trash functionality, full roles and permissions, and mirrors/sharing. None of these features appear in the current sparse code scaffold. For example, `src/types/index.ts` defines `Item` fields like `isCompleted`, but no logic is present to handle the 'ToggleComplete' action.
- **Proposed correction:** No immediate spec correction for unimplemented features in 'SPEC-ONLY' mode. This confirms the specification of future work that is yet to be realized in code.

### 10. Missing Implementation of Layout Components

- **Spec:** `spec/31-app/01-features/03-layout-structure.md`
- **Type:** spec-says-code-doesnt · **Severity:** 8/10 · **Impact:** 9/10 · **Weighted:** 72
- **Evidence:** Spec lists numerous components (NavBar, Sidebar, SettingsDropdown, etc.) and their paths in 'Component Contract' section. 'src/components/layout/AppLayout.tsx' comments explicitly state: 'Navbar, Sidebar, and panel slots will land in P1.3... Wrapping all routes today means future chrome additions touch zero route definitions.' The 'src/components/layout/index.ts' only exports 'AppLayout', confirming no other components exist.
- **Proposed correction:** This is acceptable given 'SPEC-ONLY' mode and P1.1 scaffold. No immediate correction needed but track against P1.3 for implementation.

### 11. Minimal AppLayout vs. Detailed Page Content Spec

- **Spec:** `spec/31-app/01-features/04-page-content-area.md`
- **Type:** spec-says-code-doesnt · **Severity:** 8/10 · **Impact:** 9/10 · **Weighted:** 72
- **Evidence:** Spec details: 'The Page is the scrollable content area below the NavBar where the user's outline lives. Every bullet item is one row composed of expand toggle, bullet dot, content, note, badges, and hover-revealed action buttons.' Code: `AppLayout.tsx` states it's 'currently a transparent passthrough so routes mount inside a single layout boundary. Navbar, Sidebar, and panel slots will land in P1.3'. The `Home.tsx` is a simple 'start typing' message, not an interactive outline.
- **Proposed correction:** This is expected given the 'SPEC-ONLY' mode. No immediate code correction, but `AppLayout.tsx` should eventually be integrated with the structural elements described here (NavBar, content area). The `Home.tsx` will need substantial rework to render item rows.

### 12. Zoom Navigation and Search Overlay Spec are Unimplemented

- **Spec:** `spec/31-app/01-features/05-interactions.md`
- **Type:** spec-says-code-doesnt · **Severity:** 8/10 · **Impact:** 9/10 · **Weighted:** 72
- **Evidence:** The 'Zoom Behaviors' and 'Search Behaviors' sections describe a complex set of interactions including URL changes, history management, a full-screen search overlay, debounced typing, and result display. The current `App.tsx` and routing (`react-router-dom`) are only set up for basic path handling ('/', '*'), with no mechanism for item-specific URLs, history stack manipulation, or a search overlay. The `ZoomState` and `SearchResult` types exist in `src/types/index.ts` showing intent.
- **Proposed correction:** This is expected given the scaffold status. The next phase of UI development should focus on implementing `AppLayout` chrome components (navbar, sidebar) that will house the zoom, breadcrumbs, search button, etc. and integrating actual search and zoom components.

### 13. Missing Toast Banners and Remote Change UI

- **Spec:** `spec/31-app/01-features/14-concurrency-and-sync.md`
- **Type:** spec-says-code-doesnt · **Severity:** 8/10 · **Impact:** 9/10 · **Weighted:** 72
- **Evidence:** Spec (14.1, 14.2, Outputs section) describes visible 'Restored remote change' banners, 'Undo' buttons, and avatars. The code (src/components/ui/Toaster.tsx and src/contexts/ToastContext.tsx) currently implements a generic toast notification system but lacks specific components for remote change feedback, user avatars, or the Undo functionality within a toast.
- **Proposed correction:** Add `RemoteChangeBanner.tsx` and `UndoRemoteChangeButton.tsx` (as noted in Component Contract) to handle specific concurrency feedback. The existing `ToastContext` could be extended or wrapped to trigger these specific UI elements when conflict responses are received, potentially leveraging `errorCode` for classification.

File: src/components/ui/Toaster.tsx
Before:
```typescript
const ToastItem = ({ entry, onDismiss }: ToastItemProps) => {
  const variantClass = VARIANT_CLASSES[entry.variant];
  return (
    <button
      type="button"
      onClick={() => onDismiss(entry.id)}
      className={`pointer-events-auto rounded-md px-xl py-lg text-menu shadow-lg ${variantClass}`}
      aria-label="Dismiss notification"
    >
      {entry.message}
    </button>
  );
};
```
After (conceptual):
```typescript
const ToastItem = ({ entry, onDismiss }: ToastItemProps) => {
  if (entry.errorCode === 'E_REMOTE_OVERWRITE') {
    return <RemoteChangeBanner 
      message={entry.message} 
      winningUser={entry.meta?.winningUser} 
      onDismiss={() => onDismiss(entry.id)} 
      onUndo={entry.meta?.onUndo} 
    />
  }
  const variantClass = VARIANT_CLASSES[entry.variant];
  return (
    <button
      type="button"
      onClick={() => onDismiss(entry.id)}
      className={`pointer-events-auto rounded-md px-xl py-lg text-menu shadow-lg ${variantClass}`}
      aria-label="Dismiss notification"
    >
      {entry.message}
    </button>
  );
};
```

### 14. Missing Backend Interfaces/Mocks for Roles/Permissions

- **Spec:** `spec/31-app/01-features/15-roles-and-permissions.md`
- **Type:** spec-says-code-doesnt · **Severity:** 8/10 · **Impact:** 9/10 · **Weighted:** 72
- **Evidence:** Spec specifies `resolveEffectiveRole()`, `hasRole()`, and a `user_roles` table contract. The current scaffolding contains no backend or mocked interfaces/utilities that would implement or simulate these contracts, which are foundational for a security model.
- **Proposed correction:** src/services/authService.ts (proposed new file):
```typescript
// Before: (No such file or relevant content exists)
// After:
export type WorkspaceRole = 'Owner' | 'Admin' | 'Member';
export type ItemRole = 'View' | 'Edit' | 'Admin' | 'Owner' | 'PublicView' | null;

// Placeholder mock of the core authorization contract
export function resolveEffectiveRole(actorId: string, targetItemId: string): ItemRole {
  // For P1.1 scaffold, we can hardcode some basic roles or use a simple map.
  // e.g., if actorId === 'test_owner' then 'Owner'
  // if targetItemId === 'public_item' and publicLink is true, then 'PublicView'
  console.warn('resolveEffectiveRole is a mock and always returns Owner for now');
  return 'Owner'; 
}

export function canPerform(action: string, actorId: string, targetItemId: string): boolean {
  // Placeholder: temporarily allow all actions for any authenticated user
  // if (actorId === 'test_owner') return true;
  // const role = resolveEffectiveRole(actorId, targetItemId);
  // return CAPABILITY_MATRIX[action][role] === true; (This will need a mock too)
  console.warn('canPerform is a mock and always returns true for now');
  return true;
}

// src/data/mockUserData.ts (or similar)
// export interface UserRoleEntry { userId: string; scope: 'Workspace' | 'Item'; scopeId: string | null; role: WorkspaceRole | ItemRole;}
// export const mockRoles: UserRoleEntry[] = [];
```

### 15. Many specified shortcuts are not in HOTKEYS registry

- **Spec:** `spec/31-app/02-workflows/01-keyboard-shortcuts.md`
- **Type:** spec-says-code-doesnt · **Severity:** 8/10 · **Impact:** 9/10 · **Weighted:** 72
- **Evidence:** Spec lists 30+ shortcuts across various sections. `src/lib/hotkeys.ts` `HOTKEYS` array contains only 16 entries.
- **Proposed correction:** Add all remaining keyboard shortcuts from `spec/31-app/02-workflows/01-keyboard-shortcuts.md` to `src/lib/hotkeys.ts`. Each entry should include a unique `HotkeyId`, an accurate `KeyCombo`, `scope`, `description`, and `specRef`.


---

## 📋 Per-Spec Scoreboard (lowest → highest)

| Score | Spec | Status | Findings |
|-------|------|--------|----------|
| **53.65** | `spec/31-app/01-features/15-roles-and-permissions.md` | not-started | 4 |
| **58.75** | `spec/31-app/01-features/14-concurrency-and-sync.md` | not-started | 2 |
| **58.75** | `spec/31-app/02-workflows/01-keyboard-shortcuts.md` | scaffold-only | 5 |
| **60.5** | `spec/31-app/01-features/04-page-content-area.md` | scaffold-only | 6 |
| **71.75** | `spec/20-enums-index.md` | scaffold-only | 7 |
| **75.25** | `spec/31-app/04-roadmap/01-implementation-phases.md` | scaffold-only | 7 |
| **75.35** | `spec/31-app/01-features/05-interactions.md` | scaffold-only | 8 |
| **77.25** | `spec/31-app/97-acceptance-criteria.md` | scaffold-only | 8 |
| **78** | `spec/32-ui-design/04-editor/01-rich-text-format.md` | not-started 🔸 | 0 |
| **79.5** | `spec/32-ui-design/01-architecture/03-component-hierarchy.md` | scaffold-only | 12 |
| **80.75** | `spec/19-glossary.md` | partially-implemented | 9 |
| **80.75** | `spec/31-app/01-features/00-overview.md` | scaffold-only | 4 |
| **83.25** | `spec/32-ui-design/01-architecture/05-component-contract-map.md` | scaffold-only | 8 |
| **84.5** | `spec/31-app/05-conventions/01-axios-version-control.md` | partially-implemented | 5 |
| **84.75** | `spec/31-app/01-features/03-layout-structure.md` | scaffold-only | 4 |
| **85.8** | `spec/32-ui-design/00-overview.md` | scaffold-only | 6 |
| **86** | `spec/32-ui-design/03-design-system/01-tokens-and-themes.md` | partially-implemented 🔸 | 0 |
| **86.25** | `spec/31-app/00-overview.md` | scaffold-only | 9 |
| **87** | `spec/02-coding-guidelines/consolidated-review-guide/99-quick-checklist.md` | scaffold-only 🔸 | 0 |
| **87.35** | `spec/spec-index.md` | scaffold-only | 2 |
| **88** | `spec/32-ui-design/01-architecture/04-file-organization.md` | partially-implemented | 6 |
| **88** | `spec/09-code-block-system/00-overview.md` | scaffold-only 🔸 | 0 |
| **90** | `spec/32-ui-design/01-architecture/01-tech-stack.md` | scaffold-only | 8 |
| **90** | `spec/13-cicd-pipeline-workflows/00-overview.md` | not-started 🔸 | 0 |
| **90** | `spec/32-ui-design/02-state-and-data/03-data-types.md` | partially-implemented 🔸 | 0 |
| **91** | `spec/31-app/01-features/01-information-model.md` | scaffold-only | 4 |
| **92** | `spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/00-overview.md` | not-started 🔸 | 0 |
| **92** | `spec/32-ui-design/03-design-system/03-tailwind-version-ssot.md` | fully-implemented 🔸 | 0 |
| **93** | `spec/10-powershell-integration/08-wp-plugin-boundary.md` | n/a 🔸 | 0 |
| **95** | `spec/09-code-block-system/11-highlighter-dependency-pin.md` | not-started 🔸 | 0 |

🔸 = quota-blocked retry, scored from prior audit rounds

---

## 📝 Per-Spec Detail

### `spec/spec-index.md` — 87.35/100

**Status:** scaffold-only
**Summary:** The spec-index.md accurately reflects the current directory structure and file counts, aligning with its auto-generated nature. However, it implicitly requires a specific build script to function as intended, which is missing explicit documentation.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 90 | The spec provides a comprehensive index of all other spec files, their versions, and statuses. It achieves its stated purpose. The only minor reduction is for not documenting its own generation process. |
| Consistency | 85 | The file format and content are consistent throughout, listing files, titles, versions, and statuses. The file count and folder names match the provided directory structure. However, there is a minor inconsistency in script naming between the spec itself and `package.json`. |
| Alignment | 95 | As an auto-generated spec index, its primary alignment is with the file system and other spec files. The listed `Total Files` and `Top-Level Folders` are verifiable by parsing the provided spec structure. The alignment with the provided early P1.1 scaffold is indirect but correct in that it references many specs that are not yet implemented, which is expected in 'SPEC-ONLY' mode. The only misalignment, again, is the script name. |
| Clarity | 98 | The spec index is extremely clear, easy to navigate, and provides explicit instructions (even if negative, i.e., 'DO NOT EDIT'). The table format is well-understood, and the top-level folder breakdown is helpful. The 'How to search' tip is a nice touch for usability. |
| Maintainability | 80 | As an auto-generated file, its maintainability is inherently high for humans. However, the maintainability of the *generation script itself* is not yet specified. If the script's logic were to break or diverge from expectations, there's no spec to guide its repair. The inconsistency in script names also poses a minor maintenance risk. |
| Test Coverage | 0 | This spec file itself should not have direct test coverage. Its correctness is verified by the script that generates it and the consistency of the file system. Test coverage for the generation script would be appropriate, but there's no such information here. |

**Drift findings:**
- **[D1] Missing Specification for Index Generation Script** (sev 6 · impact 5) — missing-spec
  - Evidence: The spec-index.md clearly states: 'This file is auto-generated by `scripts/spec-hygiene/04-generate-index.mjs`.' However, there is no corresponding spec file under `spec/01-spec-authoring-guide/` or `spec/13-cicd-pipeline-workflows/` that details the functionality, requirements, or execution of this script.
  - Fix: Create a new spec file, e.g., `spec/01-spec-authoring-guide/18-spec-index-generation.md`, detailing the purpose, implementation, and usage of `scripts/spec-hygiene/04-generate-index.mjs`.

```diff
--- a/spec/01-spec-authoring-guide/00-overview.md
+++ b/spec/01-spec-authoring-guide/00-overview.md
@@ -X,Y +X,Y
 - [99-consistency-report](#99-consistency-report) — Consistency Report — Spec Authoring Guide | 3.1.0 | — |
 + [18-spec-index-generation](#18-spec-index-generation) — Spec Index Generation | 1.0.0 | Active |
 + [99-consistency-report](#99-consistency-report) — Consistency Report — Spec Authoring Guide | 3.1.0 | — |

--- a/spec/spec-index.md
+++ b/spec/spec-index.md
@@ -X,Y +X,Y
 > This file is auto-generated by `scripts/spec-hygiene/04-generate-index.mjs`.
 > Any manual changes will be overwritten on the next run. Refer to `spec/01-spec-authoring-guide/18-spec-index-generation.md` for details.
```
- **[D2] Discrepancy in `package.json` vs. Spec Index Script Name** (sev 4 · impact 3) — contradiction
  - Evidence: The `spec-index.md` file states it's generated by `scripts/spec-hygiene/04-generate-index.mjs`. However, `package.json` contains a `spec:check` script that calls `node scripts/spec-hygiene/00-run-all.mjs`. It's unclear if `04-generate-index.mjs` is implicitly called by `00-run-all.mjs` or if there's a standalone call missing, or if the name has changed.
  - Fix: Clarify the relationship between `04-generate-index.mjs` and `00-run-all.mjs` within the spec index generation documentation. If `04-generate-index.mjs` is directly executable, add a `package.json` script for it. If it's a sub-module of `00-run-all.mjs`, update the spec-index.md text to reflect this.

Alternative correction (if `04-generate-index.mjs` is indeed the *only* script involved):
```diff
--- a/package.json
+++ b/package.json
@@ -X,Y +X,Y
     "preview": "vite preview",
     "test": "vitest run",
     "test:watch": "vitest",
-    "validate:axios": "npx tsx scripts/validate-axios-version.ts",
-    "spec:check": "node scripts/spec-hygiene/00-run-all.mjs",
+    "validate:axios": "node scripts/validate-axios-version.ts",
+    "spec:generate-index": "node scripts/spec-hygiene/04-generate-index.mjs",
+    "spec:check": "node scripts/spec-hygiene/00-run-all.mjs", // Ensure this includes index generation
     "prepare": "node scripts/install-git-hooks.mjs"
```

And update the comment in `spec-index.md` if `00-run-all.mjs` is the sole entry point.

---

### `spec/19-glossary.md` — 80.75/100

**Status:** partially-implemented
**Summary:** The glossary is largely well-defined and critical for project consistency. However, some naming convention definitions are misaligned with scaffold code, and key terms from built implementation features are missing from this spec.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 80 | The glossary covers many core concepts across different tiers and domains. However, several critical concepts already explicit in the early scaffold (Branded ID Types, Hotkey Registry, Toast patterns) are missing, indicating a non-exhaustive definition of 'every recurring term'. |
| Consistency | 75 | Largely consistent internally, but some naming convention rules (e.g., PascalCase for DB columns vs. actual `ItemType` values, SCREAMING_SNAKE_CASE usage) show friction between the spec's strictness and the early implementation. The `itemType` discussion highlights a subtle but important inconsistency in how naming conventions are applied versus defined. |
| Alignment | 70 | For a SPEC-ONLY project, alignment primarily means the spec accurately reflects the *intended* system. While many high-level concepts align, specific naming conventions and the complete set of new architectural patterns (like Branded IDs, Hotkey Registry) introduced in the scaffold are not fully captured, leading to drift. The spirit of SSOT is embraced, but the glossary itself isn't a complete SSOT with the early code. |
| Clarity | 90 | The definitions provided are generally clear, concise, and well-structured with good examples. The use of tables makes it easy to read. Some minor ambiguities arise from internal inconsistencies in naming rules. |
| Maintainability | 85 | The glossary's structure is good, and its stated purpose as an SSOT is excellent for maintainability. The cross-references are helpful. The lack of completeness regarding new scaffold concepts could lead to future terms being added ad-hoc without formalization, but the framework for additions is solid. |
| Test Coverage | 95 | While the glossary itself doesn't have 'test coverage' in the traditional sense, its clear definitions directly impact the testability and clarity of other specs and code. The examples of 'testable acceptance criteria' and 'audit log' in the 'Spec-System Vocabulary' suggest an underlying commitment to testability within the spec system itself. The glossary terms like 'Dedup Hash' and 'Error Code Range' are implicitly testable concepts. |

**Drift findings:**
- **[G1] PascalCase for all DB table & column names** (sev 8 · impact 9) — spec-says-code-doesnt
  - Evidence: Spec: 'PascalCase (...) Mandatory for (...) all DB table & column names.' Impl: `src/types/index.ts` defines `ItemType` with lowercase values (e.g., 'bullet', 'h1') which are explicitly described as needing to match 'DB column convention'. This contradicts PascalCase for DB column names.
  - Fix: spec/19-glossary.md: Revise the PascalCase definition under 'Naming Conventions' to explicitly allow lowercase/snake_case for enum values that map to DB columns or types, or mandate PascalCase for `ItemType` values themselves to match the spec. Given v13 migration, the latter is more likely correct.

Option 1 (Revise Spec):
```diff
--- a/spec/19-glossary.md
+++ b/spec/19-glossary.md
@@ -21,7 +21,7 @@
 | Term | Definition |
 |------|-----------|
 | **camelCase** | First word lowercase, subsequent words capitalised (e.g., `pluginSlug`). Mandatory for all variable names, function arguments, log context keys (PHP/Go/TS). |
-| **PascalCase** | All words capitalised (e.g., `PluginSlug`). Mandatory for class names, type names, exported Go identifiers, **all DB table & column names**, and enum constant names. |
+| **PascalCase** | All words capitalised (e.g., `PluginSlug`). Mandatory for class names, type names, exported Go identifiers, **all DB table & column names (except for `ItemType` enum values)**, and enum constant names. |
 | **snake_case** | Words separated by underscores (e.g., `plugin_slug`). **PROHIBITED** project-wide except inside protocol-driven enums (HTTP headers, content types, etc.) and WordPress hook callbacks. |
 | **kebab-case** | Words separated by hyphens (e.g., `plugin-slug`). Used only for URL slugs, file names, CSS classes, and directory names. |
 | **SCREAMING_SNAKE_CASE** | All uppercase with underscores. Reserved for compile-time constants in PHP only (e.g., `class-level const FATAL_TYPES`). |
```
OPTION 2 (Implement PascalCase for ItemType):
```diff
--- a/src/types/index.ts
+++ b/src/types/index.ts
@@ -30,19 +30,19 @@
  * NOTE: `dashboard` is a VIEW, not an item type — do not add it here.
  */
 export type ItemType =
-  | "bullet"
-  | "h1"
-  | "h2"
-  | "h3"
-  | "paragraph"
-  | "todo"
-  | "numbered"
-  | "board"
-  | "quote"
-  | "code"
-  | "divider"
-  | "mirror";
+  | "Bullet"
+  | "H1"
+  | "H2"
+  | "H3"
+  | "Paragraph"
+  | "Todo"
+  | "Numbered"
+  | "Board"
+  | "Quote"
+  | "Code"
+  | "Divider"
+  | "Mirror";
```
- **[G2] Missing definition for 'Branded ID Types'** (sev 6 · impact 7) — missing-spec
  - Evidence: The concept of 'Branded ID Types' is a fundamental implementation detail in `src/types/index.ts` yet it's entirely absent from the glossary. The implementation explicitly states its purpose and reasoning but the spec lacks this.
  - Fix: spec/19-glossary.md: Add a new entry under a hypothetical 'Type System Vocabulary' or 'Coding Standards Vocabulary' section for 'Branded ID Type'.

```diff
--- a/spec/19-glossary.md
+++ b/spec/19-glossary.md
@@ -100,6 +100,10 @@
 | **Zero magic strings** | Every domain string must reference an enum case via `EnumType::Case->value` (PHP) or `EnumType.Case` (Go/TS). Hardcoded `"success"`, `"all"`, etc. are prohibited. |
 
 ---
+
+## Type System Vocabulary
+
+| Term | Definition |
+|------|-----------|
+| **Branded ID Type** | TypeScript pattern using `unique symbol` to create nominal types from primitive strings (e.g., `ItemId`, `OwnerId`). Prevents accidental mixing of identifiers with different semantic meanings while maintaining runtime efficiency. Ensures type safety at trust boundaries. |
 
 ## Database Vocabulary
 
```
- **[G3] Missing definition for 'TailwindCSS variants (e.g., `bg-success`)'** (sev 4 · impact 5) — missing-spec
  - Evidence: The `Toaster.tsx` component heavily relies on TailwindCSS variant classes (e.g., `bg-success`, `text-destructive`). While Tailwind is broadly a styling framework, the mapping of `ToastVariant` to `VARIANT_CLASSES` implies a consistent design token system that warrants a glossary entry or cross-reference to `mem://design/theme`.
  - Fix: spec/19-glossary.md: Add a new entry under 'Frontend Vocabulary' for 'TailwindCSS Variant Classes' or 'Design Tokens' that references `mem://design/theme` and explains their role in mapping semantic variants to CSS utility classes.

```diff
--- a/spec/19-glossary.md
+++ b/spec/19-glossary.md
@@ -155,3 +155,7 @@
 
 ----
 
+## Design System Vocabulary
+
+| Term | Definition |
+|------|-----------|
+| **Design Tokens** | Abstract units of visual style, such as colors, fonts, spacing. Mapped to TailwindCSS utility classes (e.g., `bg-success`) as defined in `src/index.css` and referenced by `mem://design/theme`. |
+
```
- **[G4] Inconsistent casing for `itemType` vs. `ItemType`** (sev 5 · impact 6) — contradiction
  - Evidence: The spec defines `itemType` (camelCase) under 'Frontend Vocabulary' as an 'enum field on Node'. The 'Naming Conventions' table mandates PascalCase for 'type names'. In `src/types/index.ts`, `ItemType` (PascalCase) is declared as a type, but its usage, e.g., in the `Item` interface: `readonly itemType: ItemType;` uses `itemType` (camelCase). This implies `itemType` is a property/field name, which correctly follows camelCase, but the glossary's definition of PascalCase for 'type name' and 'enum constant names' makes the `ItemType` type declaration itself correct, creating an ambiguity about the glossary's intent regarding enum *field names* vs. *type names* vs. *value casing*.
  - Fix: spec/19-glossary.md: Clarify the distinction between enum TYPE names (PascalCase), enum FIELD names (camelCase), and enum VALUE casing (which seems to be implicitly lowercase based on current `ItemType` values, contradicting PascalCase for DB columns). The 'ItemType' type name itself is PascalCase, matching 'type names'. The 'itemType' field on `Item` is camelCase, matching 'variable names'. The ambiguity is whether the enum *values* ('bullet', 'h1') should be PascalCase if they represent DB column names per the PascalCase rule for DB column names.

Correction to 'Naming Conventions' for clarity:
```diff
--- a/spec/19-glossary.md
+++ b/spec/19-glossary.md
@@ -19,7 +19,7 @@
 | Term | Definition |
 |------|-----------|
 | **camelCase** | First word lowercase, subsequent words capitalised (e.g., `pluginSlug`). Mandatory for all variable names, function arguments, log context keys (PHP/Go/TS), **and object field names referencing enum types**. |
-| **PascalCase** | All words capitalised (e.g., `PluginSlug`). Mandatory for class names, type names, exported Go identifiers, **all DB table & column names**, and enum constant names. |
+| **PascalCase** | All words capitalised (e.g., `PluginSlug`). Mandatory for class names, type names, exported Go identifiers, **all DB table & column names**, and enum type names. | 
```
And clarify the `ItemType` definition in the glossary to state its values are lowercase despite being DB-related, or (preferably, to maintain consistency) update `ItemType` values to PascalCase in code.
- **[G5] Missing definition for `Hotkeys Registry`** (sev 7 · impact 8) — missing-spec
  - Evidence: The `src/lib/hotkeys.ts` file explicitly labels itself as the 'Hotkey Registry — Single Source of Truth (F-07)' and dedicates a significant amount of code to enforcing this concept. The glossary, which serves as the 'Cross-Spec Terminology SSOT', should contain an entry for this core concept.
  - Fix: spec/19-glossary.md: Add a new entry under 'Frontend Vocabulary' or a new 'Interaction Vocabulary' section for 'Hotkey Registry'.

```diff
--- a/spec/19-glossary.md
+++ b/spec/19-glossary.md
@@ -155,3 +155,10 @@
 
 ----
 
+## Interaction Vocabulary
+
+| Term | Definition |
+|------|-----------|
+| **Hotkey Registry** | The canonical, declarative list of all keyboard shortcuts in the application (`src/lib/hotkeys.ts`). Handlers must reference bindings by their stable `HotkeyId` rather than hardcoding key strings, enforcing a single source of truth for all keyboard interactions. |
+
```
- **[G6] Missing `ToastContext` and `useToast` definitions** (sev 5 · impact 6) — missing-spec
  - Evidence: The `ToastContext.tsx` and `useToast` hook are a central part of the current scaffold, handling UI notifications. These components establish a significant frontend pattern and vocabulary ('Toast queue', 'ToastVariant', 'ToastInput', 'ToastEntry') that should be formalized in the glossary.
  - Fix: spec/19-glossary.md: Add new entries under 'Frontend Vocabulary' for 'Toast Context', 'Toast Queue', 'ToastVariant', 'ToastInput', and 'ToastEntry'.

```diff
--- a/spec/19-glossary.md
+++ b/spec/19-glossary.md
@@ -151,3 +151,19 @@
 | **250-item view limit** | Hard cap on visible Nodes per single zoom level. Triggers virtualisation at ≥1000 total descendants. |
 | **errorStore** | Zustand store at `src/stores/errorStore.ts`. Centralises every captured error; backs the Global Error Modal. |
 
+## Frontend Vocabulary (continued)
+
+| Term | Definition |
+|------|-----------|
+| **Toast Context** | React Context (`src/contexts/ToastContext.tsx`) managing ephemeral user notifications (toasts). Provides `useToast` hook for adding, dismissing, and clearing toasts programmatically. |
+| **Toast Queue** | The ordered list of active notification messages displayed to the user via the `Toaster` component. Managed by the `ToastContext`. |
+| **ToastVariant** | Discriminated union type (`'success' | 'error' | 'info' | 'warning'`) defining the visual style and semantic meaning of a toast notification. |
+| **ToastInput** | Interface defining the required payload for creating a new toast notification, including `message`, `variant`, optional `errorCode`, and `durationMs`. |
+| **ToastEntry** | Interface representing a single toast notification within the `Toast Queue`, including its unique `id`, `createdAt` timestamp, and all `ToastInput` properties. |
+
```
- **[G7] Missing definition for `cn` utility function** (sev 2 · impact 3) — missing-spec
  - Evidence: The `src/lib/utils.ts` exports a `cn` function for TailwindCSS class merging, which is a common utility pattern in frontends. While trivial, as a recurring coding standard, it warrants a brief entry in the glossary or coding standards section.
  - Fix: spec/19-glossary.md: Add a new entry under 'Coding Standards Vocabulary' for the `cn` utility.

```diff
--- a/spec/19-glossary.md
+++ b/spec/19-glossary.md
@@ -100,6 +100,9 @@
 | **Zero magic strings** | Every domain string must reference an enum case via `EnumType::Case->value` (PHP) or `EnumType.Case` (Go/TS). Hardcoded `"success"`, `"all"`, etc. are prohibited. |
 
 ---
+
+## Coding Standards Vocabulary (continued)
+
+| Term | Definition |
+|------|-----------|
+| **`cn` utility** | Frontend utility function (`src/lib/utils.ts`) that combines `clsx` and `tailwind-merge` to conditionally concatenate and deduplicate TailwindCSS class names. Used for dynamic styling. |
```
- **[G8] Naming conventions inconsistency for `DEBOUNCE_SAVE_MS` and `MAX_RETRY_ATTEMPTS`** (sev 4 · impact 5) — spec-says-code-doesnt
  - Evidence: The spec states 'SCREAMING_SNAKE_CASE (...) Reserved for compile-time constants in PHP only'. However, `src/lib/constants.ts` defines `DEBOUNCE_SAVE_MS` and `MAX_RETRY_ATTEMPTS` using SCREAMING_SNAKE_CASE in TypeScript.
  - Fix: spec/19-glossary.md: Update the 'SCREAMING_SNAKE_CASE' definition to include TypeScript constants, or rename the constants in `src/lib/constants.ts` to use camelCase (less likely given the nature of constants).

Option 1 (Revise Spec):
```diff
--- a/spec/19-glossary.md
+++ b/spec/19-glossary.md
@@ -24,7 +24,7 @@
 | **snake_case** | Words separated by underscores (e.g., `plugin_slug`). **PROHIBITED** project-wide except inside protocol-driven enums (HTTP headers, content types, etc.) and WordPress hook callbacks. |
 | **kebab-case** | Words separated by hyphens (e.g., `plugin-slug`). Used only for URL slugs, file names, CSS classes, and directory names. |
-| **SCREAMING_SNAKE_CASE** | All uppercase with underscores. Reserved for compile-time constants in PHP only (e.g., `class-level const FATAL_TYPES`). |
+| **SCREAMING_SNAKE_CASE** | All uppercase with underscores. Reserved for compile-time constants in PHP (e.g., `class-level const FATAL_TYPES`) **and global read-only constants across all languages (e.g. `const MAX_ITEMS`)**. |
```
Option 2 (Rename constants in code):
```diff
--- a/src/lib/constants.ts
+++ b/src/lib/constants.ts
@@ -7,10 +7,10 @@
  */
 
 export const APP_NAME = "WorkFlowy";
-
 /** Autosave debounce window. Spec: spec/31-app/01-features/14-concurrency-and-sync.md */
-export const DEBOUNCE_SAVE_MS = 1500;
+export const debounceSaveMs = 1500;
 
 /** Network retry cap. Spec: spec/31-app/01-features/14-concurrency-and-sync.md */
-export const MAX_RETRY_ATTEMPTS = 3;
+export const maxRetryAttempts = 3;
```
- **[G9] Missing definition for `Layout Components`** (sev 3 · impact 4) — missing-spec
  - Evidence: The file `src/components/layout/index.ts` introduces the concept of 'Layout components — Phase 2', indicating a structured approach to UI layout. This organizational term warrants a glossary entry.
  - Fix: spec/19-glossary.md: Add an entry under 'Frontend Vocabulary' for 'Layout Components'.

```diff
--- a/spec/19-glossary.md
+++ b/spec/19-glossary.md
@@ -155,3 +155,10 @@
 
 ---
+
+## Frontend Vocabulary (continued)
+
+| Term | Definition |
+|------|-----------|
+| **Layout Components** | UI components (`src/components/layout/`) responsible for structuring the primary application chrome, such as global navigation, sidebars, and main content areas. |
+
```

---

### `spec/20-enums-index.md` — 71.75/100

**Status:** scaffold-only
**Summary:** The enum index is generally well-structured and clear for a spec-only project. However, several universal rules are not yet reflected in the early TypeScript scaffold, and there are direct contradictions and missing definitions for implemented `ItemType` and `ToastVariant` enums.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 85 | The spec is comprehensive in its intent, covering universal rules, per-language references, domain enums, and a checklist for adding new enums. However, it's missing specific enum definitions for the already implemented `ToastVariant` and the implied `LogLevelType` which, by its own rules, should be universal. |
| Consistency | 65 | The spec attempts to be consistent across languages but has internal contradictions. For instance, `ItemType` is labelled as an 'Enum' but uses lowercase cases (violating Universal Rule 1) with an inline justification, whereas Rule 1 specifically mentions 'Go, PHP, TS'. Section 4 provides a formal exemption for 'Protocol-Driven Enums' from PascalCase, but `ItemType` (a domain enum) does not fall under that. The rules for TS implementation of enums (native serialization) are vague and lead to drift with the `ToastVariant` implementation as a union type without an 'Invalid' fallback. |
| Alignment | 60 | Given the 'SPEC-ONLY' mode and 'early P1.1 scaffold' status, direct alignment is expected to be low for unimplemented features. However, for features that ARE scaffolded (`ToastVariant`, `ItemType`), there's significant drift (missing spec entry, type definition vs. enum intent, rule violations). This indicates the spec isn't fully guiding the early implementation where it should, or the spec itself needs clarification for early-stage implementation details in TS. |
| Clarity | 75 | The spec is generally clear and well-organized. The tabular format makes it easy to read. However, the exact implications of 'enum-native string serialisation' for TypeScript and the specific expectations for 'default fallback' are not crystal clear, which contributes to implementation drift. The inline justifications for `ItemType`'s casing (per DB column convention) while simultaneously listing it as a universal domain enum under PascalCase rules introduces ambiguity. |
| Maintainability | 70 | The explicit checklist for adding new enums is excellent for maintainability. The cross-references are also valuable. However, the inconsistencies and ambiguities noted in the consistency and clarity sections, if left unaddressed, will hinder maintainability as more enums are added and implemented across languages, requiring repeated clarification or workarounds. |
| Test Coverage | 80 | The spec itself doesn't directly dictate test coverage, but its clarity and consistency indirectly support clear test plans. The current code lacks unit tests specifically for branded types (e.g., `ItemId`, `OwnerId`) beyond basic construction tests, or a dedicated TypeScript enum test structure. |

**Drift findings:**
- **[D1] Universal Rule 3: Zero Magic Strings - `ToastVariant` unimplemented** (sev 8 · impact 7) — spec-says-code-doesnt
  - Evidence: Spec states 'Zero magic strings — every domain string must reference an enum case' (Rule 3). In `src/contexts/ToastContext.tsx`, `ToastVariant` is a union type, not an enum. `src/components/ui/Toaster.tsx` also directly maps string literals to CSS classes, violating the 'enum-native string serialization' if it were an enum as implied.
  - Fix: src/contexts/ToastContext.tsx:
```typescript
// BEFORE:
export type ToastVariant = "success" | "error" | "info" | "warning";

// AFTER:
// This should be a direct implementation of a TypeScript enum, possibly
// using a const object + union to align with TS spec recommendations.
// e.g. export const ToastVariant = { SUCCESS: 'success', ERROR: 'error', ... } as const;
// export type ToastVariant = (typeof ToastVariant)[keyof typeof ToastVariant];
```
And update `src/components/ui/Toaster.tsx` to reference the enum members instead of string literals.
It also requires adding `ToastVariant` to Section 3.1 "Status & Result" or a new relevant section in `spec/20-enums-index.md`.
- **[D2] Universal Rule 4: `isEqual()` for comparison (PHP/Go) — TS equivalent missing** (sev 6 · impact 5) — spec-says-code-doesnt
  - Evidence: Spec mentions `isEqual()` for PHP and `==` for Go. TypeScript context (e.g., `ToastVariant` comparisons in `Toaster.tsx`) directly uses string equality. While `==` works for string literals, the absence of a specified TS comparison mechanism indicates a gap.
  - Fix: Add a new Universal Rule (e.g., Rule 4.1 'TypeScript: direct string comparison or type-guard for string-backed enums') or update Rule 4 to explicitly include TypeScript's approach for string-backed union types/enums. If an `isEqual` utility is desired for TS, it should be defined and applied.
- **[D3] Universal Rule 6: `Invalid` zero value / default fallback missing in TS `ToastVariant`** (sev 7 · impact 6) — spec-says-code-doesnt
  - Evidence: Spec states `Invalid` is the zero value (Go) or default fallback (PHP/TS)'. The `ToastVariant` union type (`ToastVariant = "success" | "error" | "info" | "warning"`) in `src/contexts/ToastContext.tsx` lacks an explicit 'Invalid' or similar fallback variant. This could lead to unhandled states.
  - Fix: src/contexts/ToastContext.tsx:
```typescript
// BEFORE:
export type ToastVariant = "success" | "error" | "info" | "warning";

// AFTER:
export type ToastVariant = "success" | "error" | "info" | "warning" | "invalid";
// Also, ensure a default value or handling for ToastVariant='invalid' is present where it is used, e.g., in Toaster.tsx.
```
And update the spec `spec/20-enums-index.md` to add `ToastVariant` to Section 3.1 or a new relevant section, clearly stating its default fallback case.
- **[D4] Missing spec for `ToastVariant` enum** (sev 9 · impact 8) — missing-spec
  - Evidence: The `ToastVariant` type (`success`, `error`, `info`, `warning`) is defined and used in `src/contexts/ToastContext.tsx` and `src/components/ui/Toaster.tsx`, but it is not listed in Section 3, 'Universal Domain Enums', nor in Section 4 'Protocol-Driven Enums' of `spec/20-enums-index.md`. This is a core UI/App enum.
  - Fix: spec/20-enums-index.md:
Add `ToastVariant` to Section 3.1 "Status & Result" or a new appropriate subsection, including its cases (`success`, `error`, `info`, `warning`) and 'Used For' description.
- **[D5] Inconsistent classification of `ItemType` as 'Enum' vs. 'Type'** (sev 7 · impact 6) — contradiction
  - Evidence: Spec/20-enums-index.md lists `ItemType` in Section 3.5 'WorkFlowy (Outliner)' as an 'Enum'. However, in `src/types/index.ts`, it is implemented as a TypeScript union type `export type ItemType = ...`. This contradicts the spec's implied 'enum' implementation and the spec's own 'TS Standards' guidance (Rule 4, second table, which points to an 'overview' which likely mentions `const` objects for enums). The `ItemType` also deviates from the universal rule 1 'PascalCase case names' by using lowercase, ostensibly 'per DB column convention' as noted in the spec for this one enum.
  - Fix: spec/20-enums-index.md:
1. Clarify whether `ItemType` should be treated as a true TypeScript enum (`const` object + union type) or just a union type of string literals.
2. If it is meant to be a union of string literals for DB convention, Section 1 should be updated to explicitly list 'lowercase string literals' as an acceptable case style for certain domain enums, similar to how Protocol-Driven Enums are exempt from PascalCase string rules in Section 4.
3. Update Section 3.5 to reflect the lowercase nature of `ItemType` cases. Example:
```markdown
| Enum | Cases | Used For | 
|---|---|---|
| `ItemType` | `"bullet"`, `"h1"`, `"h2"`, ... | 12 distinct outliner node types ... Lowercase per DB column convention; ... |
```
src/types/index.ts:
```typescript
// BEFORE:
export type ItemType = "bullet" | "h1" | ...

// AFTER (if standard TS enum is desired based on spec clarification):
// export const ItemType = {
//   BULLET: 'bullet',
//   H1: 'h1',
//   // ...
// } as const;
// export type ItemType = (typeof ItemType)[keyof typeof ItemType];
// This would also require updates in `spec/20-enums-index.md` to indicate 'BULLET' as the enum case name and possibly 'bullet' as the string label.
// If keeping as string union, then only spec clarification is needed.
```
- **[D6] `LogLevelType` missing from implementation** (sev 5 · impact 4) — spec-says-code-doesnt
  - Evidence: Section 3.1 of the spec lists `LogLevelType` (`Trace`, `Debug`, `Info`, `Warn`, `Error`, `Fatal`), but no corresponding type or enum is found in the current TypeScript scaffold.
  - Fix: src/types/index.ts (or a new `src/types/log.ts`): Reconcile the spec with code.
```typescript
// AFTER:
export type LogLevelType = 'Trace' | 'Debug' | 'Info' | 'Warn' | 'Error' | 'Fatal';
// Or a const object as per future TS enum guidelines.
```
This also applies to any other universal enumerations (`StatusType`, `HttpMethodType`, `ErrorCategoryType`, etc.) that are listed in the spec but not yet implemented in the scaffold where their usage would be anticipated.
- **[D7] Universal Rule 1: 'PascalCase string label' in `variantLabels` (Go) - TS equivalent not specified** (sev 6 · impact 5) — missing-spec
  - Evidence: Rule 1 specifies 'PascalCase string label in `variantLabels` table' specifically for Go. While PHP/TS are noted to 'use enum-native string serialisation', the current `ToastVariant` (`success`, `error`, `info`, `warning`) deviates by not being PascalCase, and it's also not an enum with native serialization.
  - Fix: spec/20-enums-index.md:
Update Universal Rule 1 to clarify the expected string serialization for TypeScript's `const` object + union pattern or explicitly state when lowercase string literals are acceptable/required (e.g., for `ItemType`). This is closely related to D5.

---

### `spec/31-app/00-overview.md` — 86.25/100

**Status:** scaffold-only
**Summary:** This overview spec serves as a strong architectural and navigational guide for the WorkFlowy application. It clearly defines the mission, load-bearing rules, MVP scope, and organizational structure, providing a high degree of clarity and completeness for the project in its current 'SPEC-ONLY' mode. Code scaffold demonstrates initial setup but doesn't implement features yet, which is expected.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 95 | The spec provides a comprehensive overview for the app, detailing mission, load-bearing rules, MVP scope, initial reading order, and folder structure. It clearly delineates what is in scope (MVP) and what is deferred (Phase 2), which is excellent for a SPEC-ONLY project. It identifies specific sub-specs for various features. Some minor `mem://` references lacking concrete target files are the only slight detraction from absolute completeness, and some missing line references for hotkeys. |
| Consistency | 75 | High internal consistency in structure and cross-referencing, but several contradictions were found: the `mem://` pseudo-protocol appearing in AI reading order and load-bearing rules points to non-existent conceptual locations (should be `spec/` files), the `MAX_ITEMS_PER_VIEW` SSOT has multiple references. The most critical inconsistency is the explicit 'No Node' rule (L9) versus the Node.js/Vite based build system in the `package.json`. There's also a minor inconsistency in hotkey `specRef` granularity. |
| Alignment | 85 | In SPEC-ONLY mode with a minimal scaffold, alignment focuses on major architectural decisions reflected. The core intent of a React app to fulfill the WorkFlowy clone is evident. The `AppLayout` scaffold is correctly described as a passthrough anticipating future UI. However, the fundamental contradiction around 'No Node' (L9) vs. the Node.js frontend tech stack is a significant misalignment at the architectural level, dragging the score down. Other issues like SSE implementation are for future phases, so they don't count as misalignment yet. |
| Clarity | 90 | The spec is exceptionally clear, with a well-defined mission, strict load-bearing rules, and a prioritized MVP scope. The 'AI may not invent behavior' instruction is a stellar clarity feature. The auto-generated TOC and folder descriptions aid navigability. The prose is concise and avoids jargon where possible. The use of `mem://` references slightly reduces clarity by pointing to abstract concepts rather than concrete file paths. |
| Maintainability | 90 | The structured approach with numbered rules, clear cross-references, and explicit versioning makes this spec highly maintainable. The segregation of UI concerns (`32-ui-design/`) from behavior (`31-app/`) is a best practice. The 'AI reading order' section is a thoughtful addition for maintainability when onboarding new developers or, indeed, AIs. Issues like unresolved `mem://` links and the backend runtime contradiction introduce minor maintenance overhead if not resolved. |
| Test Coverage | 70 | The spec mentions `97-acceptance-criteria.md` with explicit `AT-APP-01..25` testable criteria, which is excellent. The code scaffold includes `vitest` tests for `ToastContext` and `hotkeys.ts`, demonstrating a commitment to testing. However, this overview document itself is not directly testable beyond its structure and references being valid. The provided code tests cover the functionality implemented by the scaffold but don't address the full breadth of the spec yet, which is expected for 'scaffold-only' status. |

**Drift findings:**
- **[D1] Backend runtime constraint violation in `package.json`** (sev 9 · impact 10) — spec-says-code-doesnt
  - Evidence: Spec L9 'Backend runtime is WordPress plugin (PHP 8.1+ + SQLite via PDO). No Node, Postgres, Supabase...' but `package.json` explicitly includes `vite`, `@vitejs/plugin-react-swc`, `@tanstack/react-query` which are Node.js/frontend build tools and libraries, implicitly assuming a non-PHP direct backend interaction or a headless CMS setup.
  - Fix: This is a fundamental architectural contradiction. Reconcile `spec/31-app/00-overview.md#L9` with the chosen implementation stack. If Node.js/Vite is intended for the frontend, the spec should clarify this and distinguish it from the backend runtime. If 'No Node' means the entire stack, then the current `package.json` is a direct violation.

Option 1 (Clarify Spec): Amend spec L9 to explicitly state Node.js/Vite for frontend, PHP for backend API.
```diff
--- a/spec/31-app/00-overview.md
+++ b/spec/31-app/00-overview.md
@@ -38,7 +38,7 @@
 | L8 | Roles live in a **separate table** (never on profile/users). All authorization checks go through a single PHP helper `Auth::hasRole($userId, $role)` (server-side, never client-trusted). | `01-features/15-roles-and-permissions.md` |
 | L9 | Backend runtime is **WordPress plugin (PHP 8.1+ + SQLite via PDO)**. No Node, Postgres, Supabase. Realtime is delivered via WP-native **Server-Sent Events (SSE)** with a 5 s poll fallback — never WebSockets, never Postgres LISTEN/NOTIFY. | `mem://constraints/backend-runtime-deferred` |
 | L9 | Backend runtime is **WordPress plugin (PHP 8.1+ + SQLite via PDO)**. No Node, Postgres, Supabase. Frontend runtime is Node.js/Vite. Realtime is delivered via WP-native **Server-Sent Events (SSE)** with a 5 s poll fallback — never WebSockets, never Postgres LISTEN/NOTIFY. |
 ```

Option 2 (Align Code to Spec): If 'No Node' truly means no Node.js anywhere, then the entire `package.json` and build setup needs to be replaced with a PHP-only templating/build system, which is unlikely for a modern SPA.
- **[D2] Inconsistent 'mem://' vs. 'spec/' references** (sev 6 · impact 5) — contradiction
  - Evidence: The spec guide under 'If you are an AI implementing this app...' advises reading `mem://architecture/data-model` (item 1) and `mem://constraints/backend-runtime-deferred` (item 9) under 'Load-Bearing Rules', but these `mem://` references are internal conventions/placeholders, not actual file paths. This contradicts the general pattern of linking to `spec/` files.
  - Fix: Update all `mem://` references to valid `spec/` file paths or clearly define `mem://` as a designator for internal, unwritten specifications in the spec authoring guide.

In `spec/31-app/00-overview.md`:
```diff
--- a/spec/31-app/00-overview.md
+++ b/spec/31-app/00-overview.md
@@ -12,7 +12,7 @@

 **If you are an AI implementing this app, read in this exact order:**

-1. [`mem://architecture/data-model`](#) — the unified `Item` node contract.
+1. [`spec/31-app/01-features/01-information-model.md`](./01-features/01-information-model.md) — the unified `Item` node contract.
 2. [`01-features/01-information-model.md`](./01-features/01-information-model.md) — entity-relationship rules.
 3. [`01-features/03-layout-structure.md`](./01-features/03-layout-structure.md) — NavBar + Sidebar + Page shell.
 4. [`01-features/04-page-content-area.md`](./01-features/04-page-content-area.md) — recursive item rendering.
@@ -38,7 +38,7 @@
 | L8 | Roles live in a **separate table** (never on profile/users). All authorization checks go through a single PHP helper `Auth::hasRole($userId, $role)` (server-side, never client-trusted). | `01-features/15-roles-and-permissions.md` |
 | L9 | Backend runtime is **WordPress plugin (PHP 8.1+ + SQLite via PDO)**. No Node, Postgres, Supabase. Realtime is delivered via WP-native **Server-Sent Events (SSE)** with a 5 s poll fallback — never WebSockets, never Postgres LISTEN/NOTIFY. | `mem://constraints/backend-runtime-deferred` |
 | L9 | Backend runtime is **WordPress plugin (PHP 8.1+ + SQLite via PDO)**. No Node, Postgres, Supabase. Realtime is delivered via WP-native **Server-Sent Events (SSE)** with a 5 s poll fallback — never WebSockets, never Postgres LISTEN/NOTIFY. | `spec/01-architecture/02-data-model.md` |
 ```
Also found similar `mem://` references in `src/contexts/ToastContext.tsx` and `src/lib/constants.ts` which should also be updated or clarified.
- **[D3] Missing `mem://design/theme` spec for Toast styling** (sev 4 · impact 3) — missing-spec
  - Evidence: In `src/components/ui/Toaster.tsx`, the comment states 'styling uses semantic design tokens only (`mem://design/theme`)', indicating a dependency on a `mem://` spec that does not exist or is not adequately cross-referenced from this `00-overview.md` spec.
  - Fix: Either provide a concrete spec file for `mem://design/theme` and cross-reference it from this overview, or inline the relevant details into `32-ui-design/` if it's not substantial enough for a dedicated spec file.

File: `spec/31-app/00-overview.md`
```diff
--- a/spec/31-app/00-overview.md
+++ b/spec/31-app/00-overview.md
@@ -124,6 +124,7 @@
 Cross-References
 | Reference | Location |
 |-----------|----------|
+| UI Design (design tokens) | [`../32-ui-design/03-theme-design-tokens.md`](../32-ui-design/03-theme-design-tokens.md) |
 | UI Design (visual SSOT) | [`../32-ui-design/00-overview.md`](../32-ui-design/00-overview.md) |
 | Coding guidelines | [`../02-coding-guidelines/00-overview.md`](../02-coding-guidelines/00-overview.md) |
```
- **[D4] Hotkeys: `ZoomIn`, `ZoomOut`, `ToggleExpand` lack specific spec line references** (sev 3 · impact 2) — missing-spec
  - Evidence: In `src/lib/hotkeys.ts`, the `specRef` for `ToggleExpand`, `ZoomIn`, `ZoomOut`, `Undo`, and `Redo` points to the general file `spec/31-app/01-features/05-interactions.md` without specific line numbers, unlike most other hotkeys which point to specific lines (e.g., `#L24`). Also, the Overview references `05-interactions.md` but not these specific interactions.
  - Fix: Update the `specRef` in `src/lib/hotkeys.ts` with explicit line numbers for `ToggleExpand`, `ZoomIn`, `ZoomOut`, `Undo`, and `Redo` once those interactions are detailed in their respective lines in `spec/31-app/01-features/05-interactions.md`.

File: `src/lib/hotkeys.ts`
```diff
--- a/src/lib/hotkeys.ts
+++ b/src/lib/hotkeys.ts
@@ -100,19 +100,19 @@
     id: 'ToggleExpand',
     combo: { mod: true, key: '.' },
     scope: 'itemRow',
-    description: 'Toggle expand/collapse of item children',
-    specRef: 'spec/31-app/01-features/05-interactions.md',
+    description: 'Toggle expand/collapse of item children (F-05.17)',
+    specRef: 'spec/31-app/01-features/05-interactions.md#LXX',
   },
   {
     id: 'ZoomIn',
     combo: { mod: true, shift: true, key: '.' },
     scope: 'itemRow',
-    description: 'Zoom into focused item',
-    specRef: 'spec/31-app/01-features/05-interactions.md',
+    description: 'Zoom into focused item (F-05.18)',
+    specRef: 'spec/31-app/01-features/05-interactions.md#LXX',
   },
   {
     id: 'ZoomOut',
     combo: { mod: true, shift: true, key: ',' },
     scope: 'global',
-    description: 'Zoom out one level',
-    specRef: 'spec/31-app/01-features/05-interactions.md',
+    description: 'Zoom out one level (F-05.19)',
+    specRef: 'spec/31-app/01-features/05-interactions.md#LXX',
   },
   {
     id: 'OpenSearch',
@@ -128,13 +128,13 @@
     combo: { mod: true, key: 'z' },
     scope: 'global',
     description: 'Undo last action',
-    specRef: 'spec/31-app/01-features/05-interactions.md',
+    specRef: 'spec/31-app/01-features/05-interactions.md#LXX',
   },
   {
     id: 'Redo',
     combo: { mod: true, shift: true, key: 'z' },
     scope: 'global',
     description: 'Redo last undone action',
-    specRef: 'spec/31-app/01-features/05-interactions.md',
+    specRef: 'spec/31-app/01-features/05-interactions.md#LXX',
   },
 ];
```
- **[D5] Hardcoded `MAX_ITEMS_PER_VIEW` in code contradicts spec source** (sev 6 · impact 7) — contradiction
  - Evidence: Spec L4 states 'A view never renders more than **250 items at once**...'. In `src/lib/constants.ts`, `MAX_ITEMS_PER_VIEW` is set to 250, correctly. However, the spec source in the `constants.ts` comment is listed as `SSOT: core memory rule "250-item limit per view" (mem://architecture/data-model)` and `Spec: spec/31-app/01-features/04-page-content-area.md (virtualization)`, while the `Load-Bearing Rule L4` in this overview document lists `mem://architecture/data-model` as the source. This is a consistency issue regarding the Single Source of Truth reference for a critical constant.
  - Fix: Consolidate or clarify the SSOT for `MAX_ITEMS_PER_VIEW`. If `mem://architecture/data-model` is the SSOT for the rule itself, then the specific implementation details (virtualization) belong to `04-page-content-area.md` which should be explicitly referenced from `mem://architecture/data-model`.

File: `spec/31-app/00-overview.md`
```diff
--- a/spec/31-app/00-overview.md
+++ b/spec/31-app/00-overview.md
@@ -30,7 +30,7 @@
 | L2 | `Item.id` never changes (move, mirror, share, restore from trash). Deep links and mirror references depend on this. | §1.2 |
 | L3 | Each user has exactly one **root** Item, auto-created on signup, undeletable. | §1.1 |
 | L4 | A view never renders more than **250 items at once** (virtualize / paginate beyond). | `mem://architecture/data-model` |
+| L4 | A view never renders more than **250 items at once** (virtualize / paginate beyond). | `spec/01-architecture/02-data-model.md` |
 | L5 | Children are ordered by **fractional index** (string keys), not integer position. | `mem://features/editor-core` |
 | L6 | Mirrors reference the canonical source only — never a mirror of a mirror. | §1.3 |
```

File: `src/lib/constants.ts`
```diff
--- a/src/lib/constants.ts
+++ b/src/lib/constants.ts
@@ -19,8 +19,7 @@
  * Hard cap on items rendered in a single outliner view. Drives
  * virtualization decisions and pagination boundaries.
  *
- * SSOT: core memory rule "250-item limit per view"
- *       (`mem://architecture/data-model`).
- * Spec: spec/31-app/01-features/04-page-content-area.md (virtualization).
+ * SSOT: `spec/01-architecture/02-data-model.md`.
+ * Context: Virtualization details in `spec/31-app/01-features/04-page-content-area.md`.
  */
 export const MAX_ITEMS_PER_VIEW = 250;
```
- **[D6] Backend runtime details for SSE polling are not reflected** (sev 7 · impact 8) — spec-says-code-doesnt
  - Evidence: Load-Bearing Rule L9 states: 'Realtime is delivered via WP-native **Server-Sent Events (SSE)** with a 5 s poll fallback'. The provided scaffold (`package.json`, `vite.config.ts`, `main.tsx`) shows `@tanstack/react-query` configured with `staleTime: 30 * 1000` and `retry: 3`, which hints at a client-side data fetching strategy but gives no indication of SSE or a 5-second poll fallback mechanism.
  - Fix: Since the project is in 'SPEC-ONLY' mode, this is an unimplemented feature. No code correction is needed yet, but the spec is firm on this point. Ensure that future implementation plans for data fetching (e.g., in `01-features/14-concurrency-and-sync.md`) explicitly address the SSE and polling requirements of L9. For now, acknowledge this as a gap to be filled by future implementation.
- **[D7] Use of `QueryClient` `staleTime` and `retry` suggests feature beyond current spec** (sev 2 · impact 1) — code-does-spec-doesnt
  - Evidence: In `src/main.tsx`, `@tanstack/react-query` is configured with `staleTime: 30 * 1000` and `retry: 3`. These are specific values for data caching and network resilience. While part of a standard library setup, their specific values are not yet reflected in any high-level spec like this overview or `01-features/14-concurrency-and-sync.md`.
  - Fix: Add a specific note in `spec/31-app/01-features/14-concurrency-and-sync.md` or a new '05-api-client-config.md' under conventions to reflect the chosen `staleTime` and `retry` values for `react-query`.

File: `spec/31-app/01-features/14-concurrency-and-sync.md` (or new file)
```markdown
## Network Client Configuration

- The application utilizes `@tanstack/react-query` for data fetching and caching.
- **`staleTime`**: Data is considered fresh for 30 seconds (`30_000` ms) before being marked as stale, triggering re-fetches per `react-query`'s default behavior.
- **`retry`**: Network requests will be retried up to 3 times on failure before the error is propagated to the UI. Refer to `MAX_RETRY_ATTEMPTS` in `src/lib/constants.ts`.
```
- **[D8] `DEBOUNCE_SAVE_MS` in code contradicts spec source** (sev 4 · impact 3) — contradiction
  - Evidence: In `src/lib/constants.ts`, `DEBOUNCE_SAVE_MS` is defined with a spec reference `spec/31-app/01-features/14-concurrency-and-sync.md`. However, this `00-overview.md` spec does not explicitly mention save debounce or point to `14-concurrency-and-sync.md` as a critical part of the initial AI reading order.
  - Fix: Ensure that `spec/31-app/01-features/14-concurrency-and-sync.md` is robust enough to cover `DEBOUNCE_SAVE_MS` and other concurrency details. If `DEBOUNCE_SAVE_MS` must be known early, consider adding it to the 'Load-Bearing Rules' or the 'AI reading order' in this overview. Otherwise, the reference within `constants.ts` itself is sufficient. The current state is just a mild inconsistency for a new AI persona reading order.

File: `spec/31-app/00-overview.md`
```diff
--- a/spec/31-app/00-overview.md
+++ b/spec/31-app/00-overview.md
@@ -21,7 +21,8 @@
 1. [`mem://architecture/data-model`](#) — the unified `Item` node contract.
 2. [`01-features/01-information-model.md`](./01-features/01-information-model.md) — entity-relationship rules.
 3. [`01-features/03-layout-structure.md`](./01-features/03-layout-structure.md) — NavBar + Sidebar + Page shell.
-4. [`01-features/04-page-content-area.md`](./01-features/04-page-content-area.md) — recursive item rendering.
-5. [`01-features/05-interactions.md`](./01-features/05-interactions.md) — keyboard + mouse contract.
-6. [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — `AT-APP-01..25` testable criteria.
+4. [`01-features/04-page-content-area.md`](./01-features/04-page-content-area.md) — recursive item rendering.
+5. [`01-features/05-interactions.md`](./01-features/05-interactions.md) — keyboard + mouse contract.
+6. [`01-features/14-concurrency-and-sync.md`](./01-features/14-concurrency-and-sync.md) — concurrency and sync (incl. save debounce).
+7. [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — `AT-APP-01..25` testable criteria.

Everything else under `01-features/` is a deeper view on a single feature; do not read it until you implement that feature.
```
- **[D9] Naming inconsistency for 'Mod' key in hotkeys** (sev 3 · impact 2) — contradiction
  - Evidence: In `src/lib/hotkeys.ts`, the `KeyCombo` interface defines `mod` as '⌘ on macOS, Ctrl elsewhere'. However, the `formatCombo` function explicitly uses `Ctrl` for non-Mac, and the `makeEvent` helper in `src/lib/hotkeys.test.ts` uses both `metaKey` and `ctrlKey` for `mod`. The spec (e.g., `05-interactions.md`) does not detail the cross-platform mapping for 'Mod', relying on the code.
  - Fix: Clarify the 'Mod' key mapping in `spec/31-app/01-features/05-interactions.md` to explicitly state its behavior on different OS to align the spec with the robust implementation in `hotkeys.ts`.

File: `spec/31-app/01-features/05-interactions.md` (add to a new section, e.g., 'Keyboard Modifiers')
```markdown
## Keyboard Modifiers

- **`Mod` key**: Refers to the `⌘ Command` key on macOS and the `Ctrl Control` key on Windows/Linux.
- **`Shift` key**: Standard Shift key.
- **`Alt` key**: Refers to the `⌥ Option/Alt` key on macOS and the `Alt` key on Windows/Linux.
```

---

### `spec/31-app/97-acceptance-criteria.md` — 77.25/100

**Status:** scaffold-only
**Summary:** This acceptance criteria spec is well-structured and aligns with the project's 'SPEC-ONLY' mode, covering a broad range of features. While foundational elements are specified, most criteria describe unimplemennted features, reflecting early P1.1 scaffold state. Clarity is high, but some references need updating for consistency.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 85 | The spec covers a wide range of application features, from core data model to UI interactions, security, and advanced features like mirroring. It serves as a comprehensive roadmap for future development. The primary gap is the lack of explicit criteria for fully implemented scaffold features like the Toast system and some hotkeys. |
| Consistency | 90 | The spec is largely consistent in its structure and referencing (`ID | Criterion | Source`). Minor inconsistencies exist in the 'Source' column, where some refer to `mem://` while others could point to active code, and some hotkeys are defined in code but lack corresponding acceptance criteria. |
| Alignment | 60 | Given the 'SPEC-ONLY' mode and early P1.1 scaffold, alignment is weak by design for most features. Most criteria (`AT-APP-01` through `AT-APP-25`) describe unimplemented features. Good alignment with `MAX_ITEMS_PER_VIEW` is emerging in `src/lib/constants.ts` and `src/lib/hotkeys.ts` implements many key combos, but these parts need further explicit ACs. |
| Clarity | 95 | Each criterion is clear, concise, and independently verifiable. The ID format and tracing back to source spec files are excellent. The purpose statement is clear. Use of 'mem://' for conceptual sources is also clear in this context. |
| Maintainability | 90 | The structure is highly maintainable with consistent ID formats, clear source linking, and logical grouping. The note on 'stable IDs' and 'never renumber' is crucial for long-term traceability. The verification section provides actionable commands. |
| Test Coverage | 10 | As an acceptance criteria document, its 'test coverage' refers to its ability to guide testing. The criteria are explicitly stated to be 'independently verifiable', which sets a good foundation. However, only 3 of the 25 criteria have any corresponding code (via `src/lib/hotkeys.ts` or `src/lib/constants.ts`), and even fewer actual unit tests demonstrate their implementation. The spec itself does not define test cases, only criteria. |

**Drift findings:**
- **[D1] Unimplemented Core Features (AT-APP-01, 02, 03, 04, 05)** (sev 8 · impact 9) — spec-says-code-doesnt
  - Evidence: Spec criteria AT-APP-01 through AT-APP-05 define fundamental aspects of the information model (root Item, immutable Item.id, unified Item type, fractional indexing, virtualization). The current scaffold (`src/types/index.ts`) only defines the types for `Item` and related structures, but no actual implementation of these behaviors or data structures exists.
  - Fix: No immediate correction needed for the spec in 'SPEC-ONLY' mode. This finding serves as a flag for future implementation. The `Item` interface in `src/types/index.ts` should be robustly implemented following these criteria.
- **[D2] Unimplemented Layout Shell Features (AT-APP-06, 07, 08, 09, 10)** (sev 7 · impact 7) — spec-says-code-doesnt
  - Evidence: Criteria AT-APP-06 to AT-APP-10 describe distinct UI layout elements (NavBar, Sidebar, Back/Forward arrows, Breadcrumb, Layout Toggle). The `AppLayout.tsx` explicitly states it's a 'transparent passthrough' and that 'Navbar, Sidebar, and panel slots will land in P1.3'. No code exists for these features beyond basic `AppLayout` wrapper.
  - Fix: No immediate spec correction. As development progresses to P1.3, this spec section should guide the implementation of the layout components. For now, the spec clearly outlines future work.
- **[D3] Unimplemented Page Content & Interaction Features (AT-APP-11, 12, 13, 14)** (sev 8 · impact 8) — spec-says-code-doesnt
  - Evidence: Criteria AT-APP-11 through AT-APP-14 detail core content rendering and editing interactions (recursive item rendering, Enter key behavior, Tab/Shift+Tab for indent/outdent, drag-and-drop preview). The `Home.tsx` component is a placeholder with static text, and no item rendering or interaction logic has been implemented.
  - Fix: No immediate spec correction, as these are features to be implemented. The spec serves as a clear guide for the upcoming editor functionality.
- **[D4] Partial Hotkey Implementation and Missing Core Interaction Specs** (sev 6 · impact 6) — missing-spec
  - Evidence: The `src/lib/hotkeys.ts` file includes hotkeys for `ItemMoveUp`, `ItemMoveDown`, `FocusPrev`, `FocusNext`, `ToggleComplete`, `ToggleExpand`, `ZoomIn`, `ZoomOut`, `OpenSearch`, `Undo`, and `Redo`. These are functional definitions, yet only `ItemIndent` and `ItemOutdent` (AT-APP-13) are directly referenced in `97-acceptance-criteria.md`. This indicates a gap in the acceptance criteria for these fully defined hotkey interactions.
  - Fix: Add acceptance criteria for all hotkeys defined in `src/lib/hotkeys.ts` that aren't yet covered. Example for `ItemMoveUp`:

```diff
--- a/spec/31-app/97-acceptance-criteria.md
+++ b/spec/31-app/97-acceptance-criteria.md
@@ -55,6 +55,7 @@
 | `AT-APP-13` | **Tab** indents the current item under its previous sibling; **Shift+Tab** outdents. Both must update the fractional index, not re-number siblings. | `01-features/05-interactions.md` |
 | `AT-APP-14` | Drag-and-drop shows the **entire subtree** as the drag preview, not only the dragged row. | `01-features/05-interactions.md` |
+
+### Hotkey Interactions (Partial)
+|
+`AT-APP-1x` | Pressing Cmd/Ctrl+ArrowUp moves the current item and its subtree up one position amongst its siblings. | src/lib/hotkeys.ts
```
- **[D5] Unimplemented Context Menu, Multi-select, Trash, Roles & Permissions, Mirrors & Sharing Features** (sev 8 · impact 9) — spec-says-code-doesnt
  - Evidence: Criteria AT-APP-15 through AT-APP-25 cover significant features like context menus, multi-select, trash functionality, full roles and permissions, and mirrors/sharing. None of these features appear in the current sparse code scaffold. For example, `src/types/index.ts` defines `Item` fields like `isCompleted`, but no logic is present to handle the 'ToggleComplete' action.
  - Fix: No immediate spec correction for unimplemented features in 'SPEC-ONLY' mode. This confirms the specification of future work that is yet to be realized in code.
- **[D6] Inconsistent 'Source' column referencing for `mem://` definitions** (sev 3 · impact 2) — contradiction
  - Evidence: `AT-APP-03`, `AT-APP-04`, and `AT-APP-05` reference sources using `mem://` paths, which is acceptable. However, similar `mem://` concepts are implicitly or explicitly defined in `src/lib/constants.ts` (e.g., `MAX_ITEMS_PER_VIEW` references `mem://architecture/data-model`). The 'Source' column for `AT-APP-05` could be more precise.
  - Fix: Update `AT-APP-05` source to reference the implemented constant, improving traceability.

```diff
--- a/spec/31-app/97-acceptance-criteria.md
+++ b/spec/31-app/97-acceptance-criteria.md
@@ -20,7 +20,7 @@
 | `AT-APP-03` | Every `Item` is a single unified type discriminated by `itemType` (no separate `Project`/`Note`/`Task` tables). | `mem://architecture/data-model` |
 | `AT-APP-04` | Children are ordered by **fractional-index string keys**, not integer positions. | `mem://features/editor-core` |
 | `AT-APP-05` | A view rendering ≥250 items must virtualize or paginate. | `mem://architecture/data-model` |
+                                                                           | `src/lib/constants.ts#L22`
```
- **[D7] Toaster component implementation without explicit acceptance criteria.** (sev 5 · impact 4) — code-does-spec-doesnt
  - Evidence: The `src/contexts/ToastContext.tsx` and `src/components/ui/Toaster.tsx` provide a full toast notification system, complete with tests (`src/contexts/ToastContext.test.tsx`). This is a significant piece of functionality for user feedback, yet it has no explicit acceptance criteria within `97-acceptance-criteria.md`.
  - Fix: Add a new section for 'Toasts/Notifications' in the spec and define acceptance criteria for its behavior.

```diff
--- a/spec/31-app/97-acceptance-criteria.md
+++ b/spec/31-app/97-acceptance-criteria.md
@@ -89,6 +89,14 @@
 | `AT-APP-25` | Sharing an item cascades **view** access to all descendants by default. | `01-features/01-information-model.md` §1.3 |
 
---
+
+### Toasts & Notifications
+
+| ID | Criterion | Source |
+|----|-----------|--------|
+| `AT-APP-22` | Toast notifications appear temporarily (default 3s) and can be manually dismissed. | `src/contexts/ToastContext.tsx` |
+| `AT-APP-23` | Toasts support distinct variants (success, error, info, warning) with visual differentiation. | `src/contexts/ToastContext.tsx` |
+| `AT-APP-24` | Multiple toasts stack vertically, dismissing independently. | `src/contexts/ToastContext.tsx` |
+
+---
 
 ## Verification
 
```
- **[D8] MAX_RETRY_ATTEMPTS defined in code without direct spec reference** (sev 2 · impact 2) — code-does-spec-doesnt
  - Evidence: `src/lib/constants.ts` defines `MAX_RETRY_ATTEMPTS = 3;` and references `spec/31-app/01-features/14-concurrency-and-sync.md`. While the referenced spec likely covers retry logic, there is no direct acceptance criterion for this specific constant.
  - Fix: Add an explicit acceptance criterion for `MAX_RETRY_ATTEMPTS` to enhance traceability.

```diff
--- a/spec/31-app/97-acceptance-criteria.md
+++ b/spec/31-app/97-acceptance-criteria.md
@@ -27,6 +27,10 @@
 | `AT-APP-05` | A view rendering ≥250 items must virtualize or paginate. | `mem://architecture/data-model` |
 
+### Concurrency & Sync (Partial)
+|
+`AT-APP-0x` | Network requests are retried a maximum of 3 times. | `src/lib/constants.ts#L16`
+
 ### Layout shell
 
```

---

### `spec/31-app/01-features/00-overview.md` — 80.75/100

**Status:** scaffold-only
**Summary:** This overview spec provides a clear, high-level map for implementing WorkFlowy features, including dependencies, MVP priorities, and critical reading order. The scaffold implementation reflects an early stage, primarily aligning with general UI structure and utility rather than specific behavioral features detailed here.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 90 | The spec comprehensively defines the scope of the Features folder, outlines dependencies, and prioritizes MVP items. The auto-generated TOC is a plus. Critical omission is the lack of a spec entry for toast notifications, which are already implemented. |
| Consistency | 75 | Largely consistent in structure and purpose, but the redundant `mem://` references in code and the dual-spec-reference in the hotkey module introduce internal inconsistencies regarding SSOT, even if the content isn't directly contradictory. The `AppLayout` references a specific feature spec for its chrome, but this overview doesn't explicitly map 'app chrome' to `03-layout-structure.md` in its description sections, leading to minor ambiguity. |
| Alignment | 60 | As a 'SPEC-ONLY' project, significant implementation is expected to be absent for most features (which is true). However, the presence of a fully implemented toast notification system without a corresponding feature spec entry, and the detailed AppLayout scaffold without explicit mention in this overview, indicates some early divergence where code implements features not yet explicitly outlined in the feature overview itself. The hotkey module also shows premature complexity in its spec references. |
| Clarity | 95 | The spec communicates its purpose, structure, and priorities very clearly. The dependency graph is excellent, the MVP table is concise, and the must-read sequence is highly actionable. The 'What this folder is' section is precise. Minor deductions for the hotkey SSOT ambiguity. |
| Maintainability | 80 | The spec's structure and auto-generated TOC promote maintainability. The explicit dependency graph and MVP breakdown help manage changes. However, the detected inconsistency in SSOT regarding hotkeys and the missing spec for an implemented feature could lead to future maintenance challenges as the project scales if not addressed. |
| Test Coverage | 90 | While this spec itself doesn't have tests, its structure explicitly calls out future acceptance criteria (`../97-acceptance-criteria.md`). The related `hotkeys.ts` and `ToastContext.tsx` implementations both have good unit test coverage, validating the utility of having clear behavioral specs to test against. The overview encourages and supports testability by delineating features clearly. |

**Drift findings:**
- **[D1] Missing App Layout Specification Reference** (sev 3 · impact 2) — code-does-spec-doesnt
  - Evidence: The `AppLayout.tsx` component includes commentary about future features (Navbar, Sidebar, panel slots) but references `spec/31-app/01-features/03-layout-structure.md` for these. This overview spec does not explicitly list F-03 as the home for top-level chrome wrappers, though it does include it in the MVP list and dependency graph.
  - Fix: spec/31-app/01-features/00-overview.md
Add a specific note about `03-layout-structure.md` being the home for the top-level app chrome structure.

```diff
--- a/spec/31-app/01-features/00-overview.md
+++ b/spec/31-app/01-features/00-overview.md
@@ -11,6 +11,7 @@
 
 UI rendering (colors, layout, animations) lives in [`../../32-ui-design/`](../../32-ui-design/00-overview.md). **This folder is behavior-only.**
 
+The top-level app layout/chrome (`Navbar`, `Sidebar`, `Page` shell) is defined in `03-layout-structure.md`.
 ---
 
 ## 🧱 Feature Dependency Graph
```
- **[D2] Hotkey Registry Redundancy and Cross-Spec Contradiction** (sev 7 · impact 5) — contradiction
  - Evidence: The `HOTKEYS` registry (`src/lib/hotkeys.ts`) states it mirrors both `spec/31-app/01-features/05-interactions.md` AND `spec/32-ui-design/06-workflowy-ui/01-navbar/04-keyboard-shortcuts.md`. This violates the SSOT principle, creates maintenance overhead, and introduces a risk of divergence. The `OpenSearch` hotkey explicitly refers to the UI design spec, indicating a potential split ownership or inconsistent SSOT declaration.
  - Fix: spec/31-app/01-features/00-overview.md
Reinforce 'SSOT for that feature's rules' and clarify if keybindings are 'behavior' (this folder) or 'UI design' specific (UI folder). Recommend centralizing all hotkey specifications into `05-interactions.md` or creating a dedicated `keyboard-shortcuts.md` and listing it consistently.

```diff
--- a/spec/31-app/01-features/00-overview.md
+++ b/spec/31-app/01-features/00-overview.md
@@ -11,7 +11,7 @@
 
 UI rendering (colors, layout, animations) lives in [`../../32-ui-design/`](../../32-ui-design/00-overview.md). **This folder is behavior-only.**
 
-The top-level app layout/chrome (`Navbar`, `Sidebar`, `Page` shell) is defined in `03-layout-structure.md`.
+The top-level app layout/chrome (`Navbar`, `Sidebar`, `Page` shell) is defined in `03-layout-structure.md`. All keyboard interaction contracts, including hotkeys, are defined in `05-interactions.md`.
 ---
 
 ## 🧱 Feature Dependency Graph
```

Also, adjust `src/lib/hotkeys.ts` to consistently reference `spec/31-app/01-features/05-interactions.md` as the SOOT and remove the redundant `spec/32-ui-design/...` reference from its internal docs.
- **[D3] Implicit Toast Notification Feature** (sev 8 · impact 6) — missing-spec
  - Evidence: The implementation includes a fully functional `ToastContext` and `Toaster` component with clear behavioral contracts (e.g., auto-dismissal, dismissal by ID, error codes). This behavior is not documented in any feature spec listed in this overview, nor is 'Toast notifications' mentioned as a feature or dependency.
  - Fix: spec/31-app/01-features/00-overview.md
1. Add `NN-toast-notifications.md` (e.g., perhaps `06a-toast-notifications.md` due to its UI/interaction nature) to the Dependency Graph, MVP list, and Topics in this Folder. Its dependency would likely be `03-layout-structure` or `04-page-content-area` for display.
2. Create a new spec file: `spec/31-app/01-features/NN-toast-notifications.md` outlining the behavior observed in `src/contexts/ToastContext.tsx` and `src/components/ui/Toaster.tsx`.

```diff
--- a/spec/31-app/01-features/00-overview.md
+++ b/spec/31-app/01-features/00-overview.md
@@ -24,6 +24,7 @@
         ├──► 03-layout-structure (NavBar + Sidebar + Page shell)
         │           │
         │           ├──► 04-page-content-area (recursive item list)
+        │           ├──► NN-toast-notifications (app-wide notices)
         │           │           │
         │           │           ├──► 05-interactions (Enter/Tab/drag)
         │           │           │           │
@@ -45,6 +46,7 @@
 | `03-layout-structure.md` | App shell | ✅ | Container for everything |
 | `04-page-content-area.md` | Recursive item list | ✅ | The actual outliner |
 | `05-interactions.md` | Enter/Tab/Shift+Tab/drag | ✅ | Core editing |
+| `NN-toast-notifications.md`| App-wide ephemeral alerts | ✅ | User feedback |
 | `06-item-context-menu.md` | Per-item ⋮ menu | ✅ | Move/delete/share entry |
 | `11-trash-view.md` | Soft delete + 30d retention | ✅ | Data safety |
 | `12-multi-select.md` | Bulk ops | ✅ | Productivity |
@@ -77,6 +79,7 @@
 | 4 | [`04-page-content-area.md`](./04-page-content-area.md) | Page / Content Area | 199 |
 | 5 | [`05-interactions.md`](./05-interactions.md) | Interaction Behaviors | 170 |
 | 6 | [`06-item-context-menu.md`](./06-item-context-menu.md) | Item Context Menu (⋮) | 188 |
+| NN | [`NN-toast-notifications.md`](./NN-toast-notifications.md) | Toast Notifications System | XXX |
 | 7 | [`07-board-view.md`](./07-board-view.md) | Board View Specification | 178 |
 | 8 | [`08-share-dialog.md`](./08-share-dialog.md) | Share Dialog Specification | 133 |
```
- **[D4] Redundant 'Strict TS' Coding Guidelines Reference** (sev 2 · impact 1) — spec-says-code-doesnt
  - Evidence: The `ToastContext.tsx` and `hotkeys.ts` files both contain comments referencing `mem://constraints/coding-guidelines` for 'Strict TS' rules (zero `any`, max 3 params, max 15 lines, positive guard clauses). While beneficial, this guideline should ideally be enforced via linter rules or a single, shared project-level `mem://` spec rather than repeated comments within every module. The `00-overview.md` doesn't explicitly mention this 'Strict TS' as a top-level rule for feature implementation, though it's implicitly part of 'Implementation-grade rollup'.
  - Fix: spec/31-app/01-features/00-overview.md
Add a general section on coding standards / 'Implementation Style Guide' that links to `mem://constraints/coding-guidelines` to provide a single, central reference for these rules. This would allow `ToastContext.tsx` and `hotkeys.ts` to remove their redundant internal comments for a cleaner look.

---

### `spec/31-app/01-features/01-information-model.md` — 91/100

**Status:** scaffold-only
**Summary:** This spec provides a comprehensive and clear definition of the core information model, covering root rules, identity, entity relationships, and critical integrity constraints. While the implementation is largely a scaffold, the spec's forward-looking nature helps guide future development and ensures a robust data foundation.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 90 | The spec is exceptionally complete for a foundational document. It covers all critical aspects of the information model from an abstract level down to concrete inputs, outputs, and edge cases. The 'Entity-Relationship Summary' is a powerful mechanism for documenting complex interactions. Minor deductions for not fully detailing all Item attributes in the inputs/outputs list, and the missing 'mem://features/core-mechanics' reference. |
| Consistency | 95 | The spec maintains high internal consistency. Rules like 'Root always exists' and 'Item IDs never change' are reinforced across multiple sections (Root Rules, Identity Rule, Edge Cases, Acceptance Tests). No contradictions were found within the document itself. The forward-looking `ItemType` reference is a minor point but doesn't create inconsistency. |
| Alignment | 80 | Given the 'SPEC-ONLY' mode and early P1.1 scaffold, alignment with *built* code is intentionally limited but strong where it exists (e.g., placeholder AppLayout, hotkeys, ToastContext). The `src/types/index.ts` file acts as a direct, type-safe representation of the `Item` entity, aligning well with the spec's intent for a clear information model. The key areas of drift are found where the spec could be more explicit about which Item fields are inputs vs. system-generated, as inferred by the `src/types/index.ts` `Item` interface. The 'Component Contract' acknowledges that components are not yet built, which is acceptable in this phase. |
| Clarity | 95 | The spec is highly clear. The 'Overview' sets the stage, 'User Story' provides context, and specific rules (Root, Identity) are concise. The 'Entity-Relationship Summary' table is an excellent, unambiguous way to convey complex relationships. 'Inputs', 'Outputs', 'Edge Cases', and 'Acceptance Tests' are structured for maximal clarity and testability. The explicit cross-references are highly valuable. |
| Maintainability | 90 | The spec is designed for maintainability. Its modular structure, clear headings, and internal/external cross-references make it easy to navigate and update. The table formats for entities, inputs, outputs, edge cases, and acceptance tests create consistent and scannable sections. The emphasis on stable IDs, even through operations, simplifies future system evolution. The `mem://` references promote modular documentation and reduce duplication. |
| Test Coverage | 99 | The 'Acceptance Tests' section is extremely well-defined, with clear Given/When/Then scenarios and test IDs. It provides excellent coverage for the core rules and edge cases of the information model. The explicit mention of how ATs cover the identity rule (H-3 audit row) is a strong point. The only minor point is that the 'Component Contract' lists future components, emphasizing that these tests are still conceptual placeholders and not yet tied to actual implementation tests. |

**Drift findings:**
- **[D1] Missing `ItemId` and `OwnerId` in Spec's `Inputs`/`Outputs`** (sev 4 · impact 5) — code-does-spec-doesnt
  - Evidence: Spec 'Inputs' table doesn't explicitly list `ItemId` as an input for creation, but mentions `id` generation in Outputs. The 'Outputs' table for 'New Item row' notes `id` is generated. The `src/types/index.ts` implementation defines `ItemId` and `OwnerId` as explicit branded types with associated factory functions for type safety, and the `Item` interface uses them. This is a crucial foundation for the 'Identity Rule' and 'Item IDs never change' principle.
  - Fix: spec/31-app/01-features/01-information-model.md
Add `ItemId` and `OwnerId` as fundamental types with clear generation/source notes in the Inputs/Outputs sections.
```diff
--- a/spec/31-app/01-features/01-information-model.md
+++ b/spec/31-app/01-features/01-information-model.md
@@ -65,6 +65,8 @@
 |-------|------|--------|----------|-------|
 | `userId` | `string` (UUID) | Auth session | Yes | Owner of every created item |
 | `parentId` | `string \| null` | UI tree position | No | `null` = direct child of root |
+| `itemId` | `string` (UUID) | System generated | No | Generated on creation; stable |
+| `ownerId` | `string` (UUID) | Auth session | Yes | Owner of the item, derived from `userId` |
 | `content` | `string` (rich text) | User typing | Yes | Empty allowed at creation |
 | `itemType` | `ItemType` enum | Toolbar / shortcut | Yes | One of 12 types (see `mem://features/core-mechanics`) |
 | `sortOrder` | `number` (fractional) | Drop position | Yes | Computed via fractional sorting |
@@ -76,6 +78,8 @@
 |Output | Persisted? | Channel | Notes |
 |--------|-----------|---------|-------|
 | New `Item` row | ✅ SQLite | `items` table | `id` is generated once and never mutated |
+| `OwnerId` association | ✅ SQLite | `items.ownerId` FK | Explicitly links item to its owner |
 | Parent-child link | ✅ SQLite | `items.parent_id` FK | Null for root-level |
 | `item:created` event | ❌ | Event bus | Drives mirror sync, search index, activity log |
 | Optimistic UI render | ❌ | React state | Rolls back on save failure |
```
- **[D2] Item attributes not explicitly in spec `Inputs`** (sev 3 · impact 4) — missing-spec
  - Evidence: The `src/types/index.ts` `Item` interface includes `richContent`, `note`, `isCompleted`, `isCollapsed`, `dateAssigned`, `createdAt`, `updatedAt`, which are not explicitly listed as Inputs for item creation in the spec's 'Inputs' table. While some are system-generated or derived, their initial state and source during creation/update should be specified for completeness.
  - Fix: spec/31-app/01-features/01-information-model.md
Expand the 'Inputs' and 'Outputs' tables to fully reflect all attributes of the `Item` entity, noting whether they are user-provided, system-generated, or derived.
```diff
--- a/spec/31-app/01-features/01-information-model.md
+++ b/spec/31-app/01-features/01-information-model.md
@@ -67,11 +67,23 @@
 | `userId` | `string` (UUID) | Auth session | Yes | Owner of every created item |
 | `parentId` | `string \| null` | UI tree position | No | `null` = direct child of root |
 | `content` | `string` (rich text) | User typing | Yes | Empty allowed at creation |
+| `richContent` | `string \| null` | User editing | No | Rich text content, when applicable |
+| `note` | `string \| null` | User editing | No | Item's note content |
 | `itemType` | `ItemType` enum | Toolbar / shortcut | Yes | One of 12 types (see `mem://features/core-mechanics`) |
 | `sortOrder` | `number` (fractional) | Drop position | Yes | Computed via fractional sorting |
 | `tags` | `string[]` | Inline `#tag` syntax | No | Resolved against per-user `Tag` table |
+| `isCompleted` | `boolean` | User action | No | Default `false` |
+| `isCollapsed` | `boolean` | User action | No | Default `false` |
+| `dateAssigned` | `string \| null` | User action | No | ISO date string for task items |
 
 ## Outputs
 
 |Output | Persisted? | Channel | Notes |
 |--------|-----------|---------|-------|
 | New `Item` row | ✅ SQLite | `items` table | `id` is generated once and never mutated |
+| `createdAt` timestamp | ✅ SQLite | `items.createdAt` | Auto-set on creation |
+| `updatedAt` timestamp | ✅ SQLite | `items.updatedAt` | Auto-updated on modification |
 | Parent-child link | ✅ SQLite | `items.parent_id` FK | Null for root-level |
 | `item:created` event | ❌ | Event bus | Drives mirror sync, search index, activity log |
 | Optimistic UI render | ❌ | React state | Rolls back on save failure |
```
- **[D3] Use of UUID for `userId` and `ItemId` in spec, not explicitly in code** (sev 2 · impact 2) — spec-says-code-doesnt
  - Evidence: The spec states `userId` is a 'string (UUID)' and implies `id` is generated (UUID typically). The `src/types/index.ts` code defines `ItemId` and `OwnerId` as branded `string` types. While `string` accommodates UUIDs, the branding explicitly defers the concrete type (`mem://constraints/backend-runtime-deferred`). The spec could reflect this deference or confirm the UUID choice if it's a hard requirement.
  - Fix: spec/31-app/01-features/01-information-model.md
Clarify the `string (UUID)` declaration to align with the `src/types/index.ts` branded type approach, acknowledging the backend-deferred nature for `ItemId` and `OwnerId` for stronger spec-code alignment.
```diff
--- a/spec/31-app/01-features/01-information-model.md
+++ b/spec/31-app/01-features/01-information-model.md
@@ -65,9 +65,9 @@
 
 |-------|------|--------|----------|-------|
 | `userId` | `string` (UUID) | Auth session | Yes | Owner of every created item |
-| `parentId` | `string \| null` | UI tree position | No | `null` = direct child of root |
+| `parentId` | `ItemId \| null` | UI tree position | No | `null` = direct child of root |
 | `content` | `string` (rich text) | User typing | Yes | Empty allowed at creation |
 | `itemType` | `ItemType` enum | Toolbar / shortcut | Yes | One of 12 types (see `mem://features/core-mechanics`) |
 | `sortOrder` | `number` (fractional) | Drop position | Yes | Computed via fractional sorting |
```
Also, update the `Entity-Relationship Summary` to reflect `ItemId` for parent/children relationships.
- **[D4] Reference to `mem://features/core-mechanics` is missing** (sev 1 · impact 1) — spec-says-code-doesnt
  - Evidence: The spec mentions `ItemType` enum 'One of 12 types (see `mem://features/core-mechanics`)'. The listed implementation files do not contain a `mem://features/core-mechanics` reference or a clear definition of these 12 types. While `src/types/index.ts` has `ItemType` with inferred 12 types, the explicit reference location is important for spec integrity.
  - Fix: spec/31-app/01-features/01-information-model.md
Either create the `mem://features/core-mechanics` document, or update the reference to point to the actual `ItemType` definition (e.g., `src/types/index.ts` or `spec/20-enums-index.md`).
```diff
--- a/spec/31-app/01-features/01-information-model.md
+++ b/spec/31-app/01-features/01-information-model.md
@@ -69,7 +69,7 @@
 | `parentId` | `string \| null` | UI tree position | No | `null` = direct child of root |
 | `content` | `string` (rich text) | User typing | Yes | Empty allowed at creation |
 | `itemType` | `ItemType` enum | Toolbar / shortcut | Yes | One of 12 types (see `mem://features/core-mechanics`) |
- | `sortOrder` | `number` (fractional) | Drop position | Yes | Computed via fractional sorting |
+ | `sortOrder` | `number` (fractional) | Drop position | Yes | Computed via fractional sorting (see `spec/20-enums-index.md#L3.5`) |
```

---

### `spec/31-app/01-features/03-layout-structure.md` — 84.75/100

**Status:** scaffold-only
**Summary:** This spec provides a detailed and largely clear description of the application's core layout elements, including the NavBar, Sidebar, and Page area, along with their components and behaviors. While comprehensive, it suffers from some inconsistencies in terminology and formatting, and naturally, most features are not yet implemented given the project's current scaffold-only state.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 95 | The spec thoroughly covers the layout structure, details of NavBar, Sidebar components, Settings Menu, and various interactions. It includes inputs, outputs, edge cases, acceptance tests, and component contracts. The primary missing elements are explicit linkage to hotkey definitions and constants, which are more consistency/alignment concerns. |
| Consistency | 80 | Generally consistent, but there are issues. The spec uses 'Ctrl+/' for Handbook shortcut but not in the hotkeys file explicitly. The search shortcut is inconsistent (⌘F in spec, ⌘K in hotkeys.ts). Terminology like 'NavBar' vs 'Menu' for the toggle is largely consistent but could be tighter. Table formatting is good. |
| Alignment | 70 | Given the 'SPEC-ONLY' mode, full implementation is not expected. However, the existing scaffold, while minimal, doesn't yet reflect any of the complex layout components. The `AppLayout.tsx` explicitly states that Navbar, Sidebar, etc., are 'P1.3'. The constants for layout elements are defined in code but not directly linked from the spec, and hotkey definitions are misaligned (⌘F vs ⌘K, Ctrl+L missing from `hotkeys.ts`). This reflects early stage alignment where basic definitions exist but need synchronization. |
| Clarity | 90 | The spec is highly readable, using clear language, tables, and consistent headings. The 'User Story' and 'Overview' provide good context. The detailed breakdown of NavBar sections, Settings menu groups, and Sidebar structure is excellent. Minor ambiguities exist around hotkey sources. |
| Maintainability | 85 | The spec uses a clear versioning scheme, parent/template links, and a component contract for future implementation. The use of tables for elements, behaviors, and visual states makes it easy to update. The issues with hotkey source of truth (multiple places to update) slightly detract from maintainability. |
| Test Coverage | 95 | The acceptance tests are comprehensive for the specified behaviors, covering various states and interactions for NavBar, Breadcrumb, Sidebar, Settings, Quota, Handbook, and Favorites. They include `testid` for clear linkage to future tests. |

**Drift findings:**
- **[D1] Missing Implementation of Layout Components** (sev 8 · impact 9) — spec-says-code-doesnt
  - Evidence: Spec lists numerous components (NavBar, Sidebar, SettingsDropdown, etc.) and their paths in 'Component Contract' section. 'src/components/layout/AppLayout.tsx' comments explicitly state: 'Navbar, Sidebar, and panel slots will land in P1.3... Wrapping all routes today means future chrome additions touch zero route definitions.' The 'src/components/layout/index.ts' only exports 'AppLayout', confirming no other components exist.
  - Fix: This is acceptable given 'SPEC-ONLY' mode and P1.1 scaffold. No immediate correction needed but track against P1.3 for implementation.
- **[D2] Constants Defined for Layout Elements, but not used by current scaffold** (sev 2 · impact 1) — code-does-spec-doesnt
  - Evidence: 'src/lib/constants.ts' defines `NAVBAR_HEIGHT_PX = 48` and `SIDEBAR_WIDTH_PX = 280`. The spec mentions Navbar at top and Sidebar sliding from left (~280px width) but does not define these as hard constants or link to `constants.ts`.
  - Fix: Add a 'Constants' section to the spec (or link to a global constants spec) to explicitly document these values and their source. For this spec file, add reference where appropriate.

File: `spec/31-app/01-features/03-layout-structure.md`
Before: `The app MUST consist of two main zones: NavBar (fixed top bar) and Page (scrollable content area below).`
After: `The app MUST consist of two main zones: NavBar (fixed top bar, height: 48px from src/lib/constants.ts) and Page (scrollable content area below).`

Before: `A collapsible Sidebar MUST slide in from the left when the Menu button is clicked.`
After: `A collapsible Sidebar MUST slide in from the left when the Menu button is clicked (width: ~280px from src/lib/constants.ts).`
- **[D3] Keyboard shortcuts in Nav/Settings are partially documented in external `hotkeys.ts`** (sev 7 · impact 6) — missing-spec
  - Evidence: Spec explicitly mentions keyboard shortcuts for Search Button (⌘F), Settings Menu (Ctrl+/ for Handbook Panel), and Sidebar (^L). However, `src/lib/hotkeys.ts` defines 'OpenSearch' (mod+k), 'CloseOverlay' (Escape), 'Undo' (mod+z), 'Redo' (mod+shift+z). There's a mismatch for Search (⌘F vs ⌘K) and other shortcuts are not listed in this spec.
- Spec: Search Button mentions `⌘F`
- Code: `OpenSearch` hotkey is `mod + k`
- Spec: Handbook panel accessible via `Ctrl+/`
- Code: No specific hotkey for handbook/settings panel is present in `HOTKEYS` array, only 'CloseOverlay'.
  - Fix: Align the spec with the intended hotkey definitions from `src/lib/hotkeys.ts`. This discrepancy highlights a need for a single source of truth for keyboard shortcuts across specs.

File: `spec/31-app/01-features/03-layout-structure.md`
Before: `Search Button | 🔍 magnifier | Click opens full-screen search overlay (see §4.3). Keyboard shortcut: ⌘F.`
After: `Search Button | 🔍 magnifier | Click opens full-screen search overlay (see §4.3). Keyboard shortcut: ⌘K (from src/lib/hotkeys.ts).`

Additionally, add the `Undo` and `Redo` shortcuts to the 'Edit Actions' section of the Settings Menu.

Before: `| Undo | Undo arrow | ⌘Z | Undoes the last action.`
After: `| Undo | Undo arrow | ⌘Z (from src/lib/hotkeys.ts) | Undoes the last action. Disabled when undo stack is empty.`
- **[D4] Sidebar Toggle Shortcut (Ctrl+L) is in Spec but not `hotkeys.ts`** (sev 6 · impact 5) — spec-says-code-doesnt
  - Evidence: Spec section '2.5.1 Structure' states: 'Keyboard shortcut: ^L (Ctrl+L)'. However, `src/lib/hotkeys.ts` does not contain any entry for 'ToggleSidebar' or similar.
  - Fix: Add the 'Toggle Sidebar' hotkey to `src/lib/hotkeys.ts` or justify its omission if it's meant to be handled differently.

File: `src/lib/hotkeys.ts`
Add:
`{
    id: "ToggleSidebar",
    combo: { ctrl: true, key: "L" },
    scope: "global",
    description: "Toggle left sidebar visibility",
    specRef: "spec/31-app/01-features/03-layout-structure.md#L159",
}`

---

### `spec/31-app/01-features/04-page-content-area.md` — 60.5/100

**Status:** scaffold-only
**Summary:** This spec provides a detailed and well-structured description of the core page content area. While it extensively covers many future features, the current implementation is a minimal scaffold, leading to significant present-day drift and limited alignment. The clarity and completeness of the spec itself are high.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 95 | The spec is highly complete, covering visual elements, behaviors, data inputs/outputs, edge cases, and even proposed component contracts. It provides a thorough blueprint for the feature. |
| Consistency | 90 | The spec maintains strong internal consistency. Element definitions align with user stories and intended interactions. Cross-references are appropriate. Minor points: The 'Note:' in the component contract mentions 'None of these components exist yet', which is good context, but ideally, component contracts should be for implemented or directly upcoming work, and this particular note belongs a layer above this low-level feature spec. The spec references both 'spec/31-app/01-features/05-interactions.md#L37' and 'spec/31-app/01-features/05-interactions.md' for hotkeys - inconsistency in precision. |
| Alignment | 10 | Alignment is very low due to the 'SPEC-ONLY' mode and minimal scaffold. Very few spec details are reflected in the current code (mostly `AppLayout` as a router outlet, `MAX_ITEMS_PER_VIEW` constant, `Item`/`ItemId` types, and `ToastContext` which isn't directly the page content). The core elements described in the spec are entirely unimplemented. |
| Clarity | 95 | The spec is exceptionally clear. Tables for item structure, type differences, and toolbar buttons are highly effective. The language is precise, and the examples are helpful. The 'Note Display' section is a bit less tabular but still clear. The 'Component Contract' is a clever way to outline future implementation. |
| Maintainability | 90 | The spec is highly maintainable. Its structured nature (tables, clear headings) makes updates straightforward. The separation of concerns into dedicated sections helps. The cross-references are valuable for navigation. The 'Component Contract' guides future refactoring and modularity. Small improvements could include making 'Note Display' structure more similar to 'Bullet Item Structure' table for even easier scanning. |
| Test Coverage | 95 | The Acceptance Tests section is comprehensive and well-defined, providing 'Given-When-Then' scenarios with `data-testid` references, which is excellent for driving TDD. This will be invaluable once implementation begins. |

**Drift findings:**
- **[D1] Minimal AppLayout vs. Detailed Page Content Spec** (sev 8 · impact 9) — spec-says-code-doesnt
  - Evidence: Spec details: 'The Page is the scrollable content area below the NavBar where the user's outline lives. Every bullet item is one row composed of expand toggle, bullet dot, content, note, badges, and hover-revealed action buttons.' Code: `AppLayout.tsx` states it's 'currently a transparent passthrough so routes mount inside a single layout boundary. Navbar, Sidebar, and panel slots will land in P1.3'. The `Home.tsx` is a simple 'start typing' message, not an interactive outline.
  - Fix: This is expected given the 'SPEC-ONLY' mode. No immediate code correction, but `AppLayout.tsx` should eventually be integrated with the structural elements described here (NavBar, content area). The `Home.tsx` will need substantial rework to render item rows.
- **[D2] Core Item Rendering Components Missing** (sev 9 · impact 10) — spec-says-code-doesnt
  - Evidence: Section '3.1 Bullet Item Structure' and 'Component Contract' list many components like `ItemRow.tsx`, `ExpandToggle.tsx`, `BulletDot.tsx`, `MirrorBadge.tsx`, `HoverActions.tsx`, etc. The provided implementation bundle does not contain any of these core components; it's limited to layout, routing, and a `ToastContext`.
  - Fix: This is acknowledged by the spec. Implement `src/components/tree/ItemRow.tsx` and its direct children (`ExpandToggle`, `BulletDot`) as the absolute minimum to begin rendering outlines. This is the top priority for P1.1 development.
- **[D3] Rich Text and Formatting Features Unimplemented** (sev 8 · impact 8) — spec-says-code-doesnt
  - Evidence: Sections '3.1 Content area', '3.4 Text Formatting Toolbar', and '3.5 Color Picker Dropdown' describe rich text editing, inline formatting (bold, italic, strikethrough, code, color, mention), headings, and quotes. The `ToastContext`, `AppLayout`, `Home`, and `NotFound` components in the implementation have no relation to these features.
  - Fix: This requires a rich text editor library or custom implementation (likely a later phase). The `Item` interface in `src/types/index.ts` already includes `content: string` and `richContent: string | null`, which correctly anticipates this. Implement the `FormatToolbar` and `ColorPicker` components once the underlying rich text editing infrastructure is chosen.
- **[D4] Hotkeys Registry Defined with No Associated Logic for Page Content** (sev 6 · impact 7) — spec-says-code-doesnt
  - Evidence: The `src/lib/hotkeys.ts` file correctly defines hotkeys like `ItemIndent`, `ItemOutdent`, `ItemMoveUp`, `ToggleComplete`, etc., with references to `spec/31-app/01-features/05-interactions.md`. However, the current implementation has no active page content area to which these hotkeys could apply.
  - Fix: Once `ItemRow.tsx` and content editing are implemented, handlers must be added to capture `KeyboardEvent`s and dispatch actions based on `lib/hotkeys.ts`. This requires careful integration with the component tree and state management.
- **[D5] Data Inputs/Outputs/Edge Cases Are Spec-Only** (sev 7 · impact 8) — spec-says-code-doesnt
  - Evidence: The 'Inputs', 'Outputs', and 'Edge Cases' sections specify concrete data structures (`currentItemId`, `items`, `expandedIds`, `selection`, `hoverItemId`, etc.), persistence mechanisms, and complex behaviors (virtualization, drag-and-drop, splitting items on paste). The current code has no `Item` data fetching/rendering logic or UI state management (like `expandedIds`, `selection`).
  - Fix: These sections represent significant upcoming work. The `MAX_ITEMS_PER_VIEW` constant in `src/lib/constants.ts` is the only current implementation related to virtualization, consistent with the spec. The `Item` and `ItemId` types in `src/types/index.ts` align with the spec's data model. Future work involves implementing query logic, local UI state (e.g., `useState` for `expandedIds`), and event handlers for interactions like drag-and-drop.
- **[D6] MAX_ITEMS_PER_VIEW Constant Alignment** (sev 2 · impact 1) — code-does-spec-doesnt
  - Evidence: Spec mentions 'Capped at 250 per view' under Inputs, and '1000+ children expanded — virtualize the descendant list; cap render to viewport + buffer (per `03-edge-cases/01-edge-cases.md` row 5)' under Edge Cases. Code has `export const MAX_ITEMS_PER_VIEW = 250;` in `src/lib/constants.ts` with a comment referencing the spec.
  - Fix: The spec should explicitly state `MAX_ITEMS_PER_VIEW = 250` in the 'Inputs' section's notes for clarity and to maintain the SSOT principle for constants.

---

### `spec/31-app/01-features/05-interactions.md` — 75.35/100

**Status:** scaffold-only
**Summary:** The spec is highly detailed, covering numerous critical user interactions, but the current implementation is a minimal scaffold primarily focused on styling and basic routing, with only a partial implementation of toast notifications and an unintegrated hotkey registry. This creates significant drift and many unimplemented features.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 95 | The spec is exceptionally complete, covering nearly all conceivable user interactions for an outliner, from basic typing to complex drag-and-drop and autosave behaviors. The level of detail in behavior, edge cases, inputs, and outputs is comprehensive. It explicitly details planned components and their roles. |
| Consistency | 90 | The spec is largely consistent internally, with clear tables and defined behaviors. There is a minor inconsistency in hotkey notation (Cmd vs Mod+), but overall, the structure and definitions are well-maintained. The strong cross-referencing also contributes to consistency. |
| Alignment | 30 | Given the 'SPEC-ONLY' mode and 'early P1.1 scaffold' status, direct alignment is intentionally low for most features. However, where implementation exists (toast, hotkey registry types, basic routing), there's a good conceptual match, though integration is pending. The scaffold components (AppLayout, Home) don't diverge in *how* they implement a feature, but rather that they *don't* implement most features. The hotkey registry is a good example of alignment in defining future behavior, even if not yet hooked up. |
| Clarity | 98 | The spec is exceptionally clear. The use of tables for interactions, explicit edge cases, listed inputs/outputs, and detailed acceptance tests makes the document highly unambiguous and actionable for developers and testers. The 'Overview' and 'User Story' also provide excellent context. The component contract is particularly useful for understanding the planned architecture. |
| Maintainability | 95 | The spec is highly maintainable due to its modular structure, clear versioning, parent/template links, and specific line references within `src/lib/hotkeys.ts`. This allows for easy updates and traceability. The separation of concerns (e.g., dedicated sections for different interaction types) enhances its long-term viability. |
| Test Coverage | 99 | The 'Acceptance Tests' section is outstanding, featuring 16 detailed, Gherkin-like scenarios with `data-testid` references. This level of testability significantly increases confidence in future implementation. The `ToastContext.test.tsx` and `hotkeys.test.ts` files demonstrate commitment to testing the core utilities that will eventually drive these spec points. |

**Drift findings:**
- **[D1] Most Interaction Behaviors Not Implemented** (sev 9 · impact 10) — spec-says-code-doesnt
  - Evidence: The spec details 15+ keyboard/pointer interactions (Enter, Backspace, Tab, Cmd+Arrows, Click, Drag, Cmd+Enter), 5 zoom interactions, 7 search behaviors, and 7 autosave triggers. The current codebase only implements a basic routing structure, a Toast notification system, and a hotkey registry (without actual handler integration). None of the core item manipulation or navigation behaviors are present in `App.tsx`, `AppLayout.tsx`, `Home.tsx`, or `NotFound.tsx`.
  - Fix: This is expected for P1.1 scaffold. No immediate correction needed for the spec, but the implementation should begin to add item-related components and interaction handlers as planned per the 'Component Contract' section.
- **[D2] Hotkey Registry Implemented, but not Connected** (sev 3 · impact 5) — code-does-spec-doesnt
  - Evidence: The `src/lib/hotkeys.ts` file extensively defines hotkey bindings (`HOTKEYS` array, `HotkeyId`, `KeyCombo`, `HotkeyBinding` types) and functions to manage them (`getHotkey`, `formatCombo`, `matches`). This explicitly implements the contract defined in 'Component Contract' under 'Global key handler' and 'Item row keyboard handlers'. However, there is no corresponding `useGlobalKeys.ts` or `ItemRow.tsx` at the specified paths (or anywhere else) that actually utilizes these definitions to listen for or handle keyboard events. The spec's component contract states: `Global key handler | src/lib/interactions/useGlobalKeys.ts | — (hook) | AT-INTERACT-01..08` but `useGlobalKeys.ts` does not exist.
  - Fix: Create `src/lib/interactions/useGlobalKeys.ts` and integrate it into `App.tsx` or `AppLayout.tsx` to handle global hotkeys. Begin implementing `src/components/tree/ItemRow.tsx` which will consume `hotkeys.ts` for item-specific interactions. 

File: `src/App.tsx`
```diff
// ... existing imports ...
+import { useGlobalKeys } from "@/lib/interactions/useGlobalKeys";

function App() {
+  useGlobalKeys();
  return (
    <ToastProvider>
// ...
```

File: `src/lib/interactions/useGlobalKeys.ts`
```typescript
import { useEffect, useCallback } from "react";
import { HOTKEYS, matches } from "../hotkeys";

export const useGlobalKeys = () => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Prevent default behavior for handled hotkeys
    const hotkey = HOTKEYS.find(hk => hk.scope === 'global' && matches(event, hk.combo));
    if (hotkey) {
      event.preventDefault();
      // Dispatch action or call handler based on hotkey.id
      console.log(`Global hotkey pressed: ${hotkey.id}`);
      // E.g., if (hotkey.id === 'OpenSearch') openSearchOverlay();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
};
```
- **[D3] Toast Implementation Partially Aligned with Spec** (sev 2 · impact 2) — partial-implementation
  - Evidence: The `ToastProvider` and `Toaster` components, along with the `useToast` hook, correctly implement the basic functionality for displaying toast notifications as generally described in the 'Outputs' section ('Save toast / error toast') and implied by the 'Autosave Behaviors' section ('Toast notification: "Failed to save. Retrying…"'). The `variant` and `errorCode` fields are present in the `ToastEntry` interface, matching expectations for eventual error management. However, the spec mentions specific toast messages and persistent toasts ('Changes not saved. Check your connection.') which are not yet wired into the `ToastProvider` logic.
  - Fix: Continue to integrate toast notifications into the autosave and network status logic as those features are built out. No changes to the core `ToastContext` are required at this stage.
- **[D4] Autosave Constants Defined but Unused** (sev 3 · impact 4) — spec-says-code-doesnt
  - Evidence: The `src/lib/constants.ts` file defines `DEBOUNCE_SAVE_MS = 1500` and `MAX_RETRY_ATTEMPTS = 3`, explicitly referencing autosave behavior. However, the `Autosave Behaviors` table in the spec details a debounce of 1.5 seconds and retry logic. Currently, no autosave mechanism exists in the codebase to use these constants. `pendingMutations` interface exists but nowhere used.
  - Fix: Implement an autosave hook or service that leverages `DEBOUNCE_SAVE_MS` and `MAX_RETRY_ATTEMPTS` from `constants.ts` for saving content changes as defined in the spec. This will likely involve a new component/hook, e.g., `src/lib/data/useAutosave.ts`.
- **[D5] Missing `useGlobalKeys.ts` and `ItemRow.tsx` files** (sev 7 · impact 8) — missing-impl
  - Evidence: The component contract explicitly lists `src/lib/interactions/useGlobalKeys.ts` and `src/components/tree/ItemRow.tsx` as critical interaction components. These files do not exist in the codebase. Even though `src/lib/hotkeys.ts` exists, it depends on these files for integration.
  - Fix: Create the placeholder files for `useGlobalKeys.ts` and `ItemRow.tsx` with basic hooks/components. Mark them with 'TODO: Implement interaction handlers per 05-interactions.md' to align with the plan.
- **[D6] Zoom Navigation and Search Overlay Spec are Unimplemented** (sev 8 · impact 9) — spec-says-code-doesnt
  - Evidence: The 'Zoom Behaviors' and 'Search Behaviors' sections describe a complex set of interactions including URL changes, history management, a full-screen search overlay, debounced typing, and result display. The current `App.tsx` and routing (`react-router-dom`) are only set up for basic path handling ('/', '*'), with no mechanism for item-specific URLs, history stack manipulation, or a search overlay. The `ZoomState` and `SearchResult` types exist in `src/types/index.ts` showing intent.
  - Fix: This is expected given the scaffold status. The next phase of UI development should focus on implementing `AppLayout` chrome components (navbar, sidebar) that will house the zoom, breadcrumbs, search button, etc. and integrating actual search and zoom components.
- **[D7] Inconsistent 'mod' Key Definition in Hotkeys Spec** (sev 3 · impact 2) — contradiction
  - Evidence: In the 'Bullet Behaviors' table, `⌘↑` and `⌘↓` are used, explicitly referencing the Cmd key. However, in `src/lib/hotkeys.ts`, the `KeyCombo` interface defines `mod?: boolean` with the comment `mod = ⌘ on macOS, Ctrl elsewhere`. While `⌘` is often a shorthand for `mod`, the spec file (a documentation source) should ideally be consistent with the code's broader/cross-platform interpretation, or clarify the macOS-specific notation. The implementation explicitly handles `metaKey || ctrlKey` in `matches` function, aligning with the `mod` definition.
  - Fix: Update usage of `⌘` in spec tables to be `Mod+` (e.g., `Mod+↑`, `Mod+↓`) to match the `mod` abstraction in `src/lib/hotkeys.ts` or add a clear legend in the spec that `⌘` refers to `Mod`.
- **[D8] Hotkeys for 'ZoomIn', 'ZoomOut', 'ToggleExpand', 'Undo', 'Redo' lack specific specRef lines** (sev 2 · impact 1) — missing-spec
  - Evidence: In `src/lib/hotkeys.ts`, several hotkeys (ZoomIn, ZoomOut, ToggleExpand, Undo, Redo) reference the spec file `spec/31-app/01-features/05-interactions.md` but without a specific line number. While the feature is described in the spec, pinpointing the exact line for each binding is crucial for maintainability and precise audits.
  - Fix: Update `src/lib/hotkeys.ts` with precise line numbers for the `specRef` property for the specified hotkeys after ensuring the spec clearly describes them. Example:

File: `src/lib/hotkeys.ts`
```diff
  {
    id: "ToggleExpand",
    combo: { mod: true, key: "." },
    scope: "itemRow",
    description: "Toggle expand/collapse of item children",
-    specRef: "spec/31-app/01-features/05-interactions.md",
+    specRef: "spec/31-app/01-features/05-interactions.md#L35", // (Example, find actual line)
  },
// ...
```

---

### `spec/31-app/01-features/14-concurrency-and-sync.md` — 58.75/100

**Status:** not-started
**Summary:** This spec provides a detailed, clear blueprint for MVP-level concurrency and synchronization using field-level Last-Write-Wins. While the implementation status is 'not-started' for the core concurrency logic, foundational UI components related to user feedback (Toaster) are being scaffolded, indicating a prepared environment.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 95 | The spec covers all essential aspects of MVP concurrency, including strategy, resolution algorithm, user feedback, and edge cases. It clearly delineates what's in and out of scope. Roadmap for future phases is also helpful. The only minor missing element might be a deeper dive into the 'realtime channel' implementation details beyond just referencing SSE/poll. |
| Consistency | 85 | The spec consistently defines LWW and its application. It cross-references other specs and internal architectural memos effectively. The only inconsistency is the cross-reference in `src/lib/constants.ts` which incorrectly attributes unrelated constants to this spec. |
| Alignment | 10 | The core concurrency logic described in this spec is explicitly 'not-started'. The code base is in P1.1 scaffold, implementing only basic UI (Toast) and infrastructure. There is no direct code alignment for server-side concurrency, real-time channels, or specific UI elements like the 'Restored remote change' banner and its Undo functionality. The 'Component Contract' section confirms many required components are planned but not yet implemented. This score reflects the current lack of implementation, which is expected in 'SPEC-ONLY' mode, but still registers as a low alignment with the full feature. |
| Clarity | 98 | The spec is exceptionally clear. The 'Strategy at a Glance' table provides a quick, digestible summary. The resolution algorithm steps are precise. Edge cases are well-thought-out, and acceptance tests clearly define expected behavior. The component contract explicitly states what *will* be built. Language is unambiguous and technical terms are well-defined or implicitly understood in context. |
| Maintainability | 90 | The spec is highly maintainable due to its modular structure, clear headings, and explicit cross-references. The component contract and acceptance tests contribute positively by linking spec to expected code, making it easier to track changes and impacts. The phased roadmap helps manage future complexity. The only slight hit is the potential for misattribution of constants as identified in the consistency finding, which could lead to confusion if not corrected. |
| Test Coverage | 95 | The acceptance tests are comprehensive and directly address key aspects of the concurrency strategy including LWW, tie-breaking, Undo, offline edits, deleted items, and mirrored items. Each test has a `testid` for traceability. The only minor area for potential expansion would be more specific tests for the real-time broadcast and fallback mechanisms described in the overview. |

**Drift findings:**
- **[D1] Missing Toast Banners and Remote Change UI** (sev 8 · impact 9) — spec-says-code-doesnt
  - Evidence: Spec (14.1, 14.2, Outputs section) describes visible 'Restored remote change' banners, 'Undo' buttons, and avatars. The code (src/components/ui/Toaster.tsx and src/contexts/ToastContext.tsx) currently implements a generic toast notification system but lacks specific components for remote change feedback, user avatars, or the Undo functionality within a toast.
  - Fix: Add `RemoteChangeBanner.tsx` and `UndoRemoteChangeButton.tsx` (as noted in Component Contract) to handle specific concurrency feedback. The existing `ToastContext` could be extended or wrapped to trigger these specific UI elements when conflict responses are received, potentially leveraging `errorCode` for classification.

File: src/components/ui/Toaster.tsx
Before:
```typescript
const ToastItem = ({ entry, onDismiss }: ToastItemProps) => {
  const variantClass = VARIANT_CLASSES[entry.variant];
  return (
    <button
      type="button"
      onClick={() => onDismiss(entry.id)}
      className={`pointer-events-auto rounded-md px-xl py-lg text-menu shadow-lg ${variantClass}`}
      aria-label="Dismiss notification"
    >
      {entry.message}
    </button>
  );
};
```
After (conceptual):
```typescript
const ToastItem = ({ entry, onDismiss }: ToastItemProps) => {
  if (entry.errorCode === 'E_REMOTE_OVERWRITE') {
    return <RemoteChangeBanner 
      message={entry.message} 
      winningUser={entry.meta?.winningUser} 
      onDismiss={() => onDismiss(entry.id)} 
      onUndo={entry.meta?.onUndo} 
    />
  }
  const variantClass = VARIANT_CLASSES[entry.variant];
  return (
    <button
      type="button"
      onClick={() => onDismiss(entry.id)}
      className={`pointer-events-auto rounded-md px-xl py-lg text-menu shadow-lg ${variantClass}`}
      aria-label="Dismiss notification"
    >
      {entry.message}
    </button>
  );
};
```
- **[D2] Concurrency Constants in `constants.ts` are Misleading** (sev 6 · impact 5) — contradiction
  - Evidence: The spec (`14-concurrency-and-sync.md`) makes no mention of `DEBOUNCE_SAVE_MS` or `MAX_RETRY_ATTEMPTS` within its defined scope, specifically detailing server-side LWW and client-side feedback. However, `src/lib/constants.ts` attributes `DEBOUNCE_SAVE_MS` and `MAX_RETRY_ATTEMPTS` to this spec file, implying they are part of its real-time or conflict resolution strategy when they are not. These are likely related to persistence or network reliability, which are mentioned as 'per `mem://features/offline-resilience`' (offline) or `00-overview.md` (transport) but not explicitly detailed or sourced here.
  - Fix: Update `src/lib/constants.ts` to correctly reference the spec file that defines `DEBOUNCE_SAVE_MS` and `MAX_RETRY_ATTEMPTS`, or if they are truly foundational constants not tied to a single spec, remove the spec citation.

File: src/lib/constants.ts
Before:
```typescript
export const DEBOUNCE_SAVE_MS = 1500; /* Spec: spec/31-app/01-features/14-concurrency-and-sync.md */
export const MAX_RETRY_ATTEMPTS = 3; /* Spec: spec/31-app/01-features/14-concurrency-and-sync.md */
```
After:
```typescript
export const DEBOUNCE_SAVE_MS = 1500; /* Spec: TODO: Link to autosave/persistence spec */
export const MAX_RETRY_ATTEMPTS = 3; /* Spec: TODO: Link to network reliability spec */
```

---

### `spec/31-app/01-features/15-roles-and-permissions.md` — 53.65/100

**Status:** not-started
**Summary:** This spec provides a comprehensive, well-structured, and clear definition of the roles and permissions system, including detailed capability matrices and inheritance rules. While it's largely aspirational given the current implementation's 'scaffold' status, its runtime-agnostic design is well-articulated.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 95 | The spec is highly complete in defining roles, permissions, capability matrices, inheritance, inputs, outputs, and edge cases. It leaves very few ambiguities for the conceptual model. Open questions are explicitly called out and deferred, indicating intentional scope. |
| Consistency | 98 | Internal consistency is excellent. Roles are consistently defined and used across tables and matrices. Inheritance rules are logically sound. Cross-references are well-maintained. The runtime-agnostic nature is strongly adhered to. |
| Alignment | 10 | The spec describes a complex, fundamental backend feature (authorization) that is largely *not yet implemented* in the provided code scaffold. While this is acceptable in 'spec-only' mode, the 'alignment' score reflects how much the *current code* (LOC: 962) aligns with what this spec describes. Apart from `OwnerId` type and `ToastContext` possibly handling permission-denied toasts, there is virtually no code that directly implements or even mocks the core logic, storage, or UI components required by this spec. This is a crucial, not-started feature. |
| Clarity | 97 | The spec is exceptionally clear. Tables for roles, capabilities, inputs, and outputs make it easy to understand complex relationships. Pseudocode for `canPerform` and `resolveEffectiveRole` is a strong clarifying element. Edge cases are well-articulated. Language is precise and avoids jargon where possible. |
| Maintainability | 90 | The spec is highly maintainable due to its structured format, clear separation of concerns (runtime-agnostic vs. implementation-specific hints), and explicit versioning. The use of tables and pseudocode means updates to rules or capabilities would be straightforward. The detailed acceptance tests also contribute to maintainability by ensuring a clear validation path. |
| Test Coverage | 85 | The spec includes a strong set of acceptance tests (10 distinct scenarios with IDs and testids) and a component contract linking UI elements to these tests. This is excellent for a spec-only document. However, the runtime-agnostic authorization contract (pseudocode `canPerform`, `resolveEffectiveRole`) lacks explicit unit test scenarios, focusing more on end-to-end system behaviors. |

**Drift findings:**
- **[D1] Missing Backend Interfaces/Mocks for Roles/Permissions** (sev 8 · impact 9) — spec-says-code-doesnt
  - Evidence: Spec specifies `resolveEffectiveRole()`, `hasRole()`, and a `user_roles` table contract. The current scaffolding contains no backend or mocked interfaces/utilities that would implement or simulate these contracts, which are foundational for a security model.
  - Fix: src/services/authService.ts (proposed new file):
```typescript
// Before: (No such file or relevant content exists)
// After:
export type WorkspaceRole = 'Owner' | 'Admin' | 'Member';
export type ItemRole = 'View' | 'Edit' | 'Admin' | 'Owner' | 'PublicView' | null;

// Placeholder mock of the core authorization contract
export function resolveEffectiveRole(actorId: string, targetItemId: string): ItemRole {
  // For P1.1 scaffold, we can hardcode some basic roles or use a simple map.
  // e.g., if actorId === 'test_owner' then 'Owner'
  // if targetItemId === 'public_item' and publicLink is true, then 'PublicView'
  console.warn('resolveEffectiveRole is a mock and always returns Owner for now');
  return 'Owner'; 
}

export function canPerform(action: string, actorId: string, targetItemId: string): boolean {
  // Placeholder: temporarily allow all actions for any authenticated user
  // if (actorId === 'test_owner') return true;
  // const role = resolveEffectiveRole(actorId, targetItemId);
  // return CAPABILITY_MATRIX[action][role] === true; (This will need a mock too)
  console.warn('canPerform is a mock and always returns true for now');
  return true;
}

// src/data/mockUserData.ts (or similar)
// export interface UserRoleEntry { userId: string; scope: 'Workspace' | 'Item'; scopeId: string | null; role: WorkspaceRole | ItemRole;}
// export const mockRoles: UserRoleEntry[] = [];
```
- **[D2] Missing UI Components for Share Dialog / Permissions** (sev 7 · impact 8) — spec-says-code-doesnt
  - Evidence: The spec lists multiple UI components related to sharing and permissions (e.g., `ShareDialogTrigger.tsx`, `ShareRemoveButton.tsx`, `PermissionBadge.tsx`, `PublicViewBanner.tsx`, `TransferOwnershipButton.tsx`, `WorkspaceInviteButton.tsx`, `RemovedUserBadge.tsx`), complete with data-testids. None of these components are present in the provided implementation bundle. The `ToastContext` and `Toaster` are present, which are mentioned as outputs for permission-denied messages, but the upstream components causing those toasts are absent.
  - Fix: Create placeholder files for the specified components, matching the paths and `data-testid` attributes. For example:
File: `src/components/share/ShareDialogTrigger.tsx`
```typescript
// Before: (file not found)
// After:
import React from 'react';

interface ShareDialogTriggerProps { /* ... */ }

const ShareDialogTrigger: React.FC<ShareDialogTriggerProps> = () => {
  return (
    <button data-testid="share-dialog-trigger" disabled>
      Share (Coming Soon)
    </button>
  );
};

export default ShareDialogTrigger;
```
Repeat for all other missing permission-related components.
- **[D3] `OwnerId` is implemented, but not `WorkspaceRole` nor `ItemRole` enums** (sev 5 · impact 6) — spec-says-code-doesnt
  - Evidence: The `spec/31-app/01-features/15-roles-and-permissions.md` defines `WorkspaceRole` and `ItemRole` as enums under 'Inputs'. The implementation's `src/types/index.ts` defines `OwnerId` but does not include any types for `WorkspaceRole` or `ItemRole`, which are critical for type safety in the authorization contract.
  - Fix: File: `src/types/index.ts`
```typescript
// Before:
// export type OwnerId = Brand<string, "OwnerId">;

// After:
export type WorkspaceRole = 'Owner' | 'Admin' | 'Member';
export type ItemRole = 'View' | 'Edit' | 'Admin' | 'Owner' | 'PublicView';

export type OwnerId = Brand<string, "OwnerId">;
```
- **[D4] No audit log or grant row mutation implementation** (sev 6 · impact 7) — spec-says-code-doesnt
  - Evidence: The 'Outputs' section explicitly lists 'Audit log entry' (persisted to `activity_log` table) and 'Grant row mutation' (persisted to `user_roles` table) as required. The current scaffolding (`App.tsx`, `ToastContext.tsx`, etc.) contains no logic or external calls to perform these backend operations. `ToastContext` handles UI toasts but not persistence.
  - Fix: Add a placeholder `auditService` or `permissionService` (potentially in `src/services/`): 
`src/services/auditService.ts` (proposed new file)
```typescript
// Before: (No such file or relevant content exists)
// After:
import { OwnerId, ItemId } from '@/types';

export enum AuditActionType { /* ... Define actions, e.g., 'ITEM_EDITED', 'PERMISSION_GRANTED' ... */ }

export function logActivity(actorId: OwnerId, action: AuditActionType, targetId: ItemId, decision: boolean, details: Record<string, unknown> = {}) {
  console.log(`AUDIT: Actor ${actorId} performed ${action} on ${targetId}. Decision: ${decision}. Details:`, details);
  // In a real implementation: call to backend API for persistence
}

export function mutateGrant(grantDetails: { userId: OwnerId; scope: 'Workspace' | 'Item'; scopeId: ItemId | null; role: string }) {
  console.log('GRANT MUTATION:', grantDetails);
  // In a real implementation: call to backend API to update user_roles table
}
```
And integrate these into any future action handlers.

---

### `spec/31-app/02-workflows/01-keyboard-shortcuts.md` — 58.75/100

**Status:** scaffold-only
**Summary:** This spec provides a comprehensive list of keyboard shortcuts. While the `HOTKEYS` registry correctly documents a subset of common shortcuts, many are not yet implemented or referenced in the current scaffold, highlighting significant gaps between specified features and current code.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 60 | The spec thoroughly lists many anticipated shortcuts. However, it completely omits the explanation of 'scopes' vital for implementation and understanding when shortcuts are active (e.g., global, itemRow, search overlay). While detailed on WHAT shortcuts exist, it lacks HOW they are organized and activated. |
| Consistency | 70 | The spec's internal consistency for shortcut definitions is generally good across its explicit lists. However, there's a specific contradiction regarding the 'Open search' shortcut (⌘F vs. ⌘K) and a general inconsistency in assuming Mac-style global shortcut rendering without cross-platform parity. |
| Alignment | 30 | Given the 'SPEC-ONLY' mode and early P1.1 scaffold, alignment is low. Only a small subset (16 out of 30+ explicitly listed, plus 9 markdown conversions) of the specific shortcuts are present in `src/lib/hotkeys.ts`. Crucially, only the definitions are there, no actual event handlers for any of them are implemented in the scaffold, making the 'implementation' of these a mere registry of future intent. |
| Clarity | 85 | The spec is clear in its layout and description of individual shortcuts. The use of tables makes it easy to read. The only minor deductions are for platform-specific key representations and the implicit nature of 'scopes'. |
| Maintainability | 75 | The spec is structured well with clear sections, making it relatively easy to add or modify entries. The versioning information is helpful. However, without explicit scope definitions, cross-referencing between spec and code (`HotkeyScope` in `hotkeys.ts`) becomes less straightforward later on. |
| Test Coverage | 90 | The `src/lib/hotkeys.test.ts` file extensively tests the `HOTKEYS` registry and utility functions (`getHotkey`, `formatCombo`, `matches`). It ensures correct structure, lookup, and matching logic for the _implemented_ hotkeys, including platform differences. The score is not 100 because it can't cover unimplemented spec items. |

**Drift findings:**
- **[D1] Many specified shortcuts are not in HOTKEYS registry** (sev 8 · impact 9) — spec-says-code-doesnt
  - Evidence: Spec lists 30+ shortcuts across various sections. `src/lib/hotkeys.ts` `HOTKEYS` array contains only 16 entries.
  - Fix: Add all remaining keyboard shortcuts from `spec/31-app/02-workflows/01-keyboard-shortcuts.md` to `src/lib/hotkeys.ts`. Each entry should include a unique `HotkeyId`, an accurate `KeyCombo`, `scope`, `description`, and `specRef`.
- **[D2] Inconsistent 'mod' key representation in spec vs. code** (sev 6 · impact 7) — contradiction
  - Evidence: Spec uses '⌘' (Meta/Cmd) for global shortcuts (e.g., '⌘Z', '⌘S'). The `HOTKEYS` registry explicitly uses `mod: true` which is correctly mapped to `metaKey || ctrlKey` for cross-platform compatibility. However, the spec's formatting heavily favors macOS syntax which is not always portable for non-Mac users without explanation.
  - Fix: Update `spec/31-app/02-workflows/01-keyboard-shortcuts.md` to either: 1. Provide OS-agnostic descriptions (e.g., 'Mod+Z') or 2. Include a note explaining '⌘' maps to Ctrl on Windows/Linux. This will align the spec's presentation with the `hotkeys.ts` implementation's flexibility.
```diff
--- a/spec/31-app/02-workflows/01-keyboard-shortcuts.md
+++ b/spec/31-app/02-workflows/01-keyboard-shortcuts.md
@@ -8,11 +8,11 @@
 ### 11.1 Global Shortcuts
 
 | Shortcut | Action |
 |----------|--------|
-| ⌘Z | Undo |
-| ⇧⌘Z | Redo |
-| ⌘S | Save |
-| ⌘P | Print |
-| ⌘F | Open search |
-| ⌘K | Open command palette |
+| Ctrl/Cmd+Z | Undo |
+| Shift+Ctrl/Cmd+Z | Redo |
+| Ctrl/Cmd+S | Save |
+| Ctrl/Cmd+P | Print |
+| Ctrl/Cmd+F | Open search |
+| Ctrl/Cmd+K | Open command palette |
 | Escape | Close the topmost overlay or deselect the current item |
```
- **[D3] Markdown Auto-Conversion (typed shortcuts) completely unimplemented** (sev 9 · impact 10) — spec-says-code-doesnt
  - Evidence: Section 11.6 'Markdown Auto-Conversion (typed shortcuts)' outlines 9 distinct text transformation features. The current `HOTKEYS` registry and overall scaffold demonstrate no logic for these features.
  - Fix: This is a major feature. Create a new `src/lib/markdown-autocompletion.ts` (or similar) to handle these transformations. Add corresponding `HotkeyId` entries if these 'shortcuts' are event-driven rather than purely text-based. Update `spec/31-app/02-workflows/01-keyboard-shortcuts.md` to cross-reference the future implementation file in its `specRef` field once created.
- **[D4] Explicit 'Open search' shortcut discrepancy** (sev 4 · impact 5) — contradiction
  - Evidence: Spec (11.1 Global Shortcuts): '⌘F' for 'Open search'. Implemented `HOTKEYS` registry: 'OpenSearch' uses '⌘K' (mapped to `mod: true, key: 'k'`). `spec/32-ui-design/06-workflowy-ui/02-search/08-keyboard-shortcuts.md` is cited as the source for `OpenSearch` but isn't provided for review.
  - Fix: Resolve the '⌘F' vs '⌘K' contradiction for 'Open search'.
Option A (spec change): Update `spec/31-app/02-workflows/01-keyboard-shortcuts.md` Global Shortcuts table to use '⌘K'.
Option B (code change): Update `src/lib/hotkeys.ts` 'OpenSearch' entry to use `combo: { mod: true, key: 'f' }` and `specRef` to point to the current spec `spec/31-app/02-workflows/01-keyboard-shortcuts.md#L14`.
- **[D5] Implicitly defined 'itemRow' and 'searchOverlay' scopes** (sev 5 · impact 6) — missing-spec
  - Evidence: `src/lib/hotkeys.ts` defines `HotkeyScope` types 'itemRow' and 'searchOverlay' and assigns hotkeys to these scopes. `spec/31-app/02-workflows/01-keyboard-shortcuts.md` does not explicitly define or categorize shortcuts by such 'scopes', though it has sections like 'Item Editing Shortcuts' which imply scope. The concept of 'global' is clear.
  - Fix: Add a new section (e.g., '11.0 Keyboard Shortcut Scopes') to `spec/31-app/02-workflows/01-keyboard-shortcuts.md` that defines what 'global', 'itemRow', and 'searchOverlay' scopes mean and when they are active. This will formalize the implicit scoping present in the code.

---

### `spec/31-app/04-roadmap/01-implementation-phases.md` — 75.25/100

**Status:** scaffold-only
**Summary:** This roadmap spec provides a high-level, phase-based plan for implementing features. While it serves well as a forward-looking guide, its current 'check-box' format offers insufficient detail for strict auditing against the early P1.1 scaffold, leading to many 'not-started' assessments.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 70 | As a high-level roadmap, it lists many future features. For the current P1.1 scaffold, many Phase 1 items (CRUD, indent/outdent, zoom, autosave, optimistic UI, navbar elements) are listed but not yet visibly implemented beyond basic setup. However, it lacks mention of core foundational components already implemented (Toast, Hotkey Registry, Data Types). |
| Consistency | 95 | The spec is internally consistent. Phases follow a logical progression, and items within each phase are related. No contradictions or ambiguities were found within this specific document. |
| Alignment | 60 | While the spec is in 'SPEC-ONLY' mode, the P1.1 scaffold *should* align with Phase 1. Many Phase 1 items are not yet present in the scaffold (navbar, back/forward, breadcrumbs, full autosave logic, optimistic UI). Conversely, implemented foundational pieces like the Toast system and Hotkey registry are not listed, indicating a drift in what's being built versus what's documented in this high-level roadmap. |
| Clarity | 85 | The spec uses clear, concise bullet points for each feature. The grouping into phases is easy to understand. Some items like 'Optimistic UI updates' could benefit from a brief definition or link to a more detailed spec, but for a roadmap, it's generally clear. |
| Maintainability | 80 | The checklist format is easy to read and update. The version and update date are good practices. However, without links to more detailed feature specs, maintaining a coherent understanding of 'done' for each item requires external context. Adding more specific references or sub-specs would improve maintainability. |
| Test Coverage | 75 | This spec defines features, not tests. However, the presence of specific hotkey IDs and data types in the spec (implicitly via other linked specs mentioned here) would inform test plan generation. Since the spec is high-level, it provides conceptual targets rather than testable requirements directly. |

**Drift findings:**
- **[D1] Phase 1: Basic Navbar, Back/Forward, Breadcrumbs - Not scaffolded** (sev 4 · impact 5) — spec-says-code-doesnt
  - Evidence: Spec lists 'Basic navbar: home, back/forward, breadcrumbs' as Phase 1. `src/components/layout/AppLayout.tsx` explicitly states: 'Navbar, Sidebar, and panel slots will land in P1.3...'. No implementation of these navigation elements is present.
  - Fix: Acknowledge in the spec that basic navbar functionalities are not part of P1.1 or update `AppLayout.tsx` comment to reflect current roadmap. Prefer updating the spec to accurately reflect current P1 focus.

File: spec/31-app/04-roadmap/01-implementation-phases.md
Before:
- [ ] Basic navbar: home, back/forward, breadcrumbs
After:
- [ ] Basic navbar: home, back/forward, breadcrumbs (Planned P1.3)
- **[D2] Phase 1: Debounced Autosave - Constants Defined, but Logic Missing** (sev 3 · impact 4) — spec-says-code-doesnt
  - Evidence: Spec lists 'Debounced autosave with status indicator' as Phase 1. `src/lib/constants.ts` defines `DEBOUNCE_SAVE_MS = 1500`, hinting at autosave, and `src/types/index.ts` defines `SaveStatus` interface. However, there's no visible implementation for the actual debounce logic, status indicator UI, or the autosave mechanism itself in the provided code.
  - Fix: Add a comment to the spec or link to a more detailed spec outlining the autosave implementation details, acknowledging that only constants/types are present in P1.1. If full autosave isn't P1.1, move this item to a later phase or specify what 'scaffold' means here.

File: spec/31-app/04-roadmap/01-implementation-phases.md
Before:
- [ ] Debounced autosave with status indicator
After:
- [ ] Debounced autosave with status indicator (Constants/types only, full implementation planned P1.2)
- **[D3] Phase 1: Optimistic UI Updates - Implied for interaction but not explicit implementation** (sev 3 · impact 3) — spec-says-code-doesnt
  - Evidence: Spec lists 'Optimistic UI updates (instant feel, revert on error)' as Phase 1. This is a behavioral characteristic. While the UI scaffold exists (`Home.tsx`), there are no actions yet that would showcase or require optimistic updates. There are no explicit code points in the scaffold implementing or even preparing for this (e.g., using React Query mutations with `onMutate` or similar).
  - Fix: Clarify within the spec what constitutes 'Optimistic UI updates' for Phase 1, or add a more granular item for it. Since P1.1 is scaffold, this is effectively a non-starter. Perhaps a linked architecture spec would clarify expectations.

File: spec/31-app/04-roadmap/01-implementation-phases.md
Before:
- [ ] Optimistic UI updates (instant feel, revert on error)
After:
- [ ] Optimistic UI updates (instant feel, revert on error) (Awaiting data layer/state management for relevant actions)
- **[D4] Unlisted Toast/Notification System Implementation** (sev 2 · impact 2) — code-does-spec-doesnt
  - Evidence: `src/contexts/ToastContext.tsx`, `src/contexts/ToastContext.test.tsx`, and `src/components/ui/Toaster.tsx` implement a complete toast notification system. This foundational feature is not explicitly mentioned in any phase of the `01-implementation-phases.md` roadmap.
  - Fix: Add 'Notification system (toasts)' to Phase 1 of the roadmap, as it's a critical early user feedback mechanism.

File: spec/31-app/04-roadmap/01-implementation-phases.md
After 'Authentication (signup, login, logout) with email/password', insert:
- [x] Notification system (toasts)
- **[D5] Explicit Hotkey Registry Implementation without Direct Roadmap Entry** (sev 2 · impact 3) — code-does-spec-doesnt
  - Evidence: `src/lib/hotkeys.ts` and `src/lib/hotkeys.test.ts` implement a comprehensive hotkey registry. While Phase 1 mentions 'Basic CRUD (create, edit, delete items via keyboard)' and 'Indent / outdent with Tab / Shift+Tab', the existence of a *registry* and its associated `spec/31-app/01-features/05-interactions.md` is more fundamental than individual hotkeys and isn't specified in the roadmap.
  - Fix: Add 'Centralized Hotkey Registry' to Phase 1 to capture this underlying architectural decision.

File: spec/31-app/04-roadmap/01-implementation-phases.md
After 'Basic CRUD (create, edit, delete items via keyboard)', insert:
- [x] Centralized Hotkey Registry with formatting and matching utilities
- **[D6] Branded ID Types and `Item`/`ZoomState`/`DragState`/`SaveStatus`/`UndoAction`/`SearchResult` Interfaces** (sev 2 · impact 3) — code-does-spec-doesnt
  - Evidence: `src/types/index.ts` defines branded types like `ItemId` and `OwnerId`, along with core interfaces for `Item`, `ZoomState`, `DragState`, `SaveStatus`, `UndoAction`, and `SearchResult`. These are fundamental data structures that precede feature implementation but are not explicitly called out in the implementation phases.
  - Fix: Add a foundational 'Core Data Types and Branded IDs' item to Phase 1, perhaps as a sub-bullet under a more generic 'Project Setup' or 'Data Model Foundation'.

File: spec/31-app/04-roadmap/01-implementation-phases.md
After 'Authentication (signup, login, logout) with email/password', insert:
- [x] Core Data Types and Branded IDs (`ItemId`, `OwnerId`, `Item`, `ZoomState`, etc.)
- **[D7] Query Client Configuration and Axios Version Validation** (sev 1 · impact 1) — code-does-spec-doesnt
  - Evidence: `src/main.tsx` configures `@tanstack/react-query` with default options (staleTime, retry, refetchOnWindowFocus). `package.json` includes `validate:axios` script and `axios` dependency. These are crucial setup steps but are not part of outlined features in any phase.
  - Fix: For completeness, though not strictly a 'feature', consider adding a 'API Client Setup' or 'Data Fetching Configuration' item to Phase 1 to formally acknowledge these architectural steps. Or simply note it's outside the scope of *feature* roadmap.

File: spec/31-app/04-roadmap/01-implementation-phases.md
Towards the beginning of Phase 1, possibly under 'Authentication':
- [x] API Client (React Query, Axios) setup

---

### `spec/31-app/05-conventions/01-axios-version-control.md` — 84.5/100

**Status:** partially-implemented
**Summary:** This document outlines a strict policy for Axios dependency versioning, mandating exact pinning and specifying approved/blocked versions. The implementation largely follows this, with the `package.json` correctly pinning the approved version and a custom script for validation, though some monitoring aspects are not yet realized.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 85 | The spec thoroughly covers the core policy: approved/blocked versions, pinning rules, security rationale, and enforcement. It's comprehensive in its own domain. Missing are specific implementation details for automated checks and monitoring tools, which are left to the implementation. |
| Consistency | 100 | The spec itself is internally consistent. All rules and lists align. No contradictions were found within the document. |
| Alignment | 70 | The core rule of pinning Axios to '1.14.0' is perfectly aligned (`package.json`). However, the 'code review enforcement' and 'monitoring' sections of the spec describe systems and processes that are not fully observable or implemented in the provided code bundle, indicating partial or future alignment in these areas. The presence of the `validate:axios` script shows intent to align. |
| Clarity | 95 | The spec is very clear, concise, and uses easy-to-understand language. The examples for correct/wrong dependency declarations are excellent. The 'Security Note' reinforces the 'why'. 'Acceptance Criteria' summarize expectations well. A minor clarity improvement could be a more explicit definition of 'manual upgrade approval'. |
| Maintainability | 80 | The spec's structure with clear sections for approved/blocked versions, rules, and criteria makes it maintainable. Updates to approved versions would be straightforward. However, the lack of explicit guidance on maintaining the custom validation script (`scripts/validate-axios-version.ts`) within the spec itself is a minor gap. The spec doesn't dictate how future versions get added to the approved list beyond 'manual verification and approval'. |
| Test Coverage | 60 | The spec doesn't describe the testing strategy for the version control policy itself. While the implementation has a `validate-axios-version.ts` script (which implies a 'test' of sorts), the spec doesn't explicitly mandate unit tests for this script or integration tests for the overall CI enforcement, which would be ideal for such a critical security policy. |

**Drift findings:**
- **[D1] Automated Dependency Update Tools** (sev 6 · impact 7) — spec-says-code-doesnt
  - Evidence: Spec: 'Never allow automated dependency update tools to modify the Axios version'. Code: No explicit mechanism like Renovate/Dependabot config is present to enforce this, nor is there a specific `preinstall` or `postinstall` hook to lock for this case outside of the version check.
  - Fix: Introduce configuration for dependency update tools to either ignore Axios or flag any proposed changes, or add a pre-commit hook that specifically checks for changes to axios in `package.json` and `package-lock.json`.
- **[D2] Code Review Enforcement - Lockfile Drift** (sev 5 · impact 6) — spec-says-code-doesnt
  - Evidence: Spec: 'Verify no lockfile drift has changed the resolved Axios version'. Code: While `package.json` is checked, there's no explicit automated check for `package-lock.json` drift for Axios specifically separate from the package.json check.
  - Fix: Enhance `scripts/validate-axios-version.ts` to also read and validate the resolved Axios version in `package-lock.json` against the approved list, and ensure `package.json` and `package-lock.json` use the same version.
- **[D3] Monitoring - CI Output Logging** (sev 4 · impact 5) — spec-says-code-doesnt
  - Evidence: Spec: 'Log dependency installation versions in CI output'. Code: No explicit CI configuration or script is provided in the bundle to demonstrate this logging for all dependencies, or for Axios specifically beyond the custom validation script.
  - Fix: Add a dedicated CI step that prints the installed version of `axios`, `package.json` version, and `package-lock.json` resolved version for audit and ensure its presence in the CI logs.
- **[D4] Monitoring - Dependency Audit Checks & Automated Alerts** (sev 7 · impact 8) — spec-says-code-doesnt
  - Evidence: Spec: 'Introduce dependency audit checks in CI pipeline' and 'Add automated alerts for unauthorized version changes'. Code: The `validate:axios` script is a basic check, but there's no evidence of a comprehensive dependency audit tool (e.g., `npm audit`, Snyk, Dependabot Security Updates configured) or an alerting system integrated into the CI pipeline.
  - Fix: Integrate a robust dependency vulnerability scanner (e.g., `npm audit` by default, or Snyk/Mend Scan) into the CI pipeline. Configure it to fail builds on critical Axios vulnerabilities and set up direct alerts for maintainers. The `validate:axios` script could be extended to directly trigger alerts or hook into an existing alerting system if a violation is found.
- **[D5] Specification Lacks Detail for Validation Script** (sev 3 · impact 4) — missing-spec
  - Evidence: Code: `package.json` includes `"validate:axios": "npx tsx scripts/validate-axios-version.ts"`. Spec: While the spec demands enforcement, it does not describe the specific mechanism (a custom script) or its expected behavior/location.
  - Fix: Add a new section (e.g., 'Automated Validation') to the spec describing the purpose and high-level behavior of `scripts/validate-axios-version.ts`, including what it checks and under what conditions it should be run (e.g., pre-commit, CI).

---

### `spec/32-ui-design/00-overview.md` — 85.8/100

**Status:** scaffold-only
**Summary:** This overview spec provides a high-level guide for UI development, outlining key principles and linking to more detailed specifications. It serves its purpose well as a starting point for implementers, but specific architectural and token definitions cited are not fully aligned with the current, very early scaffold implementation.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 90 | The spec provides an excellent mission statement and a clear reading order for UI implementation. It lists critical load-bearing rules and outlines the core recursive rendering contract. The AUTO-TOC and folder listings are comprehensive for the UI module. It accurately sets the stage for UI development, even if some linked specs are yet to be written or contain the actual values as described. |
| Consistency | 85 | The spec is largely internally consistent, with a clear structure and cross-references. The `Load-Bearing UI Rules` table enforces consistency. However, there's a minor inconsistency in how the `@theme` block and HSL token definitions are described versus how they are implemented, which affects the 'single source of truth' principle (D1, D2, D3). The mention of `mem://architecture/data-model` is an external consistency point that implies a unified architectural vision. |
| Alignment | 75 | Given the project is in 'SPEC-ONLY mode' and 'Implementation = early P1.1 scaffold', the alignment is generally good for the intended purpose. The scaffold correctly references the Tailwind version (`@tailwindcss/vite` in `package.json`) and the tech stack. However, the details of color token definition (D1, D2, D3) and the specific location of the HSL value SSOT do not perfectly align with the current scaffold's `src/index.css`. The explicit UI constants lack direct spec reference (D4). |
| Clarity | 92 | The language is precise, concise, and easy to understand. The 'Mission' and 'If you are an AI implementing UI, read in this exact order:' sections are particularly clear and actionable. The 'Load-Bearing UI Rules' are direct. The description of `Recursive-Tree Rendering Contract` effectively communicates complex UI logic. Slight ambiguity exists in the precise definition of 'semantic tokens' beyond color (D5) and the exact mechanism of `@theme` block usage with HSL values. |
| Maintainability | 88 | The spec contributes positively to maintainability by centralizing UI rules and providing a structured reading order. The explicit cross-references are valuable. The AUTO-TOC system ensures the spec stays up-to-date with file structure. Clarifying the actual SSOT for HSL values (D1, D2, D3) and adding explicit spec for global UI constants (D4) would further enhance maintainability by reducing ambiguity for future implementers. |
| Test Coverage | 95 | The spec explicitly calls out acceptance criteria (`AT-UIDESIGN-01..25`) and provides concrete rules (U1-U8) that are highly testable. The 'Load-Bearing UI Rules' are excellent for driving automated and manual testing. The recursive tree rendering contract also implies specific, testable behaviors. The general overview doesn't directly speak to code-level test coverage, but it enables it effectively at a functional level. |

**Drift findings:**
- **[D1] Tailwind v4 CSS-first via @tailwindcss/vite; no `tailwind.config.ts` color extensions** (sev 8 · impact 9) — spec-says-code-doesnt
  - Evidence: Spec (U3) states: 'Tailwind is **v4 CSS-first via `@tailwindcss/vite`**. No `tailwind.config.ts` color extensions; tokens go in `@theme`.'
`src/index.css` implements `@theme inline { ... }` with custom properties, but `package.json` includes `tailwindcss: ^4.2.2` and `@tailwindcss/vite: ^4.2.2`, confirming Tailwind v4, but the color definition approach differs from the 'no `tailwind.config.ts` color extensions' phrasing which implies *only* `@theme` block. The current implementation uses Tailwind v4's CSS engine, not the `@theme` block for custom color vars directly, but rather defines them in `:root` and `.dark` blocks, and has an `@theme inline` block with `var(--color-...)` referencing those HSL vars. This is a subtle difference in *how* the tokens are composed with Tailwind's v4 new CSS variable approach.
  - Fix: Rephrase spec U3 to accurately reflect Tailwind v4's CSS variable architecture. The `tailwind.config.ts` is indeed not used for color aliases, but the `:root` and `@theme inline` blocks are both in play.

File: `spec/32-ui-design/00-overview.md`
Before:
`U3 | Tailwind is **v4 CSS-first via `@tailwindcss/vite`**. No `tailwind.config.ts` color extensions; tokens go in `@theme`.`
After:
`U3 | Tailwind is **v4 CSS-first via `@tailwindcss/vite`**. Color tokens are HSL values defined as CSS variables in `:root`/`.dark` and referenced via `@theme inline { --color-primary: hsl(var(--primary)); }` declarations. No `tailwind.config.ts` color extensions.`
- **[D2] All colors are HSL, defined in `src/index.css` `@theme` block. Never hardcode `#hex` or `rgb()` in components.** (sev 8 · impact 9) — spec-says-code-doesnt
  - Evidence: Spec (U1) states: 'All colors are HSL, defined in `src/index.css` `@theme` block. **Never** hardcode `#hex` or `rgb()` in components.'
While `src/index.css` defines HSL variables, they are primarily in `:root` and `.dark` blocks, which are then *referenced* within the `@theme inline` block (e.g., `--color-background: hsl(var(--background));`). The spec implies direct HSL definition *in* the `@theme` block (e.g., `--color-background: hsl(0 0% 100%);`). This distinction affects where the single source of truth for raw HSL values resides.
File `src/index.css`
```css
@theme inline {
  --color-border: hsl(var(--border)); /* Uses var() */
  --color-background: hsl(var(--background));
  /* ... */
}

:root {
  --background: 0 0% 100%; /* Raw HSL here */
  --foreground: 0 0% 8%;
  /* ... */
}
```
  - Fix: Clarify that base HSL values are defined in `:root` variables, and these variables are then aliased into semantic `--color-*` variables within the `@theme inline` block.

File: `spec/32-ui-design/00-overview.md`
Before:
`U1 | All colors are HSL, defined in `src/index.css` `@theme` block. **Never** hardcode `#hex` or `rgb()` in components.`
After:
`U1 | All colors are HSL. Base HSL values are stored in CSS variables within `:root`/`.dark` in `src/index.css`, which are then aliased to semantic `--color-*` tokens within the `@theme inline` block with `hsl(var(...))`. Never hardcode `#hex` or `rgb()` in components.`
- **[D3] `03-design-system/01-tokens-and-themes.md` is HSL token SSOT** (sev 7 · impact 7) — spec-says-code-doesnt
  - Evidence: The spec states `'03-design-system/01-tokens-and-themes.md'` is the HSL token SSOT (single source of truth). However, the `src/index.css` file contains the actual HSL token definitions in `:root` and `.dark` blocks. The linked spec file itself would be the SSOT if it contained the explicit values, or at least confirmed `src/index.css` as the SSOT for the *values*.
  - Fix: Update `00-overview.md` to clarify that `src/index.css` is the SSOT for the *values* of HSL tokens, and `03-design-system/01-tokens-and-themes.md` provides the *conceptual* definition and usage guidelines.

File: `spec/32-ui-design/00-overview.md`
Before:
`1. [`03-design-system/01-tokens-and-themes.md`](./03-design-system/01-tokens-and-themes.md) — HSL token SSOT.`
After:
`1. [`03-design-system/01-tokens-and-themes.md`](./03-design-system/01-tokens-and-themes.md) — HSL token conceptual definition & usage. (Actual values in `src/index.css`).`
- **[D4] Missing spec for explicit global constants in `src/lib/constants.ts`** (sev 6 · impact 5) — missing-spec
  - Evidence: `src/lib/constants.ts` defines several UI-related constants (e.g., `INDENT_PER_LEVEL_PX`, `BULLET_DOT_SIZE_PX`, `NAVBAR_HEIGHT_PX`, `SIDEBAR_WIDTH_PX`, `BOARD_COLUMN_WIDTH_PX`). While `MAX_ITEMS_PER_VIEW` cites a spec, the other common UI constants related to layout and dimensions do not have an explicit reference in this UI overview spec or related UI architectural specs, although some might be mentioned implicitly elsewhere. They are critical UI design decisions that should be explicitly documented or referenced from a UI spec.
  - Fix: Create a new spec file under `01-architecture/` or `03-design-system/` (e.g., `03-design-system/04-dimensions.md`) to define these explicit pixel values and reference it from this overview, or update `01-architecture/01-tech-stack.md` or `03-design-system/00-overview.md` to explicitly link to `src/lib/constants.ts` for these values.

File: `spec/32-ui-design/00-overview.md`
Add a new rule to 'Load-Bearing UI Rules' table, e.g.:
`U9 | Global UI constant values are defined in `src/lib/constants.ts`. | `01-architecture/??-dimensions.md``
And in 'If you are an AI implementing UI, read in this exact order:', add:
`X. [`01-architecture/XX-dimensions.md`](./01-architecture/XX-dimensions.md) — Global UI constants.` (Replace XX with appropriate number)
- **[D5] Use of `text-menu` class in `Toaster.tsx` implies custom font-size, contradicting semantic token usage.** (sev 4 · impact 3) — code-does-spec-doesnt
  - Evidence: Spec (U2) states: 'Components consume **semantic tokens** (`bg-background`, `text-foreground`, `border-border`), never raw color classes (`bg-white`, `text-black`).' This rule, by implication, also applies to other UI properties like font sizes if a design system is mature. `src/index.css` defines `--font-size-menu`. However, `src/components/ui/Toaster.tsx` uses `text-menu` directly. While `text-menu` is built from a CSS variable `--font-size-menu`, the spec focuses on `semantic tokens` mainly in reference to color, but the spirit of the rule applies to other design system variables. It's a derived class rather than a utility class, which aligns with semantic usage, but the spec's phrasing could be more explicit.
  - Fix: Clarify that semantic class names built from CSS variables are also considered proper 'semantic tokens' for properties beyond color. Expand Rule U2 to explicitly mention other semantic classes where appropriate (e.g. font sizes, spacing), or add a new, more general rule that any custom Tailwind class should be derived from the design system's CSS variables.

File: `spec/32-ui-design/00-overview.md`
Before:
`U2 | Components consume **semantic tokens** (`bg-background`, `text-foreground`, `border-border`), never raw color classes (`bg-white`, `text-black`).`
After:
`U2 | Components consume **semantic tokens** and classes like (`bg-background`, `text-foreground`, `text-menu`, `px-xl`), which are derived from semantic CSS variables. Never hardcode raw values (`bg-white`, `font-size-12px`).`
- **[D6] Rubric weights inconsistency with given prompt** (sev 1 · impact 1) — contradiction
  - Evidence: The prompt specified `Completeness 25, Consistency 25, Alignment 20, Clarity 15, Maintainability 10, TestCoverage 5` (summing to 100). My calculation for the `weighted_score` will use these exact weights. This isn't a drift in the spec or code, but a self-correction for the AI's output.
  - Fix: N/A - This is an instruction for *my* output, not a flaw in the spec.

---

### `spec/32-ui-design/01-architecture/01-tech-stack.md` — 90/100

**Status:** scaffold-only
**Summary:** The tech-stack spec is generally well-aligned with the scaffolded implementation, accurately listing main frameworks and tools. Minor version discrepancies exist, and some listed technologies are not yet demonstrably integrated beyond package dependencies.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 95 | The spec provides a comprehensive list of core technologies for the UI. It details the purpose and rationale for each, leaving little ambiguity regarding the intended stack. Only minor version omissions/discrepancies exist. Some listed technologies aren't implemented yet, but for a 'SPEC-ONLY' project, this is acceptable, and they are clearly defined here. |
| Consistency | 90 | The spec is internally consistent with its defined technologies. There are no contradictions. However, there are minor inconsistencies with the exact versions reflected in `package.json`, which should be addressed. |
| Alignment | 85 | For core frameworks like React, Vite, Tailwind, React Router, and TanStack Query, the implementation aligns well, and they are present in `package.json` and basic setup files (e.g., `main.tsx`, `vite.config.ts`, `tailwind-merge` in `utils.ts`). Framer Motion is included but not yet used. shadcn/ui is listed but `radix-ui/react-slot` is used directly in `Toaster.tsx`'s `Toaster` component, suggesting a pattern is being followed rather than direct shadcn usage. `dnd-kit` and `contenteditable` are mentioned in the spec but have no implementation footprint yet, which lowers alignment for these specific items, but is acceptable given the 'scaffold-only' status being audited. |
| Clarity | 98 | The spec is highly clear. The table format explicitly lists Technology, Purpose, and Why. The version numbers are generally precise (e.g., 'React 18+'). The descriptions are concise and highlight key benefits, making the choices understandable. |
| Maintainability | 90 | The spec's table format makes it easy to add, remove, or modify entries. The rationale for 'why' each tech was chosen supports future decisions and helps prevent technology sprawl. Version numbers (e.g., '18+') allow for minor updates without immediate spec changes, which is good. However, specific minor versions in the code drifting from the spec (e.g., `^19.2.4` vs `18+`) indicates that either the spec needs more specificity or a process is needed to sync these. |
| Test Coverage | 70 | This spec primarily defines the tools, not specific testable behavior. Therefore, test coverage from the perspective of this spec is limited to verifying that the correct packages are installed and configured. Foundational configurations like `vite.config.ts` or `tailwind.config.js` aren't directly testable, but their presence confirms implementation. The existence of core packages in `package.json` and their basic setup files (e.g., `main.tsx` for `BrowserRouter` and `QueryClientProvider`, `App.tsx` for `Routes/Route`) partially covers this. The lack of `dnd-kit` and `contenteditable` usage means their presence isn't verified by testing at all, pulling this score down. |

**Drift findings:**
- **[D1] React version slight mismatch** (sev 2 · impact 1) — spec-says-code-doesnt
  - Evidence: Spec: 'React 18+'
Impl: `package.json` shows 'react': '^19.2.4', 'react-dom': '^19.2.4'
  - Fix: spec/32-ui-design/01-architecture/01-tech-stack.md:
Replace 'React 18+' with 'React 19+'
- **[D2] React Router version slight mismatch** (sev 2 · impact 1) — spec-says-code-doesnt
  - Evidence: Spec: 'React Router 6+'
Impl: `package.json` shows 'react-router-dom': '^7.13.2'
  - Fix: spec/32-ui-design/01-architecture/01-tech-stack.md:
Replace 'React Router 6+' with 'React Router 7+'
- **[D3] Tailwind CSS version slight mismatch** (sev 2 · impact 1) — spec-says-code-doesnt
  - Evidence: Spec: 'Tailwind CSS 3+'
Impl: `package.json` shows 'tailwindcss': '^4.2.2'
  - Fix: spec/32-ui-design/01-architecture/01-tech-stack.md:
Replace 'Tailwind CSS 3+' with 'Tailwind CSS 4+'
- **[D4] TanStack Query version slight mismatch** (sev 2 · impact 1) — spec-says-code-doesnt
  - Evidence: Spec: 'TanStack Query 5+'
Impl: `package.json` shows '@tanstack/react-query': '^5.95.2'
  - Fix: spec/32-ui-design/01-architecture/01-tech-stack.md:
Replace 'TanStack Query 5+' with 'TanStack Query 5.95+' (or similar specific minor version, if desired for precision)
- **[D5] Framer Motion version mismatch** (sev 3 · impact 1) — spec-says-code-doesnt
  - Evidence: Spec: 'Framer Motion 11+'
Impl: `package.json` shows 'framer-motion': '^12.38.0'
  - Fix: spec/32-ui-design/01-architecture/01-tech-stack.md:
Replace 'Framer Motion 11+' with 'Framer Motion 12+'
- **[D6] shadcn/ui not explicitly used, but Radix used for Toaster** (sev 4 · impact 3) — spec-says-code-doesnt
  - Evidence: Spec lists 'shadcn/ui' as 'Base component library'. Implemented `Toaster` component does not directly import from `shadcn/ui` but uses `radix-ui/react-icons`. `package.json` includes `@radix-ui/react-slot` which is a primitive usually consumed by shadcn/ui. The structure of `src/components/ui/Toaster.tsx` hints at a shadcn-like pattern (utility classes, separation of context/component).
  - Fix: spec/32-ui-design/01-architecture/01-tech-stack.md:
Clarify shadcn/ui is the 'pattern' for UI components leveraging Radix primitives, rather than a direct import, or ensure actual shadcn components are incorporated early.
src/components/ui/Toaster.tsx:
Consider refactoring to explicitly use shadcn/ui's `useToast` or `Toast` compound component if available and appropriate, or rename `ui` folder to clarify it's a home-grown implementation using shadcn/ui patterns and Radix primitives.
- **[D7] dnd-kit not implemented** (sev 3 · impact 4) — spec-says-code-doesnt
  - Evidence: Spec lists 'dnd-kit' for drag-and-drop. `package.json` does not include `dnd-kit` and the current scaffold does not show any drag-and-drop functionality.
  - Fix: Action is for implementation: Add `dnd-kit` to `package.json` and begin integrating it for planned drag-and-drop features, or update spec's 'Why This Over Alternatives' to reflect that it's a planned future integration.
- **[D8] Native contenteditable divs not implemented** (sev 3 · impact 4) — spec-says-code-doesnt
  - Evidence: Spec lists 'Native contenteditable divs'. No `contenteditable` usage is found in the current scaffold, e.g., the `Home.tsx` page has a static text message.
  - Fix: Action is for implementation: Start integrating `contenteditable` divs into a scaffolded item component to demonstrate this choice early, or update spec to mark this as a later phase feature if it's not critical for P1.1.

---

### `spec/32-ui-design/01-architecture/03-component-hierarchy.md` — 79.5/100

**Status:** scaffold-only
**Summary:** This spec provides a comprehensive overview of the UI component architecture, detailing major application sections and individual components. It scores highly on clarity and intent, but its alignment with the minimal P1.1 scaffold is naturally low, as most features are yet to be implemented.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 95 | The spec thoroughly covers a vast array of UI components planned for the application, going into significant detail for each. It's an excellent blueprint for the intended UI. |
| Consistency | 90 | Internally consistent, using clear headings and consistent descriptive language. One minor inconsistency is the section numbering anomaly (3.4b appearing after 3.4), which is purely aesthetic but could be clearer. |
| Alignment | 60 | Given the 'SPEC-ONLY' mode and early P1.1 scaffold, direct alignment is low for most features as expected. However, critical infrastructural components like the Router, QueryClientProvider, and ToastProvider are present and align with the spirit of the 'Top Level' section. The `AppLayout.tsx` explicitly defers future layout components, which is good alignment between spec intention and scaffold for a multi-phase project. |
| Clarity | 95 | The spec sections are well-organized, descriptive, and easy to understand. The use of bullet points and clear, concise language makes the component breakdown very digestible. Details like pixel dimensions and behavior (e.g., hover actions, conditional rendering, keyboard shortcuts where noted) enhance clarity. The section numbering `3.4b` is slightly awkward but doesn't hinder understanding. |
| Maintainability | 85 | The spec is detailed, which is good for maintainability as it reduces ambiguity. The clear component boundaries and hierarchical structure would help developers implement and maintain individual parts. Adding SSOT references for shared constants like dimensions would further improve maintainability. |
| Test Coverage | 50 | Test coverage is naturally low as most features described are not yet implemented. The one major implemented feature (ToastProvider) has excellent test coverage, which bodes well for future component testing. The `hotkeys.test.ts` also implicitly covers aspects of UI interactions described loosely here. |

**Drift findings:**
- **[D1] Missing Implementation: Top Level Structure** (sev 8 · impact 8) — spec-says-code-doesnt
  - Evidence: Spec §3.1 describes a 'query cache provider, authentication provider, and router'. The implementation provides a QueryClientProvider and BrowserRouter, as well as a custom ToastProvider. An authentication provider is absent.
  - Fix: This is expected in 'SPEC-ONLY' mode. No immediate correction needed for the spec. The 'Authentication Provider' is a critical component for P1.2. Mark this for implementation in `src/main.tsx`.
- **[D2] Missing Implementation: AppLayout Details** (sev 8 · impact 8) — spec-says-code-doesnt
  - Evidence: Spec §3.2 details a 'NavBar', 'Sidebar', 'Content Area', 'Usage Quota Indicator', 'Search Overlay', and 'Command Palette'. The `AppLayout.tsx` component is explicitly a 'transparent passthrough' and does not implement any of these, deferring them to P1.3.
  - Fix: This is explicitly noted in `src/components/layout/AppLayout.tsx` as a future phase. No correction needed for the spec, which accurately describes the target state. Good alignment in documenting future work.
- **[D3] Missing Implementation: Settings Menu Dropdown** (sev 7 · impact 7) — spec-says-code-doesnt
  - Evidence: Spec §3.3 describes a detailed 'Settings Menu Dropdown' with 5 groups of actions. No component in the current scaffold implements this menu.
  - Fix: Expected for 'SPEC-ONLY' mode. This is a future UI component. The spec is clear and detailed.
- **[D4] Missing Implementation: Bullet Item** (sev 9 · impact 9) — spec-says-code-doesnt
  - Evidence: Spec §3.4 meticulously describes the 'Bullet Item' component with 9 sub-elements (indent spacer, expand/collapse, bullet dot, content editor, note editor, inline badges, child count, hover actions, add button). This core component is not present in the current scaffold, which only has a placeholder 'Home' page.
  - Fix: This is a core, unimplemented feature. The spec provides excellent detail for future implementation. The `Home.tsx` refers to 'Start typing to create your first item', which directly implies the need for bullet items.
- **[D5] Missing Implementation: Multi-Select UI** (sev 7 · impact 6) — spec-says-code-doesnt
  - Evidence: Spec §3.4b details 'Multi-Select UI' functionality including 'Selection highlight', 'SelectionCountBadge', and 'BulkActionBar'. No such components or logic exist in the P1.1 scaffold.
  - Fix: Expected for 'SPEC-ONLY' mode. The spec is clear for future implementation.
- **[D6] Missing Implementation: Board Mode UI** (sev 7 · impact 7) — spec-says-code-doesnt
  - Evidence: Spec §3.4 describes the 'Board mode' UI (`Board container`, `Board column`, `Board card`, `Add column/card button`). This is a major view type not implemented in the current scaffold.
  - Fix: Expected for 'SPEC-ONLY' mode. This is a future UI component and view. The spec's detail is adequate.
- **[D7] Missing Implementation: Item Context Menu** (sev 7 · impact 7) — spec-says-code-doesnt
  - Evidence: Spec §3.6 details the 'Item Context Menu' with multiple groups of actions (Turn Into, Core, Move, Advanced, View, Danger Zone, Metadata). There is no UI component implementing this.
  - Fix: Expected for 'SPEC-ONLY' mode. The spec is comprehensive for future implementation.
- **[D8] Missing Implementation: Text Formatting Toolbar** (sev 6 · impact 6) — spec-says-code-doesnt
  - Evidence: Spec §3.7 describes a 'Text Formatting Toolbar' with type and format buttons. This is not implemented.
  - Fix: Expected for 'SPEC-ONLY' mode.
- **[D9] Unimplemented UI components** (sev 5 · impact 5) — spec-says-code-doesnt
  - Evidence: Sections 3.9 (Location Picker), 3.10 (Comment Side Panel), 3.11 (Tag Picker), 3.12 (Archive Action UI), 3.13 (Other Dialogs), and 3.11 (Auth Pages) describe various UI components and dialogs. None of these are implemented in the current scaffold. The search overlay (3.8) is specifically called out in hotkeys, but not yet implemented as a distinct component.
  - Fix: These are all features marked for future implementation. The spec provides good detail. This is expected in 'SPEC-ONLY' mode.
- **[D10] Partial Implementation: Toast Notification System** (sev 2 · impact 3) — partially-implemented
  - Evidence: Spec §3.1 mentions a 'global toast notification system'. The code has a `ToastProvider` and `Toaster` component (`src/contexts/ToastContext.tsx`, `src/components/ui/Toaster.tsx`, and tests).
  - Fix: The toast system is well-implemented as described. No correction needed for the spec or implementation.
- **[D11] Implicit Hotkey Implementation without UI Hookup** (sev 3 · impact 4) — code-does-spec-doesnt
  - Evidence: The `src/lib/hotkeys.ts` file defines `OpenSearch` hotkey (mod+K). While section 3.8 describes the 'Search Overlay' UI, the spec doesn't explicitly link the hotkey to the UI component. The hotkey exists as part of the app's 'interactions' and has a specRef pointing to a keyboard shortcuts spec, but the linkage to this component hierarchy spec could be stronger.
  - Fix: Add a note in spec §3.8 indicating the keyboard shortcut for opening the Search Overlay:

```diff
--- a/spec/32-ui-design/01-architecture/03-component-hierarchy.md
+++ b/spec/32-ui-design/01-architecture/03-component-hierarchy.md
@@ -80,6 +80,7 @@
 ### 3.8 Search Overlay
 
 Full-screen overlay with:
+- Keyboard shortcut: ⌘K (macOS), Ctrl+K (Windows/Linux)
 - Centered search input (~640px max width) with magnifier icon, auto-focus, and loading spinner
 - Results list below: each result shows content (with highlighted matches) and parent breadcrumb path
 - Keyboard navigation (↑↓ to select, Enter to zoom, Escape to close)
```
- **[D12] UI Dimensions in Constants vs. Spec** (sev 2 · impact 2) — code-does-spec-doesnt
  - Evidence: The `src/lib/constants.ts` file includes `NAVBAR_HEIGHT_PX = 48`, `SIDEBAR_WIDTH_PX = 280`, and `BOARD_COLUMN_WIDTH_PX = 280`. These correspond to values in spec §3.2, but the spec does not explicitly specify a single source of truth for these values, or link to the constants file.
  - Fix: Add a `SSOT:` reference in the spec to `src/lib/constants.ts` for these dimensional values, e.g., in §3.2:

```diff
--- a/spec/32-ui-design/01-architecture/03-component-hierarchy.md
+++ b/spec/32-ui-design/01-architecture/03-component-hierarchy.md
@@ -11,10 +11,10 @@
 ### 3.2 Layout
 
 The main authenticated layout contains:
-- **NavBar** (fixed at top, ~48px height)
+- **NavBar** (fixed at top, ~48px height, SSOT: `src/lib/constants.ts#NAVBAR_HEIGHT_PX`)
   - **NavBar Left**: Menu toggle, back arrow, forward arrow, home button, breadcrumbs with overflow
   - **NavBar Right**: Search button, share button (hidden on home), clipboard/copy button, favorite button (hidden on home), checkmark (complete), layout toggle (list/board), settings menu dropdown
-- **Sidebar** (~240px, collapsible from left, shortcut: ^L)
+- **Sidebar** (~240px, collapsible from left, SSOT: `src/lib/constants.ts#SIDEBAR_WIDTH_PX`, shortcut: ^L)
   - Collapse/expand arrow at top
   - Today shortcut (📅 "Today") at top
   - Home tree browser — collapsible hierarchical view of the user's entire outline starting from "Home"
```

---

### `spec/32-ui-design/01-architecture/04-file-organization.md` — 88/100

**Status:** partially-implemented
**Summary:** The file organization spec is well-defined and mostly aligned with the current scaffold. Minor inconsistencies exist in the 'components/ui/' and 'contexts/' directories, and 'hooks/' is mentioned but no hooks are present in the scaffold under that path.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 90 | The spec provides a comprehensive list of all intended directories and their key contents. It covers all major functional areas expected of the application. Some minor configuration files (e.g., vite.config.ts, package.json for dependencies) are not covered, which is acceptable for a 'source code file organization' spec. |
| Consistency | 95 | The spec itself is internally consistent in its format and breakdown. There are no contradictions within the document regarding directory definitions or contents. The naming conventions are uniform. |
| Alignment | 70 | While in 'SPEC-ONLY' mode, significant parts of the directory structure (e.g., 'outliner', 'board', 'menus') are not yet implemented, which is expected. However, the 'hooks/' directory is completely missing, and 'contexts/' contains something concrete ('ToastContext') that isn't reflected in the spec's current description ('Authentication context/provider' only). This indicates some drift in the partially completed scaffold versus the spec's explicit mentions. |
| Clarity | 95 | The spec uses a clear table format, making it easy to read and understand. Each directory has a concise purpose and lists representative key contents, effectively communicating its role. The language is unambiguous. |
| Maintainability | 90 | The spec's structure directly aids maintainability by providing clear boundaries for code. New features can be placed within their designated directories. However, the lack of specific detail on what constitutes `item-specific helper functions` in `lib/` could lead to some maintainability overhead if not further clarified. |
| Test Coverage | 80 | The spec itself doesn't directly describe test coverage, but it defines the structure which would be easy to unit test per directory. For instance, the 'types/' directory has its own tests (`src/types/index.test.ts`), indicating that this organization supports testing. 'contexts/' also shows well-written tests. |

**Drift findings:**
- **[D1] Missing `hooks/` directory in implementation** (sev 4 · impact 5) — spec-says-code-doesnt
  - Evidence: Spec lists `hooks/` directory. Implementation scaffold does not contain a `src/hooks` directory (only a `src/lib/hotkeys.ts` which is hook-like but not in `hooks`).
  - Fix: Create the `src/hooks` directory for future custom React hooks, or update the spec if the `hooks/` directory is not intended yet. Given the spec, creating the directory is preferred: `mkdir -p src/hooks`
- **[D2] Missing shadcn/ui components in `components/ui/`** (sev 3 · impact 4) — spec-says-code-doesnt
  - Evidence: Spec lists 'Button, DropdownMenu, Dialog, Popover, Tooltip, Sheet, ScrollArea, Separator, Badge, Avatar, Checkbox, Command, Toast' in `components/ui/`. Implementation only contains `Toaster.tsx`.
  - Fix: This is acceptable in 'SPEC-ONLY' mode. No immediate correction needed, but as development proceeds, these components should be added to `src/components/ui/`.
- **[D3] Specific context `ToastContext` exists but spec says 'Authentication context/provider'** (sev 2 · impact 3) — code-does-spec-doesnt
  - Evidence: Spec says `contexts/` contains 'Authentication context/provider'. Implementation contains `src/contexts/ToastContext.tsx` and `src/contexts/ToastContext.test.tsx`.
  - Fix: Update spec/32-ui-design/01-architecture/04-file-organization.md to reflect the existing ToastContext: 
```diff
--- a/spec/32-ui-design/01-architecture/04-file-organization.md
+++ b/spec/32-ui-design/01-architecture/04-file-organization.md
@@ -20,4 +20,4 @@
 | lib/ | Utilities | General utils, database client, constants, item-specific helper functions |
 | types/ | TypeScript definitions | All interfaces and type definitions |
 | pages/ | Page components | Home, ItemView, Login, Signup, ResetPassword, Trash, Settings, NotFound |
-| contexts/ | React contexts | Authentication context/provider |
+| contexts/ | React contexts | Authentication context/provider, ToastProvider |
```
- **[D4] Vite config and utility files not covered by spec** (sev 1 · impact 1) — missing-spec
  - Evidence: Files like `vite.config.ts`, `src/lib/utils.ts`, `src/vite-env.d.ts`, `src/test/setup.ts`, `package.json`, `tsconfig.json` are present but not explicitly mentioned in the file organization spec.
  - Fix: This spec focuses on 'source code' directories. Tools/config files are usually covered in a separate 'Project Structure' spec. No correction needed here, but consider a higher-level spec for project setup.
- **[D5] Auth components listed in spec, not implemented** (sev 2 · impact 2) — spec-says-code-doesnt
  - Evidence: Spec lists `components/auth/` containing `LoginForm, SignupForm, ResetPasswordForm`. These are not present in the scaffold.
  - Fix: This aligns with 'SPEC-ONLY' mode. No correction needed as implementation has not reached this point yet.
- **[D6] Many directories mentioned in spec do not exist in scaffold** (sev 2 · impact 2) — spec-says-code-doesnt
  - Evidence: Directories like `components/outliner/`, `components/board/`, `components/menus/`, `components/panels/`, `components/navigation/`, `components/dialogs/` are listed in the spec but are not present in the current implementation scaffold.
  - Fix: This is expected as the project is in 'SPEC-ONLY' mode and implementation is early. No immediate correction needed. The spec accurately describes the future state.

---

### `spec/32-ui-design/01-architecture/05-component-contract-map.md` — 83.25/100

**Status:** scaffold-only
**Summary:** This generated spec lists UI components, their paths, data-testids, and associated acceptance tests. It effectively documents current UI surface agreements but contains inconsistencies regarding acceptance test references and several data-testid mismatches with the limited scaffold. Missing specifications for scaffolded components are also noted.

| Dim | Score | Rationale |
|-----|-------|-----------|
| Completeness | 85 | The spec is highly complete in its 'spec-only' purpose, outlining a vast number of UI surfaces. The main completeness gap is not covering some 'scaffold-only' foundational components like the generic `Toaster` and `hotkeys` registry, which are implemented and tested, but not mapped here. |
| Consistency | 70 | There are minor inconsistencies in AT references (ranges vs. lists) and discrepancies in `data-testid` strategy for toast-like components, which point to a need for stricter enforcement of conventions for this generated file. The truncation of an AT ID is also a consistency issue. |
| Alignment | 80 | Given 'early P1.1 scaffold' status, direct alignment is limited by design. The listed components mostly reflect intended future implementation. Drift exists where some scaffold components (`Toaster`, `hotkeys`) are not mapped, and where data-testids are inferred (e.g., `ErrorToast` vs. generic `Toaster`). The `AppLayout` note correctly explains the intentional passthrough. |
| Clarity | 90 | The format is very clear and easy to read. The 'DO NOT EDIT BY HAND' warning is prominent. The overview succinctly explains the file's purpose. The main areas for improvement are the minor AT ID inconsistencies and the lack of mapping for some fundamental, implemented scaffold components. |
| Maintainability | 95 | As a generated file, its maintainability is inherently high. The clear source and generator script ('DO NOT EDIT') ensures consistency and ease of update. The structure is simple and tables are well-formatted. The `scripts/spec-hygiene/07-extract-contract-map.mjs` is an excellent practice. |
| Test Coverage | 85 | The spec consistently lists associated acceptance tests, which is excellent. However, `data-testid` mismatches (e.g., generic `Toaster` vs. specific named toasts) could lead to brittle tests. The truncation of one AT ID is a minor gap. |

**Drift findings:**
- **[D1] Data-testid Mismatch: ErrorToast** (sev 6 · impact 7) — spec-says-code-doesnt
  - Evidence: Spec (01-information-model.md): `src/components/feedback/ErrorToast.tsx` with `data-testid='root-delete-error'`. 
Spec (05-interactions.md): `src/components/feedback/ErrorToast.tsx` with `data-testid='dnd-error-toast'`. 
Implementation: `Toaster.tsx` implies generic toasts, but `ErrorToast.tsx` is not shown.
  - Fix: Reconcile `ErrorToast.tsx` component contract. If `ErrorToast` is a specific component separate from the generic `Toaster`, it needs to be created. If the `Toaster` is intended to handle all error toasts, the `data-testid` definitions in the spec need to reflect this, likely needing a `data-testid` prop for dynamic assignment through the `ToastEntry` interface.

Option 1 (Generic Toaster): Update spec to indicate that `root-delete-error` and `dnd-error-toast` are `ToastEntry` 'id' fields or similar, rendered by `Toaster`.

Option 2 (Specific ErrorToast): Create `src/components/feedback/ErrorToast.tsx` and ensure its `data-testid` dynamically adapts based on props, or clarify if these are distinct `ErrorToast` instances.
- **[D2] Missing Implementation: Many Components** (sev 3 · impact 5) — missing-impl
  - Evidence: The spec lists 173 surfaces across 15 feature files, but the provided scaffold implementation is only 962 LOC across 21 files, primarily focused on basic app layout and toast functionality. Most components listed in the spec (e.g., `RootContainer.tsx`, `ItemRow.tsx`, `NavBar.tsx`, `Sidebar.tsx`, `BoardContainer.tsx`, `ShareDialog.tsx`, etc.) are not present in the current codebase.
  - Fix: This is expected in 'SPEC-ONLY' mode with 'early P1.1 scaffold'. No immediate corrections needed, but future audits will track creation of these components when development progresses beyond the scaffold.
- **[D3] Missing Spec for Implemented Components** (sev 5 · impact 6) — missing-spec
  - Evidence: The `src/components/ui/Toaster.tsx` component and `src/contexts/ToastContext.tsx` and its test `src/contexts/ToastContext.test.tsx` are significant parts of the scaffold. The spec does not explicitly list `Toaster` or specific toast variants (`success`, `warning`, `info`) with `data-testid`s and acceptance tests, beyond `ErrorToast.tsx` and `InfoToast.tsx` references which are not directly aligned.

`Toaster.tsx` uses a dynamic `px-xl py-lg text-menu` class, and the toasts themselves are accessible via `aria-label="Dismiss notification"` rather than `data-testid` for the button.
  - Fix: Add explicit entries to the component contract map for `src/components/ui/Toaster.tsx` and the individual toast types it renders. Define their `data-testid`s (e.g., `toast-success`, `toast-error`, `toast-info`, `toast-warning`), even if they are dynamically assigned.

File: `spec/32-ui-design/01-architecture/05-component-contract-map.md`
Add the following entries under relevant feature sections, or create a 'Toast System' section if appropriate:

```diff
--- a/spec/32-ui-design/01-architecture/05-component-contract-map.md
+++ b/spec/32-ui-design/01-architecture/05-component-contract-map.md
@@ -X,X +X,X
+### `XX-toast-system.md` (or existing feature sections)
+
+| Surface | Component path | `data-testid` | Acceptance tests |
+|---------|---------------|---------------|------------------|
+| Toaster shell | ``src/components/ui/Toaster.tsx`` | `toaster-region` | AT-TOAST-01 |
+| Success toast | ``src/components/ui/Toaster.tsx`` | `toast-success` | AT-TOAST-02 |
+| Error toast | ``src/components/ui/Toaster.tsx`` | `toast-error` | AT-TOAST-03 |
+| Info toast | ``src/components/ui/Toaster.tsx`` | `toast-info` | AT-TOAST-04 |
+| Warning toast | ``src/components/ui/Toaster.tsx`` | `toast-warning` | AT-TOAST-05 |
```
- **[D4] Inconsistent Acceptance Test IDs** (sev 4 · impact 4) — contradiction
  - Evidence: Some acceptance test IDs listed are inconsistent, e.g., AT-PERSONAS-04, 09 for 'Bullet item (deep nesting)' and AT-LAYOUT-01..03 for 'NavBar shell'. The `Bullet item` example has two discrete numbers, while `NavBar shell` uses a range. This suggests different conventions or an oversight.
  - Fix: Standardize the format for listing multiple acceptance tests. Use either a comma-separated list of individual IDs (e.g., `AT-LAYOUT-01, AT-LAYOUT-02, AT-LAYOUT-03`) or clarify the meaning of ranges (e.g., `AT-LAYOUT-01 to AT-LAYOUT-03`). Prefer explicit listing for clarity and test traceability.

File: `spec/32-ui-design/01-architecture/05-component-contract-map.md`
Find:
| NavBar shell | ``src/components/layout/NavBar.tsx`` | `navbar` | AT-LAYOUT-01..03 |
Replace with:
| NavBar shell | ``src/components/layout/NavBar.tsx`` | `navbar` | AT-LAYOUT-01, AT-LAYOUT-02, AT-LAYOUT-03 |

Find:
| Bullet item (deep nesting) | ``src/components/items/BulletItem.tsx`` | `bullet-item` | AT-PERSONAS-04, 09 |
Replace with:
| Bullet item (deep nesting) | ``src/components/items/BulletItem.tsx`` | `bullet-item` | AT-PERSONAS-04, AT-PERSONAS-09 |
- **[D5] Partial AT ID - Truncated List** (sev 2 · impact 2) — contradiction
  - Evidence: The final entry for `multiselect-cleared-toast` in '12-multi-select.md' lists `AT-` and then truncates, indicating an incomplete entry.
  - Fix: Complete the acceptance test ID for `multiselect-cleared-toast`. If the ID is not yet defined, mark it as TBD or remove the row if the feature isn't yet specified.
- **[D6] Implicit `data-testid` in `ToastItem` vs Spec** (sev 5 · impact 5) — code-does-spec-doesnt
  - Evidence: The `ToastItem` component renders a `<button>` with an `aria-label="Dismiss notification"` but no `data-testid`. The spec, however, attributes `data-testids` like `root-delete-error` and `dnd-error-toast` to `ErrorToast.tsx` (which is not in the scaffold) and `InfoToast.tsx`. If `ToastItem` is meant to be the generic toast rendering component, then its `data-testid` strategy needs alignment.
  - Fix: Decide on a single `data-testid` strategy for toasts handled by `Toaster`.

Option 1 (Dynamic `data-testid`): Add a `data-testid` prop to `ToastItem` that is passed from the `toast` function, e.g., `data-testid={entry.testId || `toast-${entry.variant}`}`. The spec would then list these dynamic test IDs.

File: `src/components/ui/Toaster.tsx`
```diff
--- a/src/components/ui/Toaster.tsx
+++ b/src/components/ui/Toaster.tsx
@@ -20,7 +20,7 @@
     <button
       type="button"
       onClick={() => onDismiss(entry.id)}
-      className={`pointer-events-auto rounded-md px-xl py-lg text-menu shadow-lg ${variantClass}`}
+      className={`pointer-events-auto rounded-md px-xl py-lg text-menu shadow-lg ${variantClass}`}
       aria-label="Dismiss notification"
+      data-testid={entry.testId || `toast-${entry.variant}`}
     >
       {entry.message}
     </button>
```

Option 2 (Semantic `aria-label` only): If `data-testid`s are not strictly required for every toast instance, update the spec to reflect this, relying on `aria-label` and message content for testing. This would imply removing specific `data-testid`s from `ErrorToast`/`InfoToast` entries and focusing on the `Toaster`'s container `role="region"`.
- **[D7] `AppLayout` is a passthrough but spec anticipates future chrome** (sev 1 · impact 1) — spec-says-code-doesnt
  - Evidence: `AppLayout.tsx` comments state it's a 'transparent passthrough' but also mentions 'Navbar, Sidebar, and panel slots will land in P1.3 per `spec/31-app/01-features/03-layout-structure.md`'. The component contract map lists these components.
  - Fix: This is acceptable given the 'early P1.1 scaffold' status. No immediate correction needed, as the spec clearly lays out future features without implying they are currently built. `AppLayout.tsx`'s comment clearly explains its interim state.
- **[D8] Use of `src/lib/hotkeys.ts` but no entry in this spec** (sev 4 · impact 5) — missing-spec
  - Evidence: The file `src/lib/hotkeys.ts` is a critical 'Single Source of Truth (F-07)' for keyboard shortcuts, complete with `HotkeyId`, `KeyCombo`, `HotkeyBinding`, and formatting utility. Its test file `src/lib/hotkeys.test.ts` further reinforces its role. The component contract map, however, does not include any entry for this global 'surface' or 'component path', which it should given its role in defining interaction behaviors.
  - Fix: Add `src/lib/hotkeys.ts` to the component contract map, defining its `data-testid` (perhaps `keyboard-action-registry` as seen incidentally in `02-personas.md`) and referencing `AT-PERSONAS-02` or dedicated acceptance tests for hotkey functionality.

File: `spec/32-ui-design/01-architecture/05-component-contract-map.md`
Add entry under '02-personas.md' or a new '1X-interactions-system.md' section:

```diff
--- a/spec/32-ui-design/01-architecture/05-component-contract-map.md
+++ b/spec/32-ui-design/01-architecture/05-component-contract-map.md
@@ -X,X +X,X
| Keyboard action registry | ``src/lib/hotkeys.ts`` | `keyboard-action-registry` | AT-PERSONAS-02 |
```

---

### `spec/09-code-block-system/00-overview.md` — 88/100 🔸

**Status:** scaffold-only
**Note:** Validated in Plan 07 (F-04 closure); pin-aware. No drift in scaffold.

---

### `spec/09-code-block-system/11-highlighter-dependency-pin.md` — 95/100 🔸

**Status:** not-started
**Note:** Validated in Plan 07; round-2 audit confirmed dependency budget + theme strategy. No code yet (gated on SPEC-ONLY lift).

---

### `spec/13-cicd-pipeline-workflows/00-overview.md` — 90/100 🔸

**Status:** not-started
**Note:** Validated in Plan 05 (F-02 closure); rollup correctly references 18-wp-plugin-deploy/.

---

### `spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/00-overview.md` — 92/100 🔸

**Status:** not-started
**Note:** Validated in Plan 05; .distignore + GH Actions + version sync all defined. Awaits CI repo.

---

### `spec/10-powershell-integration/08-wp-plugin-boundary.md` — 93/100 🔸

**Status:** n/a
**Note:** Validated in Plan 06 (F-03 closure); 8 boundary rules B1–B8 defined. No code drift possible (PHP/PS dev-only boundary).

---

### `spec/02-coding-guidelines/consolidated-review-guide/99-quick-checklist.md` — 87/100 🔸

**Status:** scaffold-only
**Note:** Drift risk: AUDIT-02 (DB casing) + AUDIT-05 (TS enum) still open. Otherwise checklist matches scaffold rules.

---

### `spec/32-ui-design/02-state-and-data/03-data-types.md` — 90/100 🔸

**Status:** partially-implemented
**Note:** Aligns with src/types/index.ts (12 ItemTypes match exactly). Drift: src uses camelCase TS interfaces; spec promotes snake_case DB column SSOT — boundary needs explicit mapping table.

---

### `spec/32-ui-design/03-design-system/01-tokens-and-themes.md` — 86/100 🔸

**Status:** partially-implemented
**Note:** src/index.css uses @theme tokens; matches spec. Drift: spec mentions HSL var pattern; impl uses raw HSL (correct per Tailwind v4).

---

### `spec/32-ui-design/03-design-system/03-tailwind-version-ssot.md` — 92/100 🔸

**Status:** fully-implemented
**Note:** package.json pins tailwindcss ^4.2.2 + @tailwindcss/vite ^4.2.2 — exact match.

---

### `spec/32-ui-design/04-editor/01-rich-text-format.md` — 78/100 🔸

**Status:** not-started
**Note:** Editor not yet built (P1.4); spec defines richContent format. Risk: spec mentions HTML AND markdown — needs single SSOT pick before P1.4.


---

## 🎯 Highest-Priority Corrections (blockers, severity ≥ 7)

1. **`spec/31-app/00-overview.md`** — Backend runtime constraint violation in `package.json` (sev 9, impact 10)
   → This is a fundamental architectural contradiction. Reconcile `spec/31-app/00-overview.md#L9` with the chosen implementation stack. If Node.js/Vite is intended for the frontend, the spec should clarify this and distinguish it from the backend runtime. If 'No Node' means the entire stack, then the current `package.json` is a direct violation.

Option 1 (Clarify Spec): Amend spec L9 to explicitly state Node.js/Vite for frontend, PHP for backend API.
```diff
--- a/spec/31-app/00-overview.md
+++ b/spec/31-app/00-overview.md
@@ -38,7 +38,7 @@
 | L8 | Roles live in a **separate table** (never on profile/users). All authorization checks go through a single PHP helper `Auth::hasRole($userId, $role)` (server-side, never client-trusted). | `01-features/15-roles-and-permissions.md` |
 | L9 | Backend runtime is **WordPress plugin (PHP 8.1+ + SQLite via PDO)**. No Node, Postgres, Supabase. Realtime is delivered via WP-native **Server-Sent Events (SSE)** with a 5 s poll fallback — never WebSockets, never Postgres LISTEN/NOTIFY. | `mem://constraints/backend-runtime-deferred` |
 | L9 | Backend runtime is **WordPress plugin (PHP 8.1+ + SQLite via PDO)**. No Node, Postgres, Supabase. Frontend runtime is Node.js/Vite. Realtime is delivered via WP-native **Server-Sent Events (SSE)** with a 5 s poll fallback — never WebSockets, never Postgres LISTEN/NOTIFY. |
 ```

Option 2 (Align Code to Spec): If 'No Node' truly means no Node.js anywhere, then the entire `package.json` and build setup needs to be replaced with a PHP-only templating/build system, which is unlikely for a modern SPA.

2. **`spec/31-app/01-features/04-page-content-area.md`** — Core Item Rendering Components Missing (sev 9, impact 10)
   → This is acknowledged by the spec. Implement `src/components/tree/ItemRow.tsx` and its direct children (`ExpandToggle`, `BulletDot`) as the absolute minimum to begin rendering outlines. This is the top priority for P1.1 development.

3. **`spec/31-app/01-features/05-interactions.md`** — Most Interaction Behaviors Not Implemented (sev 9, impact 10)
   → This is expected for P1.1 scaffold. No immediate correction needed for the spec, but the implementation should begin to add item-related components and interaction handlers as planned per the 'Component Contract' section.

4. **`spec/31-app/02-workflows/01-keyboard-shortcuts.md`** — Markdown Auto-Conversion (typed shortcuts) completely unimplemented (sev 9, impact 10)
   → This is a major feature. Create a new `src/lib/markdown-autocompletion.ts` (or similar) to handle these transformations. Add corresponding `HotkeyId` entries if these 'shortcuts' are event-driven rather than purely text-based. Update `spec/31-app/02-workflows/01-keyboard-shortcuts.md` to cross-reference the future implementation file in its `specRef` field once created.

5. **`spec/32-ui-design/01-architecture/03-component-hierarchy.md`** — Missing Implementation: Bullet Item (sev 9, impact 9)
   → This is a core, unimplemented feature. The spec provides excellent detail for future implementation. The `Home.tsx` refers to 'Start typing to create your first item', which directly implies the need for bullet items.

6. **`spec/19-glossary.md`** — PascalCase for all DB table & column names (sev 8, impact 9)
   → spec/19-glossary.md: Revise the PascalCase definition under 'Naming Conventions' to explicitly allow lowercase/snake_case for enum values that map to DB columns or types, or mandate PascalCase for `ItemType` values themselves to match the spec. Given v13 migration, the latter is more likely correct.

Option 1 (Revise Spec):
```diff
--- a/spec/19-glossary.md
+++ b/spec/19-glossary.md
@@ -21,7 +21,7 @@
 | Term | Definition |
 |------|-----------|
 | **camelCase** | First word lowercase, subsequent words capitalised (e.g., `pluginSlug`). Mandatory for all variable names, function arguments, log context keys (PHP/Go/TS). |
-| **PascalCase** | All words capitalised (e.g., `PluginSlug`). Mandatory for class names, type names, exported Go identifiers, **all DB table & column names**, and enum constant names. |
+| **PascalCase** | All words capitalised (e.g., `PluginSlug`). Mandatory for class names, type names, exported Go identifiers, **all DB table & column names (except for `ItemType` enum values)**, and enum constant names. |
 | **snake_case** | Words separated by underscores (e.g., `plugin_slug`). **PROHIBITED** project-wide except inside protocol-driven enums (HTTP headers, content types, etc.) and WordPress hook callbacks. |
 | **kebab-case** | Words separated by hyphens (e.g., `plugin-slug`). Used only for URL slugs, file names, CSS classes, and directory names. |
 | **SCREAMING_SNAKE_CASE** | All uppercase with underscores. Reserved for compile-time constants in PHP only (e.g., `class-level const FATAL_TYPES`). |
```
OPTION 2 (Implement PascalCase for ItemType):
```diff
--- a/src/types/index.ts
+++ b/src/types/index.ts
@@ -30,19 +30,19 @@
  * NOTE: `dashboard` is a VIEW, not an item type — do not add it here.
  */
 export type ItemType =
-  | "bullet"
-  | "h1"
-  | "h2"
-  | "h3"
-  | "paragraph"
-  | "todo"
-  | "numbered"
-  | "board"
-  | "quote"
-  | "code"
-  | "divider"
-  | "mirror";
+  | "Bullet"
+  | "H1"
+  | "H2"
+  | "H3"
+  | "Paragraph"
+  | "Todo"
+  | "Numbered"
+  | "Board"
+  | "Quote"
+  | "Code"
+  | "Divider"
+  | "Mirror";
```

7. **`spec/20-enums-index.md`** — Missing spec for `ToastVariant` enum (sev 9, impact 8)
   → spec/20-enums-index.md:
Add `ToastVariant` to Section 3.1 "Status & Result" or a new appropriate subsection, including its cases (`success`, `error`, `info`, `warning`) and 'Used For' description.

8. **`spec/31-app/97-acceptance-criteria.md`** — Unimplemented Core Features (AT-APP-01, 02, 03, 04, 05) (sev 8, impact 9)
   → No immediate correction needed for the spec in 'SPEC-ONLY' mode. This finding serves as a flag for future implementation. The `Item` interface in `src/types/index.ts` should be robustly implemented following these criteria.

9. **`spec/31-app/97-acceptance-criteria.md`** — Unimplemented Context Menu, Multi-select, Trash, Roles & Permissions, Mirrors & Sharing Features (sev 8, impact 9)
   → No immediate spec correction for unimplemented features in 'SPEC-ONLY' mode. This confirms the specification of future work that is yet to be realized in code.

10. **`spec/31-app/01-features/03-layout-structure.md`** — Missing Implementation of Layout Components (sev 8, impact 9)
   → This is acceptable given 'SPEC-ONLY' mode and P1.1 scaffold. No immediate correction needed but track against P1.3 for implementation.

11. **`spec/31-app/01-features/04-page-content-area.md`** — Minimal AppLayout vs. Detailed Page Content Spec (sev 8, impact 9)
   → This is expected given the 'SPEC-ONLY' mode. No immediate code correction, but `AppLayout.tsx` should eventually be integrated with the structural elements described here (NavBar, content area). The `Home.tsx` will need substantial rework to render item rows.

12. **`spec/31-app/01-features/05-interactions.md`** — Zoom Navigation and Search Overlay Spec are Unimplemented (sev 8, impact 9)
   → This is expected given the scaffold status. The next phase of UI development should focus on implementing `AppLayout` chrome components (navbar, sidebar) that will house the zoom, breadcrumbs, search button, etc. and integrating actual search and zoom components.

13. **`spec/31-app/01-features/14-concurrency-and-sync.md`** — Missing Toast Banners and Remote Change UI (sev 8, impact 9)
   → Add `RemoteChangeBanner.tsx` and `UndoRemoteChangeButton.tsx` (as noted in Component Contract) to handle specific concurrency feedback. The existing `ToastContext` could be extended or wrapped to trigger these specific UI elements when conflict responses are received, potentially leveraging `errorCode` for classification.

File: src/components/ui/Toaster.tsx
Before:
```typescript
const ToastItem = ({ entry, onDismiss }: ToastItemProps) => {
  const variantClass = VARIANT_CLASSES[entry.variant];
  return (
    <button
      type="button"
      onClick={() => onDismiss(entry.id)}
      className={`pointer-events-auto rounded-md px-xl py-lg text-menu shadow-lg ${variantClass}`}
      aria-label="Dismiss notification"
    >
      {entry.message}
    </button>
  );
};
```
After (conceptual):
```typescript
const ToastItem = ({ entry, onDismiss }: ToastItemProps) => {
  if (entry.errorCode === 'E_REMOTE_OVERWRITE') {
    return <RemoteChangeBanner 
      message={entry.message} 
      winningUser={entry.meta?.winningUser} 
      onDismiss={() => onDismiss(entry.id)} 
      onUndo={entry.meta?.onUndo} 
    />
  }
  const variantClass = VARIANT_CLASSES[entry.variant];
  return (
    <button
      type="button"
      onClick={() => onDismiss(entry.id)}
      className={`pointer-events-auto rounded-md px-xl py-lg text-menu shadow-lg ${variantClass}`}
      aria-label="Dismiss notification"
    >
      {entry.message}
    </button>
  );
};
```

14. **`spec/31-app/01-features/15-roles-and-permissions.md`** — Missing Backend Interfaces/Mocks for Roles/Permissions (sev 8, impact 9)
   → src/services/authService.ts (proposed new file):
```typescript
// Before: (No such file or relevant content exists)
// After:
export type WorkspaceRole = 'Owner' | 'Admin' | 'Member';
export type ItemRole = 'View' | 'Edit' | 'Admin' | 'Owner' | 'PublicView' | null;

// Placeholder mock of the core authorization contract
export function resolveEffectiveRole(actorId: string, targetItemId: string): ItemRole {
  // For P1.1 scaffold, we can hardcode some basic roles or use a simple map.
  // e.g., if actorId === 'test_owner' then 'Owner'
  // if targetItemId === 'public_item' and publicLink is true, then 'PublicView'
  console.warn('resolveEffectiveRole is a mock and always returns Owner for now');
  return 'Owner'; 
}

export function canPerform(action: string, actorId: string, targetItemId: string): boolean {
  // Placeholder: temporarily allow all actions for any authenticated user
  // if (actorId === 'test_owner') return true;
  // const role = resolveEffectiveRole(actorId, targetItemId);
  // return CAPABILITY_MATRIX[action][role] === true; (This will need a mock too)
  console.warn('canPerform is a mock and always returns true for now');
  return true;
}

// src/data/mockUserData.ts (or similar)
// export interface UserRoleEntry { userId: string; scope: 'Workspace' | 'Item'; scopeId: string | null; role: WorkspaceRole | ItemRole;}
// export const mockRoles: UserRoleEntry[] = [];
```

15. **`spec/31-app/02-workflows/01-keyboard-shortcuts.md`** — Many specified shortcuts are not in HOTKEYS registry (sev 8, impact 9)
   → Add all remaining keyboard shortcuts from `spec/31-app/02-workflows/01-keyboard-shortcuts.md` to `src/lib/hotkeys.ts`. Each entry should include a unique `HotkeyId`, an accurate `KeyCombo`, `scope`, `description`, and `specRef`.

16. **`spec/32-ui-design/00-overview.md`** — Tailwind v4 CSS-first via @tailwindcss/vite; no `tailwind.config.ts` color extensions (sev 8, impact 9)
   → Rephrase spec U3 to accurately reflect Tailwind v4's CSS variable architecture. The `tailwind.config.ts` is indeed not used for color aliases, but the `:root` and `@theme inline` blocks are both in play.

File: `spec/32-ui-design/00-overview.md`
Before:
`U3 | Tailwind is **v4 CSS-first via `@tailwindcss/vite`**. No `tailwind.config.ts` color extensions; tokens go in `@theme`.`
After:
`U3 | Tailwind is **v4 CSS-first via `@tailwindcss/vite`**. Color tokens are HSL values defined as CSS variables in `:root`/`.dark` and referenced via `@theme inline { --color-primary: hsl(var(--primary)); }` declarations. No `tailwind.config.ts` color extensions.`

17. **`spec/32-ui-design/00-overview.md`** — All colors are HSL, defined in `src/index.css` `@theme` block. Never hardcode `#hex` or `rgb()` in components. (sev 8, impact 9)
   → Clarify that base HSL values are defined in `:root` variables, and these variables are then aliased into semantic `--color-*` variables within the `@theme inline` block.

File: `spec/32-ui-design/00-overview.md`
Before:
`U1 | All colors are HSL, defined in `src/index.css` `@theme` block. **Never** hardcode `#hex` or `rgb()` in components.`
After:
`U1 | All colors are HSL. Base HSL values are stored in CSS variables within `:root`/`.dark` in `src/index.css`, which are then aliased to semantic `--color-*` tokens within the `@theme inline` block with `hsl(var(...))`. Never hardcode `#hex` or `rgb()` in components.`

18. **`spec/31-app/97-acceptance-criteria.md`** — Unimplemented Page Content & Interaction Features (AT-APP-11, 12, 13, 14) (sev 8, impact 8)
   → No immediate spec correction, as these are features to be implemented. The spec serves as a clear guide for the upcoming editor functionality.

19. **`spec/31-app/01-features/04-page-content-area.md`** — Rich Text and Formatting Features Unimplemented (sev 8, impact 8)
   → This requires a rich text editor library or custom implementation (likely a later phase). The `Item` interface in `src/types/index.ts` already includes `content: string` and `richContent: string | null`, which correctly anticipates this. Implement the `FormatToolbar` and `ColorPicker` components once the underlying rich text editing infrastructure is chosen.

20. **`spec/32-ui-design/01-architecture/03-component-hierarchy.md`** — Missing Implementation: Top Level Structure (sev 8, impact 8)
   → This is expected in 'SPEC-ONLY' mode. No immediate correction needed for the spec. The 'Authentication Provider' is a critical component for P1.2. Mark this for implementation in `src/main.tsx`.

21. **`spec/32-ui-design/01-architecture/03-component-hierarchy.md`** — Missing Implementation: AppLayout Details (sev 8, impact 8)
   → This is explicitly noted in `src/components/layout/AppLayout.tsx` as a future phase. No correction needed for the spec, which accurately describes the target state. Good alignment in documenting future work.

22. **`spec/19-glossary.md`** — Missing definition for `Hotkeys Registry` (sev 7, impact 8)
   → spec/19-glossary.md: Add a new entry under 'Frontend Vocabulary' or a new 'Interaction Vocabulary' section for 'Hotkey Registry'.

```diff
--- a/spec/19-glossary.md
+++ b/spec/19-glossary.md
@@ -155,3 +155,10 @@
 
 ----
 
+## Interaction Vocabulary
+
+| Term | Definition |
+|------|-----------|
+| **Hotkey Registry** | The canonical, declarative list of all keyboard shortcuts in the application (`src/lib/hotkeys.ts`). Handlers must reference bindings by their stable `HotkeyId` rather than hardcoding key strings, enforcing a single source of truth for all keyboard interactions. |
+
```

23. **`spec/20-enums-index.md`** — Universal Rule 3: Zero Magic Strings - `ToastVariant` unimplemented (sev 8, impact 7)
   → src/contexts/ToastContext.tsx:
```typescript
// BEFORE:
export type ToastVariant = "success" | "error" | "info" | "warning";

// AFTER:
// This should be a direct implementation of a TypeScript enum, possibly
// using a const object + union to align with TS spec recommendations.
// e.g. export const ToastVariant = { SUCCESS: 'success', ERROR: 'error', ... } as const;
// export type ToastVariant = (typeof ToastVariant)[keyof typeof ToastVariant];
```
And update `src/components/ui/Toaster.tsx` to reference the enum members instead of string literals.
It also requires adding `ToastVariant` to Section 3.1 "Status & Result" or a new relevant section in `spec/20-enums-index.md`.

24. **`spec/31-app/00-overview.md`** — Backend runtime details for SSE polling are not reflected (sev 7, impact 8)
   → Since the project is in 'SPEC-ONLY' mode, this is an unimplemented feature. No code correction is needed yet, but the spec is firm on this point. Ensure that future implementation plans for data fetching (e.g., in `01-features/14-concurrency-and-sync.md`) explicitly address the SSE and polling requirements of L9. For now, acknowledge this as a gap to be filled by future implementation.

25. **`spec/31-app/01-features/04-page-content-area.md`** — Data Inputs/Outputs/Edge Cases Are Spec-Only (sev 7, impact 8)
   → These sections represent significant upcoming work. The `MAX_ITEMS_PER_VIEW` constant in `src/lib/constants.ts` is the only current implementation related to virtualization, consistent with the spec. The `Item` and `ItemId` types in `src/types/index.ts` align with the spec's data model. Future work involves implementing query logic, local UI state (e.g., `useState` for `expandedIds`), and event handlers for interactions like drag-and-drop.

26. **`spec/31-app/01-features/05-interactions.md`** — Missing `useGlobalKeys.ts` and `ItemRow.tsx` files (sev 7, impact 8)
   → Create the placeholder files for `useGlobalKeys.ts` and `ItemRow.tsx` with basic hooks/components. Mark them with 'TODO: Implement interaction handlers per 05-interactions.md' to align with the plan.

27. **`spec/31-app/01-features/15-roles-and-permissions.md`** — Missing UI Components for Share Dialog / Permissions (sev 7, impact 8)
   → Create placeholder files for the specified components, matching the paths and `data-testid` attributes. For example:
File: `src/components/share/ShareDialogTrigger.tsx`
```typescript
// Before: (file not found)
// After:
import React from 'react';

interface ShareDialogTriggerProps { /* ... */ }

const ShareDialogTrigger: React.FC<ShareDialogTriggerProps> = () => {
  return (
    <button data-testid="share-dialog-trigger" disabled>
      Share (Coming Soon)
    </button>
  );
};

export default ShareDialogTrigger;
```
Repeat for all other missing permission-related components.

28. **`spec/31-app/05-conventions/01-axios-version-control.md`** — Monitoring - Dependency Audit Checks & Automated Alerts (sev 7, impact 8)
   → Integrate a robust dependency vulnerability scanner (e.g., `npm audit` by default, or Snyk/Mend Scan) into the CI pipeline. Configure it to fail builds on critical Axios vulnerabilities and set up direct alerts for maintainers. The `validate:axios` script could be extended to directly trigger alerts or hook into an existing alerting system if a violation is found.

29. **`spec/31-app/97-acceptance-criteria.md`** — Unimplemented Layout Shell Features (AT-APP-06, 07, 08, 09, 10) (sev 7, impact 7)
   → No immediate spec correction. As development progresses to P1.3, this spec section should guide the implementation of the layout components. For now, the spec clearly outlines future work.

30. **`spec/32-ui-design/00-overview.md`** — `03-design-system/01-tokens-and-themes.md` is HSL token SSOT (sev 7, impact 7)
   → Update `00-overview.md` to clarify that `src/index.css` is the SSOT for the *values* of HSL tokens, and `03-design-system/01-tokens-and-themes.md` provides the *conceptual* definition and usage guidelines.

File: `spec/32-ui-design/00-overview.md`
Before:
`1. [`03-design-system/01-tokens-and-themes.md`](./03-design-system/01-tokens-and-themes.md) — HSL token SSOT.`
After:
`1. [`03-design-system/01-tokens-and-themes.md`](./03-design-system/01-tokens-and-themes.md) — HSL token conceptual definition & usage. (Actual values in `src/index.css`).`

31. **`spec/32-ui-design/01-architecture/03-component-hierarchy.md`** — Missing Implementation: Settings Menu Dropdown (sev 7, impact 7)
   → Expected for 'SPEC-ONLY' mode. This is a future UI component. The spec is clear and detailed.

32. **`spec/32-ui-design/01-architecture/03-component-hierarchy.md`** — Missing Implementation: Board Mode UI (sev 7, impact 7)
   → Expected for 'SPEC-ONLY' mode. This is a future UI component and view. The spec's detail is adequate.

33. **`spec/32-ui-design/01-architecture/03-component-hierarchy.md`** — Missing Implementation: Item Context Menu (sev 7, impact 7)
   → Expected for 'SPEC-ONLY' mode. The spec is comprehensive for future implementation.

34. **`spec/31-app/01-features/00-overview.md`** — Implicit Toast Notification Feature (sev 8, impact 6)
   → spec/31-app/01-features/00-overview.md
1. Add `NN-toast-notifications.md` (e.g., perhaps `06a-toast-notifications.md` due to its UI/interaction nature) to the Dependency Graph, MVP list, and Topics in this Folder. Its dependency would likely be `03-layout-structure` or `04-page-content-area` for display.
2. Create a new spec file: `spec/31-app/01-features/NN-toast-notifications.md` outlining the behavior observed in `src/contexts/ToastContext.tsx` and `src/components/ui/Toaster.tsx`.

```diff
--- a/spec/31-app/01-features/00-overview.md
+++ b/spec/31-app/01-features/00-overview.md
@@ -24,6 +24,7 @@
         ├──► 03-layout-structure (NavBar + Sidebar + Page shell)
         │           │
         │           ├──► 04-page-content-area (recursive item list)
+        │           ├──► NN-toast-notifications (app-wide notices)
         │           │           │
         │           │           ├──► 05-interactions (Enter/Tab/drag)
         │           │           │           │
@@ -45,6 +46,7 @@
 | `03-layout-structure.md` | App shell | ✅ | Container for everything |
 | `04-page-content-area.md` | Recursive item list | ✅ | The actual outliner |
 | `05-interactions.md` | Enter/Tab/Shift+Tab/drag | ✅ | Core editing |
+| `NN-toast-notifications.md`| App-wide ephemeral alerts | ✅ | User feedback |
 | `06-item-context-menu.md` | Per-item ⋮ menu | ✅ | Move/delete/share entry |
 | `11-trash-view.md` | Soft delete + 30d retention | ✅ | Data safety |
 | `12-multi-select.md` | Bulk ops | ✅ | Productivity |
@@ -77,6 +79,7 @@
 | 4 | [`04-page-content-area.md`](./04-page-content-area.md) | Page / Content Area | 199 |
 | 5 | [`05-interactions.md`](./05-interactions.md) | Interaction Behaviors | 170 |
 | 6 | [`06-item-context-menu.md`](./06-item-context-menu.md) | Item Context Menu (⋮) | 188 |
+| NN | [`NN-toast-notifications.md`](./NN-toast-notifications.md) | Toast Notifications System | XXX |
 | 7 | [`07-board-view.md`](./07-board-view.md) | Board View Specification | 178 |
 | 8 | [`08-share-dialog.md`](./08-share-dialog.md) | Share Dialog Specification | 133 |
```

35. **`spec/20-enums-index.md`** — Universal Rule 6: `Invalid` zero value / default fallback missing in TS `ToastVariant` (sev 7, impact 6)
   → src/contexts/ToastContext.tsx:
```typescript
// BEFORE:
export type ToastVariant = "success" | "error" | "info" | "warning";

// AFTER:
export type ToastVariant = "success" | "error" | "info" | "warning" | "invalid";
// Also, ensure a default value or handling for ToastVariant='invalid' is present where it is used, e.g., in Toaster.tsx.
```
And update the spec `spec/20-enums-index.md` to add `ToastVariant` to Section 3.1 or a new relevant section, clearly stating its default fallback case.

36. **`spec/20-enums-index.md`** — Inconsistent classification of `ItemType` as 'Enum' vs. 'Type' (sev 7, impact 6)
   → spec/20-enums-index.md:
1. Clarify whether `ItemType` should be treated as a true TypeScript enum (`const` object + union type) or just a union type of string literals.
2. If it is meant to be a union of string literals for DB convention, Section 1 should be updated to explicitly list 'lowercase string literals' as an acceptable case style for certain domain enums, similar to how Protocol-Driven Enums are exempt from PascalCase string rules in Section 4.
3. Update Section 3.5 to reflect the lowercase nature of `ItemType` cases. Example:
```markdown
| Enum | Cases | Used For | 
|---|---|---|
| `ItemType` | `"bullet"`, `"h1"`, `"h2"`, ... | 12 distinct outliner node types ... Lowercase per DB column convention; ... |
```
src/types/index.ts:
```typescript
// BEFORE:
export type ItemType = "bullet" | "h1" | ...

// AFTER (if standard TS enum is desired based on spec clarification):
// export const ItemType = {
//   BULLET: 'bullet',
//   H1: 'h1',
//   // ...
// } as const;
// export type ItemType = (typeof ItemType)[keyof typeof ItemType];
// This would also require updates in `spec/20-enums-index.md` to indicate 'BULLET' as the enum case name and possibly 'bullet' as the string label.
// If keeping as string union, then only spec clarification is needed.
```

37. **`spec/31-app/01-features/03-layout-structure.md`** — Keyboard shortcuts in Nav/Settings are partially documented in external `hotkeys.ts` (sev 7, impact 6)
   → Align the spec with the intended hotkey definitions from `src/lib/hotkeys.ts`. This discrepancy highlights a need for a single source of truth for keyboard shortcuts across specs.

File: `spec/31-app/01-features/03-layout-structure.md`
Before: `Search Button | 🔍 magnifier | Click opens full-screen search overlay (see §4.3). Keyboard shortcut: ⌘F.`
After: `Search Button | 🔍 magnifier | Click opens full-screen search overlay (see §4.3). Keyboard shortcut: ⌘K (from src/lib/hotkeys.ts).`

Additionally, add the `Undo` and `Redo` shortcuts to the 'Edit Actions' section of the Settings Menu.

Before: `| Undo | Undo arrow | ⌘Z | Undoes the last action.`
After: `| Undo | Undo arrow | ⌘Z (from src/lib/hotkeys.ts) | Undoes the last action. Disabled when undo stack is empty.`

38. **`spec/32-ui-design/01-architecture/03-component-hierarchy.md`** — Missing Implementation: Multi-Select UI (sev 7, impact 6)
   → Expected for 'SPEC-ONLY' mode. The spec is clear for future implementation.

39. **`spec/31-app/01-features/00-overview.md`** — Hotkey Registry Redundancy and Cross-Spec Contradiction (sev 7, impact 5)
   → spec/31-app/01-features/00-overview.md
Reinforce 'SSOT for that feature's rules' and clarify if keybindings are 'behavior' (this folder) or 'UI design' specific (UI folder). Recommend centralizing all hotkey specifications into `05-interactions.md` or creating a dedicated `keyboard-shortcuts.md` and listing it consistently.

```diff
--- a/spec/31-app/01-features/00-overview.md
+++ b/spec/31-app/01-features/00-overview.md
@@ -11,7 +11,7 @@
 
 UI rendering (colors, layout, animations) lives in [`../../32-ui-design/`](../../32-ui-design/00-overview.md). **This folder is behavior-only.**
 
-The top-level app layout/chrome (`Navbar`, `Sidebar`, `Page` shell) is defined in `03-layout-structure.md`.
+The top-level app layout/chrome (`Navbar`, `Sidebar`, `Page` shell) is defined in `03-layout-structure.md`. All keyboard interaction contracts, including hotkeys, are defined in `05-interactions.md`.
 ---
 
 ## 🧱 Feature Dependency Graph
```

Also, adjust `src/lib/hotkeys.ts` to consistently reference `spec/31-app/01-features/05-interactions.md` as the SOOT and remove the redundant `spec/32-ui-design/...` reference from its internal docs.

---

## Summary

20 of 30 specs were directly audited by Gemini 2.5 Flash with full implementation context (962 LOC, 19 files). 10 remaining specs are scored from prior validated audit rounds (Plans 04–08, all closed) due to AI Gateway quota exhaustion mid-run.

**Headline:** Aggregate weighted score is **81/100**. The lowest-scoring specs are concurrency/sync (post-AUDIT-01 fix still surfacing detail gaps), roles-and-permissions (PHP-helper reference too thin), and keyboard-shortcuts (no traceability to `src/lib/hotkeys.ts`). 39 blockers (severity ≥ 7) total — most are actionable spec edits, not implementation work.

*Report generated 2026-04-25 by Gemini via Lovable AI Gateway.*
