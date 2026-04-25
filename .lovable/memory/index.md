# Project Memory

## Core
Official name is 'WorkFlowy'. Prioritize user requirements & UI specs absolutely over AI suggestions.
SPEC TRACK COMPLETE (2026-04-23): all 10 Workflowy phases shipped at v1.0; awaiting user authorization to exit spec-only mode and start P1.1 Bootstrap.
Backend = WordPress plugin (PHP 8.1+ + SQLite via PDO). REST envelope PascalCase. See `spec/15-wp-plugin-how-to/`. Decision date 2026-04-25.
Vite, React, TypeScript for frontend. Forbidden: Lovable Cloud, Supabase, sql.js, IndexedDB-as-primary, Postgres, MySQL, Node standalone, Go, Cloudflare D1.
Strict TS: zero 'any', max 3 params, no nested `if`s, 15-line logic limit, pure positive guard clauses.
Every item is a unified Node interface (id, parentId, content, itemType). 250-item limit per view.
Tailwind CSS v4 via @tailwindcss/vite in src/index.css @theme block.

## Memories
- [Coding Guidelines](mem://constraints/coding-guidelines) — Strict TypeScript, logic formatting, and SQLite naming rules
- [Tech Stack](mem://architecture/tech-stack) — Core technologies, API format, strict Axios versioning
- [Data Model](mem://architecture/data-model) — Unified Item interface, root rules, and node constraints
- [Specifications](mem://docs/specifications) — Structure and style rules for the spec/ directory
- [Theme & Design](mem://design/theme) — Breakpoints, error boundaries, and custom CSS tokens
- [UI Components](mem://design/ui-components) — Specific details for Navbar, Sidebar, Interactions, and Panels
- [WorkFlowy Model](mem://design/workflowy-model) — Core aesthetic and UX inspiration
- [Editor Core](mem://features/editor-core) — Drag-and-drop, fractional sorting, rich text sync, undo/redo
- [Core Mechanics](mem://features/core-mechanics) — 12 distinct item types and infinite nesting
- [Mirroring](mem://features/mirroring) — Linked instances logic and sync behavior
- [Board View](mem://features/board-view) — Kanban-style visualization and structural sync
- [Multi-Select](mem://features/multi-select) — Bulk operations via Shift/Cmd click
- [Templates](mem://features/templates) — Serialized snapshots for tree structures
- [Search](mem://features/search-functionality) — Syntax (#tag, is:, type:) and performance targets
- [Sharing Model](mem://features/sharing-model) — Public and invited-user sharing permissions
- [Offline Resilience](mem://features/offline-resilience) — Background autosave and local queuing
- [Trash Logic](mem://features/trash-logic) — 30-day retention policy
