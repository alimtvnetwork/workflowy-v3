# WorkFlowy — Implementation Plan & Roadmap

> **Updated:** 2026-03-18 (session 4)
> **Purpose:** Handoff-ready plan for any AI or developer to continue work.
> **Version:** 1.1

---

## Pre-Implementation Blockers

| Blocker | Suggestion | Impact | Options |
|---------|-----------|--------|---------|
| Backend runtime undefined | S003 | Blocks auth, data layer, persistence | (a) Lovable Cloud, (b) sql.js, (c) frontend-only |
| Column naming mismatch | S002 | Causes schema confusion | Rename to PascalCase in specs |

**Phase 1.1–1.2 (Bootstrap + Design System) can start immediately — no backend dependency.**

---

## Phase 1 — Core Outliner ⭐ (Start Here)

### 1.1 Bootstrap Project ✅ READY
- **Objective:** Create the Vite + React + TypeScript + Tailwind project skeleton
- **Dependencies:** None
- **Expected Outputs:** package.json, vite.config.ts, tsconfig.json, tailwind.config.ts, index.html, index.css with all design tokens, src/ folder structure per `spec/02-FRONTEND.spec.md` §8
- **Acceptance Criteria:** `npm run dev` starts. All design tokens from spec §6 + §6F.1 are defined. File structure matches spec. Dark mode works.

### 1.2 Design System Setup ✅ READY
- **Objective:** Implement all CSS custom properties, Tailwind config, and shadcn/ui base components
- **Dependencies:** 1.1
- **Expected Outputs:** index.css with light/dark mode tokens, tailwind.config.ts with extended theme, installed shadcn components (Button, DropdownMenu, Dialog, Popover, Tooltip, Sheet, ScrollArea, Separator, Badge, Avatar, Checkbox, Command, Toast, Toaster)
- **Acceptance Criteria:** All tokens from spec §6.1 + §6F.1 available as Tailwind classes. Dark mode toggle works. Typography scale matches §6.2.

### 1.3 App Layout Shell ✅ READY (no backend needed)
- **Objective:** Build AppLayout, NavBar (left + right), Sidebar, ContentArea, and routing
- **Dependencies:** 1.2
- **Expected Outputs:** AppLayout.tsx, NavBar.tsx, NavBarLeft.tsx, NavBarRight.tsx, Sidebar.tsx, ContentArea.tsx, all pages (Home, Login, Signup, NotFound, Trash, Settings)
- **Acceptance Criteria:** Routes per spec §2. NavBar renders with all placeholders per spec §2.2–§2.3. Sidebar opens/closes per spec §2.5. Responsive breakpoints per §6F.5.

### 1.4 Core Outliner (Recursive Bullet List) ⚠️ NEEDS S003 for persistence
- **Objective:** Render and edit an infinite-depth nested bullet list
- **Dependencies:** 1.3, S003 (for persistence; can start with in-memory state)
- **Expected Outputs:** BulletList, BulletItem, BulletDot, ContentEditor, ExpandToggle, AddButton, ChildCountBadge components
- **Acceptance Criteria:** Items nest infinitely. Enter splits text (§6B). Tab indents. Shift+Tab outdents. Backspace on empty deletes. Expand/collapse works. Arrow keys traverse visible items (§6D.1). Content uses contenteditable with HTML whitelist (§6A).

### 1.5 Zoom Navigation + Breadcrumbs
- **Objective:** Click bullet to zoom, back/forward history, home button, breadcrumbs
- **Dependencies:** 1.4
- **Expected Outputs:** NavBar with breadcrumbs (overflow per §6D.8), useZoom hook, useBreadcrumbs hook, URL routing (/item/:id)
- **Acceptance Criteria:** Click bullet → zoom. Back/forward arrows. Home → root. Breadcrumbs with overflow. Focus management per §6F.6.

### 1.6 Autosave
- **Objective:** Debounced save with status indicator
- **Dependencies:** 1.4, S003
- **Expected Outputs:** useAutoSave hook, save status display
- **Acceptance Criteria:** Changes saved after 1.5s inactivity. "Autosaved X minutes ago" shown. ⌘S force-saves. Offline queue per §6E.7.

### 1.7 Authentication
- **Objective:** Signup, login, logout
- **Dependencies:** 1.1, S003
- **Expected Outputs:** Login page, Signup page, auth context/hook, protected routes
- **Acceptance Criteria:** User can sign up, log in, log out. Sessions persist. Auth pages match spec §3.11.

