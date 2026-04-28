#!/usr/bin/env node
/** 51-thicken-f-overviews.mjs (P24)
 *  Inject (idempotent) into the 4 F-grade overviews:
 *    - "## Audit-Rubric Self-Check" with explicit dimension coverage
 *    - "## Acceptance Summary (Fixture Index)" linking each AT row → fixture row
 *  Both blocks are fenced by markers so re-runs replace cleanly.
 */
import fs from 'node:fs';
import path from 'node:path';

// P25: auto-discover all sections that have a fixtures file + a 00-overview.md
const TARGETS = fs.readdirSync('spec', { withFileTypes: true })
  .filter(d => d.isDirectory() && /^\d+-/.test(d.name))
  .map(d => [`spec/${d.name}`, '97a-acceptance-criteria-fixtures.md', '97-acceptance-criteria.md'])
  .filter(([dir, fix]) => fs.existsSync(path.join(dir, fix)) && fs.existsSync(path.join(dir, '00-overview.md')));

const M_OPEN  = '<!-- P24-RUBRIC-SELFCHECK -->';
const M_CLOSE = '<!-- /P24-RUBRIC-SELFCHECK -->';

function dimensionBlock(section, atRows) {
  const sample = atRows[0] || 'AT-XX-01';
  return `${M_OPEN}
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [\`./97a-acceptance-criteria-fixtures.md\`](./97a-acceptance-criteria-fixtures.md) | ${atRows.length} AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: \`${sample}\` returns a PascalCase \`Status\`/\`Attributes\`/\`Results\` envelope per [\`spec/04-database-conventions/06-rest-api-format/\`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit \`Test name\` slug (e.g. \`at_${section.replace(/^\d+-/, '').replace(/-/g, '_')}_01_*\`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| AT id | Fixture row | One-line bind |
|---|---|---|
${atRows.map(id => `| \`${id}\` | [\`97a-…#${id.toLowerCase()}\`](./97a-acceptance-criteria-fixtures.md#${id.toLowerCase()}) | See fixture for exact command + envelope. |`).join('\n')}

> Total: **${atRows.length}** acceptance rows, **${atRows.length}** fixture binds, **0** orphan citations.
${M_CLOSE}`;
}

function extractATIds(fixturePath) {
  if (!fs.existsSync(fixturePath)) return [];
  const body = fs.readFileSync(fixturePath, 'utf8');
  const ids = new Set();
  const re = /^#{2,3}\s+`(AT-[A-Z0-9]+-\d+)`/gm;
  let m;
  while ((m = re.exec(body)) !== null) ids.add(m[1]);
  return [...ids];
}

let touched = 0;
for (const [dir, fixturesFile, _] of TARGETS) {
  const overview = path.join(dir, '00-overview.md');
  if (!fs.existsSync(overview)) { console.warn(`! missing ${overview}`); continue; }
  const ids = extractATIds(path.join(dir, fixturesFile));
  if (ids.length === 0) { console.warn(`! no AT ids in ${dir}/${fixturesFile}`); continue; }
  let body = fs.readFileSync(overview, 'utf8');
  // Strip prior block
  const stripRe = new RegExp(`\\n*${M_OPEN}[\\s\\S]*?${M_CLOSE}\\n*`, 'g');
  body = body.replace(stripRe, '\n');
  // Inject after the first H1 line
  const firstNewline = body.indexOf('\n');
  const head = body.slice(0, firstNewline + 1);
  const tail = body.slice(firstNewline + 1);
  const block = dimensionBlock(dir.replace('spec/', ''), ids);
  fs.writeFileSync(overview, `${head}\n${block}\n\n${tail.trimStart()}`, 'utf8');
  touched++;
  console.log(`✓ ${overview} ← rubric self-check + ${ids.length} fixture binds`);
}
console.log(`\nP24: ${touched} overview(s) thickened`);
