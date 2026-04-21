# Inline Elements

> **Version:** 3.2.0  
> **Updated:** 2026-04-19

---

## Links — Underline Sweep Animation

Links use a `::after` pseudo-element that sweeps from right-to-left on hover:

```css
.spec-link {
  color: hsl(var(--link-color));  /* Purple: 252 85% 55% */
  text-decoration: none;
  font-weight: 500;
}

.spec-link::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: -2px;
  left: 0;
  background: linear-gradient(90deg,
    hsl(var(--heading-gradient-from)),
    hsl(var(--heading-gradient-to))
  );
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.spec-link:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;  /* Direction reversal creates sweep effect */
}

.spec-link:hover {
  color: hsl(var(--accent));  /* Shifts to pink */
}
```

---

## Inline Code — Lift + Glow

```css
.inline-code {
  background: hsl(var(--code-bg));
  color: hsl(var(--code-text));      /* Pink: 330 85% 45% */
  padding: 0.2em 0.45em;
  border-radius: 5px;
  font-size: 0.85em;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  font-weight: 500;
  border: 1px solid hsl(var(--border) / 0.5);
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
}

.inline-code:hover {
  box-shadow: 0 0 0 2px hsl(var(--highlight-glow) / 0.15);
  transform: translateY(-1px);
}
```

---

## Bold & Italic

```css
strong { color: hsl(var(--foreground)); font-weight: 700; }
em     { color: hsl(var(--muted-foreground)); }
```

---

*Inline elements — v3.2.0 — 2026-04-19*
