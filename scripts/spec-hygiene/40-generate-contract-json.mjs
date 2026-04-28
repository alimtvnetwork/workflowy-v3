#!/usr/bin/env node
/**
 * P6 — Machine-readable contract.json generator.
 *
 * Walks the entire spec/ tree and emits spec/contract.json — the single
 * authoritative index every downstream tool (PHP route generator, TS
 * client, AI walkthrough P9, audit re-runner P10) reads to discover:
 *
 *   - acceptance_tests : every AT-XXX-NN id with its source file + line
 *   - endpoints        : every EP-XXX with HTTP method, path, source file
 *   - enums            : every named enum with its source spec + values
 *   - sections         : every top-level spec/NN-* folder with overview path
 *
 * Output is GENERATED — do not hand-edit. Re-run after any spec edit.
 *
 * Exit 0 when written cleanly; exit 1 on duplicate id collisions.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "spec";
const OUTPUT = "spec/contract.json";

// --- AT extraction -----------------------------------------------------
// P13 fixes:
//   (1) ID column may be wrapped in backticks (`AT-APP-01`) — the canonical pattern.
//   (2) Many sections define ATs as H3 narrative headings: `### AT-CICD-01 — Title`.
const AT_TABLE_ROW = /^\|\s*`?(AT-[A-Z][A-Z0-9]*-\d+)`?\s*\|\s*([^|]+?)\s*\|/;
const AT_HEADING = /^#{2,4}\s+(AT-[A-Z][A-Z0-9]*-\d+)\s+[—-]\s+(.+?)\s*$/;
const AT_INLINE = /\b(AT-[A-Z][A-Z0-9]*-\d+)\b/g;

// P13: documentation-only IDs that are intentionally cited but never need a definition.
//   - APPF-NN: legacy frozen dispatch index (per APP-FIX-14 reconciliation note).
//   - APP-200, MPG-58: deliberately bad illustrative citations in G-30 gate doc.
//   - FIX-01: planned hygiene-gate name, not an acceptance test.
const AT_ALLOW_ORPHAN = /^AT-(APPF-\d+|APP-200|MPG-58|FIX-01)$/;

// --- EP extraction (## EP-XXX — METHOD `path`) -------------------------
const EP_HEADING = /^##\s+(EP-[A-Z][A-Z0-9-]*)\s+[—-]\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+`?([^`\n]+?)`?\s*$/;

// --- Enum extraction (table rows in 20-enums-index.md) -----------------
const ENUM_INDEX = "spec/20-enums-index.md";

const acceptanceTests = new Map();
const endpoints = new Map();
const enums = new Map();
const sections = [];
const collisions = [];

function walk(dir, visit) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, visit);
      continue;
    }
    if (full.endsWith(".md")) visit(full);
  }
}

function isCanonicalACFile(p) {
  return /\/9[78]-acceptance-criteria\.md$/.test(p);
}

function recordAT(id, definition, file, line) {
  const prev = acceptanceTests.get(id);
  if (prev && prev.definedIn && prev.definedIn !== file) {
    // Prefer the canonical 97/98-acceptance-criteria.md as the authoritative definition.
    const prevCanonical = isCanonicalACFile(prev.definedIn);
    const newCanonical = isCanonicalACFile(file);
    if (prevCanonical && !newCanonical) {
      prev.citedIn.push({ file, line });
      return;
    }
    if (!prevCanonical && newCanonical) {
      prev.citedIn.push({ file: prev.definedIn, line: prev.definedLine });
      prev.definedIn = file;
      prev.definedLine = line;
      prev.definition = definition;
      return;
    }
    collisions.push(`AT collision: ${id} defined in ${prev.definedIn}:${prev.definedLine} AND ${file}:${line}`);
    return;
  }
  if (prev) {
    prev.definition = definition;
    prev.definedIn = file;
    prev.definedLine = line;
    return;
  }
  acceptanceTests.set(id, { id, definition, definedIn: file, definedLine: line, citedIn: [] });
}

function citeAT(id, file, line) {
  const rec = acceptanceTests.get(id);
  if (!rec) {
    acceptanceTests.set(id, { id, definition: null, definedIn: null, definedLine: null, citedIn: [{ file, line }] });
    return;
  }
  if (rec.definedIn === file) return;
  rec.citedIn.push({ file, line });
}

function recordEP(id, method, path, file, line) {
  if (endpoints.has(id)) {
    const prev = endpoints.get(id);
    if (prev.definedIn !== file) {
      collisions.push(`EP collision: ${id} in ${prev.definedIn} AND ${file}`);
    }
    return;
  }
  endpoints.set(id, { id, method, path: path.trim(), definedIn: file, definedLine: line });
}

walk(ROOT, (file) => {
  if (file.includes("/_archive") || file.endsWith("/spec-index.md")) return;
  // Skip template/example files: they intentionally reference existing AT ids as illustrations.
  if (file.includes("/01-spec-authoring-guide/") && /(template|example|fixtures)\.md$/i.test(file)) return;
  if (file.endsWith("/97a-acceptance-criteria-fixtures.md")) return;
  if (file.endsWith("/spec/97a-acceptance-criteria-fixtures.md")) return;
  // P13 fix: P11-generated condensed overviews include the canonical AC table verbatim.
  // They are derived artifacts — never definition sites. Skip for AT detection,
  // but do allow citation collection (orphan tracking still works correctly).
  if (file.endsWith("/00-overview-condensed.md")) return;
  const rel = relative(".", file);
  const lines = readFileSync(file, "utf8").split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const at = AT_TABLE_ROW.exec(line);
    if (at) {
      recordAT(at[1], at[2].trim(), rel, i + 1);
    } else {
      AT_INLINE.lastIndex = 0;
      let m;
      while ((m = AT_INLINE.exec(line)) !== null) {
        citeAT(m[1], rel, i + 1);
      }
    }

    const ep = EP_HEADING.exec(line);
    if (ep) recordEP(ep[1], ep[2], ep[3], rel, i + 1);
  }
});

// --- Enum extraction --------------------------------------------------
// Enums in spec/20-enums-index.md are listed as table rows:
//   | `EnumName` | `Case1`, `Case2`, ... | description |
const ENUM_ROW = /^\|\s*`([A-Z][A-Za-z0-9_]+(?:Type)?)`\s*\|\s*([^|]+?)\s*\|/;
try {
  const enumLines = readFileSync(ENUM_INDEX, "utf8").split("\n");
  for (let i = 0; i < enumLines.length; i++) {
    const m = ENUM_ROW.exec(enumLines[i]);
    if (!m) continue;
    const name = m[1];
    if (name.length < 3) continue;
    const valuesCell = m[2];
    // pull every backticked token from the values cell
    const values = [...valuesCell.matchAll(/`([A-Za-z][A-Za-z0-9_]*)`/g)].map((x) => x[1]);
    if (values.length === 0) continue;
    if (!enums.has(name)) {
      enums.set(name, { name, definedIn: ENUM_INDEX, definedLine: i + 1, values });
    }
  }
} catch {
  // enums file optional
}

// --- Sections --------------------------------------------------------
for (const entry of readdirSync(ROOT)) {
  const full = join(ROOT, entry);
  if (!statSync(full).isDirectory()) continue;
  if (!/^\d{2}/.test(entry)) continue;
  const overview = join(full, "00-overview.md");
  let title = entry;
  try {
    const first = readFileSync(overview, "utf8").split("\n").find((l) => l.startsWith("# "));
    if (first) title = first.replace(/^#\s+/, "").trim();
  } catch {
    // overview missing
  }
  sections.push({ slug: entry, title, overview: relative(".", overview) });
}
sections.sort((a, b) => a.slug.localeCompare(b.slug));

// --- Validation ------------------------------------------------------
const orphanCitations = [];
for (const [id, rec] of acceptanceTests) {
  if (!rec.definedIn && rec.citedIn.length > 0) {
    orphanCitations.push({ id, citedIn: rec.citedIn });
  }
}

// --- Emit ------------------------------------------------------------
const today = new Date().toISOString().slice(0, 10);
const contract = {
  $schema: "https://workflowy.local/spec/contract.schema.json",
  generated_at: today,
  generator: "scripts/spec-hygiene/40-generate-contract-json.mjs",
  do_not_edit: true,
  counts: {
    acceptance_tests_defined: [...acceptanceTests.values()].filter((r) => r.definedIn).length,
    acceptance_tests_orphan_citations: orphanCitations.length,
    endpoints: endpoints.size,
    enums: enums.size,
    sections: sections.length,
  },
  sections,
  endpoints: [...endpoints.values()].sort((a, b) => a.id.localeCompare(b.id)),
  enums: [...enums.values()].sort((a, b) => a.name.localeCompare(b.name)),
  acceptance_tests: [...acceptanceTests.values()]
    .filter((r) => r.definedIn)
    .map((r) => ({ id: r.id, definition: r.definition, defined_in: r.definedIn, defined_line: r.definedLine, cited_in: r.citedIn }))
    .sort((a, b) => a.id.localeCompare(b.id)),
  orphan_at_citations: orphanCitations.sort((a, b) => a.id.localeCompare(b.id)),
};

writeFileSync(OUTPUT, JSON.stringify(contract, null, 2) + "\n", "utf8");

if (collisions.length > 0) {
  console.error(`❌ contract.json: ${collisions.length} id collision(s):`);
  for (const c of collisions.slice(0, 10)) console.error(`   - ${c}`);
  process.exit(1);
}

console.log(
  `✅ contract.json written: ${contract.counts.acceptance_tests_defined} ATs (${contract.counts.acceptance_tests_orphan_citations} orphan), ${contract.counts.endpoints} EPs, ${contract.counts.enums} enums, ${contract.counts.sections} sections`,
);
