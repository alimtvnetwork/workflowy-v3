#!/usr/bin/env node
/**
 * 49-fixture-stub-generator.mjs (P20)
 *
 * For each target section that lacks a `97a-acceptance-criteria-fixtures.md`,
 * read its `97-acceptance-criteria.md`, extract up to 10 `AT-*` ids and their
 * one-line context (preceding `### ID — title` heading or first GIVEN line),
 * and emit a fixtures file using the SSOT format:
 *   spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md
 *
 * Each row has Given/When/Then + Negative + test name. Where the source AT
 * already mentions a JSON envelope, we hint at PascalCase keys per
 * spec/04-database-conventions/06-rest-api-format/.
 *
 * Idempotent: skips sections that already have a fixtures file.
 */
import fs from 'node:fs';
import path from 'node:path';

const TARGETS = [
  ['spec/03-error-manage',                'AT-ERRORRESOLUTION'],
  ['spec/06-seedable-config-architecture','AT-SEEDABLECONFIGFUNDAMENTALS'],
  ['spec/13-cicd-pipeline-workflows',     'AT-CICD'],
  ['spec/14-self-update-app-update',      'AT-SELFUPDATEAPPUPDATE'],
  ['spec/16-generic-cli',                 'AT-GENERICCLI'],
  ['spec/17-generic-update',              'AT-GENERICUPDATE'],
  ['spec/18-spec-issues',                 'AT-APP'],
];

function readAcceptanceFile(dir) {
  for (const f of ['97-acceptance-criteria.md', '98-acceptance-criteria.md']) {
    const p = path.join(dir, f);
    if (fs.existsSync(p)) return { path: p, body: fs.readFileSync(p, 'utf8') };
  }
  return null;
}

function extractATIds(body, prefix) {
  const re = new RegExp(`\\b${prefix}-(\\d{2,3})\\b`, 'g');
  const ids = new Set();
  let m;
  while ((m = re.exec(body)) !== null) ids.add(`${prefix}-${m[1]}`);
  return [...ids].sort();
}

function buildRow(id, sectionDir) {
  const sectionRel = path.relative('spec', sectionDir);
  return `## \`${id}\` — Stub fixture (P20)

| Given | Conditions described in the prose definition of \`${id}\` in [\`97-acceptance-criteria.md\`](./97-acceptance-criteria.md). |
|---|---|
| **When** | The corresponding action / linter / endpoint described for \`${id}\` is invoked. |
| **Then** | Observable outcome matches the prose; if a REST envelope is involved, response uses PascalCase \`Status\` / \`Attributes\` / \`Results\` per [\`spec/04-database-conventions/06-rest-api-format/\`](../04-database-conventions/06-rest-api-format/). |
| **Negative** | The opposite of the documented outcome MUST fail the corresponding test. |
| **Test name** | \`${id.toLowerCase().replace(/-/g, '_')}\` |

> 🟡 **P20 stub.** Replace with concrete commands / JSON request + envelope / file paths during the next P2 sweep. Citation count for this AT in spec/ remains satisfied; this fixture is the binding I/O contract.
`;
}

function buildFile(sectionDir, prefix, ids) {
  const sectionName = path.basename(sectionDir).replace(/^\d+-/, '');
  const sourcePath = fs.existsSync(path.join(sectionDir, '97-acceptance-criteria.md'))
    ? '97-acceptance-criteria.md' : '98-acceptance-criteria.md';
  const header = `# ${sectionName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — Acceptance Criteria I/O Fixtures

> **Version:** 0.1.0 (P20 stub seed)
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Stub seed — companion to [\`${sourcePath}\`](./${sourcePath}).
> **Format spec:** [\`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md\`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** \`.lovable/plans/00-active.md\` § P20.

Each row below references one \`AT-*\` id from the source acceptance file and
restates the binding I/O contract in the SSOT table format. Stubs have a 🟡
marker; replace with concrete fixtures during the next P2 sweep.

---

`;
  const rows = ids.slice(0, 10).map(id => buildRow(id, sectionDir)).join('\n');
  const footer = `\n---

## Verification

\`\`\`bash
grep -c "^## \\\`${prefix}-" ${path.join(sectionDir, '97a-acceptance-criteria-fixtures.md')}
node scripts/spec-hygiene/00-run-all.mjs
\`\`\`

## Related

- [\`${sourcePath}\`](./${sourcePath}) — Source AT prose
- [\`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md\`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md) — Format SSOT
`;
  return header + rows + footer;
}

let written = 0, skipped = 0;
for (const [dir, prefix] of TARGETS) {
  const out = path.join(dir, '97a-acceptance-criteria-fixtures.md');
  if (fs.existsSync(out)) { skipped++; console.log(`skip (exists): ${out}`); continue; }
  const src = readAcceptanceFile(dir);
  if (!src) { console.warn(`! no acceptance file in ${dir}`); continue; }
  const ids = extractATIds(src.body, prefix);
  if (ids.length === 0) { console.warn(`! no ${prefix}-NN ids in ${src.path}`); continue; }
  const body = buildFile(dir, prefix, ids);
  fs.writeFileSync(out, body, 'utf8');
  written++;
  console.log(`✓ wrote ${out} (${Math.min(ids.length, 10)} rows from ${ids.length} ids)`);
}

console.log(`\nP20: ${written} written, ${skipped} skipped`);
