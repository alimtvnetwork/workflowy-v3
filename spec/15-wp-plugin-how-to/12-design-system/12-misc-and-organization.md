# Misc Components, File Organization & Anti-Patterns

> **Updated:** 2026-04-19

Covers progress bar, live indicator, inline status, code blocks, CSS file organization, responsive breakpoints, and the anti-patterns checklist.

---

## Progress Bar

```css
.progress-bar-wrap {
    background: var(--riseup-border, #e2e8f0);
    border-radius: 10px;
    height: 22px;
    overflow: hidden;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
}
.progress-bar {
    background: linear-gradient(90deg, var(--riseup-primary), var(--riseup-primary-light));
    height: 100%;
    border-radius: 10px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}
/* Shimmer overlay */
.progress-bar::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    background-size: 200% 100%;
    animation: riseupShimmer 1.5s linear infinite;
}
```

---

## Live Indicator

```css
.live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #cbd5e1;
    display: inline-block;
    transition: all 0.3s;
}
.live-dot.active {
    background: #22c55e;
    animation: livePulse 1.5s infinite;
}
```

---

## Inline Status Text

```css
.inline-status {
    font-weight: 600;
    margin-left: 10px;
    font-size: 13px;
    transition: color 0.2s;
}
.inline-status.success { color: var(--riseup-success, #059669); }
.inline-status.error   { color: var(--riseup-danger, #dc2626); }
```

---

## Code / Pre Blocks

### Dark Terminal Style

```css
.code-pre {
    margin: 0;
    padding: 18px;
    background: #0f172a;
    color: #e2e8f0;
    font-size: 12px;
    line-height: 1.6;
    border-radius: 8px;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-height: 400px;
    overflow: auto;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    border: 1px solid #1e293b;
}
```

### Light Context Style (Stack Trace)

```css
.stack-trace {
    background: linear-gradient(135deg, #faf5ff, #f5f3ff);
    border: 1px solid #d8b4fe;
    border-radius: var(--riseup-radius, 8px);
    padding: 14px 16px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 11px;
    line-height: 1.6;
    max-height: 240px;
    overflow: auto;
    white-space: pre-wrap;
    color: #581c87;
}
```

---

## CSS File Organization

### File Structure

```
assets/css/
├── admin-shared.css       # Modal system, shared keyframes
├── admin-settings.css     # Settings page, endpoint table
├── admin-snapshots.css    # Snapshot dashboard, charts, calendar
├── admin-logs.css         # Log table, badge colors
├── admin-errors.css       # Error log, file viewer, detail modal
├── admin-agents.css       # Agent management
├── admin-license.css      # License page
└── admin-feedback.css     # Feedback form
```

### Loading Rules

1. `admin-shared.css` is loaded on ALL admin pages (contains modal, keyframes)
2. Page-specific CSS is loaded only on its respective page
3. Each page-specific CSS MUST re-declare any keyframes it uses (independent loading)
4. CSS class names use `riseup-` prefix for plugin-specific styles
5. WordPress native classes (`.button`, `.wp-list-table`, `.form-table`) are enhanced, not replaced

### Specificity Rules

1. Plugin styles scope to `.riseup-admin` wrapper class
2. Page-specific overrides scope to `.riseup-admin.riseup-{page}` (e.g., `.riseup-admin.riseup-agents`)
3. Avoid `!important` except when overriding WordPress core table row backgrounds
4. Use class-based selectors, not ID selectors

---

## Responsive Breakpoints

```css
/* Collapse grid layouts */
@media (max-width: 1100px) {
    .analytics-row { grid-template-columns: 1fr; }
}

/* General mobile adjustments handled by WordPress admin viewport */
```

---

## Anti-Patterns (NEVER DO)

1. ❌ Use raw hex colors without a CSS variable reference
2. ❌ Use `opacity` on backgrounds for status colors — use explicit gradient endpoints
3. ❌ Use `!important` for anything other than WordPress core overrides
4. ❌ Create animations without the `riseup` prefix
5. ❌ Use `box-shadow` with large spread/blur for "glow" effects
6. ❌ Place light text on light backgrounds (contrast violation)
7. ❌ Use inline `<style>` blocks in templates — always use external CSS files
8. ❌ Skip fallback values in `var()` declarations
9. ❌ Use more than 5 staggered animation delays (performance)
10. ❌ Use `transition: all` with duration > `0.3s` (feels sluggish)

---

*Misc components & file organization — v3.2.0 — 2026-04-19*
