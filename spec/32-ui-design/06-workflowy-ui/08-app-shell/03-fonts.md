# Fonts

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-55 (Geist Mono mention)

---

## Font Stack

| Role | Family | Source |
|------|--------|--------|
| UI / body / headings | **Inter** | Google Fonts (variable) |
| Code Blocks / inline code | **Geist Mono** | Vercel (variable) |
| Fallback (UI) | system-ui, -apple-system, sans-serif | OS native |
| Fallback (mono) | ui-monospace, SFMono-Regular, Menlo, monospace | OS native |

---

## CSS Definitions

```css
:root {
  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}

body {
  font-family: var(--font-sans);
  font-feature-settings: "cv11", "ss01"; /* Inter character variants */
}

code, pre, .code-block {
  font-family: var(--font-mono);
  font-feature-settings: "ss01", "ss02"; /* Geist Mono ligatures */
}
```

---

## Loading Strategy

| Font | Strategy | Rationale |
|------|----------|-----------|
| Inter | Self-hosted variable WOFF2, `font-display: swap` | Critical UI font; tolerant of brief fallback flash |
| Geist Mono | Lazy-loaded only when first Code Block renders | Reduces initial bundle for users with no code |

Preload Inter via `<link rel="preload">` in `<head>`. Geist Mono uses dynamic `@font-face` injection on first code-block mount.

---

## Type Scale (Inter)

Used by Phase 5 Headings spec (`05-editor/03-item-types.md`):

| Level | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| H1 | 32px | 700 | 1.2 | -0.02em |
| H2 | 24px | 700 | 1.25 | -0.015em |
| H3 | 20px | 600 | 1.3 | -0.01em |
| H4 | 17px | 600 | 1.4 | 0 |
| H5 | 15px | 600 | 1.5 | 0 |
| Body | 14px | 400 | 1.6 | 0 |
| Small | 12px | 400 | 1.5 | 0.01em |
| Tiny / metadata | 11px | 400 | 1.4 | 0.02em |

---

## Mono Sizes (Geist Mono)

| Use | Size | Notes |
|-----|------|-------|
| Code Block | 13px | Per Phase 5 spec |
| Inline code | 13px | Slightly smaller than body 14px to balance density |
| Keyboard shortcut chips | 11px | Used in Hotkeys table (Phase 3) |

---

## Internationalization Considerations

Inter and Geist Mono both have:
- Latin Extended ✅
- Cyrillic ✅
- Greek ✅

For CJK (Chinese, Japanese, Korean — post-v1):
- Append Noto Sans CJK fallback
- System fonts handle rendering
- No additional bundle

Arabic/Hebrew RTL: Inter has limited support; specific RTL fonts would be loaded conditionally based on `<html lang>` (post-v1).

---

## User Customization (Post-v1)

In v1, fonts are **not user-customizable**. Future Settings → Appearance → Typography options:
- Font size scale (S, M, L, XL)
- Body font (Inter, system, custom)
- Code font (Geist Mono, system, custom)

---

## Performance

| Metric | Target |
|--------|--------|
| Inter first paint | < 100ms (preload + swap) |
| Geist Mono first render after first code block | < 200ms |
| Total font weight added | < 80KB (Inter variable + Geist Mono variable, gzipped) |

---

## Cross-References

- Phase 5 [`05-editor/05-code-quote-blocks.md`](../05-editor/05-code-quote-blocks.md) — Code Block font usage
- Phase 5 [`05-editor/03-item-types.md`](../05-editor/03-item-types.md) — Heading sizes
- Phase 3 [`03-right-panel/02-hotkeys.md`](../03-right-panel/02-hotkeys.md) — Mono used for shortcut chips
