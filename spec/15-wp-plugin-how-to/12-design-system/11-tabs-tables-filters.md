# Tabs, Tables & Filter Bar

> **Updated:** 2026-04-19

---

## Page-Level Tabs

```css
.nav-tab {
    border-radius: 8px 8px 0 0;
    padding: 8px 16px;
    font-weight: 500;
    position: relative;
    overflow: hidden;
}
/* Underline indicator */
.nav-tab::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: #1d4ed8;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(-50%);
}
.nav-tab:hover::after { width: 80%; }
.nav-tab-active::after {
    width: 100%;
    background: linear-gradient(90deg, #1d4ed8, #3b82f6);
}
```

---

## Modal Tabs

```css
.modal-tab {
    padding: 10px 18px;
    font-size: 13px;
    color: #64748b;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    font-weight: 500;
}
.modal-tab.active {
    color: #1d4ed8;
    border-bottom-color: #1d4ed8;
    font-weight: 600;
}
```

---

## Table Row Hover

```css
/* Standard hover */
tbody tr {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
tbody tr:hover {
    background: #eff6ff !important;
}

/* Clickable row hover (logs) */
tbody tr.has-details:hover {
    background: #e8eeff !important;
    box-shadow: inset 3px 0 0 #667eea;
    cursor: pointer;
}
```

---

## Date Group Headers

Tables with chronological data use date group separators:

```css
.date-group-header td {
    background: linear-gradient(135deg, #f8f9fb, #eef1f6) !important;
    border-top: 2px solid #667eea;
    padding: 10px 12px !important;
    font-size: 0;  /* hide td text, show label only */
}
.date-group-label {
    font-size: 13px;
    font-weight: 700;
    color: #1e2a4a;
}
.date-group-label::before {
    content: '📅';
}
```

---

## Endpoint Group Headers

```css
.endpoint-group-header td {
    background: #f1f5f9 !important;
    font-size: 12px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-top: 2px solid #e2e8f0;
}
```

---

## Nested Rows

```css
.nested-row td {
    background: var(--riseup-bg, #f8fafc) !important;
}
.nested-row:hover td {
    background: var(--riseup-primary-bg, #eff6ff) !important;
}
.nested-row td:first-child {
    border-left: 3px solid #7b1fa2;  /* purple accent */
}
```

---

## Filter Bar

```css
.filters {
    margin-bottom: 16px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
}
.filters:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
.filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: flex-end;
}
.filters label span {
    display: block;
    font-size: 11px;
    color: #475569;
    margin-bottom: 3px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
```

---

*Tabs, tables & filter bar — v3.2.0 — 2026-04-19*
