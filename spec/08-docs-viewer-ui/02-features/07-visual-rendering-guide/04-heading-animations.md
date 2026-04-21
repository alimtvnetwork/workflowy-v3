# Heading Animations

> **Version:** 3.2.0  
> **Updated:** 2026-04-19

---

## H1 & H2 — Gradient Text + Brightness Hover

```css
.spec-h1, .spec-h2 {
  font-family: 'Ubuntu', sans-serif;
  background: linear-gradient(135deg,
    hsl(var(--heading-gradient-from)),  /* Purple: 252 85% 60% */
    hsl(var(--heading-gradient-to))     /* Pink: 330 85% 60% */
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: filter 0.3s ease;
}

/* On hover: brighter and more saturated */
.spec-h1:hover, .spec-h2:hover {
  filter: brightness(1.2) saturate(1.1);
}
```

| Property | H1 | H2 |
|----------|----|----|
| Font size | `1.6rem` | `1.25rem` |
| Weight | 700 | 700 |
| Margin | `1rem 0 0.6rem` | `1.8rem 0 0.5rem` |
| Bottom border | None | `1px solid hsl(var(--border))` |

---

## H3 — Left Border Slide

```css
.spec-h3 {
  font-size: 1.05rem;
  font-weight: 600;
  padding-left: 0.65rem;
  border-left: 3px solid hsl(var(--primary) / 0.5);
  color: hsl(var(--foreground));
  transition: color 0.2s ease, border-color 0.2s ease, padding-left 0.2s ease;
}

/* On hover: border brightens, text slides right */
.spec-h3:hover {
  color: hsl(var(--primary));
  border-color: hsl(var(--primary));
  padding-left: 0.85rem;  /* +0.2rem slide */
}
```

---

## H4 — Subtle Color Shift

```css
.spec-h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  transition: color 0.2s ease;
}

.spec-h4:hover {
  color: hsl(var(--foreground));
}
```

---

*Heading animations — v3.2.0 — 2026-04-19*