---

## Phase 2 — Rich Editing

| Task | Objective | Key Spec Sections |
|------|-----------|-------------------|
| 2.1 Text Formatting Toolbar | Floating toolbar on selection (B, I, U, S, code, color) | §3.4, §6A.2, §6D.4, §6D.5 |
| 2.2 Item Type Conversion | "Turn Into…" submenu with all 11 types | §5.1, §3.3 |
| 2.3 Notes on Items | Add/edit notes below content | §3.2, §6B.4 |
| 2.4 Todo Checkboxes | Complete/uncomplete with ⌘↵ | §3.3 (todo row), §5.2 |
| 2.5 Markdown Auto-Conversion | `# `, `> `, `[]`, etc. auto-convert | §11.6, §6D.3 |
| 2.6 Text Color Picker | Inline + item-level coloring | §3.5, §6D.5 |

---

## Phase 3 — Navigation & Menus

| Task | Objective | Key Spec Sections |
|------|-----------|-------------------|
| 3.1 Settings Menu (⋮) | Full dropdown with 5 groups | §2.4 |
| 3.2 Item Context Menu | All actions from §5 | §5, §3.6 |
| 3.3 Search Overlay | Full-screen search with filter syntax | §4.3, §6E.8, §3.8 |
| 3.4 Sidebar | Favorites, Recent, Tags sections | §2.5 |
| 3.5 Tag Picker | Inline #hashtag + picker UI | §3.11, §6A.4 |
| 3.6 Command Palette (⌘K) | All actions searchable | §6E.2 |
| 3.7 Today View | Date-filtered view with overdue section | §9, §6E.6 |
| 3.8 Settings Page | Full preferences panel | §6E.5 |

---

## Phase 4 — Collaboration & Advanced

| Task | Objective |
|------|-----------|
| 4.1 Share Dialog + Public Links | §7 |
| 4.2 Comments Side Panel | §3.10, §6D.7 |
| 4.3 Mirrors | §8 (full mirror system) |
| 4.4 Board/Kanban View | §6, §6D.6 |
| 4.5 Drag-and-Drop Reorder | §4.1, §6C |
| 4.6 Move To (Today/Tomorrow/Next Week) | §5.2 |
| 4.7 File Upload | §5.2 |
| 4.8 Templates (Save + Apply) | §13 |
| 4.9 Multi-Select + Bulk Actions | §12, §6D.2 |
| 4.10 Sort (A-Z, Z-A) | §5.2 |
| 4.11 Export (OPML, JSON, MD, TXT) | §5.2 |
| 4.12 Trash + Restore | §10 |
| 4.13 Archive | §3.12 |
| 4.14 Duplicate | §5.2 |

---

## Phase 5 — Polish & Scale

| Task | Objective |
|------|-----------|
| 5.1 Undo/Redo | §6E.1 (100-action stack) |
| 5.2 Dark Mode | §6F.1 (all HSL values defined) |
| 5.3 Mobile Responsive | §6F.5 (breakpoints defined) |
| 5.4 Keyboard Shortcuts Reference | §11 |
| 5.5 Virtualized List (1000+ items) | §10 performance |
| 5.6 Print Support | §2.4 |
| 5.7 PWA / Offline | §6E.7 (offline queue) |
| 5.8 Accessibility (ARIA, screen readers) | §9 |
| 5.9 Error Boundaries | §6F.2 (8 boundaries defined) |
| 5.10 Onboarding (new user) | §11.2 empty states |

---

## Next Task Selection

### Can start immediately (no backend needed):
1. **1.1 Bootstrap Project** ← Recommended first task
2. **1.2 Design System Setup**
3. **1.3 App Layout Shell**

### Needs S003 resolved first:
4. **1.4 Core Outliner** (can start with in-memory state)
5. **1.7 Authentication**
6. **1.6 Autosave**

---

## Spec Cross-Reference

| Phase | Primary Spec | Sections |
|-------|-------------|----------|
| 1 | Workflow §1–§4, Frontend §1–§6 + §6A–§6F | Core loop |
| 2 | Workflow §3.3–§3.5, §5.1, §11.6 | Rich editing |
| 3 | Workflow §2–§4, §9, Frontend §3.2–§3.9 | Navigation |
| 4 | Workflow §6–§13, Backend §6 | Advanced |
| 5 | Frontend §9–§10 | Polish |
