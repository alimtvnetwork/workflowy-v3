# Table of Contents (TOC) + Scroll Spy

> **Version:** 3.2.0  
> **Updated:** 2026-04-19

---

## Layout

The TOC is a sticky sidebar (right side, 208px wide, hidden below `xl` breakpoint):

```css
.toc-container {
  width: 208px;       /* w-52 */
  position: sticky;
  top: 1.5rem;
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
}
```

---

## Heading Extraction

Headings are parsed from raw markdown (not DOM), skipping code blocks:

```typescript
// Matches # through #### headings
const match = line.match(/^(#{1,4})\s+(.+)$/);
// Generates slug: "My Heading" → "my-heading"
const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
```

---

## Indent Levels

| Heading Level | Tailwind Class | Font |
|---------------|---------------|------|
| H1 | `pl-3 font-medium` | Medium weight |
| H2 | `pl-4` | Default |
| H3 | `pl-5 text-[0.7rem]` | Smaller |
| H4 | `pl-6 text-[0.65rem]` | Smallest |

---

## Active State (Scroll Spy)

An `IntersectionObserver` monitors all heading elements and updates `activeId`:

```typescript
// Observer config
const observer = new IntersectionObserver(callback, {
  root: scrollContainer,
  rootMargin: "-10% 0px -80% 0px",
  threshold: 0
});
```

| State | Style |
|-------|-------|
| Active | `text-primary border-l-2 border-primary -ml-px` |
| Inactive | `text-muted-foreground` |
| Hover | `hover:border-l-2 hover:border-muted-foreground/40` |

---

## Auto-Scroll

When the active heading changes, the TOC button scrolls itself into view:

```typescript
activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
```

`block: "nearest"` ensures the sidebar only scrolls when the active item is outside the visible area.

---

*TOC & scroll spy — v3.2.0 — 2026-04-19*
