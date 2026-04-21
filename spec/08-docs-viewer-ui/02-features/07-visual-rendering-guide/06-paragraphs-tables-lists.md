# Paragraphs, Tables & Lists

> **Version:** 3.2.0  
> **Updated:** 2026-04-19

---

## Paragraphs

```css
.spec-p {
  line-height: 1.65;
  color: hsl(var(--foreground) / 0.9);
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  transition: color 0.15s ease, background 0.2s ease;
}

.spec-p:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--primary) / 0.04);  /* Very subtle purple tint */
}
```

---

## Tables

```css
/* Wrapper */
.table-wrapper {
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--border));
  box-shadow: 0 1px 3px hsl(var(--foreground) / 0.04);
}

/* Header */
thead { background: hsl(var(--table-header-bg)); }
th {
  font-family: 'Ubuntu', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: hsl(var(--muted-foreground));
}

/* Row hover — highlight + left accent bar */
tbody tr:hover {
  background: hsl(var(--table-row-hover));
  box-shadow: inset 3px 0 0 hsl(var(--primary) / 0.5);
}

/* Alternating rows */
tbody tr.odd-row {
  background: hsl(var(--muted) / 0.15);
}
```

---

## Lists

### Unordered Lists — Bullet Grow + Slide

```css
.spec-li {
  padding: 0.1rem 0 0.1rem 0.4rem;
  line-height: 1.55;
  transition: transform 0.15s ease, background 0.2s ease;
}

/* Custom bullet (replaces native) */
.spec-li::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: hsl(var(--primary) / 0.6);
  position: absolute;
  left: -0.75rem;
  top: 0.65em;
  transition: background 0.2s ease, transform 0.2s ease;
}

/* Hover: slide right + bullet enlarges */
.spec-li:hover {
  transform: translateX(3px);
  background: hsl(var(--primary) / 0.04);
}
.spec-li:hover::before {
  background: hsl(var(--primary));
  transform: scale(1.3);
}
```

---

*Paragraphs, tables & lists — v3.2.0 — 2026-04-19*
