#!/usr/bin/env node
// G-00-ORPHAN-GATE-ID-DRIFT — surfaced by F-SCOPE-40 (NEW-12 closure, batch-37).
//
// Audit invariant: every `G-…` token cited corpus-wide MUST be either:
//   (a) Registered as a row in `spec/_GATE-REGISTRY.md` (`^| \`G-…\``), OR
//   (b) Listed in the documented allow-list below (legacy bare-numeric refs,
//       umbrella-namespace shorthand, baseline ledger names, test fixtures).
//
// This is a STANDING DRIFT GUARD: it WILL NOT shrink the registry; it catches
// new "cite-only-no-row" gates added in future PRs (the silent-gap class
// surfaced when F-SCOPE-40 found `G-38` was cited 17× but never registered).
//
// Inaugural baseline 2026-04-30: 124 tokens allow-listed (37 umbrella, 6 baseline,
// 2 test-fixture, 2 legacy-alias, 77 deprecated bare-numeric per registry §4.5).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const REG_PATH = "spec/_GATE-REGISTRY.md";
const PLACEHOLDERS = new Set(["G-NN", "G-NN-NAME", "G-DOMAIN-NN"]);
const GATE_RE = /\bG-[A-Z0-9][A-Z0-9-]*\b/g;

// Documented allow-list (do NOT shrink without a new ADR / registry §4.5 amendment).
// Categories captured for review-time grepability.
const ALLOWED = new Set([
  // Umbrella / namespace bare references (registry §4.5: deprecated bare-numeric refs)
  "G-01","G-02","G-03","G-04","G-05","G-06","G-07","G-08","G-10","G-11","G-12",
  "G-13","G-14","G-15","G-16","G-17","G-18","G-19","G-20","G-21","G-22","G-23",
  "G-25","G-26","G-27","G-28","G-29","G-30","G-31","G-32","G-33","G-34","G-35",
  "G-36","G-37","G-40",
  // Sub-rule bare references that map to existing prefix namespaces
  "G-02-15-LINE-LOGIC","G-04-DB-SPLIT-PATTERN","G-06-SEED-IDEMPOTENT",
  "G-10-BOUNDARY","G-12-LOGICAL","G-13-ADR-INDEX-CASCADE",
  "G-13-BACKLINK-EXEMPT","G-13-LEDGER-USES-SHARED-LIB",
  "G-25-SSE","G-30-AT-CITATION-VALIDITY","G-30-EXEMPTIONS",
  "G-38-AMBIGUOUS-WORDING","G-NS-ADR-COVERAGE","G-NS-LEGACY-EXEMPT",
  "G-NS-SCOPING","G-A11Y","G-AT-IO","G-TOKLC",
  // Legacy alias for G-WORDING-AMBIGUOUS-LINT (F-SCOPE-40-FOLLOWUP rename pending)
  "G-38",
  // Baseline ledger names (rows in _LEDGER-* files — by convention, not registered)
  "G-00-ADR-XLINK-SYMMETRY-BASELINE","G-00-ADR-CONSEQUENCES-XLINK-BASELINE",
  "G-00-AT-FIX-COMPANION-SHAPE-BASELINE","G-00-GRADUATION-LEDGER-CRITERION-SHAPE",
  // Test-corpus fixtures (intentional FAIL inputs for hygiene tests)
  "G-99-NONEXISTENT-DEMO","G-XX",
]);

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, acc);
    else if (e.endsWith(".md")) acc.push(full);
  }
  return acc;
}

const reg = readFileSync(REG_PATH, "utf8");
const registered = new Set();
for (const m of reg.matchAll(/^\|\s*~?~?`(G-[A-Z0-9][A-Z0-9-]*)`/gm)) registered.add(m[1]);

const cited = new Map();
for (const f of walk("spec")) {
  const lines = readFileSync(f, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const m of lines[i].matchAll(GATE_RE)) {
      if (PLACEHOLDERS.has(m[0])) continue;
      if (!cited.has(m[0])) cited.set(m[0], []);
      cited.get(m[0]).push({ file: f, line: i + 1 });
    }
  }
}

const drift = [];
for (const [tok, occs] of cited) {
  if (registered.has(tok)) continue;
  if (ALLOWED.has(tok)) continue;
  const nonRegistry = occs.filter(o => o.file !== REG_PATH);
  if (nonRegistry.length === 0) continue;
  drift.push({ tok, count: nonRegistry.length, sample: nonRegistry.slice(0, 3) });
}
drift.sort((a, b) => b.count - a.count);

console.log(`registered=${registered.size}  cited=${cited.size}  allow-listed=${ALLOWED.size}  drift=${drift.length}`);
if (drift.length === 0) {
  console.log("OK: no orphan gate-ID drift.");
  process.exit(0);
}
console.log("FAIL: cite-only-no-row gate IDs detected (silent-gap class). Either:");
console.log("  (a) register the gate in spec/_GATE-REGISTRY.md, OR");
console.log("  (b) add it to the documented ALLOWED set in this script with a category comment.");
for (const d of drift) {
  console.log(`  ${d.tok} (${d.count}×): ${d.sample.map(s => `${s.file}:${s.line}`).join(", ")}`);
}
process.exit(1);
