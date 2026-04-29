#!/usr/bin/env node
// AT-block-aware prose-MUST counter (v2 — handles heading nesting).
// A line is "in an AT block" if ANY ancestor heading (walking up through ALL
// ###/####/## levels) cites `AT-…-`. The v1 bug was stopping at the first
// heading found — but `#### Assertion contract` is a child of `### AT-WIRE-EGRESS-01`.
//
// Algorithm: maintain a stack of (level, citesAT) for the heading hierarchy.
// At every line, the line is "in an AT block" if any frame in the stack is true.
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
    if (/AT-[A-Z]+-|G-[0-9N][0-9NS]?-/.test(ln)) continue;
    if (stack.some((f) => f.citesAT)) continue;
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
console.log(`---\nTotal real prose-MUSTs (v2 nested-aware): ${total}`);
console.log(`Files with ≥1 prose-MUST: ${sorted.length}`);
