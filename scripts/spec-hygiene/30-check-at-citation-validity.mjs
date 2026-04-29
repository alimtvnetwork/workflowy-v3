#!/usr/bin/env node
/**
 * G-30 — AT Citation Validity Gate (v1.6.0)
 *
 * v1.6.0 (F-future-G30-B) — Added **G-30.3 meta sub-check** (ERROR):
 *   every entry in `REDUNDANCY_ALLOWLIST` MUST carry a rationale comment
 *   (trailing inline `// …` or contiguous `// …` lines immediately above).
 *   Algorithm ported verbatim from G-31.5 / G-32.4. Closes the meta gap
 *   in the G-30 family — allow-list bloat is now machine-detectable.
 *   Initial run: 41 entries, 0 unrationaled (all hand-curated with intent
 *   categories during F27/F28). Negative-tested.
 *
 * v1.5.0 (F-future-G30-A) — Promoted G-30.2 redundancy from WARN→ERROR.
 *   Safe to flip because the queue has been at 0 candidates since v1.4.0
 *   default-on rollout; allow-list is stable at 41 documented entries
 *   across 3 intent-categories. Any new redundant open-prefix declaration
 *   now FAILS CI immediately (exit 1) instead of accumulating silently.
 *   The previous WARN behaviour can be restored for one-off audits via
 *   `--warn-redundant-only` flag (does not affect exit code).
 *   Opt-out (emergency CI bypass): `G30_REDUNDANT_ENFORCE=0` env var
 *   reverts to v1.4.0 WARN-only behaviour. Intended for short-lived
 *   regression-recovery windows; remove ASAP.
 *
 * v1.4.0 (F28) — Promoted G-30.2 redundancy advisory to DEFAULT-ON.
 *   Safe to flip because F27 drained the queue to 0 candidates via
 *   REDUNDANCY_ALLOWLIST expansion (5→41 entries, 3 intent-categories).
 *   Default-on surfaces ANY new redundant declaration in CI immediately
 *   instead of letting allow-list bloat accumulate silently. Still
 *   WARN-only — never affects exit code. Opt-out via
 *   `--no-warn-redundant` flag or `G30_WARN_REDUNDANT=0` env var.
 *
 * v1.3.0 (F27) — Drained the G-30.2 open-prefix redundancy queue by
 *   expanding REDUNDANCY_ALLOWLIST from 5 → 41 entries, grouped into
 *   three documented intent-categories (future-licensing, convention-
 *   documentation, namespace-placeholder). Now `--warn-redundant`
 *   reports zero candidates while preserving every Coverage Map row
 *   for naming-scheme documentation. To revisit a specific entry,
 *   delete it from the allow-list and rerun the runner.
 *
 * Asserts every `AT-*` ID cited under three consumer scopes is declared
 * in at least one markdown-table registry row across spec/31-app/**:
 *   1. spec/31-app/06-endpoints/**\/*.md
 *   2. spec/31-app/02-workflows/**\/*.md
 *   3. spec/31-app/07-db-diagram/04-feature-slices.md
 *
 * G-30.2 (v1.2.0) — open-prefix redundancy advisory:
 *   When `--warn-redundant` flag is passed (or env G30_WARN_REDUNDANT=1),
 *   prints an advisory list of `AT-FOO-NN` open-prefix declarations whose
 *   citations are *all* covered by closed declarations. WARN-only — never
 *   changes exit code. Intent: surface cleanup candidates without breaking
 *   CI on intentional future-licensing prefixes (AT-WORKFLOWS-NN, etc).
 *
 * Algorithm SSOT: spec/31-app/05-conventions/23-g30-at-citation-validity-gate.md
 *
 * Exit codes:
 *   0  clean
 *   1  ≥1 unregistered citation
 *   2  runner error
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..", "..");
const APP_ROOT = join(REPO_ROOT, "spec/31-app");

// G-30.1 — extended consumer scope.
// Each entry: { dir, label } — the gate scans every *.md in dir
// (recursively), excluding files in CONSUMER_EXCLUDED.
const CONSUMER_SCOPES = [
  { dir: join(APP_ROOT, "06-endpoints"), label: "06-endpoints" },
  { dir: join(APP_ROOT, "02-workflows"), label: "02-workflows" },
  {
    dir: join(APP_ROOT, "07-db-diagram"),
    label: "07-db-diagram",
    fileFilter: (name) => name === "04-feature-slices.md",
  },
];

const CONSUMER_EXCLUDED = new Set([
  "99-consistency-report.md",
]);

// G-30.2 — open-prefix redundancy advisory.
// MIGRATED 2026-04-29 (Task #11, Phase 2): exemption rows now live in
//   spec/01-spec-authoring-guide/_LEDGER-G-30-EXEMPTIONS.md
// per the per-(gate, path) ledger schema (see Phase-1 fixture
// spec/13-cicd-pipeline-workflows/scripts-as-spec/per-gate-path-ledger-schema.md).
// The in-source Set is now empty and reserved for emergency in-source
// additions only — the canonical source is the ledger. The G-30.3 meta
// rationale check still inspects this Set (it trivially passes when
// empty); the per-(gate, path) ledger schema enforces non-empty
// rationale via its required `rationale` column.
const G30_LEDGER_PATH = "spec/01-spec-authoring-guide/_LEDGER-G-30-EXEMPTIONS.md";

function loadG30RedundancyExemptions(ledgerPath) {
  let text;
  try { text = readFileSync(ledgerPath, "utf8"); }
  catch { return { entries: new Set(), rows: [] }; }
  const rows = [];
  const entries = new Set();
  const lineRe = /^\|\s*G-30-AT-CITATION-VALIDITY\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*$/gm;
  for (const m of text.matchAll(lineRe)) {
    const row = { gate: "G-30-AT-CITATION-VALIDITY", pathGlob: m[1].trim(), entry: m[2].trim(), rationale: m[3].trim(), addedOn: m[4].trim() };
    if (row.rationale.startsWith("Removed ")) continue;
    rows.push(row);
    entries.add(row.entry);
  }
  return { entries, rows };
}

const { entries: LEDGER_ENTRIES, rows: LEDGER_ROWS } = loadG30RedundancyExemptions(G30_LEDGER_PATH);

// Reserved for emergency in-source additions only. CANONICAL source is
// the ledger above. Adding entries here also requires a one-line `// …`
// rationale comment per G-30.3.
const REDUNDANCY_ALLOWLIST_INSOURCE = new Set([]);

// Effective allow-list = union(ledger, in-source emergency). Used by
// G-30.3 meta-check name-resolution and as the path-agnostic fallback.
const REDUNDANCY_ALLOWLIST = new Set([
  ...LEDGER_ENTRIES,
  ...REDUNDANCY_ALLOWLIST_INSOURCE,
]);

// Phase-3 path-glob matcher: minimal POSIX-glob → RegExp converter
// supporting `**` (any path), `*` (any filename segment), literal chars.
// Logic kept ≤15 lines per ADR-0007 R3.
function globToRegExp(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const pattern = escaped.replace(/\*\*/g, "::DS::").replace(/\*/g, "[^/]*").replace(/::DS::/g, ".*");
  return new RegExp(`^${pattern}$`);
}
const LEDGER_GLOBS_BY_ENTRY = new Map();
for (const r of LEDGER_ROWS) {
  if (!LEDGER_GLOBS_BY_ENTRY.has(r.entry)) LEDGER_GLOBS_BY_ENTRY.set(r.entry, []);
  LEDGER_GLOBS_BY_ENTRY.get(r.entry).push(globToRegExp(r.pathGlob));
}

