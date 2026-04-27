#!/usr/bin/env node
/**
 * G-33 — Cross-Runner Allow-List Duplicate Detector (v1.0.0)
 *
 * Scans the three meta-checked spec-hygiene runners (G-30 / G-31 / G-32)
 * for the same string value appearing in allow-lists that belong to
 * **different gates**. Such cross-gate duplication is a smell:
 *
 *   - the same artifact is being exempted from two unrelated invariants;
 *   - rationale is fragmented across two source files (drift risk);
 *   - removing one exemption silently leaves the other in place.
 *
 * Same-gate duplication (e.g. an endpoint file appearing in both
 * `ENDPOINTS_ISLAND_EXEMPT` and `ENDPOINTS_HEAD_EXEMPT` under G-31) is
 * **legitimate** — those are orthogonal scopes within a single gate's
 * design — and is reported as INFO, not flagged.
 *
 * Algorithm:
 *   1. Reuse G-35's allow-list parser to collect every entry across all
 *      runners with its {value, rationale, gate, list, line} tuple.
 *   2. Bucket entries by their string value.
 *   3. For each bucket with size ≥ 2:
 *        - If all memberships share the same gate → INFO (informational).
 *        - If memberships span ≥ 2 gates → ERROR (G-33 violation).
 *   4. Print a per-violation report and exit 1 if any ERROR rows exist.
 *
 * Allow-list (G-33's own):
 *   `CROSS_GATE_EXEMPT` — values intentionally registered in multiple
 *   gates (rare; must carry a rationale comment per G-33.2 future).
 *
 * CLI:
 *   node scripts/spec-hygiene/33-check-cross-runner-duplicates.mjs
 *   node scripts/spec-hygiene/33-check-cross-runner-duplicates.mjs --info
 *     (also print same-gate INFO rows; default suppresses)
 *
 * Exit codes:
 *   0  no cross-gate duplicates (or all in CROSS_GATE_EXEMPT)
 *   1  one or more cross-gate duplicates flagged
 *   2  runner error (cannot read source / parse failure)
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..", "..");

// =====================================================================
// Runner inventory — kept in sync with G-35 (35-allow-list-inventory.mjs).
// If you add a new gate runner, register its lists here AND in G-35.
// =====================================================================

const RUNNERS = [
  {
    file: "scripts/spec-hygiene/30-check-at-citation-validity.mjs",
    gate: "G-30",
    lists: [
      { name: "REDUNDANCY_ALLOWLIST", subcheck: "G-30.2" },
    ],
  },
  {
    file: "scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs",
    gate: "G-31",
    lists: [
      { name: "WORKFLOWS_EXEMPT",         subcheck: "G-31.1" },
      { name: "FEATURES_EXEMPT",          subcheck: "G-31.2" },
      { name: "ENDPOINTS_EXEMPT",         subcheck: "G-31.3" },
      { name: "DB_DIAGRAM_EXEMPT",        subcheck: "G-31.4" },
      { name: "WORKFLOWS_ISLAND_EXEMPT",  subcheck: "G-31.6" },
      { name: "FEATURES_ISLAND_EXEMPT",   subcheck: "G-31.6" },
      { name: "ENDPOINTS_ISLAND_EXEMPT",  subcheck: "G-31.6" },
      { name: "DB_DIAGRAM_ISLAND_EXEMPT", subcheck: "G-31.6" },
      { name: "WORKFLOWS_HEAD_EXEMPT",    subcheck: "G-31.7" },
      { name: "FEATURES_HEAD_EXEMPT",     subcheck: "G-31.7" },
      { name: "ENDPOINTS_HEAD_EXEMPT",    subcheck: "G-31.7" },
      { name: "DB_DIAGRAM_HEAD_EXEMPT",   subcheck: "G-31.7" },
    ],
  },
  {
    file: "scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs",
    gate: "G-32",
    lists: [
      { name: "COVERAGE_EXEMPT",  subcheck: "G-32.1" },
      { name: "REVERSE_EXEMPT",   subcheck: "G-32.2" },
      { name: "NONUNIQUE_EXEMPT", subcheck: "G-32.3" },
      { name: "PARITY_EXEMPT",    subcheck: "G-32.5" },
    ],
  },
];

// =====================================================================
// G-33's own allow-list — values intentionally registered in multiple
// gates. Each entry MUST carry a rationale comment (future G-33.2 will
// enforce this via the meta pattern from G-30.3 / G-31.5 / G-32.4).
// Format: "value::GATE-A::GATE-B" (sorted gates, "::" separator).
// =====================================================================

const CROSS_GATE_EXEMPT = new Set([
  // (none yet — add here when a legitimate cross-gate registration arises)
]);

// =====================================================================
// Parser — copied verbatim from G-35 to keep this runner self-contained.
// (Cross-runner imports between hygiene scripts would themselves create
// the kind of coupling these gates are designed to surface.)
// =====================================================================

function parseAllowList(sourceLines, listName) {
  const startRe = new RegExp(`^const\\s+${listName}\\s*=\\s*new\\s+Set\\(\\[`);
  const startIdx = sourceLines.findIndex((l) => startRe.test(l));
  if (startIdx < 0) return { found: false, entries: [] };
  const entries = [];
  let i = startIdx + 1;
  while (i < sourceLines.length) {
    const raw = sourceLines[i];
    if (raw.trim().startsWith("]")) break;
    const m = raw.match(/^\s*"([^"]+)"\s*,?\s*(\/\/.*)?$/);
    if (m) {
      const value = m[1];
      const inlineRationale = m[2] ? m[2].replace(/^\/\/\s*/, "").trim() : null;
      const rationale = inlineRationale || extractAboveRationale(sourceLines, i);
      entries.push({ value, rationale, line: i + 1 });
    }
    i += 1;
  }
  return { found: true, entries };
}

