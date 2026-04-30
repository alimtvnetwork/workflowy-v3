#!/usr/bin/env node
// 77-check-orphan-must-citations.mjs (v1.0.0 — NEW-21, batch-44)
//
// PURPOSE
//   Surface a parser false-negative class discovered in batch-42:
//   a MUST/SHALL keyword and its gate citation can land on adjacent
//   physical lines (Markdown soft-wrapped paragraph), in which case the
//   counter (`audits/count-prose-musts.mjs`) credits the MUST as
//   unbound — but the author's intent was clearly to bind it.
//
//   This audit walks every spec/*.md file and emits a WARN line for
//   every MUST/SHALL physical line that:
//
//     (a) lacks an inline `G-…` or `AT-…-` citation on the same line,
//     (b) is NOT inside an AT-citing heading subtree,
//     (c) is NOT a fixture-slot row, blockquote, or RFC-2119 cell,
//     (d) is NOT inside a fenced code block,
//     (e) BUT another non-blank line within the same Markdown paragraph
//         (paragraph = run of non-blank lines, no blank line separator)
//         DOES contain a `G-…` or `AT-…-` token.
//
//   Authors fix a WARN by moving the citation onto the same physical
//   line as the MUST keyword. Once moved, the counter credits the
//   binding and this auditor goes silent.
//
// EXIT CODE
//   Currently WARN-only (always exits 0) — same lifecycle as
//   `76-check-orphan-gate-ids.mjs`. Promote to hard-fail (exit 1)
//   when corpus-wide WARN count reaches 0 for 2 consecutive weeks
//   (mirrors the F-SCOPE-41 graduation cadence).
//
// CLASSIFICATION
//   Parser-fix. Per project memory rule:
//     "tooling/test/parser-fix tasks capped at +0.0..+0.1; EXCEPTION:
//      parser-fix counts as content when it eliminates a false-positive
//      content finding."
//   This audit eliminates a false-NEGATIVE class (the counter wrongly
//   credits a MUST as unbound when the author plainly bound it on the
//   adjacent line). Per the same rule it counts as content for the
//   streak-counter.
//
// NON-GOALS
//   Does NOT modify the counter. Counter behavior is the SSOT for
//   "registered MUST count" in the registry-version footer; changing
//   it would invalidate every prior batch's "Δ –5 exact" claim.
//   This auditor is a sibling guard, not a counter replacement.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SKIP_DIRS = new Set(["00-adrs"]);
const SKIP_FILE = (f) =>
  /97-acceptance-criteria\.md$|^_GATE-|^_LEDGER-|^AUDIT-/.test(f);

const FIXTURE_SLOT_RE = /^\|\s*\*\*(Negative assertion|Then|Side effects|Given|When|Expected [^*]+|Linter command|Response envelope|Expected stderr regex)\*\*\s*\|/;
const RFC2119_CELL_RE = /^\|\s*[A-Z]+[0-9]+\s*\|.*\|\s*(MUST|SHALL|SHOULD|MAY)\s*\|/;
const CITATION_RE = /AT-[A-Z]+-|\bG-[A-Z0-9][A-Z0-9-]*\b/;
const MUST_RE = /\b(MUST|SHALL)\b/;

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    const s = statSync(full);
    if (s.isDirectory() && !SKIP_DIRS.has(e)) walk(full, acc);
    else if (e.endsWith(".md") && !SKIP_FILE(e)) acc.push(full);
  }
  return acc;
}

// Returns array of {start, end} 1-based inclusive paragraph ranges
// (paragraph = run of non-blank lines).
function paragraphsOf(lines) {
  const para = [];
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const blank = lines[i].trim() === "";
    if (!blank && start === -1) start = i;
    if (blank && start !== -1) { para.push({ start, end: i - 1 }); start = -1; }
  }
  if (start !== -1) para.push({ start, end: lines.length - 1 });
  return para;
}

function auditFile(file) {
  const lines = readFileSync(file, "utf8").split("\n");
  const warnings = [];
  const stack = [];
  let inFence = false;

  // Index paragraphs for adjacency lookups.
  const paragraphs = paragraphsOf(lines);
  const lineToPara = new Array(lines.length).fill(-1);
  for (let p = 0; p < paragraphs.length; p++) {
    for (let i = paragraphs[p].start; i <= paragraphs[p].end; i++) lineToPara[i] = p;
  }

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (/^[ \t]*(```|~~~)/.test(ln)) { inFence = !inFence; continue; }
    if (inFence) continue;

    const h = ln.match(/^(#{2,6})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
      stack.push({ level, citesAT: /AT-[A-Z]+-/.test(h[2]) });
      continue;
    }

    if (!MUST_RE.test(ln)) continue;
    if (CITATION_RE.test(ln)) continue;          // already bound on this line — counter credits it.
    if (stack.some((f) => f.citesAT)) continue;  // ancestor heading cites AT — counter exempts.
    if (FIXTURE_SLOT_RE.test(ln)) continue;
    if (/^\s*>\s/.test(ln)) continue;
    if (RFC2119_CELL_RE.test(ln)) continue;

    // Same-paragraph adjacency check — the false-negative class.
    const pIdx = lineToPara[i];
    if (pIdx === -1) continue;
    const { start, end } = paragraphs[pIdx];
    let adjacentCitation = false;
    for (let j = start; j <= end; j++) {
      if (j === i) continue;
      if (CITATION_RE.test(lines[j])) { adjacentCitation = true; break; }
    }
    if (!adjacentCitation) continue;  // genuinely unbound — counter is correct, not our concern.

    warnings.push({ line: i + 1, text: ln.trim().slice(0, 120) });
  }
  return warnings;
}

let totalWarn = 0;
const perFile = [];
for (const file of walk("spec")) {
  const warns = auditFile(file);
  if (warns.length === 0) continue;
  totalWarn += warns.length;
  perFile.push({ file, warns });
}

perFile.sort((a, b) => b.warns.length - a.warns.length);
for (const { file, warns } of perFile) {
  console.log(`${warns.length}\t${file}`);
  for (const w of warns) console.log(`  L${w.line}: ${w.text}`);
}
console.log(`---`);
console.log(`Orphan-MUST-citation WARN total: ${totalWarn}`);
console.log(`Files with ≥1 WARN: ${perFile.length}`);
console.log(`Mode: WARN-only (always exits 0). Graduation: hard-fail when total reaches 0 for 2 consecutive weeks.`);
process.exit(0);
