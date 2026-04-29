#!/usr/bin/env node
// Counts prose-MUSTs that are NOT inside an AT-* fixture row block.
// An AT-* row block = lines from `### \`AT-…\`` heading until next `### ` or `## ` heading.
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

function inAtBlock(lines, idx) {
  // Walk upward to find the nearest `### ` or `## ` heading; return true if it cites AT-
  for (let i = idx; i >= 0; i--) {
    const m = lines[i].match(/^#{2,4}\s+(.+)$/);
    if (!m) continue;
    return /AT-[A-Z]+-/.test(m[1]);
  }
  return false;
}

const counts = {};
let total = 0;
for (const file of walk("spec")) {
  const lines = readFileSync(file, "utf8").split("\n");
  let n = 0;
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (!/\b(MUST|SHALL)\b/.test(ln)) continue;
    if (/AT-[A-Z]+-|G-[0-9N][0-9NS]?-/.test(ln)) continue;
    if (inAtBlock(lines, i)) continue;
    n++;
  }
  if (n > 0) { counts[file] = n; total += n; }
}

const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
for (const [f, n] of sorted.slice(0, 20)) console.log(`${n}\t${f}`);
console.log(`---\nTotal real prose-MUSTs (AT-block-aware): ${total}`);
console.log(`Files with ≥1 prose-MUST: ${sorted.length}`);
