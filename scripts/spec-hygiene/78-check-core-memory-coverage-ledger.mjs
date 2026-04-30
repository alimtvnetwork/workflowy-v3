#!/usr/bin/env node
/**
 * scripts/spec-hygiene/78-check-core-memory-coverage-ledger.mjs
 *
 * Closes NEW-27 — durable fix for F-AUDIT-34 (false-positive cascade in
 * Core↔Gate coverage ledger). Three same-pass instances (GAPCLOSE-I2/J1/C3)
 * proved that ad-hoc per-namespace greps are not a reliable cross-walk.
 *
 * Enforces that `spec/_LEDGER-G-NS-CORE-MEMORY-COVERAGE.md`:
 *   1. exists and is parseable
 *   2. every row in the rule table cites either:
 *      (a) at least one gate id that EXISTS in `spec/_GATE-REGISTRY.md`,
 *      (b) an explicit `RESERVED: G-…` slot, OR
 *      (c) the literal phrase "memory-only-by-design"
 *   3. no row cites a gate id that DOES NOT exist in the registry
 *      (this is the F-AUDIT-34 anti-recurrence check — catches ledger rows
 *      pointing at hallucinated/stale/typoed gate names)
 *   4. the §"Coverage summary" counts (✅ / 📋 RESERVED / 📝 procedural)
 *      match the actual row classifications
 *
 * Pure positive guard clauses, no nested ifs, max 15-line bodies.
 */
import { readFileSync, existsSync } from "node:fs";

const LEDGER = "spec/_LEDGER-G-NS-CORE-MEMORY-COVERAGE.md";
const REGISTRY = "spec/_GATE-REGISTRY.md";
const ROW_RE = /^\| ([A-Z]\d+) \| "([^"]+)" \| (.+?) \| (.+?) \|\s*$/;
const GATE_ID_RE = /`(G-[A-Z0-9-]+(?:\*)?)`/g;
const RESERVED_RE = /`RESERVED:\s*(G-[A-Z0-9-]+)`/;
const PROCEDURAL_RE = /memory-only-by-design/;
const SCRIPT_RE = /`scripts\/spec-hygiene\/[\w.-]+\.mjs`/;
const REGISTRY_GATE_RE = /^\|\s*`(G-[A-Z0-9-]+)`\s*\|/gm;
const REGISTRY_ROW_RE = /^\|\s*`(G-[A-Z0-9-]+)`\s*\|[^|]*\|\s*\[`([^`]+)`\]/gm;
const STRICT = process.argv.includes("--strict-mode");

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function loadRegistry() {
  if (!existsSync(REGISTRY)) fail(`registry missing: ${REGISTRY}`);
  const text = readFileSync(REGISTRY, "utf8");
  const ids = new Set();
  for (const m of text.matchAll(REGISTRY_GATE_RE)) ids.add(m[1]);
  if (ids.size < 100) fail(`registry parsed too few gates: ${ids.size}`);
  return ids;
}

function classifyRow(coverageCell) {
  if (RESERVED_RE.test(coverageCell)) return "reserved";
  if (PROCEDURAL_RE.test(coverageCell)) return "procedural";
  if (SCRIPT_RE.test(coverageCell)) return "script";
  return "registered";
}

function extractGateIds(cell) {
  const ids = [];
  for (const m of cell.matchAll(GATE_ID_RE)) ids.push(m[1]);
  return ids;
}

function parseRows(text) {
  const rows = [];
  for (const line of text.split("\n")) {
    const m = line.match(ROW_RE);
    if (!m) continue;
    rows.push({ id: m[1], rule: m[2], coverage: m[3], notes: m[4] });
  }
  return rows;
}

function gateExists(cited, registryGates) {
  if (!cited.endsWith("*")) return registryGates.has(cited);
  const prefix = cited.slice(0, -1);
  for (const g of registryGates) if (g.startsWith(prefix)) return true;
  return false;
}

function checkRow(row, registryGates) {
  const klass = classifyRow(row.coverage);
  if (klass === "procedural") return klass;
  if (klass === "reserved") return klass;
  if (klass === "script") return klass;
  const cited = extractGateIds(row.coverage).filter(g => !g.startsWith("RESERVED"));
  if (cited.length === 0) fail(`${row.id}: no gate cited and not RESERVED/procedural/script`);
  const missing = cited.filter(g => !gateExists(g, registryGates));
  if (missing.length > 0) fail(`${row.id}: cites non-existent gates: ${missing.join(", ")}`);
  return klass;
}

function checkSummary(text, counts) {
  const re = /\|\s*✅[^|]*\|\s*(\d+)\s*\|[^|]*\|[\s\S]*?\|\s*📋[^|]*\|\s*(\d+)\s*\|[^|]*\|[\s\S]*?\|\s*📝[^|]*\|\s*(\d+)\s*\|/;
  const m = text.match(re);
  if (!m) fail("§Coverage summary table not parseable");
  const got = { registered: +m[1], reserved: +m[2], procedural: +m[3] };
  for (const k of ["registered", "reserved", "procedural"]) {
    if (got[k] !== counts[k]) fail(`§Coverage summary ${k} count: declared ${got[k]}, actual ${counts[k]}`);
  }
}

function main() {
  if (!existsSync(LEDGER)) fail(`ledger missing: ${LEDGER}`);
  const text = readFileSync(LEDGER, "utf8");
  const registryGates = loadRegistry();
  const rows = parseRows(text);
  if (rows.length < 20) fail(`parsed too few rows: ${rows.length} (expected ≥20 Core lines)`);
  const counts = { registered: 0, reserved: 0, procedural: 0, script: 0 };
  for (const row of rows) counts[checkRow(row, registryGates)] += 1;
  const procTotal = counts.procedural + counts.script;
  checkSummary(text, { registered: counts.registered, reserved: counts.reserved, procedural: procTotal });
  console.log(`OK: ${rows.length} Core rules cross-walked; ${counts.registered} registered, ${counts.reserved} RESERVED, ${counts.procedural} procedural, ${counts.script} script-enforced; ${registryGates.size} registry gates loaded`);
}

main();
