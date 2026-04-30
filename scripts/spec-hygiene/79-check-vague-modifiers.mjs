#!/usr/bin/env node
// G-LINT-VAGUE-MODIFIERS — F-SPEC-14 enforcement
//
// Scans spec/ for the 15 forbidden vague modifiers defined in
// spec/19-glossary.md §Forbidden Vague Modifiers and reports per-file hit
// counts so the F-AUDIT-44 burndown can proceed against measured ground
// truth instead of the prior ~94-file estimate.
//
// Mode:
//   • Default          → REPORT (exit 0; print per-file inventory)
//   • --block-new      → fail if any HIT LINE was authored on/after BLOCK_NEW_DATE
//                        (per-line `git blame --porcelain` commit-time check; falls
//                        back to file mtime when blame is unavailable, e.g. untracked
//                        files or shallow clones — fallback emits a WARN to stderr).
//   • --block-all      → fail on any hit (graduation target).
//
// Rationale (2026-04-30 enhancement, NEW-13-FOLLOWUP-tail):
//   The previous --block-new used file mtime, which mis-flagged files where a
//   legacy hit survived but an unrelated edit (typo fix, format) bumped mtime
//   above BLOCK_NEW_DATE. Per-line git-blame anchors the cut-off to the actual
//   line-of-introduction, so legacy hits remain warn-existing while NEW
//   accretion (post-cutoff commits) hard-fails. Drift = 0 today; this guard
//   prevents future regression at the smallest meaningful granularity.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, relative } from "node:path";

const ROOT = "spec";
const BLOCK_NEW_DATE = new Date("2026-04-30T00:00:00Z");
const MODE = process.argv.includes("--block-all")
  ? "block-all"
  : process.argv.includes("--block-new")
  ? "block-new"
  : "report";

const TERMS = [
  "appropriate", "reasonable", "fast", "efficient", "proper",
  "suitable", "good", "better", "nice", "optimal",
  "robust", "scalable", "secure", "simple", "modern",
];
// Multi-word phrases handled separately
const PHRASES = ["handle gracefully", "as needed", "if needed"];

const FILE_EXEMPT = new Set([
  "spec/19-glossary.md",
  "spec/_GATE-REGISTRY.md",
  "spec/AUDIT-FINDINGS-LEDGER.md",
  "spec/AMBIGUITY-LEDGER.md",
  "spec/00-ai-onboarding-ssot.md",
]);
const DIR_EXEMPT_PREFIXES = [
  "spec/18-spec-issues/",
  "spec/00-adrs/", // ADRs cite forbidden terms when documenting historical findings
];

// Standing cohort exemptions — see glossary §Forbidden Vague Modifiers
const COHORT_PATTERNS = [
  /\/\/\s*[✅❌]\s*(GOOD|BAD|Good|Bad)/,        // Paired-example markers TS/JS
  /--\s*[✅❌]\s*(GOOD|BAD|Good|Bad)/,           // SQL paired markers
  /#\s*[✅❌]\s*(GOOD|BAD|Good|Bad)/,            // Python/PowerShell markers
  /\bfail-fast\b/i,                               // CI keyword (case-insensitive: "Fail-fast" in headings)
  /\bproper\s+(enum|enums|type)s?\b/,             // TS rule name
  /\bSimple\b/,                                   // Tier name (capitalized)
  /\b(short|fast)\s+mode\b/,                      // Test runner flag
  /`Modern`/,                                     // WP admin scheme
  /\bmodern\s+(navigator|fetch|AbortController|URL|crypto)/,  // API descriptors
  /\bself-(sufficient|contained|explanatory)\b/,  // Self-defining compounds
  /^\s{0,3}#{2,4}\s.*\b(Graceful|Simple|Robust|Modern)\b/,    // Named §-headings
  /\*\*(Why|Rationale|Motivation|Background|Context):\*\*/,   // Motivation lead-in (line-level skip)
  /^\s*##?\s+(Background|Context|Motivation|Rationale)\b/,    // Section header
  /\bAdded\b|\bFixed\b|\bChanged\b|\bDeprecated\b|\bRemoved\b|\bSecurity\b(?=\s*$|\s*\|)/, // Changelog subsection
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".md")) out.push(p);
  }
  return out;
}

function isFileExempt(rel) {
  if (FILE_EXEMPT.has(rel)) return true;
  return DIR_EXEMPT_PREFIXES.some((p) => rel.startsWith(p));
}

function isLineExempt(line) {
  if (line.includes("vague-exempt:")) return true;
  return COHORT_PATTERNS.some((re) => re.test(line));
}

function stripBackticked(line) {
  // Remove inline `...` and ```...``` content so backtick-wrapped terms
  // are excluded from the search.
  return line.replace(/`[^`]*`/g, "");
}

function scanFile(absPath) {
  const rel = relative(".", absPath);
  if (isFileExempt(rel)) return null;

  const content = readFileSync(absPath, "utf8");
  const lines = content.split("\n");
  const hits = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (/^\s*```/.test(raw)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (isLineExempt(raw)) continue;

    const stripped = stripBackticked(raw);
    const lower = stripped.toLowerCase();

    for (const phrase of PHRASES) {
      if (lower.includes(phrase)) hits.push({ line: i + 1, term: phrase });
    }
    for (const term of TERMS) {
      const re = new RegExp(`\\b${term}\\b`, "i");
      if (re.test(stripped)) hits.push({ line: i + 1, term });
    }
  }
  return hits.length ? { rel, hits } : null;
}

