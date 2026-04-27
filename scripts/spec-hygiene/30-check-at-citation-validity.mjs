#!/usr/bin/env node
/**
 * G-30 — AT Citation Validity Gate (v1.3.0)
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
// Prefixes in this allow-list are NEVER reported as redundant. Three
// intentional categories live here (see SSOT §G-30.2 + F27 task log):
//
//   (a) FUTURE-LICENSING — reserve a namespace for files not yet authored
//       (AT-FOO-NN is the canonical doc example).
//   (b) CONVENTION-DOCUMENTATION — the open-prefix row is retained as a
//       Coverage-Map / Open-prefix-declarations table entry that documents
//       the naming scheme even though every concrete cited ID is already
//       registered via a closed declaration elsewhere. F15 + F20 closed
//       these prefixes' citations but deliberately KEPT the prefix rows
//       (see `01-features/97-acceptance-criteria.md` v2.3.0/v2.4.0 notes
//       and the "the open-prefix declarations [...] remain (they document
//       the naming convention)" sentence after the alias tables).
//   (c) NAMESPACE-PLACEHOLDER — feature files where citations either map
//       1:1 to closed canonical AT-APP-NN rows (workflow AT-WF-* family,
//       per `02-workflows/00-overview.md` §"Open-prefix declarations") or
//       have zero current citations because the feature's ATs are housed
//       fully under a different prefix.
//
// Adding a prefix here is the documented drain mechanism for G-30.2; it
// preserves the convention-documentation value while silencing the
// advisory. To revisit, run `node scripts/spec-hygiene/30-check-at-citation-validity.mjs --warn-redundant`
// without this allow-list.
const REDUNDANCY_ALLOWLIST = new Set([
  // (a) Future-licensing — namespaces reserved for not-yet-authored files
  "AT-FOO-",          // Doc-example placeholder (02-ci-quality-gates.md)
  "AT-WORKFLOWS-",    // 02-workflows/97 future canonical index
  "AT-ROADMAP-",      // 04-roadmap/97 future canonical index
  "AT-ENDPOINTS-",    // 06-endpoints/97 future canonical index
  "AT-DBDIAGRAM-",    // 07-db-diagram/97 future canonical index

  // (b) Convention-documentation — citations 100% closed via aliases
  //     (F15 + F20 closure work) but Coverage Map rows kept on purpose
  //     in `01-features/97-acceptance-criteria.md`.
  "AT-INFO-",         // ↔ AT-INFOMODEL-NN (F15 alias closure)
  "AT-MIRROR-",       // ↔ AT-MIRRORS-NN (F15 alias closure)
  "AT-MULTI-",        // ↔ AT-MULTISELECT-NN (F20 alias closure)
  "AT-BOARD-",        // F20 identity closure
  "AT-CONCURRENCY-",  // F20 identity closure
  "AT-CTXMENU-",      // F20 identity closure
  "AT-INTERACT-",     // F20 identity closure
  "AT-LAYOUT-",       // F20 identity closure
  "AT-PAGE-",         // F20 identity closure
  "AT-ROLES-",        // F20 identity closure
  "AT-SHARE-",        // F20 identity closure
  "AT-TEMPLATES-",    // F20 identity closure
  "AT-TODAY-",        // F20 identity closure
  "AT-TRASH-",        // F20 identity closure

  // (c) Namespace-placeholder — feature files whose citations live under
  //     `AT-APP-NN` canonical (per Coverage Map dispatch rows) so the
  //     feature-prefix rows currently cite zero IDs but document the
  //     inline-prefix convention used inside their respective source files.
  "AT-MULTISELECT-",  // 12-multi-select source-file prefix (canonical: AT-APP-17..18)
  "AT-INFOMODEL-",    // 01-information-model source-file prefix (canonical: AT-APP-01..05)
  "AT-MIRRORS-",      // 09-mirrors source-file prefix (canonical: AT-APP-24)
  "AT-DV-",           // 07b-dashboard-view inline (canonical: AT-APP-68..75)
  "AT-SM-",           // 08b-sharing-mirror-interaction inline (canonical: AT-APP-76..80)
  "AT-MGP-",          // 09b-mirror-peer-group-model inline (canonical: AT-APP-58..67)
  "AT-TR-",           // 11b-trash-reaper inline (canonical: AT-APP-81..85)
  "AT-MZ-",           // 12b-multi-select-zoom inline (canonical: AT-APP-86..91)
  "AT-TPL-",          // 13b-templates-snapshot-semantics inline (canonical: AT-APP-92..96)
  "AT-OQ-",           // 14b-offline-queue inline (canonical: AT-APP-97..102)
  "AT-SR-",           // 16-search-ranking inline (canonical: AT-APP-103..107)

  // Workflow `AT-WF-*` family — every prefix is documented in
  // `02-workflows/00-overview.md` §"Open-prefix declarations" with an
  // explicit canonical `AT-APP-NN` mapping. The rows are normative
  // namespace documentation, not unresolved licenses.
  "AT-WF-MIGRATE-",   // → AT-APP-66, 67 (10-migration-execution-flow)
  "AT-WF-CREATE-",    // → AT-APP-58, 59, 62, 66, 67 (09-mirror-create-flow)
  "AT-WF-REAPER-",    // → AT-APP-81..85 (05-trash-reaper-flow)
  "AT-WF-SEARCH-",    // → AT-APP-103..107 (06-search-query-flow)
  "AT-WF-REPLAY-",    // → AT-APP-97..102 (07-sync-replay-flow)
  "AT-WF-DETACH-",    // → AT-APP-60..65 subset (08-mirror-detach-flow)
  "AT-WF-TEMPLATE-",  // → AT-APP-43..46 (02-template-application-flow)
  "AT-WF-SHARE-",     // → AT-APP-47..51 (03-share-invite-flow)
  "AT-WF-RESTORE-",   // → AT-APP-52..57 (04-trash-restore-flow)

  // Top-of-file frozen dispatch
  "AT-APP-",          // CANONICAL AT family (97-acceptance-criteria.md)
  "AT-APPF-",         // FROZEN legacy dispatch column (APP-FIX-14)
]);

const WARN_REDUNDANT = process.argv.includes("--warn-redundant")
  || process.env.G30_WARN_REDUNDANT === "1";

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
    if (REDUNDANCY_ALLOWLIST.has(prefix)) continue;
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

function printRedundancyAdvisory(redundant) {
  if (redundant.length === 0) {
    console.log("");
    console.log("  G-30.2 redundancy advisory: no cleanup candidates 🎉");
    return;
  }
  console.log("");
  console.log(
    `  G-30.2 redundancy advisory (WARN-only): ${redundant.length} open prefix(es) may be safe to remove`,
  );
  console.log("    (citations 100% covered by closed declarations OR zero usage)");
  console.log("");
  for (const r of redundant) {
    const tag = r.reason === "zero-citations"
      ? "  zero citations    "
      : `  ${String(r.citedCount).padStart(2)} cited / all closed`;
    console.log(`    ${r.prefix.padEnd(20)} ${tag}  ${r.file}`);
  }
  console.log("");
  console.log(
    "    To suppress: add the prefix to REDUNDANCY_ALLOWLIST in this runner",
  );
  console.log(
    "    (intentional future-licensing) or delete the open declaration row.",
  );
}

function main() {
  const registered = collectRegistered();
  const citations = collectCitations();
  const uniqueCited = new Set(citations.map((c) => c.id));
  const unregistered = citations.filter((c) => !isRegistered(c.id, registered));

  if (unregistered.length === 0) {
    console.log("G-30 AT citation validity:");
    console.log(`  registered AT IDs (closed):         ${registered.ids.size}`);
    console.log(`  registered open prefixes:           ${registered.openPrefixes.size}`);
    console.log(`  consumer scopes scanned:            ${CONSUMER_SCOPES.length}`);
    console.log(`  citations scanned:                  ${citations.length}`);
    console.log(`  unique cited IDs:                   ${uniqueCited.size}`);
    console.log(`  unregistered citations:             0`);
    console.log("  ✅ all citations resolve");
    if (WARN_REDUNDANT) {
      const redundant = findRedundantOpenPrefixes(registered, citations);
      printRedundancyAdvisory(redundant);
    }
    process.exit(0);
  }

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
  console.error(
    "    1) If the citation is a typo: fix the number to match a registered ID.",
  );
  console.error(
    "    2) If the AT is genuinely new: register it in the appropriate",
  );
  console.error(
    "       97-acceptance-criteria.md as `AT-APP-NN` (canonical) before citing.",
  );
  console.error(
    "    3) Never invent ad-hoc prefixes like AT-MGP-* — see APP-FIX-14.",
  );
  process.exit(1);
}

main();
