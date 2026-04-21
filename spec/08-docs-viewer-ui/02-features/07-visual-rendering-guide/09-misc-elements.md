# Miscellaneous Elements & Animation Timing

> **Version:** 3.2.0  
> **Updated:** 2026-04-19

---

## Horizontal Rules

```css
.spec-hr {
  border: none;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    hsl(var(--heading-gradient-from) / 0.4),
    hsl(var(--heading-gradient-to) / 0.4),
    transparent
  );
  margin: 1.25rem 0;
}
```

---

## Text Selection

```css
.prose-spec ::selection {
  background: hsl(var(--primary) / 0.2);
  color: hsl(var(--foreground));
}
```

---

## Fullscreen Document Scaling

When the document enters fullscreen mode, text scales up:

| Element | Normal | Fullscreen |
|---------|--------|------------|
| Body text | `0.9rem` | `1.05rem` |
| H1 | `1.6rem` | `2rem` |
| H2 | `1.25rem` | `1.5rem` |
| H3 | `1.05rem` | `1.2rem` |
| Code blocks | `18px` | `20px` |

---

## Animation Timing Reference

| Category | Duration | Easing | Use Case |
|----------|----------|--------|----------|
| Micro | `0.15s` | `ease` | Color shifts, opacity |
| Standard | `0.2s` | `ease` | Transform, background |
| Emphasis | `0.3s` | `ease` | Filter, box-shadow, gradients |
| Sweep | `0.3s` | `cubic-bezier(0.4, 0, 0.2, 1)` | Link underline animation |

---

*Misc elements — v3.2.0 — 2026-04-19*