// Path-aware exemption check. Returns true iff:
//   (a) entry exists in REDUNDANCY_ALLOWLIST_INSOURCE (path-agnostic), OR
//   (b) entry has ≥1 ledger row whose pathGlob matches the declaring file.
// Falls back to path-agnostic LEDGER_ENTRIES.has when declaringFile is "".
function isRedundancyExempt(entry, declaringFile) {
  if (REDUNDANCY_ALLOWLIST_INSOURCE.has(entry)) return true;
  const globs = LEDGER_GLOBS_BY_ENTRY.get(entry);
  if (!globs) return false;
  if (!declaringFile) return true;
  return globs.some((re) => re.test(declaringFile));
}

// G-30.2 advisory is DEFAULT-ON as of v1.4.0 (F28). The redundancy queue
// was drained to 0 in F27 via REDUNDANCY_ALLOWLIST expansion, so default-on
// surfaces ANY new redundant declaration immediately rather than letting
// it accumulate silently. Still WARN-only — never affects exit code.
//
// Escape hatches (rarely needed):
//   --no-warn-redundant            CLI flag suppresses advisory output
//   G30_WARN_REDUNDANT=0           env var suppresses advisory output
//   --warn-redundant               CLI flag (legacy, no-op now; default-on)
//   G30_WARN_REDUNDANT=1           env var (legacy, no-op now; default-on)
const WARN_REDUNDANT = !(
  process.argv.includes("--no-warn-redundant")
  || process.env.G30_WARN_REDUNDANT === "0"
);

