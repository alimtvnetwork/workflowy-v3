# Card Patterns

> **Updated:** 2026-04-19

---

## Stat Card

```css
.stat-card {
    flex: 1;
    min-width: 90px;
    background: var(--riseup-bg, #f8fafc);
    border: 1px solid var(--riseup-border, #e2e8f0);
    border-radius: var(--riseup-radius, 8px);
    padding: 14px 16px;
    text-align: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.stat-card:hover {
    border-color: var(--riseup-primary-light, #3b82f6);
    box-shadow: var(--riseup-shadow, 0 1px 3px rgba(0, 0, 0, 0.08));
    transform: translateY(-1px);
}
```

**Internal structure:**
- `.stat-value` — `font-size: 20px; font-weight: 700; font-family: monospace; color: primary`
- `.stat-label` — `font-size: 11px; uppercase; letter-spacing: 0.5px; font-weight: 600; color: muted`

---

## Storage / Selection Card

```css
.selection-card {
    cursor: pointer;
    border: 2px solid var(--riseup-border, #e2e8f0);
    border-radius: var(--riseup-radius-lg, 12px);
    flex: 1;
    min-width: 160px;
    max-width: 220px;
    overflow: hidden;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.selection-card:hover {
    border-color: var(--riseup-primary-light, #3b82f6);
    box-shadow: var(--riseup-shadow-md);
    transform: translateY(-2px);
}
.selection-card.active {
    border-color: var(--riseup-primary, #1d4ed8);
    box-shadow: 0 0 0 1px var(--riseup-primary), var(--riseup-shadow-md);
    background: var(--riseup-primary-bg, #eff6ff);
}
```

---

## File Viewer Card

- White background with `border-radius: 10px`
- Header: `background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 18px`
- Body: dark code panel `background: #0f172a; color: #e2e8f0; font-family: monospace`

---

## Warning / Flash Banner Card

```css
.flash-banner {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    border: 1px solid #fbbf24;
    border-left: 4px solid #f59e0b;
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(245, 158, 11, 0.15);
    animation: riseupFadeInUp 0.5s ease-out;
}
```

---

*Card patterns — v3.2.0 — 2026-04-19*
