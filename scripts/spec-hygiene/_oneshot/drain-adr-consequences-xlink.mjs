#!/usr/bin/env node
/**
 * One-shot drain script for G-00-ADR-CONSEQUENCES-XLINK ledger.
 *
 * For each of the 28 ADRs listed in the baseline allow-list, appends a
 * "Spec impact" sub-paragraph at the end of the `## Consequences` section
 * (immediately before the next H2) that contains markdown links to the
 * downstream spec/ paths suggested by the ledger.
 *
 * The runner accepts any markdown link to a non-sibling-ADR spec/ path
 * inside Consequences, so a single appended paragraph drains each entry.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// ADR-NNNN → array of { label, href }
const TARGETS = {
  "0001": [["spec/04-database-conventions/", "../04-database-conventions/"]],
  "0002": [["spec/15-wp-plugin-how-to/", "../15-wp-plugin-how-to/"]],
  "0003": [["spec/31-app/", "../31-app/"], ["spec/02-coding-guidelines/02-typescript/", "../02-coding-guidelines/02-typescript/"]],
  "0004": [["spec/04-database-conventions/06-rest-api-format/", "../04-database-conventions/06-rest-api-format/"]],
  "0005": [["spec/31-app/ (mirror peer-group)", "../31-app/"]],
  "0006": [["spec/04-database-conventions/", "../04-database-conventions/"]],
  "0007": [["spec/02-coding-guidelines/02-typescript/", "../02-coding-guidelines/02-typescript/"]],
  "0008": [["spec/31-app/ (Item interface)", "../31-app/"]],
  "0009": [["spec/31-app/ (Trash logic)", "../31-app/"]],
  "0010": [["spec/31-app/ (offline queue)", "../31-app/"]],
  "0011": [["spec/02-coding-guidelines/02-typescript/", "../02-coding-guidelines/02-typescript/"], ["spec/31-app/", "../31-app/"]],
  "0012": [["spec/32-ui-design/", "../32-ui-design/"], ["spec/07-design-system/", "../07-design-system/"]],
  "0013": [["spec/31-app/ (search)", "../31-app/"]],
  "0014": [["spec/31-app/ (sharing)", "../31-app/"]],
  "0015": [["spec/20-enums-index.md", "../20-enums-index.md"]],
  "0016": [["spec/31-app/ (SortOrder)", "../31-app/"]],
  "0017": [["spec/31-app/", "../31-app/"], ["spec/32-ui-design/", "../32-ui-design/"]],
  "0018": [["spec/31-app/", "../31-app/"], ["spec/32-ui-design/", "../32-ui-design/"]],
  "0019": [["spec/04-database-conventions/06-rest-api-format/", "../04-database-conventions/06-rest-api-format/"]],
  "0020": [["spec/31-app/", "../31-app/"], ["spec/02-coding-guidelines/02-typescript/", "../02-coding-guidelines/02-typescript/"]],
  "0021": [["spec/31-app/ (undo + offline queue)", "../31-app/"]],
  "0022": [["spec/32-ui-design/", "../32-ui-design/"]],
  "0023": [["spec/31-app/ (loaders ↔ queue)", "../31-app/"]],
  "0024": [["spec/18-spec-issues/", "../18-spec-issues/"]],
  "0025": [["spec/31-app/06-endpoints/ (SSE)", "../31-app/06-endpoints/"]],
  "0026": [["spec/04-database-conventions/", "../04-database-conventions/"], ["spec/31-app/", "../31-app/"]],
  "0027": [["spec/31-app/06-endpoints/", "../31-app/06-endpoints/"]],
  "0028": [["spec/32-ui-design/ (i18n locale)", "../32-ui-design/"]],
};

function buildSpecImpact(targets) {
  const links = targets.map(([label, href]) => `[\`${label}\`](${href})`).join(", ");
  return `\n**Spec impact** — Downstream sections affected by this decision: ${links}.\n`;
}

function processAdr(file, num) {
  const targets = TARGETS[num];
  if (!targets) return;
  const txt = readFileSync(file, "utf8");
  const lines = txt.split("\n");
  // Locate ## Consequences and the next H2.
  let start = -1, end = -1;
  for (let i = 0; i < lines.length; i++) {
    if (start === -1 && /^##\s+Consequences\s*$/.test(lines[i])) { start = i; continue; }
    if (start !== -1 && /^##\s+/.test(lines[i])) { end = i; break; }
  }
  if (start === -1) { console.log(`? ${file}: no ## Consequences`); return; }
  if (end === -1) end = lines.length;
  // Check if Spec impact already present
  const block = lines.slice(start, end).join("\n");
  if (/\*\*Spec impact\*\*/.test(block)) { console.log(`· ${file}: already has Spec impact`); return; }
  // Insert before end (preserving any trailing blank line).
  const insertion = buildSpecImpact(targets).split("\n");
  lines.splice(end, 0, ...insertion);
  writeFileSync(file, lines.join("\n"));
  console.log(`✓ ${file}: appended Spec impact (${targets.length} link(s))`);
}

const ADR_DIR = "spec/00-adrs";
for (const f of readdirSync(ADR_DIR).sort()) {
  const m = f.match(/^(\d{4})-/);
  if (!m) continue;
  processAdr(join(ADR_DIR, f), m[1]);
}
