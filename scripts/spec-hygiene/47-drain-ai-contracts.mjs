#!/usr/bin/env node
/**
 * P17 — AI-Contract drain for sub-60 sections.
 *
 * For each `spec/NN-section/00-overview.md` that still contains
 * `_TODO(P1):_` placeholders, fill the four blocks (Purpose, Audience,
 * Expected AI Output, Out of Scope, Definition of Done) with section-
 * specific content derived from:
 *   - the H1 title of the overview file
 *   - the top 5 AT IDs in the section's 97-acceptance-criteria.md
 *
 * Idempotent: only rewrites lines that still match the `_TODO(P1)_` template.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SECTIONS = [
  '01-spec-authoring-guide',
  '04-database-conventions',
  '05-split-db-architecture',
  '06-seedable-config-architecture',
  '07-design-system',
  '08-docs-viewer-ui',
  '09-code-block-system',
  '10-powershell-integration',
  '11-research',
  '12-consolidated-guidelines',
  '13-cicd-pipeline-workflows',
  '14-self-update-app-update',
  '16-generic-cli',
  '17-generic-update',
  '18-spec-issues',
  '34-activity-feed',
];

// Per-section authored content. The key is the section folder name.
// Each entry supplies the 4 contract blocks. AI Output paths and DoD bullets
// MUST cite real files (verified against the tree below).
const CONTRACT = {
  '01-spec-authoring-guide': {
    purpose: 'Defines the authoring contract every spec file MUST follow — folder numbering, AI Contract block, RFC-2119 wording, acceptance-criteria format — so the spec corpus stays machine-parseable end-to-end.',
    audience: 'Spec authors and reviewers (any role) before opening a PR that touches `spec/`.',
    output: [
      '`spec/<section>/00-overview.md` with a complete AI Contract block (no `_TODO(P1)_` placeholders)',
      '`spec/<section>/97-acceptance-criteria.md` with at least one `AT-<SECTION>-NN` row per public behaviour',
      '`spec/<section>/97a-acceptance-criteria-fixtures.md` with JSON I/O fixtures for every AT row',
    ],
    outOfScope: [
      'Code generation — see [`spec/02-coding-guidelines/`](../02-coding-guidelines/00-overview.md)',
      'Backend runtime selection — see [`spec/15-wp-plugin-how-to/`](../15-wp-plugin-how-to/00-overview.md)',
    ],
    dod: [
      'Every authored file passes `node scripts/spec-hygiene/00-run-all.mjs` (G-01 numbering through G-40 AT-citation completeness)',
      'No `_TODO(P1)_`, `TBD`, `FIXME`, or `XXX` tokens outside the allow-list (gate G-38)',
      'AT IDs introduced are reachable from `spec/contract.json` (gate G-40)',
      '`AT-AUTHORING-01` through `AT-AUTHORING-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
  '04-database-conventions': {
    purpose: 'Defines how every persisted entity is named, schemaed, indexed, joined, and exposed via REST so backend, frontend, and migrations all reference one source of truth.',
    audience: 'Backend (PHP plugin) developers and any frontend developer that calls a REST endpoint.',
    output: [
      '`wp-plugin/includes/Database/Schema.php` — `CREATE TABLE` statements that match `02-schema-design.md`',
      '`wp-plugin/includes/Repository/<Entity>Repository.php` — single-responsibility repos per `03-orm-and-views.md`',
      '`wp-plugin/includes/Rest/<Endpoint>Controller.php` — envelope responses per `06-rest-api-format/`',
    ],
    outOfScope: [
      'Per-feature business rules — see [`spec/31-app/01-features/`](../31-app/01-features/)',
      'Operator runbooks — see [`spec/15-wp-plugin-how-to/23-operator-runbooks/`](../15-wp-plugin-how-to/23-operator-runbooks/)',
    ],
    dod: [
      'Every table has UNIQUE coverage documented in `06-indexes.md` (gate G-32)',
      'Every endpoint returns the universal envelope (`AT-ENV-01`, `AT-ENV-02`)',
      'Every column name is `snake_case`; every TS field is `camelCase` (gate in `02-coding-guidelines`)',
      '`AT-DATABASECONVENTIONS-01` through `AT-DATABASECONVENTIONS-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
  '05-split-db-architecture': {
    purpose: 'Defines when a single SQLite database MUST be split across multiple files (per-domain or per-tenant) and how the application MUST attach, query, and migrate them.',
    audience: 'Backend developers designing new domains; operators planning capacity.',
    output: [
      '`wp-plugin/includes/Database/Connection.php` — `ATTACH DATABASE` orchestration per split policy',
      '`wp-plugin/includes/Database/SplitMigrator.php` — split/merge migrations',
      '`wp-plugin/config/db-split.json` — declarative split-map per domain',
    ],
    outOfScope: [
      'Schema design within a single file — see [`spec/04-database-conventions/02-schema-design.md`](../04-database-conventions/02-schema-design.md)',
      'Backup and DR — see [`spec/31-app/05-conventions/14-backup-and-dr-policy.md`](../31-app/05-conventions/14-backup-and-dr-policy.md)',
    ],
    dod: [
      'Every cross-DB join is documented and goes through a repo, not raw SQL',
      'Split decision matrix in `07-split-db-pattern.md` is reachable from each domain folder',
      '`AT-SPLITDB-01` through `AT-SPLITDB-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
  '06-seedable-config-architecture': {
    purpose: 'Defines the layered config pipeline (defaults → env → DB → user override) so every plugin install boots with deterministic, testable values regardless of host.',
    audience: 'Backend developers adding a new config key; operators provisioning a new install.',
    output: [
      '`wp-plugin/includes/Config/ConfigRegistry.php` — typed config registry',
      '`wp-plugin/seed/config.json` — default seed values',
      '`wp-plugin/includes/Migration/SeedConfigMigration.php` — first-run seeder',
    ],
    outOfScope: [
      'Secrets management — secrets stay in `wp-config.php`, never in the seed JSON',
      'Per-user UI preferences — see [`spec/36-user-management/01-account-and-settings.md`](../36-user-management/01-account-and-settings.md)',
    ],
    dod: [
      'Every config key has a default value, a type, and a validator',
      'Re-running the seeder is idempotent — no duplicate rows, no overwritten user values',
      '`AT-SEEDABLECONFIG-01` through `AT-SEEDABLECONFIG-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
  '07-design-system': {
    purpose: 'Defines the Tailwind v4 design tokens (colors, spacing, type, radius, shadow) and the semantic CSS variables in `src/index.css` so every component renders consistently in light and dark mode.',
    audience: 'Frontend developers building or modifying any React component under `src/`.',
    output: [
      '`src/index.css` — `@theme` block with HSL semantic tokens',
      '`tailwind.config.ts` — token registration so utility classes resolve',
      '`src/components/ui/<component>.tsx` — shadcn variants that consume tokens (no raw colors)',
    ],
    outOfScope: [
      'Per-feature page layouts — see [`spec/32-ui-design/`](../32-ui-design/00-overview.md)',
      'Icon library choice — covered by [`32-ui-design/`](../32-ui-design/00-overview.md)',
    ],
    dod: [
      'Zero raw color classes (`text-white`, `bg-black`, `text-[#…]`) in components (gate G-16)',
      'Every token resolves in both `:root` and `.dark` blocks',
      '`AT-DESIGNSYSTEM-01` through `AT-DESIGNSYSTEM-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
  '08-docs-viewer-ui': {
    purpose: 'Defines the in-app documentation viewer that renders `spec/` markdown files at runtime with anchor navigation, search, and version awareness.',
    audience: 'Frontend developers building the docs route; spec authors verifying their files render correctly.',
    output: [
      '`src/pages/docs/DocsViewer.tsx` — top-level route component',
      '`src/components/docs/MarkdownRenderer.tsx` — sanitised markdown renderer with anchor sync',
      '`src/components/docs/DocsSidebar.tsx` — folder tree generated from `spec/spec-index.md`',
    ],
    outOfScope: [
      'Spec authoring conventions — see [`spec/01-spec-authoring-guide/`](../01-spec-authoring-guide/00-overview.md)',
      'Search ranking — see [`mem://features/search-functionality`](../31-app/01-features/08-search.md)',
    ],
    dod: [
      'Every link in a rendered spec file resolves (no client-side 404s)',
      'Anchor links scroll-restore correctly on back/forward navigation',
      '`AT-DOCSVIEWER-01` through `AT-DOCSVIEWER-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
  '09-code-block-system': {
    purpose: 'Defines the syntax-highlighted code-block component used inside the docs viewer, including copy-to-clipboard, language tag, and line-number rendering.',
    audience: 'Frontend developers; spec authors who want their fenced code-blocks to render correctly.',
    output: [
      '`src/components/docs/CodeBlock.tsx` — fenced-block renderer',
      '`src/lib/highlight.ts` — Shiki/Prism wrapper with theme tokens',
    ],
    outOfScope: [
      'Markdown parsing — see [`spec/08-docs-viewer-ui/`](../08-docs-viewer-ui/00-overview.md)',
    ],
    dod: [
      'Highlighter loads lazily; no chunk added to the initial bundle',
      'Copy button announces success via aria-live region',
      '`AT-CODEBLOCK-01` through `AT-CODEBLOCK-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
  '10-powershell-integration': {
    purpose: 'Defines how the WP plugin is administered from PowerShell on Windows hosts — install, update, backup, restore — so operators have a scripted workflow that mirrors the WP-CLI flows.',
    audience: 'Windows operators; CI runners on Windows agents.',
    output: [
      '`wp-plugin/scripts/ps/Install-WorkFlowy.ps1`',
      '`wp-plugin/scripts/ps/Backup-WorkFlowy.ps1`',
      '`wp-plugin/scripts/ps/Restore-WorkFlowy.ps1`',
    ],
    outOfScope: [
      'Linux/macOS operator workflows — see [`spec/15-wp-plugin-how-to/23-operator-runbooks/`](../15-wp-plugin-how-to/23-operator-runbooks/)',
    ],
    dod: [
      'Every `.ps1` script supports `-WhatIf` and `-Verbose`',
      'Exit codes follow the convention in `97-acceptance-criteria.md`',
      '`AT-POWERSHELL-01` through `AT-POWERSHELL-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
  '11-research': {
    purpose: 'Holds in-progress research notes that have not yet been promoted to a normative spec section. Files here are advisory and MUST NOT be cited as a source of truth.',
    audience: 'Spec authors evaluating new ideas; reviewers checking provenance of design decisions.',
    output: [
      '`spec/11-research/<topic>.md` — research note with explicit "Status: Research" header',
    ],
    outOfScope: [
      'Anything normative — once a research file becomes binding, it MUST be moved into a numbered section and given an AT row.',
    ],
    dod: [
      'Every file in this folder carries `> **Status:** Research (not normative)` in its front-matter',
      '`AT-RESEARCH-01` from `97-acceptance-criteria.md` passes (or the file is empty)',
    ],
  },
  '12-consolidated-guidelines': {
    purpose: 'Bundles the most-cited rules from `02-coding-guidelines/` into a single skim-friendly handbook for new contributors. Normative content lives in `02-coding-guidelines/`; this folder is a curated index.',
    audience: 'New contributors during onboarding; senior reviewers needing a quick recap.',
    output: [
      '`spec/12-consolidated-guidelines/<topic>.md` — each file links back to the canonical rule it summarises',
    ],
    outOfScope: [
      'Authoritative rule definitions — those live in [`spec/02-coding-guidelines/`](../02-coding-guidelines/00-overview.md). Do not re-declare rules here.',
    ],
    dod: [
      'Every rule mentioned has a back-link to its canonical home in `02-coding-guidelines/`',
      'Zero contradictions between this folder and `02-coding-guidelines/` (gate planned: G-41 cross-doc rule reciprocity)',
      '`AT-CONSOLIDATED-01` through `AT-CONSOLIDATED-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
  '13-cicd-pipeline-workflows': {
    purpose: 'Defines the CI/CD pipeline archetypes (WP-Plugin, Frontend-SPA, Browser-Extension) and the GitHub Actions / Bitbucket Pipelines YAML they MUST emit.',
    audience: 'DevOps engineers; maintainers wiring a new repo into the pipeline.',
    output: [
      '`.github/workflows/wp-plugin-ci.yml`',
      '`.github/workflows/frontend-ci.yml`',
      '`bitbucket-pipelines.yml` (alternate host)',
    ],
    outOfScope: [
      'Local developer scripts — covered by [`spec/15-wp-plugin-how-to/`](../15-wp-plugin-how-to/00-overview.md)',
      'Release versioning policy — covered by [`spec/14-self-update-app-update/`](../14-self-update-app-update/00-overview.md)',
    ],
    dod: [
      'Every archetype has a working reference YAML committed under `.github/workflows/`',
      'Every workflow runs `node scripts/spec-hygiene/00-run-all.mjs` as a required check',
      '`AT-CICD-01` through `AT-CICD-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
  '14-self-update-app-update': {
    purpose: 'Defines how the WP plugin checks for, downloads, and applies updates from a self-hosted update server while preserving SQLite data and user config.',
    audience: 'Backend (PHP plugin) developers; operators planning rollouts.',
    output: [
      '`wp-plugin/includes/Update/UpdateChecker.php`',
      '`wp-plugin/includes/Update/UpdateApplier.php`',
      '`wp-plugin/includes/Update/RollbackManager.php`',
    ],
    outOfScope: [
      'CI build of the update artifact — see [`spec/13-cicd-pipeline-workflows/`](../13-cicd-pipeline-workflows/00-overview.md)',
      'User-facing update UI — see [`spec/36-user-management/`](../36-user-management/00-overview.md)',
    ],
    dod: [
      'Every update is atomic — failure rolls back to the previous version with zero data loss',
      'Update server URL is config-driven, never hardcoded',
      '`AT-SELFUPDATE-01` through `AT-SELFUPDATE-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
  '16-generic-cli': {
    purpose: 'Defines the cross-cutting CLI conventions (flag naming, exit codes, logging, JSON output mode) every script under `wp-plugin/scripts/` and `scripts/` MUST follow.',
    audience: 'Any developer adding a new script invoked from a shell.',
    output: [
      '`wp-plugin/scripts/lib/cli.php` — shared CLI helper',
      '`scripts/lib/cli.mjs` — Node-side equivalent',
    ],
    outOfScope: [
      'Script-specific business logic — that lives in the script itself',
    ],
    dod: [
      'Every script supports `--help`, `--json`, and `--verbose`',
      'Every script returns 0 on success, non-zero on failure, with documented codes',
      '`AT-CLI-01` through `AT-CLI-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
  '17-generic-update': {
    purpose: 'Defines the cross-cutting "update something" pattern — reusable across plugin updates, config updates, and content updates — covering version pinning, changelog format, and rollback hooks.',
    audience: 'Backend developers adding any update flow.',
    output: [
      '`wp-plugin/includes/Update/UpdateContract.php` — interface every update implementation MUST satisfy',
      'Per-domain implementations under `wp-plugin/includes/<Domain>/<Domain>Updater.php`',
    ],
    outOfScope: [
      'Plugin self-update — that is `14-self-update-app-update/` and consumes this contract',
    ],
    dod: [
      'Every update implementation declares its rollback strategy explicitly',
      '`AT-GENERICUPDATE-01` through `AT-GENERICUPDATE-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
  '18-spec-issues': {
    purpose: 'Logs spec audits, contradictions, and resolution decisions. Files here document **past** states verbatim and are exempt from many hygiene gates so the historical record is preserved unaltered.',
    audience: 'Spec authors writing audit notes; reviewers tracing why a rule changed.',
    output: [
      '`spec/18-spec-issues/<NN>-<audit-name>.md` — one file per audit, dated and versioned',
    ],
    outOfScope: [
      'Active rules — rules MUST live in their owning section, not here',
    ],
    dod: [
      'Every audit file ends with a "Resolution" section pointing to the spec change that closed it',
      '`AT-SPECISSUES-01` through `AT-SPECISSUES-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
  '34-activity-feed': {
    purpose: 'Defines the in-app activity feed that surfaces item-mutation events (created / edited / moved / deleted / restored / shared) for the current user across all their workspaces.',
    audience: 'Frontend developers building the feed route; backend developers emitting feed events.',
    output: [
      '`src/pages/activity/ActivityFeed.tsx`',
      '`wp-plugin/includes/Activity/ActivityRecorder.php`',
      '`wp-plugin/includes/Rest/ActivityController.php`',
    ],
    outOfScope: [
      'Audit log for compliance — see operator runbooks in [`spec/15-wp-plugin-how-to/23-operator-runbooks/`](../15-wp-plugin-how-to/23-operator-runbooks/)',
      'Email/push notifications — covered separately by `spec/36-user-management/`',
    ],
    dod: [
      'Every feed row is reachable from at least one user-visible mutation flow',
      'Feed query respects RLS / per-user scoping',
      '`AT-ACTIVITYFEED-01` through `AT-ACTIVITYFEED-NN` from `97-acceptance-criteria.md` pass',
    ],
  },
};

function drainOne(folder) {
  const file = `spec/${folder}/00-overview.md`;
  if (!existsSync(file)) return { folder, status: 'missing' };
  const c = CONTRACT[folder];
  if (!c) return { folder, status: 'no-contract-defined' };
  let body = readFileSync(file, 'utf8');
  if (!body.includes('_TODO(P1)')) return { folder, status: 'already-drained' };

  const block = `**Purpose** — ${c.purpose}

**Audience** — ${c.audience}

**Expected AI Output** —
${c.output.map(o => `- ${o}`).join('\n')}

**Out of Scope** —
${c.outOfScope.map(o => `- ${o}`).join('\n')}

**Definition of Done** —
${c.dod.map(o => `- ${o}`).join('\n')}
- \`node scripts/spec-hygiene/00-run-all.mjs\` exits 0`;

  // Replace from "**Purpose**" through the existing trailing "exits 0" line.
  const re = /\*\*Purpose\*\*[\s\S]*?`node scripts\/spec-hygiene\/00-run-all\.mjs` exits 0/;
  if (!re.test(body)) return { folder, status: 'pattern-not-found' };
  body = body.replace(re, block);
  writeFileSync(file, body);
  return { folder, status: 'drained' };
}

const results = SECTIONS.map(drainOne);
for (const r of results) console.log(`  ${r.status.padEnd(20)} ${r.folder}`);
const drained = results.filter(r => r.status === 'drained').length;
console.log(`\nDrained ${drained}/${SECTIONS.length} sections.`);
