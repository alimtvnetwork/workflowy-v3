#!/usr/bin/env node
/**
 * G-31 — Workflow Cross-Reference Reciprocity Gate (v1.0.0)
 *
 * Asserts that every `## Related` link from one workflow file
 * (`spec/31-app/02-workflows/NN-*-flow.md`) to another workflow file
 * is reciprocated by a back-link in the target's own `## Related`
 * section. Catches the F25 drift class (5 of 6 asymmetries were real
 * semantic gaps; 1 was cargo-cult boilerplate).
 *
 * Algorithm SSOT: spec/31-app/05-conventions/24-g31-workflow-xref-reciprocity-gate.md
 *
 * Exit codes:
 *   0  No asymmetries found
 *   1  Asymmetric forward-links detected
 *   2  Runner error (missing dir, malformed file, etc.)
 *
 * Promoted from one-shot prototype `/tmp/audit_xrefs.mjs` (built during
 * F25). The prototype reported asymmetries but had no exit code, no
 * allow-list, and no suppression hint. This runner adds all three.
 *
 * Allow-list: ASYMMETRIC_BY_DESIGN — pairs explicitly excluded because
 * the directional reference is one-way by intent (e.g. an "inverse path"
 * reference that does not warrant a back-link). Each entry needs a
 * one-line rationale comment.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const WORKFLOWS_DIR = "spec/31-app/02-workflows";
const FLOW_FILE_RX = /^\d{2}-.+-flow\.md$/;

// Pairs intentionally one-way. Format: `${from} → ${to}`.
// Empty as of v1.0.0 (F25 drained the queue to 0 asymmetries).
// To suppress a future intentional asymmetry, add a one-line entry here.
const ASYMMETRIC_BY_DESIGN = new Set([
  // "10-migration-execution-flow.md → 02-template-application-flow.md",
  // "(reason: migration is bootstrap-time only; template flow is user-time only)"
]);

function fail(msg, code = 2) {
  console.error(`G-31 runner error: ${msg}`);
  process.exit(code);
}

function listFlowFiles(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch (e) {
    fail(`cannot read ${dir}: ${e.message}`);
  }
  return entries.filter((f) => FLOW_FILE_RX.test(f)).sort();
}

function extractRelatedSection(content, file) {
  const idx = content.indexOf("## Related");
  if (idx < 0) return ""; // No Related section is OK — file simply has no outgoing links
  const rest = content.slice(idx);
  // Stop at the next H2 that doesn't start with R (avoid stopping mid-Related)
  const next = rest.search(/\n## [^R]/);
  return next > 0 ? rest.slice(0, next) : rest;
}

function buildLinkMatrix(flows) {
  const matrix = {};
  for (const f of flows) {
    let content;
    try {
      content = readFileSync(join(WORKFLOWS_DIR, f), "utf8");
    } catch (e) {
      fail(`cannot read ${f}: ${e.message}`);
    }
    const block = extractRelatedSection(content, f);
    matrix[f] = new Set();
    for (const other of flows) {
      if (other === f) continue;
      // Match either bare filename or ./filename or ()-wrapped link
      if (block.includes(other)) matrix[f].add(other);
    }
  }
  return matrix;
}

function findAsymmetries(flows, matrix) {
  const out = [];
  for (const a of flows) {
    for (const b of flows) {
      if (a === b) continue;
      if (matrix[a].has(b) && !matrix[b].has(a)) {
        const key = `${a} → ${b}`;
        if (ASYMMETRIC_BY_DESIGN.has(key)) continue;
        out.push({ from: a, to: b });
      }
    }
  }
  return out;
}

function printReport(flows, matrix, asymmetries) {
  const totalLinks = flows.reduce((n, f) => n + matrix[f].size, 0);
  console.log("G-31 workflow ## Related reciprocity:");
  console.log(`  flow files scanned:                 ${flows.length}`);
  console.log(`  cross-flow Related links found:     ${totalLinks}`);
  console.log(`  asymmetric-by-design (allow-list):  ${ASYMMETRIC_BY_DESIGN.size}`);
  console.log(`  unreciprocated forward-links:       ${asymmetries.length}`);

  if (asymmetries.length === 0) {
    console.log("  ✅ all cross-flow Related links reciprocated");
    return;
  }

  console.log("");
  console.log(`  ❌ ${asymmetries.length} asymmetric link(s) — target file is missing back-link in its ## Related section:`);
  console.log("");
  for (const { from, to } of asymmetries) {
    console.log(`    ${from}  →  ${to}    (add back-link in ${to})`);
  }
  console.log("");
  console.log("  To suppress an intentional one-way reference, add the directed");
  console.log("  pair to ASYMMETRIC_BY_DESIGN in this runner with a rationale.");
}

// --- main ---
let dirStat;
try {
  dirStat = statSync(WORKFLOWS_DIR);
} catch (e) {
  fail(`workflows directory ${WORKFLOWS_DIR} not found: ${e.message}`);
}
if (!dirStat.isDirectory()) {
  fail(`${WORKFLOWS_DIR} is not a directory`);
}

const flows = listFlowFiles(WORKFLOWS_DIR);
if (flows.length === 0) {
  fail(`no flow files matching ${FLOW_FILE_RX} in ${WORKFLOWS_DIR}`);
}

const matrix = buildLinkMatrix(flows);
const asymmetries = findAsymmetries(flows, matrix);
printReport(flows, matrix, asymmetries);

process.exit(asymmetries.length === 0 ? 0 : 1);