// G-30.2 enforcement (v1.5.0+): redundant open prefixes now FAIL CI by
// default. Set `G30_REDUNDANT_ENFORCE=0` to revert to v1.4.0 WARN-only
// behaviour during regression-recovery windows.
const ENFORCE_REDUNDANT = process.env.G30_REDUNDANT_ENFORCE !== "0";
const WARN_ONLY_FLAG = process.argv.includes("--warn-redundant-only");

// Declaration — first table cell holds an AT-* ID, optionally backticked.
// Examples that match:
//   | `AT-APP-01` | something | source |
//   | AT-LAYOUT-01 | When... | Then... |
const RX_DECL_SINGLE = /^\|\s*`?(AT-[A-Z][A-Z0-9-]*-?\d+)`?\s*\|/gm;

// Range declarations like `AT-APPF-01..05` or `AT-APP-58..67` expand
// to every integer in [start, end]. Prefix ends with the trailing `-`
// so it never swallows leading digits.
const RX_DECL_RANGE = /`(AT-[A-Z][A-Z0-9]*(?:-[A-Z][A-Z0-9]*)*-)(\d+)\.\.(\d+)`/g;

// Open-prefix declarations like `AT-INFO-NN`, `AT-MIRROR-NN` license the
// entire numeric series under that prefix. Documented in
// `01-features/97-acceptance-criteria.md` as the "inline-prefix"
// convention (per APP-FIX-14 reconciliation).
const RX_DECL_OPEN = /`(AT-[A-Z][A-Z0-9]*(?:-[A-Z][A-Z0-9]*)*-)NN`/g;

// Citation: any backticked AT-* ID in prose, tables, or lists.
const RX_CITE = /`(AT-[A-Z][A-Z0-9-]*-?\d+)`/g;

function fail(msg, code = 2) {
  console.error(`G-30 runner error: ${msg}`);
  process.exit(code);
}

function walkMd(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      out.push(...walkMd(full));
    } else if (name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

function padToWidth(numStr, width) {
  return numStr.padStart(width, "0");
}

function collectRegistered() {
  if (!existsSync(APP_ROOT)) fail(`app spec dir missing: ${APP_ROOT}`);
  const ids = new Map();          // id -> first declaring file (relative)
  const openPrefixes = new Map(); // prefix (e.g. "AT-INFO-") -> file
  for (const file of walkMd(APP_ROOT)) {
    const content = readFileSync(file, "utf8");
    const relFile = relative(REPO_ROOT, file);

    // Single-ID declarations.
    for (const m of content.matchAll(RX_DECL_SINGLE)) {
      const id = m[1];
      if (!ids.has(id)) ids.set(id, relFile);
    }

    // Range declarations — `AT-APP-58..67` enumerated.
    for (const m of content.matchAll(RX_DECL_RANGE)) {
      const prefix = m[1];
      const start = parseInt(m[2], 10);
      const end = parseInt(m[3], 10);
      const width = Math.max(m[2].length, m[3].length);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
        continue;
      }
      for (let n = start; n <= end; n++) {
        const id = `${prefix}${padToWidth(String(n), width)}`;
        if (!ids.has(id)) ids.set(id, relFile);
      }
    }

    // Open-prefix declarations — `AT-INFO-NN` licenses the entire series.
    for (const m of content.matchAll(RX_DECL_OPEN)) {
      const prefix = m[1];
      if (!openPrefixes.has(prefix)) openPrefixes.set(prefix, relFile);
    }
  }
  return { ids, openPrefixes };
}

function isRegistered(id, registered) {
  if (registered.ids.has(id)) return true;
  for (const prefix of registered.openPrefixes.keys()) {
    if (id.startsWith(prefix) && /^\d+$/.test(id.slice(prefix.length))) {
      return true;
    }
  }
  return false;
}

function collectCitations() {
  const citations = [];
  for (const scope of CONSUMER_SCOPES) {
    if (!existsSync(scope.dir)) fail(`consumer dir missing: ${scope.dir}`);
    const files = walkMd(scope.dir).filter((full) => {
      const base = full.split("/").pop();
      if (CONSUMER_EXCLUDED.has(base)) return false;
      if (scope.fileFilter && !scope.fileFilter(base)) return false;
      return true;
    });
    for (const full of files) {
      const lines = readFileSync(full, "utf8").split("\n");
      lines.forEach((line, idx) => {
        for (const m of line.matchAll(RX_CITE)) {
          citations.push({
            id: m[1],
            file: relative(REPO_ROOT, full),
            line: idx + 1,
            scope: scope.label,
          });
        }
      });
    }
  }
  return citations;
}

