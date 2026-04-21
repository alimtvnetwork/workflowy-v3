# Badge System

> **Updated:** 2026-04-19

---

## Base Badge Anatomy

```css
.badge {
    display: inline-block;           /* or inline-flex with gap */
    padding: 3px 10px;
    border-radius: 20px;             /* pill shape, status badges */
    /* OR */
    border-radius: 4px;              /* tag shape, action/trigger badges */
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Badge Variants

| Variant | Shape | Background | Text | Border | Shadow |
|---------|-------|------------|------|--------|--------|
| **Status (pill)** | `border-radius: 20px` | Gradient `135deg` | Semantic color | `1px solid` lighter | Scale on hover |
| **Action (tag)** | `border-radius: 4px` | Translucent `rgba()` | Semantic dark | `1px solid rgba()` | `0 2px 4px rgba(0,0,0,0.1)` |
| **Trigger (tag)** | `border-radius: 4px` | Solid tint | Semantic dark | `1px solid` | `0 2px 4px rgba(0,0,0,0.12)` |
| **Method (tag)** | `border-radius: 6px` | Gradient `135deg` | Dark semantic | `1px solid` | None |
| **Count (pill)** | `border-radius: 10–12px` | Red gradient | White | None | Colored shadow |
| **Source (tag)** | `border-radius: 4px` | Dark `#1a1a2e` | White | None | `0 2px 6px rgba(0,0,0,0.2)` |

---

## HTTP Method Badge Colors

| Method | Background | Text | Border |
|--------|------------|------|--------|
| `GET` | `#dcfce7 → #bbf7d0` | `#166534` | `#86efac` |
| `POST` | `#dbeafe → #bfdbfe` | `#1e40af` | `#93c5fd` |
| `PUT` | `#fef3c7 → #fde68a` | `#92400e` | `#fcd34d` |
| `DELETE` | `#fee2e2 → #fecaca` | `#991b1b` | `#fca5a5` |

---

## Badge Hover Behavior

```css
.badge:hover {
    transform: scale(1.05);         /* status badges */
    /* OR */
    transform: scale(1.08);         /* level badges */
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
```

---

*Badge system — v3.2.0 — 2026-04-19*
