#!/usr/bin/env node
/**
 * Spec Hygiene Guard — Feature-File Shape Checker
 *
 * Enforces the 5 mandatory `##` headings (in order) defined by
 * spec/01-spec-authoring-guide/13-feature-file-template.md on every file
 * under spec/31-app/01-features/ (excluding 00-overview, 97/98/99 specials).
 *
 * Mandatory headings, in order:
 *   1. ## Inputs
 *   2. ## Outputs
 *   3. ## Edge Cases
 *   4. ## Acceptance Tests
 *   5. ## Component Contract
 *
 * Optional sections may appear before, between, or after the mandatory five —
 * but the relative order of the five MUST be preserved.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const FEATURES_DIR = "spec/31-app/01-features";
const EXEMPT = new Set([
  "00-overview.md",
  "97-acceptance-criteria.md",
  "98-changelog.md",
  "99-consistency-report.md",
]);

const REQUIRED = [
  "Inputs",
  "Outputs",
  "Edge Cases",
  "Acceptance Tests",
  "Component Contract",
];

function listFeatureFiles() {
  let entries;
  try {
    entries = readdirSync(FEATURES_DIR);
  } catch {
    console.warn(`⚠ ${FEATURES_DIR} not found — skipping feature-shape check`);
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

function extractH2Headings(body) {
  const lines = body.split("\n");
  const headings = [];
  for (const line of lines) {
    const match = line.match(/^##\s+(.+?)\s*$/);
    if (match) headings.push(match[1].trim());
  }
  return headings;
}

function checkFile(path) {
  const body = readFileSync(path, "utf8");
  const headings = extractH2Headings(body);

  const missing = [];
  const indices = [];
  for (const required of REQUIRED) {
    const idx = headings.findIndex((h) => h === required);
    if (idx === -1) missing.push(required);
    else indices.push({ name: required, idx });
  }

  if (missing.length > 0) {
    return { ok: false, reason: `missing required ## heading(s): ${missing.join(", ")}` };
  }

  // Verify relative order
  for (let i = 1; i < indices.length; i += 1) {
    const prev = indices[i - 1];
    const curr = indices[i];
    if (curr.idx < prev.idx) {
      return {
        ok: false,
        reason: `'## ${curr.name}' appears before '## ${prev.name}' (must follow template order)`,
      };
    }
  }

  return { ok: true };
}

const files = listFeatureFiles();
let failed = 0;
const failures = [];

for (const file of files) {
  const result = checkFile(file);
  if (!result.ok) {
    failed += 1;
    failures.push({ file, reason: result.reason });
  }
}

// M-2.2 retrofit COMPLETE (2026-04-19, 13/13 files). Checker is STRICT by
// default — any feature file missing the 5 mandatory `##` headings (or
// presenting them out of order) fails CI. Emergency bypass: set
// SPEC_FEATURE_SHAPE_STRICT=0 (discouraged; only for hot-fix scenarios).
const isStrict = process.env.SPEC_FEATURE_SHAPE_STRICT !== "0";

if (failed > 0) {
  const tag = isStrict ? "❌" : "⚠";
  const verb = isStrict ? "failed" : "warning";
  console.error(`${tag} Feature-shape check ${verb} for ${failed}/${files.length} file(s):`);
  for (const f of failures) console.error(`   - ${f.file}\n     → ${f.reason}`);
  console.error(
    `\nFix by aligning each file with spec/01-spec-authoring-guide/13-feature-file-template.md`,
  );
  if (isStrict) process.exit(1);
  console.error(`\n(Soft mode — bypass via SPEC_FEATURE_SHAPE_STRICT=0; not recommended.)`);
  process.exit(0);
}

console.log(`✅ Feature-shape check passed (${files.length} file(s) validated)`);
