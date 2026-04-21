# Modal System

> **Updated:** 2026-04-19

---

## Standard Modal

Shared modal styles are defined in `admin-shared.css` and reused across all pages:

```
┌─────────────────────────────────────────────┐
│  .riseup-modal (fixed, z-index: 100000)     │
│  ┌─────────────────────────────────────────┐ │
│  │  .riseup-modal-overlay                  │ │
│  │  (blur backdrop, fadeIn 0.25s)          │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │  .riseup-modal-content                  │ │
│  │  (max-width: 600px, scaleIn 0.3s)       │ │
│  │  ┌───────────────────────────────────┐   │ │
│  │  │ .riseup-modal-header (bg: #f8fafc)│   │ │
│  │  │ ┌──────────┐  ┌─────────────────┐ │   │ │
│  │  │ │ h3 title │  │ × close button  │ │   │ │
│  │  │ └──────────┘  └─────────────────┘ │   │ │
│  │  ├───────────────────────────────────┤   │ │
│  │  │ .riseup-modal-body (scrollable)   │   │ │
│  │  ├───────────────────────────────────┤   │ │
│  │  │ .riseup-modal-footer (bg: #f8fafc)│   │ │
│  │  └───────────────────────────────────┘   │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Key properties:**
- Overlay: `rgba(15, 23, 42, 0.6)` + `backdrop-filter: blur(4px)`
- Content: `border-radius: 12px`, shadow xl, `max-height: 80vh`
- Close button: `32×32px`, rotates `90deg` on hover, turns red

---

## Fullscreen Modal (Error Detail)

- `max-width: 1000px`, `max-height: 85vh`
- `border-radius: 14px`, shadow 2xl
- Overlay: `rgba(15, 23, 42, 0.65)` + `backdrop-filter: blur(6px)`
- `z-index: 100001` (above standard modal)
- Contains: summary bar → modal tabs → tab panes

---

## Page-Specific Modal Overrides

Pages MAY override `max-width` on `.riseup-modal-content`:
- Agents page: `max-width: 800px`
- Error page: uses fullscreen variant

---

*Modals — v3.2.0 — 2026-04-19*
