#!/usr/bin/env node
// AT-block-aware prose-MUST counter (v7 — handles heading nesting + fixture slots
// + bare gate citations (numeric AND alphabetic prefixes) + RFC-2119 priority cells
// + fenced-code-block skip).
// A line is "in an AT block" if ANY ancestor heading (walking up through ALL
// ###/####/## levels) cites `AT-…-`. v3 added fixture-slot/blockquote skips,
// v4 added bare-form gate citations, v5 added RFC-2119 priority cells, v6
// (F-SCOPE-08) broadened bare-form gate regex to accept alphabetic prefixes
// like `G-A4-…`, `G-ERR-…`, `G-UPD-…`, `G-SPLIT-…`. v7 (F-SCOPE-11) skips
// fenced code blocks (```/~~~) — code/ASCII-art/figures are not prose claims.
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
  let inFence = false;
  let n = 0;
  for (const ln of lines) {
    // v7 (F-SCOPE-11, batch-8): skip fenced code blocks. Lines inside ```…```
    // (any info-string) are CODE/EXAMPLES/FIGURES, not prose normative claims.
    // Triple-backtick (or triple-tilde) toggles state. Heading detection still
    // skipped while inside a fence — fences cannot contain real headings.
    const fence = /^[ \t]*(```|~~~)/.test(ln);
    if (fence) { inFence = !inFence; continue; }
    if (inFence) continue;
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
    // v6 (F-SCOPE-08, batch-5): gate ids may also start with alphabetic domain prefixes
    // (e.g. G-A4-STREAM-SEPARATION, G-ERR-02, G-UPD-01, G-SPLIT-03). Old class
    // `[0-9N][0-9NS-]*` rejected these. Broadened to `[A-Z0-9][A-Z0-9-]*` (ASCII).
    if (/AT-[A-Z]+-|\bG-[A-Z0-9][A-Z0-9-]*\b/.test(ln)) continue;
    if (stack.some((f) => f.citesAT)) continue;
    if (FIXTURE_SLOT_RE.test(ln)) continue;
    if (/^\s*>\s/.test(ln)) continue;
    // v5 (F-SCOPE-07): RFC-2119 priority cells in requirements matrix
    // (`| F1 | requirement | MUST |`). Per RFC-2119 these are tag-style priority
    // markers in a tabular requirements convention, not prose normative claims.
    if (/^\|\s*[A-Z]+[0-9]+\s*\|.*\|\s*(MUST|SHALL|SHOULD|MAY)\s*\|/.test(ln)) continue;
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
console.log(`---\nTotal real prose-MUSTs (v6 + alphabetic-prefix gate-aware): ${total}`);
console.log(`Files with ≥1 prose-MUST: ${sorted.length}`);
