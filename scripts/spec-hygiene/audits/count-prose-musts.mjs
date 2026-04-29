#!/usr/bin/env node
// AT-block-aware prose-MUST counter (v3 — handles heading nesting + fixture slots).
// A line is "in an AT block" if ANY ancestor heading (walking up through ALL
// ###/####/## levels) cites `AT-…-`. v1 bug: stopped at first heading found
// (sub-headings shadowed AT parent). v3 adds: skip canonical fixture-table
// slot rows (already AT-shaped per format SSOT) + skip blockquote citations.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SKIP_DIRS = new Set(["00-adrs"]);
const SKIP_FILE = (f) => /97-acceptance-criteria\.md$|^_GATE-|^_LEDGER-|^AUDIT-/.test(f);

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    const s = statSync(full);
    if (s.isDirectory() && !SKIP_DIRS.has(e)) walk(full, acc);
    else if (e.endsWith(".md") && !SKIP_FILE(e)) acc.push(full);
  }
  return acc;
}

// v3 exclusions (2026-04-29, F-SCOPE-05):
//   (a) Fixture-table slot rows: `| **Negative assertion** |`, `| **Then** |`,
//       `| **Side effects** |`, `| **Given** |`, `| **When** |`, `| **Expected …** |`
//       — these ARE the AT-shaped form per 19-acceptance-criteria-io-table.md SSOT.
//   (b) Blockquoted lines (`> …`): citations of other docs, not new MUSTs.
const FIXTURE_SLOT_RE = /^\|\s*\*\*(Negative assertion|Then|Side effects|Given|When|Expected [^*]+|Linter command|Response envelope|Expected stderr regex)\*\*\s*\|/;

function countFile(file) {
  const lines = readFileSync(file, "utf8").split("\n");
  const stack = []; // {level, citesAT}
  let n = 0;
  for (const ln of lines) {
    const h = ln.match(/^(#{2,6})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
      stack.push({ level, citesAT: /AT-[A-Z]+-/.test(h[2]) });
      continue;
    }
    if (!/\b(MUST|SHALL)\b/.test(ln)) continue;
    // v4 (F-SCOPE-06): gate ids appear in bare form (G-40, G-22, G-N1, G-NS-SCOPING-01)
    // — terminator is word-boundary, not a literal `-`. Old regex `G-[0-9N][0-9NS]?-`
    // required trailing dash and missed ~888 corpus-wide bare-form citations.
    if (/AT-[A-Z]+-|\bG-[0-9N][0-9NS-]*\b/.test(ln)) continue;
    if (stack.some((f) => f.citesAT)) continue;
    if (FIXTURE_SLOT_RE.test(ln)) continue;
    if (/^\s*>\s/.test(ln)) continue;
    n++;
  }
  return n;
}

const counts = {};
let total = 0;
for (const file of walk("spec")) {
  const n = countFile(file);
  if (n > 0) { counts[file] = n; total += n; }
}

const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
for (const [f, n] of sorted.slice(0, 15)) console.log(`${n}\t${f}`);
console.log(`---\nTotal real prose-MUSTs (v4 nested + fixture-slot + bare-gate aware): ${total}`);
console.log(`Files with ≥1 prose-MUST: ${sorted.length}`);
