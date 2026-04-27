#!/usr/bin/env node
/**
 * G-35 — Allow-List Inventory Reporter (v1.0.0)
 *
 * Scans the three meta-checked spec-hygiene runners (G-30 / G-31 / G-32)
 * and emits a unified markdown inventory of every exemption Set:
 *
 *   - allow-list name + parent gate + sub-check
 *   - entry count + per-list rationale-coverage stat
 *   - line-anchored source link
 *   - per-entry table with rationale snippet (≤80 chars)
 *
 * Output: spec/31-app/05-conventions/26-allow-list-inventory.md
 *
 * This is a **reporter**, not a gate — exit 0 unless the runner itself
 * crashes. The intent is operator visibility: when the meta gates
 * (G-30.3 / G-31.5 / G-32.4) report "0 unrationaled", this report
 * surfaces WHAT is being exempted, so allow-list bloat doesn't hide
 * behind a green ✅.
 *
 * Algorithm:
 *   1. For each runner, read its source.
 *   2. Locate every `const NAME = new Set([` declaration.
 *   3. Extract entries (active string literals; skip `// "…"` templates).
 *   4. For each entry, extract its rationale comment (inline preferred,
 *      else nearest contiguous `// …` line(s) above).
 *   5. Render the markdown report with a top-level summary table
 *      followed by per-list detail blocks.
 *
 * CLI:
 *   node scripts/spec-hygiene/35-allow-list-inventory.mjs           writes report
 *   node scripts/spec-hygiene/35-allow-list-inventory.mjs --check   writes + diffs;
 *                                                                   exit 1 if drift
 *
 * Exit codes:
 *   0  report written cleanly (or matches existing if --check)
 *   1  --check mode: report content drifted (regenerate + commit)
 *   2  runner error (cannot read source / parse failure)
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..", "..");
const OUTPUT_PATH = resolve(
  REPO_ROOT,
  "spec/31-app/05-conventions/26-allow-list-inventory.md",
);

// =====================================================================
// Runner inventory: which lists belong to which gate / sub-check.
// Order here drives the report's section order.
// =====================================================================

const RUNNERS = [
  {
    file: "scripts/spec-hygiene/30-check-at-citation-validity.mjs",
    gate: "G-30",
    title: "G-30 — AT Citation Validity",
    lists: [
      {
        name: "REDUNDANCY_ALLOWLIST",
        subcheck: "G-30.2",
        purpose: "open-prefix declarations exempt from redundancy ERROR",
      },
    ],
  },
  {
    file: "scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs",
    gate: "G-31",
    title: "G-31 — Cross-Reference Reciprocity",
    lists: [
      { name: "WORKFLOWS_EXEMPT",         subcheck: "G-31.1", purpose: "asymmetric cross-flow links by design" },
      { name: "FEATURES_EXEMPT",          subcheck: "G-31.2", purpose: "asymmetric feature cross-refs by design" },
      { name: "ENDPOINTS_EXEMPT",         subcheck: "G-31.3", purpose: "asymmetric endpoint cross-refs by design" },
      { name: "DB_DIAGRAM_EXEMPT",        subcheck: "G-31.4", purpose: "asymmetric db-diagram cross-refs by design" },
      { name: "WORKFLOWS_ISLAND_EXEMPT",  subcheck: "G-31.6", purpose: "workflow files with no peer cross-refs (legitimate)" },
      { name: "FEATURES_ISLAND_EXEMPT",   subcheck: "G-31.6", purpose: "feature files with no peer cross-refs (legitimate)" },
      { name: "ENDPOINTS_ISLAND_EXEMPT",  subcheck: "G-31.6", purpose: "endpoint files with no peer cross-refs (legitimate)" },
      { name: "DB_DIAGRAM_ISLAND_EXEMPT", subcheck: "G-31.6", purpose: "db-diagram files with no peer cross-refs (legitimate)" },
      { name: "WORKFLOWS_HEAD_EXEMPT",    subcheck: "G-31.7", purpose: "workflow files using non-canonical related-section heading" },
      { name: "FEATURES_HEAD_EXEMPT",     subcheck: "G-31.7", purpose: "feature files using non-canonical related-section heading" },
      { name: "ENDPOINTS_HEAD_EXEMPT",    subcheck: "G-31.7", purpose: "endpoint files using non-canonical related-section heading" },
      { name: "DB_DIAGRAM_HEAD_EXEMPT",   subcheck: "G-31.7", purpose: "db-diagram files using non-canonical related-section heading" },
    ],
  },
  {
    file: "scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs",
    gate: "G-32",
    title: "G-32 — DDL Unique Coverage",
    lists: [
      { name: "COVERAGE_EXEMPT",  subcheck: "G-32.1", purpose: "DDL CREATE INDEX statements exempt from doc-row coverage" },
      { name: "REVERSE_EXEMPT",   subcheck: "G-32.2", purpose: "doc rows allowed without a corresponding DDL CREATE INDEX" },
      { name: "NONUNIQUE_EXEMPT", subcheck: "G-32.3", purpose: "indexes allowed to be non-UNIQUE despite UNIQUE-by-default policy" },
      { name: "PARITY_EXEMPT",    subcheck: "G-32.5", purpose: "doc rows whose columns/predicate intentionally diverge from DDL" },
    ],
  },
];

// =====================================================================
// Parsing — extract entries + rationale for one named Set.
// =====================================================================

function parseAllowList(sourceLines, listName) {
  const startRe = new RegExp(`^const\\s+${listName}\\s*=\\s*new\\s+Set\\(\\[`);
  const startIdx = sourceLines.findIndex((l) => startRe.test(l));
  if (startIdx < 0) {
    return { found: false, declLine: null, entries: [] };
  }
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
  return { found: true, declLine: startIdx + 1, entries };
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
  if (collected.length === 0) return "(MISSING)";
  return collected.join(" ");
}

function truncate(s, max) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

// =====================================================================
// Rendering — markdown report.
// =====================================================================

function renderReport(inventory) {
  const now = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push("---");
  lines.push("slug: allow-list-inventory");
  lines.push("version: 1.0.0");
  lines.push(`updated: ${now}`);
  lines.push("parent: ./02-ci-quality-gates.md");
  lines.push("status: generated");
  lines.push("generator: scripts/spec-hygiene/35-allow-list-inventory.mjs");
  lines.push("---");
  lines.push("");
  lines.push("# Allow-List Inventory");
  lines.push("");
  lines.push("> **Generated.** Do not hand-edit. Run");
  lines.push("> `node scripts/spec-hygiene/35-allow-list-inventory.mjs` to regenerate.");
  lines.push("> CI verifies freshness with `--check`.");
  lines.push("");
  lines.push(
    "Companion to the meta sub-checks **G-30.3 / G-31.5 / G-32.4** which assert",
  );
  lines.push(
    "that every allow-list entry carries a rationale comment. This report makes",
  );
  lines.push(
    "the *content* of those allow-lists visible at-a-glance so opt-out bloat",
  );
  lines.push("does not hide behind a green ✅.");
  lines.push("");
  lines.push(`**Parent:** [\`02-ci-quality-gates.md\`](./02-ci-quality-gates.md)`);
  lines.push("");

  // Top-level summary table.
  lines.push("## Summary");
  lines.push("");
  lines.push("| Gate | Sub-check | Allow-list | Entries | Unrationaled |");
  lines.push("|------|-----------|------------|--------:|-------------:|");
  let totalEntries = 0;
  let totalUnrationaled = 0;
  for (const runner of inventory) {
    for (const list of runner.lists) {
      const u = list.entries.filter((e) => e.rationale === "(MISSING)").length;
      totalEntries += list.entries.length;
      totalUnrationaled += u;
      const uMark = u === 0 ? "0 ✅" : `${u} ❌`;
      lines.push(
        `| ${runner.gate} | ${list.subcheck} | \`${list.name}\` | ${list.entries.length} | ${uMark} |`,
      );
    }
  }
  lines.push(
    `| **TOTAL** | — | **${inventory.reduce((n, r) => n + r.lists.length, 0)} lists** | **${totalEntries}** | **${totalUnrationaled}** |`,
  );
  lines.push("");

  // Per-runner detail.
  for (const runner of inventory) {
    lines.push(`## ${runner.title}`);
    lines.push("");
    lines.push(
      `**Runner:** [\`${runner.file}\`](../../../${runner.file})`,
    );
    lines.push("");
    for (const list of runner.lists) {
      lines.push(`### \`${list.name}\` (${list.subcheck})`);
      lines.push("");
      lines.push(`*${list.purpose}.*`);
      lines.push("");
      if (!list.found) {
        lines.push("> ⚠️  Allow-list declaration not found — runner may have renamed it.");
        lines.push("");
        continue;
      }
      lines.push(
        `Source: [\`${runner.file}:${list.declLine}\`](../../../${runner.file}#L${list.declLine})`,
      );
      lines.push("");
      if (list.entries.length === 0) {
        lines.push("_(empty)_");
        lines.push("");
        continue;
      }
      lines.push("| # | Entry | Rationale |");
      lines.push("|---|-------|-----------|");
      list.entries.forEach((e, idx) => {
        const rat = e.rationale === "(MISSING)"
          ? "**❌ MISSING**"
          : truncate(e.rationale, 100);
        lines.push(`| ${idx + 1} | \`${e.value}\` | ${rat} |`);
      });
      lines.push("");
    }
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "**Regenerate:** `node scripts/spec-hygiene/35-allow-list-inventory.mjs`",
  );
  lines.push("");
  return lines.join("\n");
}

// =====================================================================
// Main.
// =====================================================================

function main() {
  const checkMode = process.argv.includes("--check");
  const inventory = [];

  for (const runner of RUNNERS) {
    const fullPath = resolve(REPO_ROOT, runner.file);
    let sourceLines;
    try {
      sourceLines = readFileSync(fullPath, "utf8").split("\n");
    } catch (e) {
      console.error(`G-35: cannot read ${runner.file}: ${e.message}`);
      process.exit(2);
    }
    const enrichedLists = runner.lists.map((l) => ({
      ...l,
      ...parseAllowList(sourceLines, l.name),
    }));
    inventory.push({ ...runner, lists: enrichedLists });
  }

  const report = renderReport(inventory);

  if (checkMode) {
    if (!existsSync(OUTPUT_PATH)) {
      console.error(`G-35 --check: report does not exist at ${relative(REPO_ROOT, OUTPUT_PATH)}`);
      console.error("  Run without --check to generate.");
      process.exit(1);
    }
    const existing = readFileSync(OUTPUT_PATH, "utf8");
    if (normalizeForDiff(existing) !== normalizeForDiff(report)) {
      console.error(`G-35 --check: report content has drifted from current allow-list state.`);
      console.error(`  Expected file: ${relative(REPO_ROOT, OUTPUT_PATH)}`);
      console.error(`  Resolution: re-run without --check to regenerate, then commit.`);
      process.exit(1);
    }
    console.log(`G-35: ✅ report up-to-date (${relative(REPO_ROOT, OUTPUT_PATH)})`);
    process.exit(0);
  }

  writeFileSync(OUTPUT_PATH, report, "utf8");
  const totals = inventory.reduce(
    (acc, r) => {
      for (const l of r.lists) {
        acc.lists += 1;
        acc.entries += l.entries.length;
        acc.unrationaled += l.entries.filter((e) => e.rationale === "(MISSING)").length;
      }
      return acc;
    },
    { lists: 0, entries: 0, unrationaled: 0 },
  );
  console.log(`G-35: ✅ wrote ${relative(REPO_ROOT, OUTPUT_PATH)}`);
  console.log(`  ${totals.lists} allow-lists, ${totals.entries} entries, ${totals.unrationaled} unrationaled.`);
  process.exit(0);
}

// Strip the `updated:` date so re-running on the same content with a new
// day's date doesn't trip --check during a normal CI window.
function normalizeForDiff(text) {
  return text.replace(/^updated: \d{4}-\d{2}-\d{2}$/m, "updated: <DATE>");
}

main();
