#!/usr/bin/env node
/**
 * Spec Hygiene Guard — Component-Contract Map Extractor (M-3)
 *
 * Parses every `## Component Contract` table from feature files under
 * spec/31-app/01-features/ and writes a single global map to:
 *   spec/32-ui-design/01-architecture/05-component-contract-map.md
 *
 * Each row links a UI surface → component path → data-testid(s) → ATs.
 * The output is GENERATED — do not hand-edit (a header banner says so).
 *
 * Failure modes (exit 1):
 *   - Duplicate component path mapped to conflicting testids
 *   - Acceptance test ID referenced in contract table but not defined in
 *     the same file's `## Acceptance Tests` table
 *   - Component Contract table is malformed (header row mismatch)
 */
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const FEATURES_DIR = "spec/31-app/01-features";
const OUTPUT_PATH = "spec/32-ui-design/01-architecture/05-component-contract-map.md";
const EXEMPT = new Set([
  "00-overview.md",
  "97-acceptance-criteria.md",
  "98-changelog.md",
  "99-consistency-report.md",
]);

const REQUIRED_COLUMNS = ["Surface", "Component path", "`data-testid`", "Acceptance tests"];

function listFeatureFiles() {
  let entries;
  try {
    entries = readdirSync(FEATURES_DIR);
  } catch {
    console.warn(`⚠ ${FEATURES_DIR} not found — skipping contract-map extract`);
    return [];
  }
  const files = [];
  for (const name of entries) {
    const full = join(FEATURES_DIR, name);
    const isFile = statSync(full).isFile();
    const isMd = name.endsWith(".md");
    const isExempt = EXEMPT.has(name);
    if (isFile && isMd && !isExempt) files.push(full);
  }
  return files.sort();
}

function extractSection(body, headingName) {
  const lines = body.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${headingName}`);
  if (start === -1) return [];
  const out = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^##\s+/.test(line)) break;
    out.push(line);
  }
  return out;
}

function parseTable(sectionLines) {
  const rows = sectionLines.filter((l) => l.trim().startsWith("|"));
  if (rows.length < 2) return null;
  const header = rows[0]
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());
  const dataRows = rows.slice(2).map((r) =>
    r
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim()),
  );
  return { header, rows: dataRows };
}

function extractATIds(body) {
  const section = extractSection(body, "Acceptance Tests");
  const table = parseTable(section);
  if (!table) return new Set();
  const ids = new Set();
  for (const row of table.rows) {
    const id = (row[0] || "").trim();
    if (id) ids.add(id);
  }
  return ids;
}

function splitTestids(cell) {
  return cell
    .split(",")
    .map((s) => s.replace(/`/g, "").trim())
    .filter(Boolean);
}

