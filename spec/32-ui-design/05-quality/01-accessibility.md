# Accessibility Requirements

> **Version:** 1.2.0  
> **Updated:** 2026-04-30 — Bound all 5 prose-MUSTs to new `G-A11Y-*` namespace gates (batch-34). Non-MUST capability rows (Keyboard navigation, Focus indicators, Drag-and-drop alternative) remain prose; they describe surfaces enforced by sibling gates and have no parser-visible MUST tokens.

**Reserved Gate IDs (this file):** `G-A11Y-INTERACTIVE-LABEL`, `G-A11Y-TREE-ROLES`, `G-A11Y-CONTRAST-WCAG-AA`, `G-A11Y-REDUCED-MOTION`, `G-A11Y-ICON-BUTTON-TOOLTIP` — see [`spec/_GATE-REGISTRY.md`](../../_GATE-REGISTRY.md) §Domain-A11Y.

---

| Requirement | Description |
|-------------|-------------|
| Labels | All interactive elements MUST have accessible labels (visible text or aria-label) — gate `G-A11Y-INTERACTIVE-LABEL` |
| Keyboard navigation | Full keyboard support: Tab between sections, arrow keys within lists, Enter to activate, Escape to close |
| Focus indicators | Visible focus rings on all focusable elements |
| Tree semantics | Item list MUST use ARIA `role="tree"` on the container and `role="treeitem"` with `aria-expanded` (true/false) on each row; expand/collapse state changes MUST be announced via live region — gate `G-A11Y-TREE-ROLES` |
| Color contrast | MUST meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text) — gate `G-A11Y-CONTRAST-WCAG-AA` |
| Reduced motion | MUST respect user's reduced-motion preference by disabling animations — gate `G-A11Y-REDUCED-MOTION` |
| Drag-and-drop alternative | Keyboard shortcuts (⌘↑/⌘↓) provide the same reordering capability as drag |
| Tooltips | All icon-only buttons MUST have descriptive tooltips — gate `G-A11Y-ICON-BUTTON-TOOLTIP` |

---
