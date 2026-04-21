# Themes (B3 RESOLVED)

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Decision:** Light + Dark only at launch. Named themes post-v1.

---

## Available Themes (v1)

| Theme | Value | Default |
|-------|-------|---------|
| Light | `light` | |
| Dark | `dark` | |
| System | `system` | ✅ |

**System** follows `prefers-color-scheme` reactively (updates without reload).

---

## Theme Switcher Location

| Surface | Notes |
|---------|-------|
| Settings panel → Appearance → Theme | Primary location (`04-settings.md`) |
| App menu (⋮) → Quick Theme | Secondary shortcut, 3 segmented buttons |
| Hotkey: `⌘⇧Y` | Cycles Light → Dark → System → Light |

---

## Visual Treatment of Switcher

```
┌─────────────────────────────────┐
│  Theme                          │
│                                 │
│  ┌────────┬────────┬─────────┐ │
│  │ ☀ Light │ 🌙 Dark │ 💻 System│ │  ← Segmented control
│  └────────┴────────┴─────────┘ │
│                                 │
│  Auto-switch when system theme  │
│  changes (System mode only).    │
└─────────────────────────────────┘
```

---

## Token Mapping

Each theme defines values for ALL semantic tokens. Components must NEVER hardcode hex values — always use tokens.

### Light Theme
```css
--background: hsl(0, 0%, 100%);
--foreground: hsl(222, 47%, 11%);
--muted: hsl(210, 40%, 96%);
--muted-foreground: hsl(215, 16%, 47%);
--border: hsl(214, 32%, 91%);
--accent: hsl(210, 40%, 96%);
--accent-foreground: hsl(222, 47%, 11%);
--primary: hsl(222, 47%, 11%);
--primary-foreground: hsl(210, 40%, 98%);
--popover: hsl(0, 0%, 100%);
--popover-foreground: hsl(222, 47%, 11%);
--ring: hsl(222, 47%, 11%);
--destructive: hsl(0, 84%, 60%);
```

### Dark Theme
```css
--background: hsl(222, 47%, 11%);
--foreground: hsl(210, 40%, 98%);
--muted: hsl(217, 33%, 17%);
--muted-foreground: hsl(215, 20%, 65%);
--border: hsl(217, 33%, 17%);
--accent: hsl(217, 33%, 17%);
--accent-foreground: hsl(210, 40%, 98%);
--primary: hsl(210, 40%, 98%);
--primary-foreground: hsl(222, 47%, 11%);
--popover: hsl(222, 47%, 11%);
--popover-foreground: hsl(210, 40%, 98%);
--ring: hsl(212, 27%, 84%);
--destructive: hsl(0, 63%, 31%);
```

### Color Swatch Adaptation (from Phase 5)

| Theme | Behavior |
|-------|----------|
| Light | 11+11 hex values from `04-color-palettes.md` used as-is |
| Dark | Text colors: 0.85 opacity overlay; Highlight colors: -20% saturation |
| System | Resolves to Light or Dark dynamically |

---

## Persistence

| Storage | Value |
|---------|-------|
| Key | `workflowy.theme` |
| Storage | `localStorage` |
| Values | `"light"` \| `"dark"` \| `"system"` |
| Default | `"system"` |
| Read on app boot | YES — applied before first render to avoid flash |

---

## FOUC Prevention (Flash of Unstyled Content)

Inline blocking script in `<head>` reads `localStorage.workflowy.theme` and applies the `dark` class to `<html>` before any CSS loads. This prevents the brief light-flash on dark-mode users.

```html
<script>
  const t = localStorage.getItem('workflowy.theme') || 'system';
  const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) document.documentElement.classList.add('dark');
</script>
```

---

## System Theme Reactivity

When theme = `system`:
- Listen for `matchMedia('(prefers-color-scheme: dark)')` `change` event.
- Update `<html>` class without reload.
- Animations: 200ms color transitions on `--background` and `--foreground` for smoothness.

---

## Post-v1 Roadmap (NOT IN LAUNCH)

Future named themes (separate spec, post-v1):
- Solarized (Light + Dark variants)
- Nord
- Dracula
- High-Contrast (accessibility)
- Custom palette themes derived from img-47 swatches

These will be additive — Light/Dark/System remain the default.

---

## Accessibility

- Both Light and Dark themes meet WCAG AA contrast (4.5:1 for body text).
- High-Contrast theme deferred but planned (post-v1).
- All token-based colors automatically adapt; no per-component overrides.

---

## Cross-References

- Phase 5 [`05-editor/04-color-palettes.md`](../05-editor/04-color-palettes.md) — Swatch adaptation per theme
- `04-settings.md` — Theme switcher in Settings panel
- `01-app-menu.md` — Quick Theme in app menu
