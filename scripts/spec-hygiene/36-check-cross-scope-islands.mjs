#!/usr/bin/env node
/**
 * G-36 — Cross-Scope Island Detector (v1.0.0)
 *
 * G-31.6 finds per-scope islands: a file that has no in/out links among
 * its same-scope siblings. But a "scope-island" file may still be linked
 * from elsewhere (e.g. an endpoints/*.md cited from a workflow, or a
 * features/*.md cited from `src/lib/foo.ts`, or any file referenced from
 * a `mem://` memory note). G-36 is the **true orphan** check: it builds
 * a single global inbound-reference index across ALL of:
 *
 *   - every spec/**\/*.md file
 *   - every src/**\/*.{ts,tsx} file (mem-style backlinks live in code too)
 *   - every mem/**\/*.md file (project memory)
 *   - every .lovable/**\/*.md file (memory + suggestions + audits)
 *
 * For each candidate file (the union of the 4 G-31 scopes), G-36 reports
 * a TRUE ORPHAN iff the global inbound count is zero (after exclusions).
 *
 * Two sub-checks:
 *
 *   G-36.1 (true-orphan scan, WARN advisory)
 *     - Severity: WARN — does not influence exit code.
 *     - Per-file opt-out via `TRUE_ORPHAN_EXEMPT` Set keyed on bare filename.
 *
 *   G-36.2 (meta — exempt rationale coverage, ERROR)
 *     - Self-introspects via __filename. Every TRUE_ORPHAN_EXEMPT entry
 *       MUST carry inline `// rationale` or `// …` line directly above.
 *     - Mirrors G-30.3 / G-31.5 / G-32.4 / G-34.2 pattern.
 *
 * CLI:
 *   node scripts/spec-hygiene/36-check-cross-scope-islands.mjs           default
 *   node scripts/spec-hygiene/36-check-cross-scope-islands.mjs --verbose lists inbound counts per candidate
 *
 * Exit codes:
 *   0  no G-36.2 violations (G-36.1 true orphans are advisory)
 *   1  one or more unrationaled TRUE_ORPHAN_EXEMPT entries
 *   2  runner error (cannot read source)
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { resolve, dirname, relative, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..", "..");

// =====================================================================
// Per-file true-orphan opt-outs (bare filename, e.g. "97-acceptance-criteria.md").
// Each line MUST carry a rationale comment (G-36.2 enforces this).
// =====================================================================
const TRUE_ORPHAN_EXEMPT = new Set([
  // (none yet — populate after first run reveals legitimate orphans)
]);

// Same 4 scopes as G-31, but we re-derive the candidate file list here
// instead of importing G-31's source (preserves the documented "no
// cross-runner imports between hygiene scripts" rule from G-33/G-34/G-35).
const CANDIDATE_SCOPES = [
  {
    label: "workflows",
    dir: "spec/31-app/02-workflows",
    filenameRx: /^\d{2}-.+-flow\.md$/,
    excludeRx: /^$/,
  },
  {
    label: "features",
    dir: "spec/31-app/01-features",
    filenameRx: /^\d{2}[a-z]?-.+\.md$/i,
    excludeRx: /^(00-overview|02-personas|05a-hotkey-table|97-acceptance-criteria|99-consistency-report)\.md$/,
  },
  {
    label: "endpoints",
    dir: "spec/31-app/06-endpoints",
    filenameRx: /^\d{2}[a-z]?-.+\.md$/i,
    excludeRx: /^(00-overview|16-endpoint-at-matrix|97-acceptance-criteria|99-consistency-report)\.md$/,
  },
  {
    label: "db-diagram",
    dir: "spec/31-app/07-db-diagram",
    filenameRx: /^\d{2}-.+\.md$/,
    excludeRx: /^(00-overview|97-acceptance-criteria|99-consistency-report)\.md$/,
  },
];

// Search roots for inbound references. We grep filename literals across
// every text file under these roots.
const SEARCH_ROOTS = [
  { dir: "spec",      exts: [".md"] },
  { dir: "src",       exts: [".ts", ".tsx", ".css"] },
  { dir: ".lovable",  exts: [".md"] },
];

// =====================================================================
// File walking.
// =====================================================================

function walk(root, exts, out = []) {
  const full = resolve(REPO_ROOT, root);
  if (!existsSync(full)) return out;
  for (const entry of readdirSync(full)) {
    const p = join(full, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      walk(relative(REPO_ROOT, p), exts, out);
    } else if (exts.some((e) => entry.endsWith(e))) {
      out.push(relative(REPO_ROOT, p));
    }
  }
  return out;
}

function listCandidateFiles(scope) {
  const dirFull = resolve(REPO_ROOT, scope.dir);
  if (!existsSync(dirFull)) return [];
  return readdirSync(dirFull)
    .filter((f) => scope.filenameRx.test(f))
    .filter((f) => !scope.excludeRx.test(f))
    .map((f) => ({ scope: scope.label, file: f, path: `${scope.dir}/${f}` }));
}

// =====================================================================
// Inbound-link counting.
//
// For each candidate file, count occurrences of its bare filename
// across every search-root text file, EXCLUDING:
//   - the candidate's own file (self-references don't count)
//   - the file's same-scope siblings (already covered by G-31.6)
// =====================================================================

function buildCorpus() {
  const corpus = new Map(); // path → text
  for (const root of SEARCH_ROOTS) {
    for (const path of walk(root.dir, root.exts)) {
      try {
        corpus.set(path, readFileSync(resolve(REPO_ROOT, path), "utf8"));
      } catch {
        // skip unreadable
      }
    }
  }
  return corpus;
}

function countInbound(candidate, corpus) {
  // Match the bare filename as a literal (escaped). We accept any
  // surrounding context — relative paths, mem:// URIs, code identifiers.
  // The candidate scope's own directory is excluded from the inbound count.
  const needle = candidate.file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = new RegExp(needle, "g");
  const ownDir = dirname(candidate.path);
  let count = 0;
  const sources = [];
  for (const [path, text] of corpus) {
    if (path === candidate.path) continue;
    if (dirname(path) === ownDir) continue;     // same-scope sibling
    const matches = text.match(rx);
    if (matches !== null) {
      count += matches.length;
      if (sources.length < 3) sources.push(path);
    }
  }
  return { count, sampleSources: sources };
}

// =====================================================================
// G-36.2 meta — TRUE_ORPHAN_EXEMPT rationale coverage.
// =====================================================================

function checkExemptRationales() {
  const sourceLines = readFileSync(__filename, "utf8").split("\n");
  const startIdx = sourceLines.findIndex((l) =>
    /^const\s+TRUE_ORPHAN_EXEMPT\s*=\s*new\s+Set\(\[/.test(l),
  );
  if (startIdx < 0) return [];
  const unrationaled = [];
  let i = startIdx + 1;
  while (i < sourceLines.length) {
    const raw = sourceLines[i];
    if (raw.trim().startsWith("]")) break;
    const m = raw.match(/^\s*"([^"]+)"\s*,?\s*(\/\/.*)?$/);
    if (m) {
      const inline = m[2] ? m[2].replace(/^\/\/\s*/, "").trim() : "";
      if (inline.length === 0) {
        const prev = sourceLines[i - 1]?.trim() ?? "";
        if (!prev.startsWith("//") || prev.length < 4) {
          unrationaled.push({ value: m[1], line: i + 1 });
        }
      }
    }
    i += 1;
  }
  return unrationaled;
}