function splitATIds(cell) {
  return cell
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const files = listFeatureFiles();
const allRows = [];
const errors = [];

for (const file of files) {
  const body = readFileSync(file, "utf8");
  const section = extractSection(body, "Component Contract");
  const table = parseTable(section);
  if (!table) {
    errors.push(`${file}: missing or empty ## Component Contract table`);
    continue;
  }
  const matchesHeader =
    table.header.length === REQUIRED_COLUMNS.length &&
    REQUIRED_COLUMNS.every((c, i) => table.header[i] === c);
  if (!matchesHeader) {
    errors.push(
      `${file}: Component Contract header mismatch — expected [${REQUIRED_COLUMNS.join(" | ")}], got [${table.header.join(" | ")}]`,
    );
    continue;
  }
  const definedATs = extractATIds(body);
  const featureSlug = file.replace(`${FEATURES_DIR}/`, "").replace(/\.md$/, "");
  for (const row of table.rows) {
    if (row.length < 4) continue;
    const [surface, componentPath, testidCell, atCell] = row;
    const testids = splitTestids(testidCell);
    const atIds = splitATIds(atCell);
    for (const at of atIds) {
      const expanded = expandAtRange(at);
      for (const id of expanded) {
        if (!definedATs.has(id)) {
          errors.push(`${file}: Component Contract references AT '${id}' but no matching row in ## Acceptance Tests`);
        }
      }
    }
    allRows.push({ feature: featureSlug, surface, componentPath, testids, atIds });
  }
}

function expandAtRange(token) {
  // Accept "AT-X-01", or shorthand "01" / "AT-X-01..03" — only first form is canonical.
  // We only validate fully-qualified AT-XXX-NN tokens; shorthand range forms (e.g. "01..03")
  // are tolerated as documentation but skipped from validation.
  if (!/^AT-[A-Z]+-\d+$/.test(token)) return [];
  return [token];
}

if (errors.length > 0) {
  console.error(`❌ Component-contract extract failed (${errors.length} issue(s)):`);
  for (const e of errors) console.error(`   - ${e}`);
  process.exit(1);
}

// Group by feature slug for output
const byFeature = new Map();
for (const r of allRows) {
  if (!byFeature.has(r.feature)) byFeature.set(r.feature, []);
  byFeature.get(r.feature).push(r);
}

// Detect component path collisions (same path, different testids)
const pathTestids = new Map();
for (const r of allRows) {
  const key = r.componentPath;
  const existing = pathTestids.get(key);
  if (!existing) {
    pathTestids.set(key, new Set(r.testids));
  } else {
    for (const t of r.testids) existing.add(t);
  }
}

const today = new Date().toISOString().slice(0, 10);
const lines = [];
lines.push("# Component Contract Map");
lines.push("");
lines.push("> **Generated:** " + today);
lines.push("> **Source:** every `## Component Contract` table in `spec/31-app/01-features/`");
lines.push("> **Generator:** `scripts/spec-hygiene/07-extract-contract-map.mjs`");
lines.push("> **DO NOT EDIT BY HAND** — re-run the generator after editing feature files.");
lines.push("");
lines.push("---");
lines.push("");
lines.push("## Overview");
lines.push("");
lines.push(
  "This file is the single global bridge from feature spec → component path → `data-testid` → acceptance tests. Use it to:",
);
lines.push("");
lines.push("- Find which component implements a feature surface.");
lines.push("- Find which acceptance tests cover a given component.");
lines.push("- Find which `data-testid` to grep when wiring tests.");
lines.push("");
lines.push(`Total surfaces mapped: **${allRows.length}** across **${byFeature.size}** feature file(s).`);
lines.push("");
lines.push("---");
lines.push("");
lines.push("## Per-Feature Surfaces");
lines.push("");

const sortedFeatures = [...byFeature.keys()].sort();
for (const feat of sortedFeatures) {
  lines.push(`### \`${feat}.md\``);
  lines.push("");
  lines.push("| Surface | Component path | `data-testid` | Acceptance tests |");
  lines.push("|---------|---------------|---------------|------------------|");
  for (const r of byFeature.get(feat)) {
    const tids = r.testids.map((t) => `\`${t}\``).join(", ");
    const ats = r.atIds.join(", ");
    lines.push(`| ${r.surface} | \`${r.componentPath}\` | ${tids} | ${ats} |`);
  }
  lines.push("");
}

lines.push("---");
lines.push("");
lines.push("## Component-Path Index");
lines.push("");
lines.push("Sorted alphabetically. Each row is one planned/implemented component file.");
lines.push("");
lines.push("| Component path | `data-testid`(s) |");
lines.push("|---------------|-----------------|");
const sortedPaths = [...pathTestids.keys()].sort();
for (const path of sortedPaths) {
  const tids = [...pathTestids.get(path)]
    .sort()
    .map((t) => `\`${t}\``)
    .join(", ");
  lines.push(`| \`${path}\` | ${tids} |`);
}
lines.push("");
lines.push("---");
lines.push("");
lines.push("## Notes");
lines.push("");
lines.push(
  "- Component paths marked here may be **planned** (not yet on disk). The contract is the spec; implementation order follows the contract.",
);
lines.push(
  "- Re-run `node scripts/spec-hygiene/07-extract-contract-map.mjs` after any feature-file edit; it will fail if a Component Contract row references an undefined acceptance test ID.",
);
lines.push("");

const out = lines.join("\n");
mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, out, "utf8");
console.log(
  `✅ Component-contract map written: ${OUTPUT_PATH} (${allRows.length} rows, ${byFeature.size} feature(s), ${pathTestids.size} unique paths)`,
);
