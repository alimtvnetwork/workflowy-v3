# Color System

> **Updated:** 2026-04-19

---

## Semantic Color Groups

Colors are organized into semantic groups defined in `data/colors.json` and managed by a `ColorGroupType` enum:

| Group | Purpose | Example keys |
|-------|---------|-------------|
| `logLevel` | Error log severity badges | Error `#dc3545`, Warn `#fd7e14`, Info `#0d6efd`, Debug `#6c757d` |
| `status` | Operation result states | success `#46b450`, error `#dc3232`, warning `#dba617` |
| `wpAdmin` | WordPress admin palette | primary `#2271b1`, headerAccent `#667eea` |

---

## Gradient Patterns

Gradients follow a consistent `135deg` angle for backgrounds and `90deg` for horizontal bars:

```css
/* Status badge gradient — 135° diagonal */
background: linear-gradient(135deg, var(--riseup-success-bg, #ecfdf5), #d1fae5);

/* Progress bar gradient — 90° horizontal */
background: linear-gradient(90deg, var(--riseup-primary, #1d4ed8), var(--riseup-primary-light, #3b82f6));

/* Chart bar gradient — 180° vertical */
background: linear-gradient(180deg, var(--riseup-primary-light, #3b82f6), var(--riseup-primary, #1d4ed8));
```

---

## Semantic Status Colors (Complete Table)

| Semantic State | Background | Text | Border | Use Case |
|----------------|------------|------|--------|----------|
| Success / Connected / Active | `#ecfdf5 → #d1fae5` | `#059669` | `#a7f3d0` | Connected agents, success badges |
| Error / Failed / Expired | `#fef2f2 → #fecaca` | `#dc2626` | `#fca5a5` | Error badges, expired licenses |
| Warning / Pending | `#fffbeb → #fef3c7` | `#d97706` | `#fbbf24` | Warning banners, pending states |
| Neutral / Inactive | `#f1f5f9 → #e2e8f0` | `#475569` | `#cbd5e1` | Inactive states, disabled badges |
| Info / Primary | `#dbeafe → #bfdbfe` | `#1e40af` | `#93c5fd` | Info badges, primary accents |
| Purple / Incremental | `#f3e5f5` | `#7b1fa2` | `#ce93d8` | Cron triggers, incremental snapshots |

---

## Dark Mode & WordPress Admin Color Schemes

WordPress ships with multiple admin color schemes (Default, Light, `Modern` <!-- vague-exempt: WP-scheme-name -->, Blue, Coffee, Ectoplasm, Midnight, Ocean, Sunrise). Plugins MUST adapt to at least the dark schemes (Midnight, Ocean, Coffee, Ectoplasm) so text contrast meets WCAG AA (≥4.5:1 for body, ≥3:1 for large text) — verified via the `G-12-WP-DARK-SCHEME-CONTRAST` gate.

### Strategy: Override tokens per color scheme

WordPress adds a `body.admin-color-{scheme}` class. Override your design tokens for dark schemes:

```css
/* ── Dark scheme overrides ─────────────────────────────── */
body.admin-color-midnight .pluginname-admin,
body.admin-color-ectoplasm .pluginname-admin,
body.admin-color-coffee .pluginname-admin,
body.admin-color-ocean .pluginname-admin,
body.admin-color-sunrise .pluginname-admin {
    --pluginname-bg: #1e1e2f;
    --pluginname-text: #e2e8f0;
    --pluginname-text-secondary: #94a3b8;
    --pluginname-text-muted: #64748b;
    --pluginname-border: #334155;
    --pluginname-border-strong: #475569;
    --pluginname-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --pluginname-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    --pluginname-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
}

/* Card backgrounds in dark mode */
body.admin-color-midnight .pluginname-admin .pluginname-card,
body.admin-color-ectoplasm .pluginname-admin .pluginname-card,
body.admin-color-coffee .pluginname-admin .pluginname-card,
body.admin-color-ocean .pluginname-admin .pluginname-card,
body.admin-color-sunrise .pluginname-admin .pluginname-card {
    background: #252540;
    border-color: var(--pluginname-border, #334155);
}

/* Table rows in dark mode */
body.admin-color-midnight .pluginname-admin .wp-list-table tbody tr,
body.admin-color-ectoplasm .pluginname-admin .wp-list-table tbody tr {
    background: transparent;
    color: var(--pluginname-text, #e2e8f0);
}

body.admin-color-midnight .pluginname-admin .wp-list-table tbody tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.03);
}

/* Status colors remain unchanged — they use self-contained backgrounds */
```

