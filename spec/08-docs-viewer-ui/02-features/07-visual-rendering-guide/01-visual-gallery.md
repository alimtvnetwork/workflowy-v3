# Visual Examples Gallery

> **Version:** 3.2.0  
> **Updated:** 2026-04-19

---

## Full-Page Examples

### Full Page — Dark Mode

Shows gradient headings (H1/H2 purple→pink), sidebar navigation, TOC with scroll-spy, inline code badges, blockquote, ordered list, and table with hover states.

*(screenshot pending — was: `01-overview-dark.png`; caption: Overview in dark mode)*

### Full Page — Light Mode

Same layout with light theme tokens — note how heading gradients, inline code, and table headers adapt.

*(screenshot pending — was: `04-overview-light.png`; caption: Overview in light mode)*

---

## Tree Structure

### Tree Structure — Dark Mode

Tree block with 📁 folder icons, 📄 file icons, muted guide lines, italic comments, and the STRUCTURE language badge.

*(screenshot pending — was: `02-tree-dark.png`; caption: Tree structure dark)*

### Tree Structure — Light Mode

Same tree content — code block background stays dark regardless of app theme.

*(screenshot pending — was: `03-tree-light.png`; caption: Tree structure light)*

---

## Code Blocks

### Code Blocks with Syntax Highlighting — Dark Mode

BASH and MARKDOWN language badges with per-language accent colors, line numbers, font controls, copy/download buttons.

*(screenshot pending — was: `06-codeblocks-dark.png`; caption: Code blocks dark)*

### Code Blocks — Light Mode

Same blocks in light theme — note the dark code background is preserved while the surrounding UI adapts.

*(screenshot pending — was: `05-codeblocks-light.png`; caption: Code blocks light)*

### Split View — Editor + Live Preview

Monaco editor on the left with markdown source, live rendered preview on the right, draggable divider in between.

*(screenshot pending — was: `07-split-view-dark.png`; caption: Split view)*

---

## Hover States — Dark Mode

### H1 / H2 Heading Brightness Animation

On hover, `filter: brightness(1.2) saturate(1.1)` boosts the purple→pink gradient. The entire heading glows brighter without changing the gradient direction.

*(screenshot pending — was: `08-heading-hover-dark.png`)*

### H3 Border Slide

H3 headings transition from `muted-foreground` to `primary` color. A 3px left border appears and `padding-left` increases by `0.2rem`, creating a slide-in effect.

*(screenshot pending — was: `09-h3-hover-dark.png`)*

### Link Underline Sweep

Links use a `::after` pseudo-element underline that sweeps from right-to-left on hover (`transform-origin: left` → `scaleX(1)`). The text color shifts from `primary` to `accent` (pink).

*(screenshot pending — was: `10-link-hover-dark.png`)*

### Inline Code Glow & Lift

Inline `code` elements lift 1px (`translateY(-1px)`) and gain a subtle ring glow (`box-shadow: 0 0 0 2px hsl(var(--primary) / 0.15)`) on hover.

*(screenshot pending — was: `11-inline-code-hover-dark.png`)*

### Code Block Hover Glow

The entire `.code-block-wrapper` gains a box-shadow tinted with the language's accent HSL color on hover, creating a colored glow border effect.

*(screenshot pending — was: `12-codeblock-hover-dark.png`)*

---

## Hover States — Light Mode

### H1 Heading Brightness (Light Theme)

The gradient brightness boost works identically in light mode — the purple→pink gradient becomes more vivid.

*(screenshot pending — was: `13-heading-hover-light.png`)*

### Inline Code Glow (Light Theme)

Same lift + ring glow, but the muted background contrasts differently against the light page background.

*(screenshot pending — was: `14-inline-code-hover-light.png`)*

### Link Sweep + Table Row Highlight (Light Theme)

The underline sweep animation and table row hover (inset 3px left bar in primary color) are visible together in a table context.

*(screenshot pending — was: `15-link-hover-light.png`)*

---

*Visual gallery — v3.2.0 — 2026-04-19*
