# Animation Library

> **Updated:** 2026-04-19

---

## Keyframe Registry

| Name | Effect | Duration | Easing | Use Case |
|------|--------|----------|--------|----------|
| `riseupFadeIn` | `opacity 0→1` | `0.25–0.3s` | `ease-out` | Overlays, tab content |
| `riseupFadeInUp` | `opacity 0→1 + translateY(12px→0)` | `0.3–0.5s` | `ease-out` | Table rows, cards, sections |
| `riseupScaleIn` | `opacity 0→1 + scale(0.95→1)` | `0.3–0.35s` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Modals, dialogs |
| `riseupPulse` | `scale(1→1.05→1)` | `1.5–3s` | `ease-in-out` | Live indicators, alert badges |
| `riseupSpin` | `rotate(0→360deg)` | `0.8–1.2s` | `linear` | Loading spinners |
| `riseupShimmer` | `background-position slide` | `1.5s` | `linear` | Progress bar shine effect |
| `livePulse` | `opacity + box-shadow pulse` | `1.5s` | — | Live dot indicator |

---

## Keyframe Definitions

```css
@keyframes riseupFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}

@keyframes riseupFadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
}

@keyframes riseupScaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
}

@keyframes riseupPulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.05); }
}

@keyframes riseupSpin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes riseupShimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

@keyframes livePulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
    50%      { opacity: 0.7; box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
}
```

---

## Staggered Row Animation

Table rows MUST use staggered delays for entrance:

```css
.wp-list-table tbody tr {
    animation: riseupFadeInUp 0.4s ease-out both;
}
.wp-list-table tbody tr:nth-child(1) { animation-delay: 0s; }
.wp-list-table tbody tr:nth-child(2) { animation-delay: 0.06s; }
.wp-list-table tbody tr:nth-child(3) { animation-delay: 0.12s; }
.wp-list-table tbody tr:nth-child(4) { animation-delay: 0.18s; }
.wp-list-table tbody tr:nth-child(5) { animation-delay: 0.24s; }
```

---

## Transition Standards

| Property | Duration | Easing | Use Case |
|----------|----------|--------|----------|
| `all` | `0.2s` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default for interactive elements |
| `color` | `0.2s` | `ease` | Status text changes |
| `width` | `0.5s` | `cubic-bezier(0.4, 0, 0.2, 1)` | Progress bar fill |
| `transform` | `0.2s` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy icon scale (dashicons) |
| `background` | `0.2s` | `cubic-bezier(0.4, 0, 0.2, 1)` | Table row hover |

---

## Animation Rules

1. Every page MUST re-declare the keyframes it uses (pages load CSS independently)
2. `infinite` animations are reserved for: spinners, live indicators, and alert pulses
3. Entrance animations use `both` fill mode for staggered delays
4. Hover animations are NEVER `infinite` — they are state transitions only

---

*Animation library — v3.2.0 — 2026-04-19*
