# Tech Stack

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

| Technology | Purpose | Why This Over Alternatives |
|-----------|---------|---------------------------|
| React 18+ with TypeScript | UI framework with strict type safety | Industry standard, largest ecosystem, best hiring signal for portfolio projects |
| Vite 5+ | Build tool with fast hot-reload | Significantly faster than Webpack/CRA; near-instant HMR during development |
| Tailwind CSS 3+ | Utility-first styling using semantic HSL design tokens | Faster iteration than CSS Modules; design token system prevents style drift |
| shadcn/ui | Base component library (dropdowns, dialogs, tooltips, popovers, sheets, command palette, scroll areas, separators) | Unstyled/composable — full control over design unlike Material UI or Ant Design |
| TanStack Query 5+ | Server state management with caching, optimistic updates, and background refetching | Superior cache management vs raw useEffect; built-in optimistic update patterns |
| React Router 6+ | Client-side navigation and URL management | Most mature React router; nested routes match the app's zoom-based navigation model |
| Framer Motion 11+ | Animations (layout transitions, expand/collapse, presence, spring physics) | Best React animation library for layout animations; spring physics feel natural |
| Lucide React | Consistent, tree-shakeable icon library | Lighter than FontAwesome; consistent stroke style matches minimal design |
| dnd-kit | Accessible, keyboard-friendly drag-and-drop for bullet reordering and board cards | Built-in keyboard support and accessibility vs react-beautiful-dnd (unmaintained) |
| Native contenteditable divs | Inline rich text editing matching WorkFlowy's real editing behavior (not textarea) | Lighter than Slate.js/ProseMirror for single-line items; matches WorkFlowy's actual behavior exactly |

---