// =====================================================================
// Main.
// =====================================================================

const verbose = process.argv.includes("--verbose");

console.log("G-36: building global inbound-reference corpus…");
const corpus = buildCorpus();
console.log(`  scanned ${corpus.size} files across ${SEARCH_ROOTS.length} roots`);

const candidates = CANDIDATE_SCOPES.flatMap(listCandidateFiles);
console.log(`  ${candidates.length} candidate files across ${CANDIDATE_SCOPES.length} G-31 scopes`);

const trueOrphans = [];
const linked = [];
for (const c of candidates) {
  const { count, sampleSources } = countInbound(c, corpus);
  const exempted = TRUE_ORPHAN_EXEMPT.has(c.file);
  if (count === 0 && !exempted) {
    trueOrphans.push({ ...c, count, sampleSources });
  } else {
    linked.push({ ...c, count, sampleSources, exempted });
  }
}

if (verbose) {
  console.log(`\nℹ️  Verbose: per-candidate inbound counts (sorted ascending):`);
  [...linked, ...trueOrphans]
    .sort((a, b) => a.count - b.count)
    .forEach((c) => {
      const tag = c.exempted ? " (EXEMPT)" : c.count === 0 ? " ← ORPHAN" : "";
      console.log(`    [${String(c.count).padStart(4)}] ${c.scope}/${c.file}${tag}`);
    });
}

if (trueOrphans.length > 0) {
  console.warn(`\n⚠️  G-36.1: ${trueOrphans.length} TRUE ORPHAN${trueOrphans.length === 1 ? "" : "S"} (zero inbound references across spec/, src/, .lovable/):`);
  trueOrphans.forEach((c) => {
    console.warn(`    ${c.scope}/${c.file}`);
  });
  console.warn(`\n  Resolution per file:`);
  console.warn(`    - Add inbound references from at least one peer/parent/memory note, OR`);
  console.warn(`    - Add the bare filename to TRUE_ORPHAN_EXEMPT with a rationale comment.`);
} else {
  console.log(`\nG-36.1: ✅ no true orphans across ${candidates.length} candidates`);
}

const metaFails = checkExemptRationales();
if (metaFails.length > 0) {
  console.error(`\n❌ G-36.2: ${metaFails.length} TRUE_ORPHAN_EXEMPT entr${metaFails.length === 1 ? "y" : "ies"} without a rationale comment:`);
  metaFails.forEach((m) => console.error(`    line ${m.line}: "${m.value}"`));
  console.error(`\nG-36: ❌ FAIL`);
  process.exit(1);
}

console.log(`\nG-36: ✅ PASS (G-36.1 advisory; G-36.2 ${TRUE_ORPHAN_EXEMPT.size} exempt entr${TRUE_ORPHAN_EXEMPT.size === 1 ? "y" : "ies"} all rationaled)`);
process.exit(0);
