# 11 — Design Tokens

> **Version:** 1.0.0 · **Created:** 2026-04-25 (UTC+8) · **Status:** ✅ Authored (spec-only — no code edits)
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Related:** [`../../03-design-system/03-tailwind-version-ssot.md`](../../03-design-system/03-tailwind-version-ssot.md) — Tailwind v4 `@theme` is the single source of truth
> **Memory:** [`mem://design/theme`](../../../../.lovable/memory/design/theme.md)

---

## Scope

Maps every visual surface of the Search Popover to a **semantic design token**. This file is **spec-only**: it describes which tokens the future implementer must read from `src/index.css` `@theme` and which **3 NEW tokens** must be added before implementation begins.

> ⚠️ **No code is written or modified by this spec file.** All token additions are an implementation prerequisite, not part of this spec phase.

---

## 1. Existing Tokens (already defined)

These tokens already exist in `@theme` and must be reused as-is. Do not redefine.

| Token | Used by | Notes |
|-------|---------|-------|
| `--background` | Outline scrim while popover open | Unchanged |
| `--foreground` | Input text, hint text, footer text | — |
| `--popover` | Popover container background | Reuse from existing shadcn token |
| `--popover-foreground` | Default text on popover | — |
| `--muted` | Footer pill background, inactive tab background | — |
| `--muted-foreground` | Placeholder, secondary hint copy, inactive tab label | — |
| `--accent` | Token chip background, hovered tab background | — |
| `--accent-foreground` | Token chip text | — |
| `--border` | Popover border, tab rail divider, input underline | — |
| `--ring` | Focus ring on all focusable elements | 2px outline |
| `--primary` | Saved search "load" button accent | — |
| `--primary-foreground` | Text on `--primary` surface | — |
| `--destructive` | Negation token chip (e.g. `-is:completed`) tint | Used at 80% opacity |
| `--radius` | Popover corner radius (×1), chip radius (×0.5) | — |

---

## 2. NEW Tokens — REQUIRED Additions

The implementer **MUST add these 3 tokens** to `src/index.css` `@theme` block (light + dark variants) before building Phase 2. Until added, the popover cannot be themed correctly.

| Token | Purpose | Light value (suggested) | Dark value (suggested) | Contrast partner |
|-------|---------|-------------------------|------------------------|------------------|
| `--highlight` | `<mark>` background for matched text in outline + popover suggestions | `hsl(48 100% 88%)` | `hsl(48 70% 35%)` | `--highlight-foreground` |
| `--highlight-foreground` | Text color on `<mark>` highlight surface | `hsl(48 90% 15%)` | `hsl(48 100% 95%)` | `--highlight` (≥ 4.5:1) |
| `--accent-active` | Active/selected tab background (distinct from hover `--accent`) | `hsl(220 90% 56%)` | `hsl(220 80% 60%)` | `--accent-active-foreground` |
| `--accent-active-foreground` | Text on active tab | `hsl(0 0% 100%)` | `hsl(0 0% 100%)` | `--accent-active` (≥ 7:1) |

> Total new tokens: **4** (highlight pair + accent-active pair). The overview lists 3 because `--accent-active-foreground` is implicitly paired with `--accent-active`. Both pairs are required.

### 2.1 Authoring location

`src/index.css` Tailwind v4 `@theme` block. Format:

```
@theme {
  --highlight: hsl(48 100% 88%);
  --highlight-foreground: hsl(48 90% 15%);
  --accent-active: hsl(220 90% 56%);
  --accent-active-foreground: hsl(0 0% 100%);
}
```

Dark variant goes in the existing `.dark` selector (or `@media (prefers-color-scheme: dark)` block, whichever the project uses).

---

## 3. Surface → Token mapping

| Surface | Background | Foreground | Border | Notes |
|---------|-----------|-----------|--------|-------|
| Popover container | `--popover` | `--popover-foreground` | `--border` | Shadow uses existing `shadow-lg` |
| Header input | transparent | `--foreground` | bottom: `--border` | Placeholder: `--muted-foreground` |
| Tab — inactive | transparent | `--muted-foreground` | — | Hover: `--accent` bg |
| Tab — hover | `--accent` | `--accent-foreground` | — | — |
| Tab — active | `--accent-active` | `--accent-active-foreground` | bottom underline `--accent-active` | NEW token |
| Hint area | `--popover` | `--muted-foreground` | — | — |
| Suggestion chip — idle | `--muted` | `--foreground` | `--border` | — |
| Suggestion chip — hover/focus | `--accent` | `--accent-foreground` | `--accent` | — |
| Value picker option | `--popover` | `--foreground` | — | Selected: `--accent` bg |
| Token chip — affirmative | `--accent` | `--accent-foreground` | — | Radius: calc(var(--radius) * 0.5) |
| Token chip — negated | `--destructive` (80% α) | `--destructive-foreground` | — | Strikethrough on keyword |
| Match `<mark>` | `--highlight` | `--highlight-foreground` | — | NEW tokens |
| Footer pill | `--muted` | `--foreground` | `--border` | — |
| Action icon — idle | transparent | `--muted-foreground` | — | — |
| Action icon — hover | `--accent` | `--accent-foreground` | — | — |
| Action icon — active toggle | `--accent-active` | `--accent-active-foreground` | — | NEW token |
| Focus ring (all) | — | — | `--ring` 2px | — |

---

## 4. Spacing & Sizing Tokens (no new ones)

Reuse existing Tailwind scale. Spec-level requirements:

| Element | Property | Value |
|---------|----------|-------|
| Popover | width | 480px desktop, 100vw - 32px mobile |
| Popover | padding | `p-4` (16px) |
| Tab rail | gap | `gap-1` (4px) |
| Token chip | padding | `px-2 py-0.5` |
| Picker option | padding | `px-3 py-2` |
| Footer pill | padding | `px-3 py-1` |

No new spacing tokens needed.

---

## 5. Motion Tokens (no new ones)

Reuse existing animation utilities. Spec-level requirements:

| Animation | Duration | Easing | Reduced-motion behavior |
|-----------|----------|--------|------------------------|
| Popover open | 120ms | `ease-out` | instant |
| Popover close | 80ms | `ease-in` | instant |
| Tab underline slide | 150ms | `ease-out` | instant swap |
| Token commit | 100ms | `ease-out` | instant |
| Picker open | 100ms | `ease-out` | instant |

---

## 6. Z-index

| Layer | z-index | Notes |
|-------|---------|-------|
| Popover container | 50 | Above outline, below toast |
| Value picker (nested) | 51 | Above popover |
| Quick Actions menu | 52 | Above picker |

Reuse existing z-index scale; no new tokens.

---

## 7. Implementation prerequisite checklist

Before any Phase 2 code is written, the implementer must:

- [ ] Add `--highlight` + `--highlight-foreground` to `@theme` (light + dark)
- [ ] Add `--accent-active` + `--accent-active-foreground` to `@theme` (light + dark)
- [ ] Verify all contrast ratios in [`10-accessibility.md`](./10-accessibility.md) § 5
- [ ] Update `tailwind.config.ts` if v3 fallback shim is in use (v4 `@theme` is canonical per Tailwind SSOT)

---

## Acceptance Criteria refs

Token presence is verified via `AT-WF02-RES-15` (highlight rendering) and `AT-WF02-TAB-06` (active tab styling). See [`97-acceptance-criteria.md`](./97-acceptance-criteria.md).