### Token override table

| Token | Light default | Dark override | Rationale |
|-------|-------------|---------------|-----------|
| `--pluginname-bg` | `#f8fafc` | `#1e1e2f` | Dark surface |
| `--pluginname-text` | `#0f172a` | `#e2e8f0` | Light-on-dark text |
| `--pluginname-text-secondary` | `#475569` | `#94a3b8` | Slightly muted |
| `--pluginname-text-muted` | `#94a3b8` | `#64748b` | Placeholder text |
| `--pluginname-border` | `#e2e8f0` | `#334155` | Subtle dark border |
| `--pluginname-border-strong` | `#cbd5e1` | `#475569` | Emphasized border |
| `--pluginname-primary` | `#1d4ed8` | `#3b82f6` | Slightly lighter for dark bg contrast |
| `--pluginname-primary-bg` | `#eff6ff` | `#1e293b` | Tinted dark surface |
| `--pluginname-danger-bg` | `#fef2f2` | `#3b1c1c` | Dark red tint |
| `--pluginname-success-bg` | `#ecfdf5` | `#1a2e22` | Dark green tint |
| `--pluginname-warning-bg` | `#fffbeb` | `#2e2a1a` | Dark amber tint |

### Which schemes are "dark"

| Scheme | Type | Needs override |
|--------|------|---------------|
| Default | Light | No |
| Light | Light | No |
| Modern | Light | No |
| Blue | Light | No |
| Coffee | **Dark** | **Yes** |
| Ectoplasm | **Dark** | **Yes** |
| Midnight | **Dark** | **Yes** |
| Ocean | **Dark** | **Yes** |
| Sunrise | **Dark** | **Yes** |

### Detection in PHP (for conditional asset loading)

```php
$isDarkScheme = in_array(
    get_user_option('admin_color'),
    ['midnight', 'ectoplasm', 'coffee', 'ocean', 'sunrise'],
    true,
);
```

This can be used to conditionally enqueue an `admin-dark.css` file instead of embedding all overrides in the shared CSS:

```php
if ($isDarkScheme) {
    wp_enqueue_style(
        $pluginSlug . '-admin-dark',
        plugin_dir_url(__FILE__) . 'assets/css/admin-dark.css',
        [$pluginSlug . '-admin-shared'],
        PluginConfigType::Version->value,
    );
}
```

### Rules

1. Semantic status colors (success/error/warning badges) do NOT change — they have self-contained background+text contrast
2. Only surface, text, border, and shadow tokens need dark overrides
3. The `.code-pre` terminal block (see [`12-misc-and-organization.md`](./12-misc-and-organization.md)) is already dark — no override needed
4. Test with Midnight scheme at minimum — it's the most common dark scheme
5. Use `rgba()` for dark mode shadows with higher opacity (0.3–0.4 vs 0.05–0.08)

---

## Anti-Patterns

1. ❌ Never use hardcoded hex without a CSS variable reference
2. ❌ Never mix color systems (Material + Tailwind palettes in same badge)
3. ❌ Never use `opacity` on badge backgrounds — use explicit `rgba()` or gradient endpoints
4. ❌ Never place light text on light backgrounds

---

*Color system — v3.2.0 — 2026-04-19*
