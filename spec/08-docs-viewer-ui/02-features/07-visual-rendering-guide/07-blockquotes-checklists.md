# Blockquotes & Checklists

> **Version:** 3.2.0  
> **Updated:** 2026-04-19

---

## Blockquotes — Gradient Border + Slide

```css
.spec-blockquote {
  border-left: 4px solid transparent;
  border-image: linear-gradient(to bottom,
    hsl(var(--heading-gradient-from)),
    hsl(var(--heading-gradient-to))
  ) 1;
  background: hsl(var(--muted) / 0.3);
  padding: 0.5rem 1rem;
  border-radius: 0 0.5rem 0.5rem 0;
  font-style: italic;
  color: hsl(var(--muted-foreground));
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.spec-blockquote:hover {
  background: hsl(var(--muted) / 0.5);
  transform: translateX(3px);
  box-shadow: -4px 0 12px hsl(var(--heading-gradient-from) / 0.1);
}
```

---

## Checklists

Checklists are rendered as a dedicated `.checklist-block` container:

```
┌──────────────────────────────────────────┐
│ HEADER:  ☐ CHECKLIST           [Copy]    │
├──────────────────────────────────────────┤
│  ✅ Completed item (green gradient box)  │
│  ☐  Unchecked item (bordered empty box)  │
│  ✅ Another completed item               │
└──────────────────────────────────────────┘
```

| Element | Style |
|---------|-------|
| Checked box | `linear-gradient(135deg, hsl(var(--success)), hsl(var(--success) / 0.8))` with white ✓ |
| Unchecked box | `hsl(var(--muted))` background, `1.5px` border |
| Item hover | `translateX(3px)` + subtle primary background |
| Checkbox hover | `scale(1.1)` + primary glow shadow |
| Copy button | Copies raw markdown (`- [ ]`, `* [x]` syntax), NOT HTML |

---

*Blockquotes & checklists — v3.2.0 — 2026-04-19*
