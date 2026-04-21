# CSS Custom Properties (Design Tokens)

> **Updated:** 2026-04-19

All colors, radii, shadows, and transitions are defined as CSS variables with `--riseup-` namespace prefix. Every property MUST include a hardcoded fallback value for environments where variables are not defined.

---

## Token Registry

| Token | Fallback | Purpose |
|-------|----------|---------|
| `--riseup-primary` | `#1d4ed8` | Primary brand (buttons, links, active states) |
| `--riseup-primary-light` | `#3b82f6` | Lighter primary (gradients, hover accents) |
| `--riseup-primary-bg` | `#eff6ff` | Primary tinted background |
| `--riseup-primary-glow` | `rgba(59, 130, 246, 0.25)` | Focus ring / inset glow |
| `--riseup-success` | `#059669` | Success text / icon color |
| `--riseup-success-bg` | `#ecfdf5` | Success background tint |
| `--riseup-danger` | `#dc2626` | Error / destructive text |
| `--riseup-danger-bg` | `#fef2f2` | Error background tint |
| `--riseup-warning` | `#d97706` | Warning text |
| `--riseup-warning-bg` | `#fffbeb` | Warning background tint |
| `--riseup-text` | `#0f172a` | Primary text (headings, labels) |
| `--riseup-text-secondary` | `#475569` | Secondary text (descriptions, stats) |
| `--riseup-text-muted` | `#94a3b8` | Tertiary text (placeholders, legends) |
| `--riseup-bg` | `#f8fafc` | Surface background (cards, panels) |
| `--riseup-border` | `#e2e8f0` | Default border |
| `--riseup-border-strong` | `#cbd5e1` | Emphasized border |
| `--riseup-radius` | `8px` | Default border radius |
| `--riseup-radius-lg` | `12px` | Large border radius (cards, modals) |
| `--riseup-transition` | `0.2s` | Default transition duration |
| `--riseup-shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.05)` | Subtle shadow |
| `--riseup-shadow` | `0 1px 3px rgba(0, 0, 0, 0.08)` | Default shadow |
| `--riseup-shadow-md` | `0 4px 6px rgba(0, 0, 0, 0.08)` | Medium shadow |

---

## Usage Pattern

```css
/* ✅ CORRECT — always include fallback */
.my-card {
    background: var(--riseup-bg, #f8fafc);
    border: 1px solid var(--riseup-border, #e2e8f0);
    border-radius: var(--riseup-radius, 8px);
}

/* ❌ WRONG — no fallback */
.my-card {
    background: var(--riseup-bg);
}

/* ❌ WRONG — hardcoded without variable */
.my-card {
    background: #f8fafc;
}
```

---

## Naming Convention

- Prefix: `--riseup-` (replace with your plugin slug)
- Pattern: `--{slug}-{category}-{modifier}`
- Examples: `--riseup-primary`, `--riseup-text-muted`, `--riseup-shadow-md`

---

## Slug Substitution Guide

All examples in this design system use the `riseup` prefix from the reference implementation. When building a new plugin, **replace every occurrence** with your plugin's kebab-case slug.

### What to replace

| Category | Reference pattern | Your plugin (`my-tool`) |
|----------|------------------|------------------------|
| CSS custom properties | `--riseup-primary` | `--my-tool-primary` |
| CSS class prefixes | `.riseup-admin`, `.riseup-card` | `.my-tool-admin`, `.my-tool-card` |
| CSS file scoping | `.riseup-admin.riseup-agents` | `.my-tool-admin.my-tool-agents` |
| Keyframe names | `@keyframes riseupFadeIn` | `@keyframes myToolFadeIn` |
| JS localized objects | `window.RiseupErrors` | `window.MyToolErrors` |
| AJAX action prefixes | `riseup_dismiss_error_flash` | `my_tool_dismiss_error_flash` |

### Derivation rules

| Plugin name | Kebab slug | CSS/property prefix | Class prefix |
|-------------|-----------|---------------------|--------------|
| Riseup Asia Uploader | `riseup` | `--riseup-` | `.riseup-` |
| QUpload | `qupload` | `--qupload-` | `.qupload-` |
| My Custom Plugin | `my-custom` | `--my-custom-` | `.my-custom-` |

### How to derive your slug

1. Take the value of `PluginConfigType::Slug` (e.g., `'my-custom-plugin'`)
2. For CSS: use the slug directly as the prefix → `--my-custom-plugin-primary`
3. For classes: use the slug directly → `.my-custom-plugin-admin`
4. Alternatively, use a shortened form if the slug is long — define it once in your shared CSS and use consistently

### ❌ Common mistakes

```css
/* ❌ WRONG — using reference prefix in a different plugin */
.riseup-admin { background: var(--riseup-bg, #f8fafc); }

/* ❌ WRONG — mixing prefixes */
.my-tool-admin { background: var(--riseup-bg, #f8fafc); }

/* ✅ CORRECT — consistent prefix throughout */
.my-tool-admin { background: var(--my-tool-bg, #f8fafc); }
```

---

*Design tokens — v3.2.0 — 2026-04-19*
