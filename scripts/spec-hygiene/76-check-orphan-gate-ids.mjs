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
// Placeholder/skeleton tokens used in prose ("see G-NN", "G-2X family", "G-09 reserved")
// — these are NOT citations and MUST NOT count toward drift.
const PLACEHOLDERS = new Set([
  "G-NN", "G-NN-NAME", "G-DOMAIN-NN", "G-ADR-NNNN",
  "G-00-UMBRELLA-LEAVES-DESCRIBED",
  // Family/skeleton mentions in prose — see spec/31-app/05-conventions/02-ci-quality-gates.md §reserved
  "G-09", "G-2X", "G-3X", "G-26-", "G-41",
  // Bare ADR-namespace mention in §0033 examples
  "G-00-ADR", "G-28-NO",
]);
// L-09 (parser robustness): trim trailing dash from token captures
// (e.g. "G-26-style" tokenises as "G-26-" — must normalise before lookup).
const GATE_RE = /\bG-[A-Z0-9][A-Z0-9-]*\b/g;
const NORMALISE = (t) => t.replace(/-+$/, "");

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
  "G-99-NONEXISTENT-DEMO","G-XX","G-100-NONEXISTENT-DEMO","G-FOO-BAR",
  "G-99-FOO-EXEMPTIONS","G-04-DDL-EXEMPTIONS",
  // Future-CI gate names PROPOSED in AT-table "Gate" columns of
  // spec/00-adrs/97-acceptance-criteria.md — these are documentation of
  // forthcoming gates per ADR-0031 (DOC-tier → future CI promotion).
  // F-AUDIT-45-FOLLOWUP closure: cited-as-future-name, not yet a row.
  "G-15-ITEMTYPE-CANONICAL-ORDER","G-15-CHILD-RENDERING-DUALITY","G-15-ITEMTYPE-TRI-SSOT",
  "G-16-SORTORDER-STRING-SHAPE","G-16-BASE62-ALPHABET","G-16-GENERATION-RULES",
  "G-16-SINGLE-ROW-WRITE","G-16-REBALANCE-TRIGGER","G-16-NO-UNIQUE-CONSTRAINT",
  "G-16-WIRE-AND-DDL","G-16-SORTORDER-IS-STRING",
  "G-17-BOUNDARY-NAMES-CLOSED","G-17-BOUNDARY-INDEPENDENCE","G-17-FALLBACK-CONTRACT",
  "G-17-VIRTUALIZATION-THRESHOLD","G-17-VIRTUALIZER-PINNED","G-17-VIRTUALIZER-BEHAVIOR",
  "G-17-VIRTUALIZE-1000","G-17-NAMED-BOUNDARIES",
  "G-20-BRAND-MANDATORY","G-20-BOUNDARY-CONSTRUCTION","G-20-RUNTIME-SHAPE",
  "G-20-HELPER-CONTRACT","G-20-WIRE-PLAIN-STRING","G-20-SPEC-CONSISTENCY-SWEEP",
  "G-21-REDO-INVALIDATION",
  "G-23-LOADER-NO-FETCH","G-23-MIRROR-QUEUE-ATOMIC","G-23-WORKER-SOLE-EGRESS",
  "G-24-PRIVILEGE-MUTATION-GATED","G-24-PRIVILEGE-MUTATION-GATED-DRIFT",
  "G-24-ALIAS-BRIDGE-AUTHORITY","G-24-TRIAGE-BANNER-PRESENT","G-24-NO-SINGLETON-GROUPS",
  "G-25-SSE-ONLY-NO-POLL","G-25-SSE-AUTH","G-25-SSE-NEVER-ENQUEUES",
  "G-28-NO-PHYSICAL",
  // Future-CI named in scoping/glossary/auth-guide AT tables (same DOC-tier class)
  "G-NS-CORE-MEMORY-COVERAGE","G-NS-SCOPING-ADR-FOR-RECLASS","G-NS-SCOPING-INVENTORY",
  "G-AT-IO-VERBATIM-ADR-DRIFT","G-WORDING","G-13-AUDIT-RUNNER-PARITY",
  "G-13-RUNNER-NO-INVALID-REGEX-ANCHORS","G-31-EXEMPTIONS","G-32-EXEMPTIONS",
  "G-EP-COMPLETE-CLIENT-TS-REQUIRED","G-EP-BOOL-PREFIX",
  "G-05-2PC-REQUIRED","G-11-RESEARCH-NONNORMATIVE",
  "G-12-WP-DARK-SCHEME-CONTRAST","G-WF-ENUM-NO-STRING-LITERALS",
  "G-NUMBERING-NO-SKIP","G-SUBFEATURE-LETTER-ORDER","G-SUBFEATURE-PARITY-LOGGED",
  "G-SEARCH-FANOUT-NO-CROSS-DB-JOIN","G-SEARCH-FANOUT-CAP","G-SEARCH-FANOUT-MEMBERSHIP-FRESH",
  "G-DB-SCOPE-CITED","G-04-PASCAL-COLUMNS","G-CG-R-BRANDED-IDS","G-04-API-ENVELOPE-PASCAL",
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
const umbrellas = []; // [{ token, family|null }]
for (const line of reg.split("\n")) {
  const rowMatch = line.match(/^\|\s*~?~?`(G-[A-Z0-9][A-Z0-9-]*)`/);
  if (!rowMatch) continue;
  const tok = rowMatch[1];
  registered.add(tok);
  // ADR-0033: umbrella row marker `(Umbrella)` or `(Umbrella, family=X)` in Description.
  const um = line.match(/\(Umbrella(?:,\s*family=([a-z0-9-]+))?\)/i);
  if (um) umbrellas.push({ token: tok, family: um[1] ?? null });
}