const files = walk(ROOT);
const results = files.map(scanFile).filter(Boolean);

const totalHits = results.reduce((s, r) => s + r.hits.length, 0);
const totalFiles = results.length;

// Sort by hit count desc for batch prioritization
results.sort((a, b) => b.hits.length - a.hits.length);

console.log(`G-LINT-VAGUE-MODIFIERS scan — mode=${MODE}`);
console.log(`Files with hits: ${totalFiles}`);
console.log(`Total occurrences: ${totalHits}`);
console.log("");
console.log("Top-30 files by hit count (burndown priority):");
for (const r of results.slice(0, 30)) {
  console.log(`  ${r.hits.length.toString().padStart(4)}  ${r.rel}`);
}

if (MODE === "block-all" && totalHits > 0) {
  console.error(`\n❌ G-LINT-VAGUE-MODIFIERS: ${totalHits} occurrences in ${totalFiles} files`);
  process.exit(1);
}
if (MODE === "block-new") {
  const cutoffSec = Math.floor(BLOCK_NEW_DATE.getTime() / 1000);
  const newOffenders = [];
  let blameWarnedFiles = 0;
  for (const r of results) {
    const lineNumbers = r.hits.map((h) => h.line);
    const newHitLines = blameNewLines(r.rel, lineNumbers, cutoffSec);
    if (newHitLines === null) { blameWarnedFiles++; continue; }
    if (newHitLines.length > 0) {
      newOffenders.push({ rel: r.rel, lines: newHitLines, hits: r.hits });
    }
  }
  if (blameWarnedFiles > 0) {
    console.error(`⚠ git-blame unavailable for ${blameWarnedFiles} file(s) — fell back to file mtime gate (set GIT_DIR or run inside a git checkout to enable per-line accuracy)`);
  }
  if (newOffenders.length > 0) {
    console.error(`\n❌ G-LINT-VAGUE-MODIFIERS (block-new, per-line git-blame): ${newOffenders.length} file(s) with HIT LINES authored ≥${BLOCK_NEW_DATE.toISOString().slice(0,10)}`);
    for (const o of newOffenders) {
      const sample = o.hits.filter((h) => o.lines.includes(h.line)).slice(0, 3)
        .map((h) => `L${h.line}:${h.term}`).join(", ");
      console.error(`  ${o.rel}  (${o.lines.length} new hit-line(s): ${sample}${o.lines.length > 3 ? ", …" : ""})`);
    }
    process.exit(1);
  }
  console.log("\n✓ block-new: no hit lines authored on/after cutoff (per-line git-blame).");
}
process.exit(0);

/**
 * Return the subset of `lineNumbers` whose blame author-time is ≥ cutoffSec.
 * Returns `null` when git-blame is unavailable (untracked file, no git, etc.) —
 * caller falls back to mtime-based check and emits a WARN.
 */
function blameNewLines(relPath, lineNumbers, cutoffSec) {
  if (lineNumbers.length === 0) return [];
  try {
    // Build one `-L N,N` per hit line; --porcelain emits `author-time <epoch>`
    // per blamed chunk. Single subprocess per file keeps overhead linear.
    const lArgs = lineNumbers.flatMap((n) => ["-L", `${n},${n}`]);
    const out = execFileSync("git", ["blame", "--porcelain", ...lArgs, "--", relPath], {
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    });
    return parseBlamePorcelain(out, lineNumbers, cutoffSec);
  } catch {
    // Fallback: file mtime (legacy behavior, less precise)
    try {
      const mtimeSec = Math.floor(statSync(relPath).mtime.getTime() / 1000);
      return mtimeSec >= cutoffSec ? lineNumbers : [];
    } catch { return null; }
  }
}

/**
 * Parse `git blame --porcelain` output. Each commit-block starts with a header
 * `<sha> <orig-line> <final-line> <num-lines>`. `author-time <epoch>` follows.
 * Returns line numbers whose author-time ≥ cutoffSec.
 */
function parseBlamePorcelain(out, requestedLines, cutoffSec) {
  const newLines = [];
  const lines = out.split("\n");
  let curFinalLine = null;
  let curAuthorTime = null;
  for (const ln of lines) {
    const header = ln.match(/^[0-9a-f]{40}\s+\d+\s+(\d+)(?:\s+\d+)?$/);
    if (header) { curFinalLine = parseInt(header[1], 10); continue; }
    const at = ln.match(/^author-time\s+(\d+)$/);
    if (at) { curAuthorTime = parseInt(at[1], 10); continue; }
    if (ln.startsWith("\t") && curFinalLine !== null && curAuthorTime !== null) {
      if (requestedLines.includes(curFinalLine) && curAuthorTime >= cutoffSec) {
        newLines.push(curFinalLine);
      }
      curFinalLine = null; curAuthorTime = null;
    }
  }
  return newLines;
}
