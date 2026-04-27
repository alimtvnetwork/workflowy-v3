#!/usr/bin/env node
/**
 * G-31 — Cross-Reference Reciprocity Gate (v2.2.0)
 *
 * Asserts that every cross-sibling Related-section link in a scoped
 * folder is reciprocated by a back-link in the target's own
 * Related/Cross-References section.
 *
 * Sub-checks (one per registered scope):
 *
 *   G-31.1 (workflows, ERROR, v1.0.0)  — 02-workflows/NN-*-flow.md
 *                                       reciprocity. Drained queue from
 *                                       6 asymmetries (F25) to 0.
 *   G-31.2 (features,  WARN,  v2.0.0)  — 01-features/NN[a-z]?-*.md
 *                                       reciprocity. Pre-existing drift
 *                                       at intro: 30 asymmetries.
 *   G-31.3 (endpoints, ERROR, v2.1.0)  — 06-endpoints/NN[a-z]?-*.md
 *                                       reciprocity. Drained 2026-04-27
 *                                       (8 → 0) and promoted to ERROR.
 *   G-31.4 (db-diagram,WARN,  v2.0.0)  — 07-db-diagram/NN-*.md
 *                                       reciprocity. Pre-existing drift
 *                                       at intro: 6 asymmetries.
 *
 * Mode semantics:
 *   - ERROR scopes contribute to exit code 1 on any asymmetry.
 *   - WARN  scopes report violations but never fail the gate. Used as
 *     a staged-rollout pattern (mirrors F24/F27/F28 G-30.2 rollout):
 *     introduce the check, surface drift in CI output, drain via
 *     follow-up tasks, then promote to ERROR (F-future-G31a-promote).
 *
 * Scope config (per entry):
 *   id           — sub-check identifier (e.g. "G-31.2")
 *   label        — short human label for output
 *   dir          — folder relative to repo root
 *   filenameRx   — regex matching scoped sibling files
 *   excludeRx    — regex for siblings to skip (overviews, AT registries,
 *                  consistency reports — these are aggregator pages, not
 *                  cross-referencing peers)
 *   relatedHeads — array of H2 heading texts that mark the back-link
 *                  section (different folders use different conventions:
 *                  workflows use "## Related"; db-diagram uses
 *                  "## Cross-References"; we accept either when present)
 *   mode         — "error" | "warn"
 *   exemptions   — Set<`${from} → ${to}`> intentionally one-way pairs
 *
 * Exit codes:
 *   0  No asymmetries in any ERROR scope (WARN scope drift is reported
 *      but does not fail)
 *   1  At least one ERROR-scope asymmetry detected
 *   2  Runner error (missing dir, malformed file, etc.)
 *
 * Algorithm SSOT: spec/31-app/05-conventions/24-g31-workflow-xref-reciprocity-gate.md
 *
 * Promoted from one-shot prototype `/tmp/audit_xrefs.mjs` (built during
 * F25). v1.0.0 added typed exit codes, allow-list, suppression hint.
 * v2.0.0 (F-future-G31a) generalised to N scopes with per-scope mode.
 * v2.1.0 (F-future-G31a-promote-endpoints) drained 8 endpoint asymmetries
 *        by adding back-link rows to the Cross-References tables of
 *        14-concurrency-and-sync.md (×5), 15-roles-and-permissions.md (×2),
 *        and 11-trash-view.md (×1); promoted G-31.3 from WARN to ERROR.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// =====================================================================
// Per-scope allow-lists. Format: `${from} → ${to}` (bare filenames).
// Each entry needs a one-line rationale comment (informational; not yet
// machine-enforced — see F-future-G31b for rationale-comment gate).
// =====================================================================

const WORKFLOWS_EXEMPT = new Set([
  // "10-migration-execution-flow.md → 02-template-application-flow.md",
  // (reason: migration is bootstrap-time only; template flow is user-time only)
]);

const FEATURES_EXEMPT = new Set([
  // (empty at v2.0.0 — drift is genuine and surfaced in WARN mode)
]);

const ENDPOINTS_EXEMPT = new Set([
  // (empty at v2.0.0)
]);

const DB_DIAGRAM_EXEMPT = new Set([
  // (empty at v2.0.0)
]);

// =====================================================================
// Scope registry. Order = output order.
// =====================================================================

const SCOPES = [
  {
    id: "G-31.1",
    label: "workflows",
    dir: "spec/31-app/02-workflows",
    filenameRx: /^\d{2}-.+-flow\.md$/,
    excludeRx: /^$/,                       // filename regex already restrictive
    relatedHeads: ["## Related"],
    mode: "error",
    exemptions: WORKFLOWS_EXEMPT,
  },
  {
    id: "G-31.2",
    label: "features",
    dir: "spec/31-app/01-features",
    filenameRx: /^\d{2}[a-z]?-.+\.md$/i,
    // Aggregator pages — not first-class cross-referencing peers.
    excludeRx: /^(00-overview|02-personas|05a-hotkey-table|97-acceptance-criteria|99-consistency-report)\.md$/,
    relatedHeads: ["## Related", "## Cross-References", "## See also"],
    mode: "warn",
    exemptions: FEATURES_EXEMPT,
  },
  {
    id: "G-31.3",
    label: "endpoints",
    dir: "spec/31-app/06-endpoints",
    filenameRx: /^\d{2}[a-z]?-.+\.md$/i,
    excludeRx: /^(00-overview|16-endpoint-at-matrix|97-acceptance-criteria|99-consistency-report)\.md$/,
    relatedHeads: ["## Related", "## Cross-References", "## See also"],
    mode: "error",
    exemptions: ENDPOINTS_EXEMPT,
  },
  {
    id: "G-31.4",
    label: "db-diagram",
    dir: "spec/31-app/07-db-diagram",
    // Restrict to top-level NN-*.md (skip the sql/ subfolder; that's
    // schema, not prose siblings).
    filenameRx: /^\d{2}-.+\.md$/,
    excludeRx: /^(00-overview|97-acceptance-criteria|99-consistency-report)\.md$/,
    relatedHeads: ["## Cross-References", "## Related", "## See also"],
    mode: "error",
    exemptions: DB_DIAGRAM_EXEMPT,
  },
];

function fail(msg, code = 2) {
  console.error(`G-31 runner error: ${msg}`);
  process.exit(code);
}

function listSiblingFiles(scope) {
  let entries;
  try {
    entries = readdirSync(scope.dir);
  } catch (e) {
    fail(`cannot read ${scope.dir}: ${e.message}`);
  }
  return entries
    .filter((f) => scope.filenameRx.test(f))
    .filter((f) => !scope.excludeRx.test(f))
    .sort();
}

/**
 * Extract the back-link section from a file. Tries each heading in
 * `scope.relatedHeads` in order; returns the slice from the first hit
 * to the next H2, or "" if none present. We deliberately stop only at
 * H2s that don't begin with one of the related-head initials, so the
 * captured block can include sub-headings.
 */
