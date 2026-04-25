# 11 — Highlighter Dependency Pin

> **Version:** 1.0.0
> **Created:** 2026-04-25 (UTC+8)
> **Status:** Canonical — locks the syntax-highlighter choice for WorkFlowy
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Closes:** Audit finding F-04

---

## Why This File Exists

`spec/09-code-block-system/03-syntax-highlighting.md` references **highlight.js v11+** but does NOT pin:
- The exact npm package + version range
- The exact ES module import paths (core vs full bundle)
- The theme CSS source-of-truth (project tokens vs vendor stylesheet)
- The bundle-size budget
- The frozen list of registered languages

Without these, an AI implementer could plausibly substitute **Shiki**, **Prism**, **starry-night**, or `cdn.jsdelivr.net/npm/highlight.js` — each of which would change bundle size by 10-100×, break SSR, or corrupt token coloring.

This file is the single source of truth for those decisions.

---

## Locked Choice: `highlight.js`

| Decision | Value | Why |
|----------|-------|-----|
| Library | **`highlight.js`** | MIT, mature, tree-shakable, no peer deps, no Web-Worker requirement |
| Package | `highlight.js` (npm) | NOT `@highlightjs/cdn-assets`, NOT `react-highlight`, NOT `react-syntax-highlighter` |
| Version range | `^11.10.0` | v11 is the current major; `^` allows patch + minor within v11 only |
| Resolved version (lockfile) | Pinned in `bun.lock` | Runtime regeneration MUST NOT cross majors |
| Import strategy | **Core + per-language** registration | Full bundle is ~500KB; core + 11 langs ≈ ~80KB |
| Theme | **Project HSL tokens only** (NO vendor `.css` import) | Vendor themes ship hex colors and break the `--primary`/`--accent` token system |
| SSR | Not required (Vite SPA) | But the library is SSR-safe if needed later |
| Auto-detect | Permitted as fallback only (`hljs.highlightAuto`) | Per the resolution flow in [`03-syntax-highlighting.md`](./03-syntax-highlighting.md) |
| Web Worker | Not used | Code blocks are short; worker overhead exceeds savings |

**Forbidden alternatives** (Code-Red — fail review immediately):
- ❌ Shiki / `@shikijs/*` — uses TextMate grammars + WASM, bundle is 1MB+
- ❌ Prism / `prismjs` — different token class names, would invalidate `05-styling.md`
- ❌ `react-syntax-highlighter` — wraps Prism/highlight.js but adds React-specific overhead and inline styles
- ❌ CDN imports (`cdn.jsdelivr.net`, `unpkg.com`) — breaks offline use, breaks CSP, version drift
- ❌ `starry-night` / `@wooorm/starry-night` — GitHub's grammar set, larger and slower
- ❌ Custom regex-based highlighter — reinventing the wheel; fails AT-CODEBLOCKSYSTEM-05

---

## Canonical Import Paths

All imports MUST use these exact paths. Relative paths, namespace imports (`import * as hljs`), and CDN URLs are forbidden.

```ts
// src/lib/highlighter/index.ts

// 1. Core (no languages registered) — ~30KB
import hljs from 'highlight.js/lib/core';

// 2. Per-language registration (tree-shaken) — order matches the language table below
import typescript from 'highlight.js/lib/languages/typescript';
import go         from 'highlight.js/lib/languages/go';
import php        from 'highlight.js/lib/languages/php';
import css        from 'highlight.js/lib/languages/css';
import json       from 'highlight.js/lib/languages/json';
import bash       from 'highlight.js/lib/languages/bash';
import sql        from 'highlight.js/lib/languages/sql';
import rust       from 'highlight.js/lib/languages/rust';
import xml        from 'highlight.js/lib/languages/xml';
import yaml       from 'highlight.js/lib/languages/yaml';
import markdown   from 'highlight.js/lib/languages/markdown';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('go',         go);
hljs.registerLanguage('php',        php);
hljs.registerLanguage('css',        css);
hljs.registerLanguage('json',       json);
hljs.registerLanguage('bash',       bash);
hljs.registerLanguage('sql',        sql);
hljs.registerLanguage('rust',       rust);
hljs.registerLanguage('xml',        xml);
hljs.registerLanguage('yaml',       yaml);
hljs.registerLanguage('markdown',   markdown);

export { hljs };
```

**Rule:** Adding a language outside this 11-entry list requires a spec PR that updates THIS file, [`03-syntax-highlighting.md`](./03-syntax-highlighting.md) §"Registered Languages", AND the language-label/accent maps in [`06-constants-and-maps.md`](./06-constants-and-maps.md). Drift = AT-CODEBLOCKSYSTEM-13 failure.

---

## Frozen Language Set (v1)

| # | Registration name | Aliases (in `normalizeLang`) | hljs module |
|---|-------------------|-------------------------------|-------------|
| 1 | `typescript` | `ts`, `tsx`, `javascript`, `js` | `typescript` |
| 2 | `go` | `golang` | `go` |
| 3 | `php` | — | `php` |
| 4 | `css` | — | `css` |
| 5 | `json` | — | `json` |
| 6 | `bash` | `sh`, `shell` | `bash` |
| 7 | `sql` | — | `sql` |
| 8 | `rust` | — | `rust` |
| 9 | `xml` | `html` | `xml` |
| 10 | `yaml` | `yml` | `yaml` |
| 11 | `markdown` | `md` | `markdown` |

Languages **not** in this table render via `hljs.highlightAuto` or fall back to plain text per the resolution flow in [`03-syntax-highlighting.md`](./03-syntax-highlighting.md).

