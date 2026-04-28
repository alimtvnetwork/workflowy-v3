# ADR-0028 — i18n Locale Strategy (Library, Fallback Chain, RTL)

> **Status:** Accepted
> **Date:** 2026-04-28
> **Supersedes:** —
> **Superseded by:** —
> **Related:** ADR-0003 (React 19 + TS strict frontend), ADR-0012 (Tailwind v4 token registry), ADR-0017 (8 named error boundaries), ADR-0022 (shadcn/Radix components)
> **Closes:** P75 · spec-wide gap "no i18n strategy specified"

---

## 1. Context

The spec mandates Vite 5.4 + React 19 + TypeScript 5.6 (strict) for the frontend (ADR-0003) and shadcn/ui + Radix for components (ADR-0022) — but **never specifies an i18n library, locale-resolution algorithm, fallback chain, or RTL behaviour**. This forces every new UI feature to either:

1. Hard-code English strings (violates internationalisation expectations and fails any localisation audit), or
2. Reach for an arbitrary library (`react-i18next`, `react-intl`, `lingui`, `paraglide`, …) — each with different bundle costs, runtime models, and message-key conventions, producing inconsistent code and re-renders.

A unified i18n decision is also a prerequisite for:
- Date/number formatting (currently inconsistent — some components use `toLocaleString()`, others `Intl.DateTimeFormat`)
- RTL text editor support (the unified Node `content` field per ADR-0023 is direction-agnostic, but the **shell** around it is not — sidebar/breadcrumbs/menus need explicit `dir` handling)
- Error-boundary fallback copy (ADR-0017's 8 named boundaries currently hard-code English)
- SSE `Heartbeat`/`resync` user-facing toasts (ADR-0025/0027)

---

## 2. Decision

### D1 — Library: `react-i18next` v15+ with `i18next` v23+

**Rationale:**
- Stable, maintained, React 19-compatible (functional `useTranslation` hook — no class HOC).
- Native TypeScript module-augmentation for **typed message keys** — satisfies ADR-0002 strict-TS rule "zero `any`".
- Lazy namespace loading via dynamic `import()` — keeps initial bundle small.
- Compatible with React Router v7 data-router loaders (sync API after init).
- Battle-tested with shadcn/Radix (no DOM ownership conflicts).

**Forbidden alternatives** (each with its own `G-28-NO-*` gate):
- `react-intl` / `formatjs` — heavier ICU runtime; verbose `<FormattedMessage>` JSX clashes with shadcn composition.
- `lingui` — macro-based extraction requires Babel; the project is **Vite + SWC only**, no Babel allowed.
- `paraglide` — message-per-file model produces too many small chunks for the `~250-key` initial scope.
- Any **hand-rolled** `t(key)` function — violates "single source for cross-cutting concerns".

### D2 — Module structure (canonical layout)

```
src/i18n/
  index.ts                    # createI18n() singleton + init
  config.ts                   # SUPPORTED_LOCALES, FALLBACK_CHAIN, RTL_LOCALES
  detector.ts                 # 5-tier locale detection (D3)
  types.d.ts                  # module augmentation: declare module 'i18next' { … }
  locales/
    en/
      common.json             # default namespace
      editor.json
      errors.json             # 1 entry per ErrorCategoryType (ADR-0003)
      sse.json                # toast strings for SSE state changes
    es/  fr/  de/  ja/  ar/   # one folder per supported locale (D4)
```

- One JSON namespace file per **feature area**, not per **page**. Keeps bundles cohesive with code-splitting boundaries.
- All keys use **dot.notation**: `editor.toolbar.bold`, `errors.E1001.title`.
- Source language is **English (`en`)** — translators receive English `.json` and return parallel files.

### D3 — Locale detection (5-tier ordered chain)

The `detector.ts` resolver MUST evaluate tiers **in order**, returning the first match in `SUPPORTED_LOCALES`:

| # | Source | Storage | Persistence |
|---|--------|---------|-------------|
| 1 | URL `?locale=` query param | URL only | Per-request override (debug, share-link) |
| 2 | User profile `OwnerSettings.PreferredLocale` | Server (REST) | Per-account |
| 3 | IndexedDB `i18nLocale` key (under the existing app DB, **not** localStorage — ADR-0021) | Local mirror | Per-device |
| 4 | `navigator.language` + `navigator.languages[]` | Browser | Default |
| 5 | Hard fallback: `en` | Hard-coded | Always present |

**Constraint:** detection MUST complete **before** the React Router data-router boots, because route loaders (ADR-0023) may need locale-formatted error messages. The boot sequence is:
1. `detectLocale()` → resolves to a `SupportedLocale` literal in <5ms p95 (all 5 tiers are sync except tier 2, which is gated behind a session check and only consulted on authenticated boots).
2. `await i18n.changeLanguage(locale)` (lazy-loads the namespace JSON for the resolved locale).
3. `<RouterProvider router={router} />` mounts.

A loading splash with no text (logo only) covers steps 1–2 to avoid flashing English.

### D4 — Supported locales (initial scope)

```ts
export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'ja', 'ar'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
```

Six locales chosen to exercise: Latin LTR (en/es/fr/de), CJK (ja), and RTL (ar). Adding a locale = (a) new folder under `locales/`, (b) append to `SUPPORTED_LOCALES`, (c) translator-completed JSON. **No code change** beyond the literal union.

### D5 — Fallback chain (per-key resolution)

`i18next` is configured with explicit fallbacks — **not** the default "en only":

```ts
fallbackLng: {
  'es-MX': ['es', 'en'],
  'es-AR': ['es', 'en'],
  'pt-BR': ['pt', 'en'],     // pt added later
  'zh-TW': ['zh-Hant', 'en'],
  default: ['en']
}
```

Resolution order for any missing key:
1. Exact requested locale (`es-MX`)
2. Region-stripped base (`es`)
3. English (`en`)
4. **Last resort:** the literal key string itself, wrapped in `[KEY: …]` so QA can spot it (only in `import.meta.env.DEV`; production renders empty string).

A missing key in **production** MUST be reported to the error pipeline (ADR-0003 logger) with category `Frontend` — silent missing translations are a `G-28-MISSING-KEY-LOGGED` violation.

### D6 — RTL handling

```ts
export const RTL_LOCALES: readonly SupportedLocale[] = ['ar'] as const;
```

When the active locale is in `RTL_LOCALES`:

1. **`<html dir="rtl" lang="ar">`** is set by the i18n `languageChanged` listener — single source of truth for direction.
2. **Tailwind v4 logical properties** (`ms-*`/`me-*`/`ps-*`/`pe-*`/`start-*`/`end-*`) are mandatory in any new component. The `pl-*`/`pr-*`/`ml-*`/`mr-*`/`left-*`/`right-*` classes are **forbidden** in component code. **The full rule, exemption mechanism, and grandfathering policy live in [ADR-0012 §D7](./0012-tailwind-v4-theme-block-token-registry.md#d7--logical-properties-are-mandatory-physical-directional-utilities-are-forbidden)** and are enforced by gates `G-12-LOGICAL-MARGINS-PADDING`, `G-12-LOGICAL-INSET`. This ADR cites them; it does not duplicate them.
3. **Editor content (TipTap-style rich text per ADR-0023) preserves its own intrinsic direction** via the Unicode bidi algorithm — the i18n direction toggles only the **chrome**, not user content. A user in `ar` chrome can still type LTR English in a node, and vice versa.
4. **Icons that imply direction** (chevron-right, undo arrows, `Caret*`) are mirrored via `rtl:rotate-180` (lucide-react icons per ADR-0017's icon rule). Decorative icons (logo, status dots) are NOT mirrored — judgment call documented per icon in `src/components/icons/README.md`.
5. **Logical text alignment**: use `text-start`/`text-end`, never `text-left`/`text-right`. Authoritative gate: `G-12-LOGICAL-TEXT-ALIGN` (ADR-0012 §D7).

### D7 — Number, date, currency formatting

Use the **platform `Intl.*` APIs** (`Intl.DateTimeFormat`, `Intl.NumberFormat`, `Intl.RelativeTimeFormat`) keyed by `i18n.language`. **Forbid `toLocaleString()`** without an explicit locale arg — non-determinism between SSR (none here) and CSR, and against test snapshots, makes it a source of flaky tests. Gate: `G-28-INTL-EXPLICIT-LOCALE`.

A thin wrapper `src/i18n/format.ts` exposes:
```ts
formatDate(d: Date, opts?: Intl.DateTimeFormatOptions): string
formatNumber(n: number, opts?: Intl.NumberFormatOptions): string
formatRelative(d: Date): string   // uses Intl.RelativeTimeFormat with 'auto' numeric
```
All three pull `i18n.language` internally — callers pass values, never locales. This keeps the locale-coupling on a single line.

### D8 — Type-safe keys (TS module augmentation)

```ts
// src/i18n/types.d.ts
import type common from './locales/en/common.json';
import type editor from './locales/en/editor.json';
import type errors from './locales/en/errors.json';
import type sse from './locales/en/sse.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      editor: typeof editor;
      errors: typeof errors;
      sse: typeof sse;
    };
  }
}
```

Result: `t('editor.toolbar.bold')` is type-checked at compile time. A typo or stale key fails `tsc --noEmit`. This satisfies "zero magic strings" (Universal Enum Rule #3 from `spec/20-enums-index.md`).

Gate `G-28-TYPED-KEYS` asserts `tsc --noEmit` fails on any unknown key; CI runs it on every PR.

### D9 — Pluralisation & interpolation

- Use **ICU MessageFormat lite** via `i18next-icu`. Plural forms covered: `one` / `other` (en), `one` / `few` / `many` / `other` (ar/ru), `other` (ja).
- Interpolation uses `{{var}}` — never string concatenation in JSX.
- HTML in translations is **forbidden**; use `<Trans>` component for inline markup. Gate: `G-28-NO-HTML-IN-JSON`.

### D10 — Persistence write path

When the user changes locale via the settings UI:
1. Optimistically update `i18n.language` and IndexedDB `i18nLocale` (instant UI flip).
2. Enqueue an `UpdateOwnerSettings { PreferredLocale }` action via the offline FIFO queue (ADR-0023 D2/D5) — never a direct fetch.
3. The server eventually persists `OwnerSettings.PreferredLocale`; on next cold boot from another device, tier 2 of D3 picks it up.

This uses the same write path as every other mutation — no special-case egress.

---

## 3. Consequences

### Positive

- **Single decision** unblocks every UI feature waiting for "what library should I use?" — no more ad-hoc choices.
- **Typed keys** prevent stale/missing translations at compile time, not at runtime.
- **RTL handled at chrome level** without polluting editor logic — bidi text in user content works naturally.
- **No new infrastructure** — translation bundles are static JSON served from the same WordPress plugin (`/wp-content/plugins/workflowy/dist/locales/`).
- **Compatible with offline mode** — once a locale's namespaces have been fetched once, they're cached by Vite's hashed-URL strategy and the service worker.

### Negative

- Adds ~22 KB gzipped (`i18next` core + `react-i18next` + `i18next-icu`) to the initial bundle.
- Six locales × four namespaces = 24 JSON files to keep in sync; needs a translator workflow doc (out of scope here).
- ICU plural rules require translators familiar with CLDR categories — onboarding cost.

### Neutral

- This ADR does NOT specify a TMS (translation management system); teams may choose Crowdin, Lokalise, or plain Git-PR workflow. The JSON file structure is TMS-agnostic.
- Server-rendered emails (out of scope for v1) will need their own PHP-side i18n decision when introduced.

---

## 4. Compliance Gates

| Gate ID | Severity | Description |
|---|---|---|
| `G-28-LIBRARY-IS-I18NEXT` | **CI** | `package.json` MUST list `react-i18next` and `i18next`. CI denies any other i18n library in `package.json` or imports of `react-intl`/`lingui`/`@formatjs/*`. |
| `G-28-NO-PHYSICAL-MARGINS` | **CI** | `eslint-plugin-tailwindcss` rule forbids `pl-*`, `pr-*`, `ml-*`, `mr-*`, `left-*`, `right-*` in `src/`. Use `ps-*`/`pe-*`/`ms-*`/`me-*`/`start-*`/`end-*`. |
| `G-28-NO-PHYSICAL-ALIGN` | **CI** | ESLint custom rule forbids `text-left` and `text-right`; enforce `text-start`/`text-end`. |
| `G-28-NO-HTML-IN-JSON` | **CI** | Pre-commit hook greps every `locales/**/*.json` for `<` / `>` / `&[a-z]+;` and fails. |
| `G-28-INTL-EXPLICIT-LOCALE` | **CI** | ESLint rule: `.toLocaleString()` and `.toLocaleDateString()` calls without an explicit first arg fail. |
| `G-28-TYPED-KEYS` | **CI** | `tsc --noEmit` MUST fail if `t('foo.bar')` references an unknown key (relies on D8 module augmentation). |
| `G-28-MISSING-KEY-LOGGED` | **TEST** | Test fakes a missing key; assert one entry hits the error logger with category `Frontend`. |
| `G-28-FALLBACK-CHAIN` | **TEST** | Acceptance test: request `es-MX` → assert `es` then `en` are tried in order; assert final string is `en` text when `es` lacks the key. |
| `G-28-RTL-DIR-ATTR` | **TEST** | Switch to `ar`; assert `document.documentElement.dir === 'rtl'` and `lang === 'ar'`. |
| `G-28-DETECTION-ORDER` | **TEST** | All 5 detection tiers covered by a parameterised test; tier-1 `?locale=` overrides every other tier. |
| `G-28-LOCALE-WRITE-VIA-QUEUE` | **DOC-NORM** | Locale change MUST go through the offline FIFO queue — no direct `fetch` to `OwnerSettings`. |

Add to `spec/_GATE-REGISTRY.md` under area **ADR-0028** in the next sweep (11 new gates).

---

## 5. Open Follow-Ups

1. **Translator workflow** — pick a TMS (Crowdin/Lokalise) or define a Git-PR workflow with translator-only branches. Tracked separately as P78.
2. **Server-side i18n** — when transactional email is introduced, decide PHP-side approach (likely `gettext` via WordPress core's `__()`).
3. **Date-fns vs Intl.RelativeTimeFormat** — decision deferred; D7 mandates `Intl.*` for now to avoid the dependency.
4. **Per-namespace lazy-load thresholds** — `editor.json` is large enough to consider splitting per-feature once it exceeds 8 KB.

---

## 6. References

- ADR-0003 (frontend stack — React 19 + TS strict)
- ADR-0012 (Tailwind v4 token registry — logical-property amendment lives here)
- ADR-0017 (error boundaries — error copy is i18n'd)
- ADR-0021 (no localStorage — locale lives in IndexedDB tier 3)
- ADR-0022 (shadcn/Radix — verified compatible with `react-i18next`)
- ADR-0023 (loader↔queue — locale write path uses the FIFO queue per D10)
- `spec/20-enums-index.md` Universal Rule #3 (zero magic strings — D8 typed keys deliver this)

---

*ADR-0028 — closes P75 — 2026-04-28*