function extractRelatedSection(content, scope) {
  for (const head of scope.relatedHeads) {
    const idx = content.indexOf(head);
    if (idx < 0) continue;
    const rest = content.slice(idx);
    // Stop at next H2 that isn't another related-head variant.
    const nextH2 = rest.search(/\n## (?!Related|Cross-References|See also)/);
    return nextH2 > 0 ? rest.slice(0, nextH2) : rest;
  }
  return "";
}

function buildLinkMatrix(scope, files) {
  const matrix = {};
  for (const f of files) {
    let content;
    try {
      content = readFileSync(join(scope.dir, f), "utf8");
    } catch (e) {
      fail(`cannot read ${join(scope.dir, f)}: ${e.message}`);
    }
    const block = extractRelatedSection(content, scope);
    matrix[f] = new Set();
    for (const other of files) {
      if (other === f) continue;
      if (block.includes(other)) matrix[f].add(other);
    }
  }
  return matrix;
}

function findAsymmetries(scope, files, matrix) {
  const out = [];
  for (const a of files) {
    for (const b of files) {
      if (a === b) continue;
      if (matrix[a].has(b) && !matrix[b].has(a)) {
        const key = `${a} → ${b}`;
        if (scope.exemptions.has(key)) continue;
        out.push({ from: a, to: b });
      }
    }
  }
  return out;
}

function printScopeReport(scope, files, matrix, asymmetries) {
  const totalLinks = files.reduce((n, f) => n + matrix[f].size, 0);
  const modeTag = scope.mode.toUpperCase();
  console.log("");
  console.log(`${scope.id} (${scope.label}, ${modeTag}) cross-sibling reciprocity:`);
  console.log(`  scope:                              ${scope.dir}`);
  console.log(`  files scanned:                      ${files.length}`);
  console.log(`  cross-sibling Related links found:  ${totalLinks}`);
  console.log(`  asymmetric-by-design (allow-list):  ${scope.exemptions.size}`);
  console.log(`  unreciprocated forward-links:       ${asymmetries.length}`);

  if (asymmetries.length === 0) {
    console.log(`  ✅ all cross-sibling Related links reciprocated`);
    return;
  }

  const verdict = scope.mode === "error" ? "❌" : "⚠️";
  console.log("");
  console.log(`  ${verdict} ${asymmetries.length} asymmetric link(s) — target is missing back-link in its Related section:`);
  console.log("");
  for (const { from, to } of asymmetries) {
    console.log(`    ${from}  →  ${to}    (add back-link in ${to})`);
  }
  if (scope.mode === "warn") {
    console.log("");
    console.log(`  (WARN scope — does not fail the gate; drain via reciprocity follow-up,`);
    console.log(`   then promote to ERROR mode in the runner's SCOPES registry.)`);
  } else {
    console.log("");
    console.log(`  To suppress an intentional one-way reference, add the directed`);
    console.log(`  pair to this scope's exemptions Set in the runner with a rationale.`);
  }
}

// --- main ---
let totalErrorAsym = 0;
let totalWarnAsym = 0;

for (const scope of SCOPES) {
  let dirStat;
  try {
    dirStat = statSync(scope.dir);
  } catch (e) {
    fail(`scope directory ${scope.dir} not found: ${e.message}`);
  }
  if (!dirStat.isDirectory()) {
    fail(`${scope.dir} is not a directory`);
  }

  const files = listSiblingFiles(scope);
  if (files.length === 0) {
    fail(`no sibling files matching ${scope.filenameRx} in ${scope.dir}`);
  }

  const matrix = buildLinkMatrix(scope, files);
  const asym = findAsymmetries(scope, files, matrix);
  printScopeReport(scope, files, matrix, asym);

  if (scope.mode === "error") totalErrorAsym += asym.length;
  else totalWarnAsym += asym.length;
}

console.log("");
console.log(`G-31 summary: ${SCOPES.length} scope(s) scanned — ${totalErrorAsym} ERROR-scope asymmetries, ${totalWarnAsym} WARN-scope asymmetries.`);

process.exit(totalErrorAsym === 0 ? 0 : 1);
