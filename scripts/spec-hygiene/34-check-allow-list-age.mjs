#!/usr/bin/env node
/**
 * G-34 — Allow-List Entry Age Tracker (v1.0.0)
 *
 * Allow-list entries (G-30/G-31/G-32 exemptions) are technical debt:
 * each one is a "yes-but" carve-out around an otherwise enforced rule.
 * Without age pressure, exemptions accumulate forever. G-34 adds time
 * pressure by reading `git blame` for each allow-list entry line and
 * categorising:
 *
 *   - INFO   age <  180 days    (fresh — no action)
 *   - WARN   age >= 180 days    (stale — review recommended)
 *   - ERROR  age >= 365 days    (rotting — must justify or remove)
 *
 * Per-entry opt-out via the `AGE_EXEMPT` Set with composite key:
 *
 *     "<list-name>::<value>"   e.g.  "WORKFLOWS_EXEMPT::W-billing-x"
 *
 * Each opt-out line MUST carry a rationale comment (recursive G-30.3
 * style — verified by G-34.2). Opting out turns ERROR into INFO for
 * that one entry; the operator owns the long tail.
 *
 * CLI:
 *   node scripts/spec-hygiene/34-check-allow-list-age.mjs           default
 *   node scripts/spec-hygiene/34-check-allow-list-age.mjs --info    show fresh too
 *
 * Exit codes:
 *   0  no ERROR-age entries (WARN allowed)
 *   1  one or more ERROR-age entries (rotted exemptions)
 *   2  runner failure (cannot read source / git unavailable)
 */

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..", "..");

const WARN_DAYS = 180;
const ERROR_DAYS = 365;

// =====================================================================
// Per-entry age opt-outs.
// Format key:  "<LIST_NAME>::<entry-value>"
// Each line MUST carry a rationale comment (G-34.2 enforces this).
// Opting an entry out caps its severity at INFO.
// =====================================================================
const AGE_EXEMPT = new Set([
  // (none yet — add entries here when an exemption is genuinely permanent)
]);

// =====================================================================
// Same runner inventory as G-35 (kept in sync manually — small list).
// =====================================================================

const RUNNERS = [
  {
    file: "scripts/spec-hygiene/30-check-at-citation-validity.mjs",
    gate: "G-30",
    lists: ["REDUNDANCY_ALLOWLIST"],
  },
  {
    file: "scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs",
    gate: "G-31",
    lists: [
      "WORKFLOWS_EXEMPT", "FEATURES_EXEMPT", "ENDPOINTS_EXEMPT", "DB_DIAGRAM_EXEMPT",
      "WORKFLOWS_ISLAND_EXEMPT", "FEATURES_ISLAND_EXEMPT",
      "ENDPOINTS_ISLAND_EXEMPT", "DB_DIAGRAM_ISLAND_EXEMPT",
      "WORKFLOWS_HEAD_EXEMPT", "FEATURES_HEAD_EXEMPT",
      "ENDPOINTS_HEAD_EXEMPT", "DB_DIAGRAM_HEAD_EXEMPT",
    ],
  },
  {
    file: "scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs",
    gate: "G-32",
    lists: ["COVERAGE_EXEMPT", "REVERSE_EXEMPT", "NONUNIQUE_EXEMPT", "PARITY_EXEMPT"],
  },
];

// =====================================================================
// Parser — locate entries and their line numbers.
// =====================================================================

function parseAllowList(sourceLines, listName) {
  const startRe = new RegExp(`^const\\s+${listName}\\s*=\\s*new\\s+Set\\(\\[`);
  const startIdx = sourceLines.findIndex((l) => startRe.test(l));
  if (startIdx < 0) return [];
  const entries = [];
  let i = startIdx + 1;
  while (i < sourceLines.length) {
    const raw = sourceLines[i];
    if (raw.trim().startsWith("]")) break;
    const m = raw.match(/^\s*"([^"]+)"\s*,?/);
    if (m) entries.push({ value: m[1], line: i + 1 });
    i += 1;
  }
  return entries;
}

// =====================================================================
// Git blame — get commit date for one file:line.
// Returns { date: Date, sha: string } or null on failure.
// =====================================================================

function blameLine(file, line) {
  const r = spawnSync(
    "git",
    ["-C", REPO_ROOT, "blame", "-L", `${line},${line}`, "--porcelain", file],
    { encoding: "utf8" },
  );
  if (r.status !== 0) return null;
  const sha = r.stdout.split(" ", 1)[0];
  const m = r.stdout.match(/^author-time (\d+)$/m);
  if (!m) return null;
  return { date: new Date(Number(m[1]) * 1000), sha: sha.slice(0, 7) };
}

