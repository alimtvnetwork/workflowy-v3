# Shadow Hierarchy & Elevation

> **Updated:** 2026-04-19

---

## Elevation Levels

| Level | CSS | Use Case |
|-------|-----|----------|
| **sm** | `0 1px 2px rgba(0, 0, 0, 0.05)` | Subtle depth (slider values) |
| **default** | `0 1px 3px rgba(0, 0, 0, 0.08)` | Cards at rest, stat cards |
| **md** | `0 4px 6px rgba(0, 0, 0, 0.08)` | Hover elevation, storage cards |
| **lg** | `0 2px 12px rgba(0, 0, 0, 0.15)` | Flash banners, alert cards |
| **xl** | `0 20px 50px -12px rgba(0, 0, 0, 0.25)` | Modals |
| **2xl** | `0 25px 60px -12px rgba(0, 0, 0, 0.3)` | Fullscreen modals |
| **inset** | `inset 0 1px 3px rgba(0, 0, 0, 0.08)` | Progress bar tracks |
| **colored** | `0 2px 6px rgba(102, 126, 234, 0.3)` | Colored badge shadows |

---

## Hover Shadow Pattern

Elements that elevate on hover MUST combine `translateY(-Npx)` with a shadow upgrade:

```css
.card {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.card:hover {
    transform: translateY(-2px);
    box-shadow: var(--riseup-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.08));
}
```

---

## Focus Ring

All focusable elements use a blue ring for accessibility:

```css
.input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    outline: none;
}
```

---

*Shadows & elevation — v3.2.0 — 2026-04-19*
