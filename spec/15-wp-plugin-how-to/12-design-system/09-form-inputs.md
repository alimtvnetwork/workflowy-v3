# Form Input Styling

> **Updated:** 2026-04-19

---

## Text Inputs & Textareas

```css
input[type="text"],
textarea {
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
input[type="text"]:focus,
textarea:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    outline: none;
}
```

---

## Checkboxes

```css
input[type="checkbox"] {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 2px solid #e2e8f0;
    transition: all 0.2s;
    cursor: pointer;
}
input[type="checkbox"]:checked {
    background: #1d4ed8;
    border-color: #1d4ed8;
}
input[type="checkbox"]:hover {
    border-color: #3b82f6;
}
```

---

## File Input

```css
input[type="file"] {
    padding: 8px;
    border: 2px dashed #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    max-width: 500px;
}
input[type="file"]:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}
```

---

## Range Slider

```css
input[type="range"] {
    flex: 1;
    max-width: 300px;
    accent-color: var(--riseup-primary, #1d4ed8);
    height: 6px;
}
```

---

## Settings Form Table

```css
.form-table tr {
    transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.form-table tr:hover {
    background: #f8fafc;
}
.form-table th {
    color: #0f172a;
    font-weight: 600;
}
.form-table .description {
    color: #64748b;
    font-style: normal;
    margin-top: 4px;
    font-size: 12px;
}
```

---

## Required Field Marker

```css
.required {
    color: var(--riseup-danger, #dc2626);
    font-weight: 700;
}
```

---

*Form inputs — v3.2.0 — 2026-04-19*