// G-30.2 — open-prefix redundancy advisory.
// Returns array of { prefix, reason, citedCount, file } for open prefixes
// whose citations are 100% covered by closed declarations OR have zero
// citations. Allow-listed prefixes are filtered out.
function findRedundantOpenPrefixes(registered, citations) {
  const cited = new Set(citations.map((c) => c.id));
  const out = [];
  for (const [prefix, file] of registered.openPrefixes.entries()) {
    if (isRedundancyExempt(prefix, file)) continue;
    const citedUnder = [...cited].filter(
      (id) => id.startsWith(prefix) && /^\d+$/.test(id.slice(prefix.length)),
    );
    if (citedUnder.length === 0) {
      out.push({ prefix, reason: "zero-citations", citedCount: 0, file });
      continue;
    }
    const uncovered = citedUnder.filter((id) => !registered.ids.has(id));
    if (uncovered.length === 0) {
      out.push({
        prefix,
        reason: "all-closed-covered",
        citedCount: citedUnder.length,
        file,
      });
    }
  }
  return out;
}

function printRedundancyAdvisory(redundant, mode) {
  if (redundant.length === 0) {
    console.log("");
    console.log(`  G-30.2 redundancy (${mode}): no cleanup candidates 🎉`);
    return;
  }
  const stream = mode === "ERROR" ? console.error : console.log;
  stream("");
  stream(
    `  G-30.2 redundancy (${mode}): ${redundant.length} open prefix(es) ${
      mode === "ERROR" ? "MUST be removed" : "may be safe to remove"
    }`,
  );
  stream("    (citations 100% covered by closed declarations OR zero usage)");
  stream("");
  for (const r of redundant) {
    const tag = r.reason === "zero-citations"
      ? "  zero citations    "
      : `  ${String(r.citedCount).padStart(2)} cited / all closed`;
    stream(`    ${r.prefix.padEnd(20)} ${tag}  ${r.file}`);
  }
  stream("");
  stream(
    "    Resolution: delete the open `AT-FOO-NN` declaration row, OR add",
  );
  stream(
    "    the prefix to REDUNDANCY_ALLOWLIST in this runner with a one-line",
  );
  stream(
    "    rationale (intentional future-licensing / convention-doc / placeholder).",
  );
  if (mode === "ERROR") {
    stream("    Bypass (emergency only): G30_REDUNDANT_ENFORCE=0");
  }
}

