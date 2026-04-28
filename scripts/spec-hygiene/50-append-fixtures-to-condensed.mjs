#!/usr/bin/env node
/** 50-append-fixtures-to-condensed.mjs (P23 follow-up)
 *  Append a "Fixtures index" block to each 00-overview-condensed.md so that
 *  the AI audit (which reads condensed when present) sees the I/O fixtures.
 */
import fs from 'node:fs';
import path from 'node:path';

const SPEC = 'spec';
const MARKER = '<!-- P23-FIXTURE-INDEX -->';

function findFixtures(dir) {
  const out = [];
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === '97a-acceptance-criteria-fixtures.md') out.push(p);
    }
  }
  walk(dir);
  return out;
}

let touched = 0;
for (const section of fs.readdirSync(SPEC)) {
  const condensed = path.join(SPEC, section, '00-overview-condensed.md');
  if (!fs.existsSync(condensed)) continue;
  const fixtures = findFixtures(path.join(SPEC, section));
  if (fixtures.length === 0) continue;
  let body = fs.readFileSync(condensed, 'utf8');
  if (body.includes(MARKER)) {
    body = body.replace(new RegExp(`\n${MARKER}[\\s\\S]*$`), '');
  }
  const blocks = fixtures.map(f => {
    const txt = fs.readFileSync(f, 'utf8');
    const slice = txt.length > 6000 ? txt.slice(0, 6000) + '\n…(truncated for audit; full file: ' + f + ')' : txt;
    return `\n### Fixtures included from \`${f}\`\n\n${slice}\n`;
  }).join('\n');
  fs.writeFileSync(condensed, `${body.trimEnd()}\n\n${MARKER}\n## Acceptance-Criteria I/O Fixtures (auto-attached by P23)\n${blocks}\n`, 'utf8');
  touched++;
  console.log(`✓ ${condensed} ← ${fixtures.length} fixture file(s)`);
}
console.log(`\nP23 attach: ${touched} condensed overview(s) updated`);