---

## Theme Strategy: Tokens, Not Vendor CSS

**MUST NOT import** any of:
```ts
// ❌ FORBIDDEN
import 'highlight.js/styles/github-dark.css';
import 'highlight.js/styles/atom-one-dark.css';
// ...any other highlight.js styles
```

**MUST use** project HSL tokens. The `.hljs-*` classes are styled in `src/styles/code-block.css` (or equivalent), mapping each token type to a semantic CSS variable per the table in [`03-syntax-highlighting.md`](./03-syntax-highlighting.md) §"Syntax Token Colors":

```css
/* Excerpt — see 05-styling.md for full ruleset */
.hljs                       { color: hsl(var(--foreground)); background: hsl(var(--code-bg)); }
.hljs-keyword,
.hljs-type,
.hljs-built_in              { color: hsl(var(--primary)); }
.hljs-title,
.hljs-section               { color: hsl(var(--foreground) / 0.85); }
.hljs-string,
.hljs-attr,
.hljs-property              { color: hsl(var(--accent)); }
.hljs-number,
.hljs-symbol,
.hljs-regexp                { color: hsl(var(--warning)); }
.hljs-comment,
.hljs-quote                 { color: hsl(var(--muted-foreground)); font-style: italic; }
```

This satisfies **AT-CODEBLOCKSYSTEM-10** (always-dark code blocks) and **AT-CODEBLOCKSYSTEM-11** (HSL-only colors).

---

## Bundle Budget

| Asset | Budget | Measured by |
|-------|--------|-------------|
| `highlight.js` core | ≤ 35 KB minified | `vite build --report` size column |
| All 11 registered languages | ≤ 60 KB minified (combined) | Sum of individual chunk sizes |
| Total highlighter footprint | **≤ 100 KB minified, ≤ 35 KB gzipped** | Vite's gzip column |
| Theme CSS (project) | ≤ 4 KB | `wc -c src/styles/code-block.css` |

CI MUST fail if `dist/assets/highlighter-*.js` exceeds 100 KB minified. Add to the `package` job in [`spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/02-github-actions-workflow.md`](../13-cicd-pipeline-workflows/18-wp-plugin-deploy/02-github-actions-workflow.md):

```yaml
- name: Verify highlighter bundle budget
  run: |
    SIZE=$(find dist/assets -name 'highlighter-*.js' -printf '%s\n' | sort -n | tail -1)
    test -n "$SIZE" && [ "$SIZE" -le 102400 ] || { echo "::error::highlighter bundle ${SIZE}B > 100KB budget"; exit 1; }
```

---

## Upgrade Policy

| Change type | Requires |
|-------------|----------|
| Patch (`11.10.0 → 11.10.1`) | Automatic via lockfile update; CI must pass |
| Minor (`11.10.x → 11.11.0`) | Manual review; check release notes for token-name changes |
| Major (`11.x → 12.x`) | Spec PR; this file MUST be updated; styling regression test required |
| Switching library | Spec PR; this file MUST be rewritten; F-04 audit gate re-runs |

Drift between `package.json` `^11.10.0` and the lockfile-resolved version MUST NOT cross a major.

---

## Acceptance Gates (verifiable)

| ID | Check | Verification |
|----|-------|--------------|
| AT-HLPIN-01 | `highlight.js` is present in `package.json` deps | `jq -e '.dependencies["highlight.js"]' package.json` |
| AT-HLPIN-02 | Version range starts with `^11.` | `jq -r '.dependencies["highlight.js"]' package.json \| grep -q '^\^11\.'` |
| AT-HLPIN-03 | Forbidden libraries are absent | `jq -e '.dependencies.shiki, .dependencies.prismjs, .dependencies["react-syntax-highlighter"], .dependencies["@shikijs/core"]' package.json \| grep -c null` returns ≥ 4 |
| AT-HLPIN-04 | No vendor highlight.js theme CSS imported | `! grep -rEn "highlight\.js/styles/" src/` |
| AT-HLPIN-05 | Core import path used (not full bundle) | `grep -rEn "from\s+['\"]highlight\.js['\"]" src/` returns 0 (use `/lib/core` instead) |
| AT-HLPIN-06 | Exactly 11 `registerLanguage` calls | `grep -c "hljs\.registerLanguage" src/lib/highlighter/index.ts` returns `11` |
| AT-HLPIN-07 | Bundle budget enforced in CI | `grep -q "Verify highlighter bundle budget" .github/workflows/release.yml` |
| AT-HLPIN-08 | No CDN highlight.js imports | `! grep -rEn "(cdn\.jsdelivr|unpkg\.com|cdnjs\.cloudflare).*highlight" src/ index.html` |

---

## Related

**In this section:**

- [`03-syntax-highlighting.md`](./03-syntax-highlighting.md) — Resolution flow, token color map (this file pins the dependency)
- [`05-styling.md`](./05-styling.md) — Full `.hljs-*` token CSS
- [`06-constants-and-maps.md`](./06-constants-and-maps.md) — Language labels, accent colors
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — `AT-CODEBLOCKSYSTEM-01..18`

**See also:**

- [`../13-cicd-pipeline-workflows/18-wp-plugin-deploy/02-github-actions-workflow.md`](../13-cicd-pipeline-workflows/18-wp-plugin-deploy/02-github-actions-workflow.md) — Bundle-budget CI step host
- `mem://architecture/tech-stack` — Pinned dependency matrix

---

*Highlighter dependency pin — v1.0.0 — created 2026-04-25 (UTC+8) — closes audit gap F-04.*