function main() {
  const registered = collectRegistered();
  const citations = collectCitations();
  const uniqueCited = new Set(citations.map((c) => c.id));
  const unregistered = citations.filter((c) => !isRegistered(c.id, registered));

  // G-30.1 — citation validity (ERROR; primary check).
  if (unregistered.length > 0) {
    console.error("G-30 AT citation validity FAILED:");
    console.error("");
    console.error(
      `  ❌ ${unregistered.length} unregistered AT citation(s) across consumer scopes:`,
    );
    console.error("");
    for (const v of unregistered) {
      console.error(`    [${v.scope}] ${v.file}:${v.line}  ${v.id}`);
    }
    console.error("");
    console.error("  Resolution:");
    console.error("    1) If the citation is a typo: fix the number to match a registered ID.");
    console.error("    2) If the AT is genuinely new: register it in the appropriate");
    console.error("       97-acceptance-criteria.md as `AT-APP-NN` (canonical) before citing.");
    console.error("    3) Never invent ad-hoc prefixes like AT-MPG-* — see APP-FIX-14.");
    process.exit(1);
  }

  console.log("G-30 AT citation validity:");
  console.log(`  registered AT IDs (closed):         ${registered.ids.size}`);
  console.log(`  registered open prefixes:           ${registered.openPrefixes.size}`);
  console.log(`  consumer scopes scanned:            ${CONSUMER_SCOPES.length}`);
  console.log(`  citations scanned:                  ${citations.length}`);
  console.log(`  unique cited IDs:                   ${uniqueCited.size}`);
  console.log(`  unregistered citations:             0`);
  console.log("  ✅ all citations resolve");

  // G-30.2 — open-prefix redundancy (ERROR since v1.5.0; bypassable).
  const enforce = ENFORCE_REDUNDANT && !WARN_ONLY_FLAG;
  const mode = enforce ? "ERROR" : "WARN";
  let g302Violations = 0;
  if (WARN_REDUNDANT) {
    const redundant = findRedundantOpenPrefixes(registered, citations);
    printRedundancyAdvisory(redundant, mode);
    g302Violations = redundant.length;
  }

  // G-30.3 — allow-list rationale coverage (ERROR; meta sub-check, v1.6.0+).
  const unrationaled = findUnrationaledG30Entries();
  printG30RationaleReport(unrationaled);

  // Aggregate exit decision.
  const failures = [];
  if (enforce && g302Violations > 0) {
    failures.push(`G-30.2: ${g302Violations} redundant open-prefix declaration(s)`);
  }
  if (unrationaled.length > 0) {
    failures.push(`G-30.3: ${unrationaled.length} unrationaled allow-list entry/entries`);
  }
  if (failures.length > 0) {
    console.error("");
    console.error(`G-30 FAILED:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  process.exit(0);
}

// =====================================================================
// G-30.3 — Meta: every entry in REDUNDANCY_ALLOWLIST MUST carry a
// rationale comment. Parses the runner's own source; for the named
// allow-list, extracts every active string-literal entry and verifies
// rationale presence:
//   * trailing inline `// …` on the same line (preferred), OR
//   * one or more `// …` lines immediately above (no blank-line gap).
// Sample/template lines (`// "Foo → Bar"`) are skipped — those are not
// active entries, just hints for future authors.
//
// Algorithm ported verbatim from G-31.5 in
// scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs (v2.4.0)
// which was itself ported from G-32.4 in
// scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs (v4.0.0).
// =====================================================================

const G30_ALLOWLIST_NAMES = ["REDUNDANCY_ALLOWLIST"];
const G30_SELF_PATH = "scripts/spec-hygiene/30-check-at-citation-validity.mjs";

function findUnrationaledG30Entries() {
  let lines;
  try {
    lines = readFileSync(G30_SELF_PATH, "utf8").split("\n");
  } catch (e) {
    console.error(`G-30.3: cannot read self at ${G30_SELF_PATH}: ${e.message}`);
    process.exit(2);
  }
  const violations = [];

  for (const listName of G30_ALLOWLIST_NAMES) {
    const startRe = new RegExp(`^const\\s+${listName}\\s*=\\s*new\\s+Set\\(\\[`);
    let i = lines.findIndex((l) => startRe.test(l));
    if (i < 0) {
      console.error(`G-30.3: cannot find allow-list \`${listName}\` in ${G30_SELF_PATH}`);
      process.exit(2);
    }
    i += 1;

    while (i < lines.length) {
      const raw = lines[i];
      const trimmed = raw.trim();
      if (trimmed.startsWith("]")) break;

      const entryMatch = raw.match(/^\s*"([^"]+)"\s*,?\s*(\/\/.*)?$/);
      if (entryMatch) {
        const entry = entryMatch[1];
        const inlineComment = entryMatch[2];

        if (inlineComment) {
          i += 1;
          continue;
        }

        let j = i - 1;
        let hasAbove = false;
        while (j >= 0) {
          const t = lines[j].trim();
          if (t === "") break;
          if (t.startsWith("//")) {
            if (/^\/\/\s*[-=*_]{3,}\s*$/.test(t)) {
              j -= 1;
              continue;
            }
            hasAbove = true;
            break;
          }
          break;
        }

        if (!hasAbove) {
          violations.push({ listName, entry, line: i + 1 });
        }
      }

      i += 1;
    }
  }

  return violations;
}

function printG30RationaleReport(violations) {
  console.log("");
  console.log(`G-30.3 (meta, ERROR) allow-list rationale-comment coverage:`);
  console.log(`  allow-lists scanned:                ${G30_ALLOWLIST_NAMES.length} (${G30_ALLOWLIST_NAMES.join(", ")})`);
  console.log(`  entries missing rationale:          ${violations.length}`);

  if (violations.length === 0) {
    console.log(`  ✅ every allow-list entry carries a rationale (inline or above)`);
    return;
  }

  console.error("");
  console.error(`  ❌ ${violations.length} unrationaled entry/entries:`);
  for (const v of violations) {
    console.error(`    [${v.listName}] "${v.entry}"`);
    console.error(`      source:    ${G30_SELF_PATH}:${v.line}`);
  }
  console.error("");
  console.error(`  To fix: add either (a) a trailing \`// rationale\` on the same line, or`);
  console.error(`  (b) a \`// …\` comment line immediately above (no blank line in between).`);
}

main();
