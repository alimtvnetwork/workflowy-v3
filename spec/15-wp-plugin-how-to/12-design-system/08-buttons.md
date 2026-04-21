# Button Variants

> **Updated:** 2026-04-19

---

## WordPress `.button` Enhancements

All WordPress `.button` elements inside `.riseup-admin` receive:

```css
.riseup-admin .button .dashicons {
    vertical-align: middle;
    margin-top: -2px;
    margin-right: 3px;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.riseup-admin .button:hover .dashicons {
    transform: scale(1.15);
}
```

---

## Primary Action Button

```css
.primary-action-btn {
    font-size: 14px;
    padding: 8px 24px;
    border-radius: 8px;
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    border-color: #1d4ed8;
    box-shadow: 0 1px 3px rgba(29, 78, 216, 0.2);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}
.primary-action-btn:hover {
    background: linear-gradient(135deg, #1e40af, #1d4ed8);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(29, 78, 216, 0.3);
}
.primary-action-btn:active {
    transform: translateY(0) scale(0.98);
    box-shadow: 0 1px 2px rgba(29, 78, 216, 0.2);
}
```

---

## Action Button (Table Row)

```css
.action-btn {
    margin-right: 4px;
    padding: 4px 10px;
    border-radius: 6px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
```

---

## Report / Pill Button

```css
.pill-btn {
    border-radius: 20px !important;
    padding: 4px 14px !important;
    font-weight: 500 !important;
}
.pill-btn:hover {
    background: #1d4ed8 !important;
    color: #fff !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(29, 78, 216, 0.25);
}
```

---

## Dashicon Hover Behavior

Interactive dashicons inside buttons MUST scale on hover:

```css
.btn:hover .dashicons {
    transform: scale(1.15);              /* Standard */
    /* OR */
    transform: scale(1.2) rotate(-5deg); /* Playful (submit, report) */
}
```

---

*Buttons — v3.2.0 — 2026-04-19*