// ADR-0033 §Decision: leaf-anchor file path → family mapping.
function familyOfPath(filePath) {
  if (filePath.startsWith("spec/00-adrs/")) return "adr-ratification";
  if (filePath.startsWith("spec/31-app/05-conventions/")) return "convention-drift";
  if (filePath.startsWith("spec/31-app/02-workflows/")) return "workflow";
  if (filePath.startsWith("spec/15-wp-plugin-how-to/")) return "wp-plugin";
  if (/^spec\/3[3-6]-/.test(filePath)) return "feature-spec";
  if (filePath.startsWith("spec/02-coding-guidelines/")) return "cross-cutting";
  if (filePath.startsWith("spec/35-enforcement-rules/")) return "cross-cutting";
  return null;
}

// ADR-0033 coverage check: token T is covered by umbrella U iff
//   T matches `^{U.token}-[A-Z0-9-]+$` AND (U.family === null OR U.family === familyOfPath(occurrence)).
function umbrellaCovers(tok, occurrenceFile) {
  const occFamily = familyOfPath(occurrenceFile);
  for (const u of umbrellas) {
    if (!tok.startsWith(u.token + "-")) continue;
    const leafPart = tok.slice(u.token.length + 1);
    if (!/^[A-Z0-9-]+$/.test(leafPart)) continue;
    if (u.family === null) return true; // family-agnostic umbrella
    if (occFamily && u.family === occFamily) return true;
  }
  return false;
}

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

// ADR-0033 §Decision + L-07 (AI Onboarding SSOT): historical ledger files
// describe past findings and may name gate-IDs that no longer exist or are
// pre-resolution. They are NOT spec-normative citations. Exempt their occurrences.
const LEDGER_PREFIXES = [
  "spec/AUDIT-FINDINGS-LEDGER.md",
  "spec/AMBIGUITY-LEDGER.md",
  "spec/_GATE-GRADUATION-LEDGER.md",
];
function isLedgerFile(p) {
  if (LEDGER_PREFIXES.includes(p)) return true;
  return /^spec\/_LEDGER-/.test(p) || /\/18-spec-issues\//.test(p);
}

const drift = [];
let umbrellaCovered = 0;
let ledgerExempt = 0;
for (const [tok, occs] of cited) {
  if (registered.has(tok)) continue;
  if (ALLOWED.has(tok)) continue;
  const nonRegistry = occs.filter(o => o.file !== REG_PATH);
  if (nonRegistry.length === 0) continue;
  // L-07: ledger-file occurrences are historical, not normative citations.
  const nonLedger = nonRegistry.filter(o => !isLedgerFile(o.file));
  if (nonLedger.length === 0) { ledgerExempt++; continue; }
  // ADR-0033: at least one non-ledger occurrence covered by an umbrella → token is covered.
  const covered = nonLedger.some(o => umbrellaCovers(tok, o.file));
  if (covered) { umbrellaCovered++; continue; }
  drift.push({ tok, count: nonLedger.length, sample: nonLedger.slice(0, 3) });
}
drift.sort((a, b) => b.count - a.count);

console.log(`registered=${registered.size}  cited=${cited.size}  allow-listed=${ALLOWED.size}  umbrellas=${umbrellas.length}  umbrella-covered=${umbrellaCovered}  drift=${drift.length}`);
if (drift.length === 0) {
  console.log("OK: no orphan gate-ID drift (ADR-0033 umbrella coverage active).");
  process.exit(0);
}
// ADR-0033 graduation: runner now honors umbrella coverage. Mode flips to
// HARD-FAIL once drift = 0 sustained for 7 days; current mode follows
// _GATE-GRADUATION-LEDGER.md row for G-00-ORPHAN-GATE-ID-DRIFT.
const HARD_FAIL = process.env.ORPHAN_GATE_HARD_FAIL === "1";
console.log(`${HARD_FAIL ? "FAIL" : "WARN"}: ${drift.length} cite-only-no-row gate ID(s) detected after ADR-0033 umbrella coverage applied.`);
console.log("Either:");
console.log("  (a) register the gate in spec/_GATE-REGISTRY.md, OR");
console.log("  (b) mark the parent gate as `(Umbrella)` per ADR-0033 (family= qualifier required when number-prefix is double-reserved), OR");
console.log("  (c) add it to the documented ALLOWED set in this script with a category comment.");
for (const d of drift) {
  console.log(`  ${d.tok} (${d.count}×): ${d.sample.map(s => `${s.file}:${s.line}`).join(", ")}`);
}
process.exit(HARD_FAIL ? 1 : 0);
