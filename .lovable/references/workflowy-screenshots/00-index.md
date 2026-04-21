# Workflowy Reference Screenshots

> **Source:** User upload, session 2026-04-21
> **Purpose:** Visual ground-truth for the 8-phase Workflowy spec consolidation (see `.lovable/plan.md` → "Workflowy Spec Consolidation").

| File | Used in phase | What it shows |
|------|---------------|---------------|
| `40-navbar-breadcrumb.png` | Phase 1 | Navbar with absolute breadcrumb path; search bar with 6 filter tabs (globe/@/📅/🕐/👥/⋯); "jump-to" hint |
| `41-search-date-filters.png` | Phase 2 | Date filter tab — keywords: `date:`, `date-before:`, `date-after:`, `day-of-week:`, today, tomorrow, yesterday, this/next/last week/month |
| `42-search-changed-created.png` | Phase 2 | History filter tab — `changed:`, `created:` |
| `43-search-people.png` | Phase 2 | People filter tab — `me`, `others` |
| `44-search-misc-filters.png` | Phase 2 | Misc filter tab — `is:`, `has:`, `in:`, `text:`, `link:`, `highlight:` |
| `45-app-menu.png` | Phase 3 | Right 3-dot app menu: What's New, Learn, Get Apps · Pin · Share/Integrations/Handbook · Undo/Redo/Save · Expand/Collapse all · Print/Export/Download · Settings/Help/Report/Trash · Log out |
| `46-bullet-3dot-menu.png` | Phase 4 | Per-bullet 3-dot menu: Quote, Code Block, Divider, Shortcut, Upload file, Number, Complete, Add date, Add comment, Add note, Duplicate, Move To… (4 variants), Share, Export, Mirror (5 variants), Expand/Collapse, Sort A-Z/Z-A, Copy internal link, Add from template, Delete, Count, Priority |
| `47-selection-toolbar-colors.png` | Phase 5 | Selection toolbar (H1–H3 today → extend to H5; ¶, B, U, I, S, link, A▾) + Text palette (11 swatches) + Highlight palette (11 swatches) |
| `48-focused-item-menu.png` | Phase 4 | Focused (top-of-page) item 3-dot menu — subset of full menu plus Embedded, Remove, Changed/Created timestamps |
| `49-child-arrow-toggle.png` | Phase 4 | Confirms: arrow icon appears ONLY when item has children; otherwise only the bullet dot + 3-dot is visible |
| `50-bullet-no-child-arrow.png` | Phase 4 | Reinforces "no child → no arrow" rule on a long-text bullet |
| `51-bullet-after-click.png` | Phase 4 | After clicking → bullet becomes focused; multi-paragraph note expands; only 3-dot remains |
| `52-absolute-path-and-context-menu.png` | Phase 1 + Phase 4 | Absolute breadcrumb path after deep focus; in-content 3-dot menu including Turn into, Make template, Chat about this, Changed/Created with author |
| `53-slash-actions-menu.png` | Phase 5 | `/` ACTIONS menu: Bullets, Board, To-do, H1–H3 (extend to H5), Paragraph, Quote, Code Block, Divider, Shortcut, Upload file, Number, Complete, Add date/comment/note, Duplicate, Move To… variants, Share, Export, Mirror variants |
| `54-whats-new-2026-03.png` | Phase 3 + Phase 7 | What's New panel: Email-to-Workflowy with per-node addresses, Pro upsell banner, Enable buttons |
| `55-whats-new-themes-fixes.png` | Phase 3 | Themes free-for-all, Geist Mono font, Calendar markers, search match fixes |
| `56-numbered-and-quote-code-blocks.png` | Phase 5 | Numbered List + Code Block + Quote Block as first-class item types |
| `57-quick-add-and-calendar-today.png` | Phase 7 | Quick Add (Android), Calendar/Today, Starred, drag-to-Calendar-icon, Found Dates |
| `58-template-shortcut-and-patch.png` | Phase 5 + Phase 4 | `/Add from template` or `/template`; mirror-search toggle, Mentions/Drafts hidden when Fractal off |
| `59-vibe-coding-prompts-context.png` | Reference only | Source workspace context |
| `60-left-menu-button.png` | Phase 1 + Phase 6 | Top-left: hamburger (3-line) menu — NOT a 3-dot. Sits left of back/forward/home arrows |
| `61-sidebar-hover-tooltip.png` | Phase 6 | Hovering hamburger shows tooltip card: title "Sidebar menu", shortcut `^L` + lightning icon, dark preview thumbnail, description: "Clicking this will expand the left sidebar. The sidebar allows you to browse and quickly navigate your account and your starred items. You can drag-and-drop items into the sidebar to move them." |
| `62-sidebar-expanded.png` | Phase 6 | Clicked sidebar: shows Today, Home (expanded with starred children: Vibe Coding Quick Prompts, Wed Feb 25, Mistakes…, Format, Abdullah Al Mahin – 02 Mar 2026), Calendar (📅 emoji), Mistake. Has back-arrow to collapse. "+ New node" button at bottom. Drag-drop target |
| `63-comment-and-handbook-tabs.png` | Phase 4 + Phase 3 | Hovering top-right of bullet shows comment-add (+) icon "Add Comment". Right 3-dot opens panel with two tabs: **Handbook** \| **Hotkeys**, language dropdown (English ▾), Sections collapsible, search field |
| `64-handbook-bullet-types.png` | Phase 3 | Handbook content: hover-tooltip mode, Ctrl+/ to close, "Bullet Types" section with screenshots and explanations of Turn into menu |
| `65-hotkeys-list.png` | Phase 3 | Hotkeys tab — full keymap (~30 entries): Zoom in/out, Zoom to Today, Expand/Collapse, Indent/Outdent, Move up/down, Focus next/prev sibling, Complete, Duplicate, Export, Delete, Search (ESC), Show/hide completed (⌘O), Star page (⇧⌘8), Navigate home (⌘'), Jump menu (⌘K), Bold/Italic/Underline/Strikethrough/Code, Toggle left sidebar (^L), Toggle this sidebar (⌘/), Copy mirror(s) (⇧⌘M), Jump to prev/next sibling (⇧⌘9 / ⇧⌘0), Heading 1/2 (⌥⌘1 / ⌥⌘2…) |
| `66-handbook-search-language.png` | Phase 3 | Confirms Handbook UI controls: Sections collapsible header, English language picker, Search field |
| `67-handbook-numbered-complete.png` | Phase 3 | Handbook entry pattern: heading + shortcut + lightning icon + screenshot + paragraph + grey callout box mentioning slash command |

## User decisions captured (2026-04-21)
- Phases run sequentially 1 → 8.
- Headings extend to **H1–H5** (current spec is H1–H3).
- Handbook ships **English only** at launch (Bengali deferred).
- Color palettes: **derive defaults from img-47**, user may override later.
- **Sidebar pattern:** shadcn `Sidebar` with `collapsible="offcanvas"` (matches Workflowy desktop hide/show via `^L`).
- **Default sidebar items:** Today, Home, **Inbox, Drafts, Mentions**, Calendar, **Trash**, + New node (user can add custom items between Home and Calendar).
- **Hotkeys keymap:** img-65 list is canonical for launch (~30 entries, Cmd on Mac / Ctrl on Win+Linux).
- **Handbook scope:** spec defines **both** structure AND content (per-feature English text + screenshot slot + slash-command callout).

## New facts learned from screenshots 50–59
- Focused-item header has NO arrow even if it had children — arrow rule applies to inline bullets only; focused root uses breadcrumb.
- Inline 3-dot context menu (img-52) differs from per-bullet 3-dot (img-46): adds "Turn into…", "Make template", "Chat about this", timestamps with author.
- Slash menu (img-53) lists H1–H3 → extend to H5. Includes `Board` and `To-do` as item types.
- What's New panel is dated, multi-section, has 👍/👎 per entry, Pro upsell banner.
- Email-to-Workflowy: each node gets a unique inbound email address — Phase 9+ deferred feature.
- Quick Add (img-57) is mobile-only — mobile-phase requirement.
- Templates insert via `/Add from template` or `/template` shortcut.
- Numbered Lists, Code Blocks, Quote Blocks are first-class item types.

## New facts learned from screenshots 60–67
- Left button is **hamburger ≡** (NOT 3-dot). Shortcut `^L`. Hover tooltip card with title/shortcut/preview/description.
- Sidebar is offcanvas with: Today (📅), Home (expandable starred tree), Calendar emoji item, custom user nodes, "+ New node" footer button. Header has back-arrow to collapse.
- Sidebar items are **drag-drop targets** — drop a bullet onto the sidebar to move it there.
- Right 3-dot opens single panel with **two tabs**: Handbook | Hotkeys + language picker (English ▾) + Sections collapsible + Search.
- Comment-add (+) icon appears on hover at top-right of bullet — separate from 3-dot menu.
- Full Hotkeys list captured (img-65, ~30 entries) — canonical for Phase 3 spec.
- Handbook entry template: heading + shortcut keys + ⚡ icon + screenshot + paragraph + grey callout for slash command.
- Handbook close shortcut: `Ctrl + /`. Toggle right sidebar: `⌘/`. Toggle left sidebar: `^L`.

## User decisions captured (2026-04-21, after re-inspecting img 50–59)
- **Headings:** H1–H5 confirmed (slash menu shows H1–H3 in Workflowy; we extend to H5 for parity with our spec).
- **Code Block conversion (forward):** Multi-select N sibling bullets → /code → merges into ONE Code Block node with N internal line breaks. Reverse direction (img-56) splits back into N bullets.
- **Email-to-Workflowy:** Deferred to Phase 9. Phase 1–8 specs do NOT include it.
- **Quick Add:** Web equivalent only — global `⌘⇧N` shortcut opens modal that appends to Inbox. No PWA / share-target in v1.

## Open questions parked for future sessions
1. Exact hex values for the 11+11 swatches in img-47.
2. ~~Full keymap for Hotkeys panel~~ — ✅ resolved by img-65.
3. "What's New" launch entries — seed list (use img-54/55/58 as templates).
4. LinkedIn integration scope.
5. ~~Email-to-Workflowy~~ — ✅ deferred to Phase 9.
6. ~~Mobile Quick Add~~ — ✅ replaced with `⌘⇧N` web modal.
7. Themes: are user-selectable themes part of launch, or post-launch?
8. Remaining screenshots (board view, share dialog, mirror flow, settings panel, mobile).
9. Handbook content authoring: AI drafts and user reviews, or user authors all?
10. Drag-drop into sidebar: MOVE the item or MIRROR it (keep both)?

## New facts from re-inspection of img 50–59 (2026-04-21)
- **img-50/51:** 3-dot handle (`⋯`) sits LEFT of bullet on hover only. Code/quote blocks render with monospace + light-gray panel + copy-icon top-right on hover.
- **img-52:** Absolute breadcrumb truncates long titles with `…` suffix. In-content 3-dot menu order locked: Turn into / Complete / Add note / Add date / Add comment / Move To… / Upload file / Mirror To… / Mirror / Duplicate ── Share / Export / Copy internal link / Make template ── Delete ── Expand all / Collapse all / Sort A-Z / Sort Z-A ── Changed/Created with author.
- **img-53:** Slash menu definitive order locked (Bullets, Board, To-do, H1, H2, H3, Paragraph, Quote, Code Block, Divider, Shortcut, Upload file, Number, Complete, Add date, Add comment, Add note, Duplicate, Move To/Child/Today/Tomorrow/Next Week/Date, Share, Export, Mirror/To/To Child).
- **img-56:** Code Block preserves multi-line content as single node (no per-line bullets inside).
- **img-58:** Templates inserted via `/Add from template` or `/template` shortcut — no fixed template library page.
- **img-59:** Focused/zoomed node renders title as H1-style bold with children as flat bullet tree below.