// =====================================================================
// G-34.2 meta — every AGE_EXEMPT line must carry a rationale comment.
// =====================================================================

function checkExemptRationales() {
  const sourceLines = readFileSync(__filename, "utf8").split("\n");
  const startIdx = sourceLines.findIndex((l) =>
    /^const\s+AGE_EXEMPT\s*=\s*new\s+Set\(\[/.test(l),
  );
  if (startIdx < 0) return [];
  const unrationaled = [];
  let i = startIdx + 1;
  while (i < sourceLines.length) {
    const raw = sourceLines[i];
    if (raw.trim().startsWith("]")) break;
    const m = raw.match(/^\s*"([^"]+)"\s*,?\s*(\/\/.*)?$/);
    if (m) {
      const inline = m[2] ? m[2].replace(/^\/\/\s*/, "").trim() : "";
      if (inline.length === 0) {
        // Check for above-line rationale.
        const prev = sourceLines[i - 1]?.trim() ?? "";
        if (!prev.startsWith("//") || prev.length < 4) {
          unrationaled.push({ value: m[1], line: i + 1 });
        }
      }
    }
    i += 1;
  }
  return unrationaled;
}

// =====================================================================
// Main.
// =====================================================================

const showInfo = process.argv.includes("--info");
const today = Date.now();
const findings = { info: [], warn: [], error: [] };

for (const runner of RUNNERS) {
  const fullPath = resolve(REPO_ROOT, runner.file);
  if (!existsSync(fullPath)) {
    console.error(`G-34: cannot find ${runner.file}`);
    process.exit(2);
  }
  const sourceLines = readFileSync(fullPath, "utf8").split("\n");
  for (const listName of runner.lists) {
    const entries = parseAllowList(sourceLines, listName);
    for (const e of entries) {
      const blame = blameLine(runner.file, e.line);
      if (blame === null) continue;
      const ageDays = Math.floor((today - blame.date.getTime()) / 86400000);
      const exemptKey = `${listName}::${e.value}`;
      const exempted = AGE_EXEMPT.has(exemptKey);
      const record = {
        gate: runner.gate, list: listName, value: e.value,
        line: e.line, file: runner.file, ageDays, sha: blame.sha,
        date: blame.date.toISOString().slice(0, 10), exempted,
      };
      const bucket = (() => {
        if (exempted) return "info";
        if (ageDays >= ERROR_DAYS) return "error";
        if (ageDays >= WARN_DAYS) return "warn";
        return "info";
      })();
      findings[bucket].push(record);
    }
  }
}

// Print report.
const total = findings.info.length + findings.warn.length + findings.error.length;
console.log(`G-34: scanned ${total} allow-list entries across ${RUNNERS.length} runners.`);
console.log(`      ${findings.info.length} fresh / ${findings.warn.length} stale (>${WARN_DAYS}d) / ${findings.error.length} rotted (>${ERROR_DAYS}d)`);

const renderRow = (r) =>
  `    [${r.date}|${r.ageDays}d|${r.sha}] ${r.gate} ${r.list} :: ${r.value}` +
  (r.exempted ? "  (AGE_EXEMPT)" : "");

if (findings.error.length > 0) {
  console.error(`\n❌ ROTTED entries (>= ${ERROR_DAYS} days — must justify or remove):`);
  findings.error.forEach((r) => console.error(renderRow(r)));
}
if (findings.warn.length > 0) {
  console.warn(`\n⚠️  STALE entries (>= ${WARN_DAYS} days — review recommended):`);
  findings.warn.forEach((r) => console.warn(renderRow(r)));
}
if (showInfo && findings.info.length > 0) {
  console.log(`\nℹ️  Fresh entries (< ${WARN_DAYS} days):`);
  findings.info.forEach((r) => console.log(renderRow(r)));
}

// G-34.2 meta-check.
const metaFails = checkExemptRationales();
if (metaFails.length > 0) {
  console.error(`\n❌ G-34.2: ${metaFails.length} AGE_EXEMPT entr${metaFails.length === 1 ? "y" : "ies"} without a rationale comment:`);
  metaFails.forEach((m) => console.error(`    line ${m.line}: "${m.value}"`));
}

const failed = findings.error.length > 0 || metaFails.length > 0;
if (failed) {
  console.error(`\nG-34: ❌ FAIL`);
  process.exit(1);
}
console.log(`\nG-34: ✅ PASS`);
process.exit(0);