function extractAboveRationale(sourceLines, entryIdx) {
  const collected = [];
  let j = entryIdx - 1;
  while (j >= 0) {
    const t = sourceLines[j].trim();
    if (t === "") break;
    if (!t.startsWith("//")) break;
    if (/^\/\/\s*[-=*_]{3,}\s*$/.test(t)) {
      j -= 1;
      continue;
    }
    collected.unshift(t.replace(/^\/\/\s*/, "").trim());
    j -= 1;
  }
  return collected.length === 0 ? "(MISSING)" : collected.join(" ");
}

function truncate(s, max) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

// =====================================================================
// Main
// =====================================================================

function main() {
  const showInfo = process.argv.includes("--info");

  // Step 1: collect every entry across every list.
  // memberships: Map<value, Array<{gate, list, subcheck, line, rationale, file}>>
  const memberships = new Map();
  for (const runner of RUNNERS) {
    const absPath = resolve(REPO_ROOT, runner.file);
    let source;
    try {
      source = readFileSync(absPath, "utf8");
    } catch (err) {
      console.error(`G-33: cannot read ${runner.file}: ${err.message}`);
      process.exit(2);
    }
    const sourceLines = source.split("\n");
    for (const list of runner.lists) {
      const parsed = parseAllowList(sourceLines, list.name);
      if (!parsed.found) {
        console.error(`G-33: list \`${list.name}\` not found in ${runner.file}`);
        process.exit(2);
      }
      for (const entry of parsed.entries) {
        const arr = memberships.get(entry.value) ?? [];
        arr.push({
          gate: runner.gate,
          file: runner.file,
          list: list.name,
          subcheck: list.subcheck,
          line: entry.line,
          rationale: entry.rationale,
        });
        memberships.set(entry.value, arr);
      }
    }
  }

  // Step 2: bucket by value, classify duplicates.
  const sameGateInfo = []; // [{value, memberships}]
  const crossGateErrors = []; // [{value, memberships, exemptKey, exempted}]

  for (const [value, members] of memberships) {
    if (members.length < 2) continue;
    const gates = [...new Set(members.map((m) => m.gate))].sort();
    if (gates.length === 1) {
      sameGateInfo.push({ value, members });
      continue;
    }
    const exemptKey = `${value}::${gates.join("::")}`;
    const exempted = CROSS_GATE_EXEMPT.has(exemptKey);
    crossGateErrors.push({ value, members, exemptKey, exempted });
  }

  // Step 3: render.
  const activeErrors = crossGateErrors.filter((e) => !e.exempted);

  if (showInfo && sameGateInfo.length > 0) {
    console.log(`G-33: ℹ️  ${sameGateInfo.length} same-gate duplicate(s) (informational, not flagged):`);
    for (const dup of sameGateInfo) {
      const tags = dup.members.map((m) => `${m.list}:${m.line}`).join(", ");
      console.log(`  • "${dup.value}"  [${dup.members[0].gate}]  ${tags}`);
    }
    console.log("");
  }

  if (crossGateErrors.length === 0) {
    console.log(`G-33: ✅ no cross-gate duplicates across ${RUNNERS.length} runners.`);
    process.exit(0);
  }

  if (activeErrors.length === 0) {
    console.log(`G-33: ✅ ${crossGateErrors.length} cross-gate duplicate(s) — all in CROSS_GATE_EXEMPT.`);
    process.exit(0);
  }

  // Active violations — print full detail.
  console.error(`G-33: ❌ ${activeErrors.length} cross-gate duplicate(s) flagged`);
  console.error("");
  console.error("  A value appearing in allow-lists of 2+ different gates means the");
  console.error("  same artifact is being exempted from multiple unrelated invariants.");
  console.error("  Rationale is fragmented and likely to drift. Resolution options:");
  console.error("    (a) remove the exemption from the gate where it is no longer needed;");
  console.error("    (b) consolidate rationale into a single source of truth and add the");
  console.error("        composite key to CROSS_GATE_EXEMPT in 33-check-cross-runner-duplicates.mjs.");
  console.error("");
  for (const err of activeErrors) {
    console.error(`  ✗ "${err.value}"`);
    for (const m of err.members) {
      const r = truncate(m.rationale, 70);
      console.error(`      [${m.gate} / ${m.subcheck}] ${m.list}:${m.line}  — ${r}`);
    }
    console.error(`      → To exempt: add "${err.exemptKey}" to CROSS_GATE_EXEMPT (with rationale).`);
    console.error("");
  }
  process.exit(1);
}

main();
