# Memory: index.md
Updated: 2026-04-21

# Project Memory

## Core
Official name is 'WorkFlowy'. Prioritize user requirements & UI specs absolutely over AI suggestions.
**SPEC-ONLY MODE ACTIVE** — only work on `spec/` and `.lovable/` files. No code implementation until user explicitly says "start implementation".
Vite, React, TypeScript, SQLite. No Go, PHP, Postgres, or Supabase.
Strict TS: zero 'any', max 3 params, no nested `if`s, 15-line logic limit, pure positive guard clauses.
Every item is a unified Node interface (id, parentId, content, itemType). 250-item limit per view.
Tailwind CSS v4 via @tailwindcss/vite in src/index.css @theme block.

## Memories
- [Spec-Only Mode](mem://constraints/spec-only-mode) — Active work mode: spec authoring only, no code until specs are 100% complete
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
