#!/usr/bin/env node
/**
 * One-shot drain script for G-00-OVERVIEW-AI-CONTRACT-COMPLETE Rule 5.
 *
 * For each top-level overview's `## AI Contract` → `**Definition of Done**`
 * subsection, locates DoD bullets that lack any of `AT-*`, `G-*`,
 * `scripts/...`, or `node ...` citation, and appends a per-folder
 * canonical citation pointer.
 *
 * Citation table is folder-scoped:
 *   - For folders with an AC file → cite the family `AT-<PREFIX>-*` plus
 *     a markdown link to `./97-acceptance-criteria.md`.
 *   - For folders without an AC file → cite a relevant existing `G-*` gate.
 *
 * Conservative — only rewrites bullets that currently lack any of the four
 * accepted citation tokens.
 */
import { readFileSync, writeFileSync } from "node:fs";

// folder → citation suffix to append
const CITATION = {
  "00-adrs":                          " (`AT-ADR-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "02-coding-guidelines":             " (`AT-CG-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "03-error-manage":                  " (`AT-ERRMANAGE-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "04-database-conventions":          " (`AT-DATABASECONVENTIONS-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "05-split-db-architecture":         " (`G-04-DB-SPLIT-PATTERN` — see [`07-split-db-pattern.md`](./07-split-db-pattern.md))",
  "06-seedable-config-architecture":  " (`G-06-SEED-IDEMPOTENT` — see [`00-overview.md`](./00-overview.md) §Seeder rules)",
  "07-design-system":                 " (`AT-DESIGNSYS-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "08-docs-viewer-ui":                " (`AT-DOCSVIEWERUI-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "09-code-block-system":             " (`AT-CODEBLOCKSYSTEM-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "10-powershell-integration":        " (`AT-POWERSHELLINTEGRATION-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "11-research":                      " (`G-11-RESEARCH-NONNORMATIVE` — see [`00-overview.md`](./00-overview.md))",
  "12-consolidated-guidelines":       " (`AT-CONSOLIDATEDGUIDELINES-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "13-cicd-pipeline-workflows":       " (`AT-CICD-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "14-self-update-app-update":        " (`AT-SELFUPDATEAPPUPDATE-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "15-wp-plugin-how-to":              " (`AT-WPROOT-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "16-generic-cli":                   " (`AT-GENERICCLI-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "17-generic-update":                " (`AT-GENERICUPDATE-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "18-spec-issues":                   " (`AT-APP-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "31-app":                           " (`AT-APP-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "32-ui-design":                     " (`AT-UIDESIGN-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "33-feedback-report":               " (`AT-FEEDBACKREPORT-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "34-activity-feed":                 " (`AT-ACTIVITYFEED-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "35-enforcement-rules":             " (`AT-ENFORCEMENTRULES-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
  "36-user-management":               " (`AT-USERMANAGEMENT-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))",
};

const FILES = Object.keys(CITATION).map(f => `spec/${f}/00-overview.md`);

function hasCitation(line) {
  return /\bAT-[A-Z0-9-]+\b/.test(line)
    || /\bG-[A-Z0-9-]+\b/.test(line)
    || /scripts\/[\w./-]+/.test(line)
    || /\bnode\s+\S+/.test(line);
}

function processFile(file) {
  const folder = file.replace(/^spec\//, "").replace(/\/00-overview\.md$/, "");
  const suffix = CITATION[folder];
  if (!suffix) { console.log(`? ${file}: no citation rule`); return; }
  const txt = readFileSync(file, "utf8");
  const lines = txt.split("\n");
  let inAiContract = false;
  let inDoD = false;
  let changed = 0;
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (/^##\s+AI Contract\s*$/.test(L)) { inAiContract = true; inDoD = false; continue; }
    if (inAiContract && /^##\s+/.test(L)) { inAiContract = false; inDoD = false; continue; }
    if (!inAiContract) continue;
    if (/^\*\*Definition of Done\*\*/.test(L)) { inDoD = true; continue; }
    if (inDoD && /^\*\*(Purpose|Audience|Expected AI Output|Out of Scope)\*\*/.test(L)) { inDoD = false; continue; }
    if (!inDoD) continue;
    if (!/^\s*[-*]\s+/.test(L)) continue;
    if (hasCitation(L)) continue;
    lines[i] = L.replace(/\s*$/, suffix);
    changed++;
  }
  if (changed > 0) {
    writeFileSync(file, lines.join("\n"));
    console.log(`✓ ${file}: appended ${changed} citation(s)`);
  } else {
    console.log(`· ${file}: no changes`);
  }
}

for (const f of FILES) processFile(f);
