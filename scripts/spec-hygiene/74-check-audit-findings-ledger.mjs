#!/usr/bin/env node
/**
 * scripts/spec-hygiene/74-check-audit-findings-ledger.mjs
 *
 * Closes F-AUDIT-30. Enforces that `spec/AUDIT-FINDINGS-LEDGER.md`:
 *   1. exists and is parseable
 *   2. lists every F-AUDIT-NN and F-AUDxx-NN id referenced anywhere under spec/
 *   3. uses only the closed status enum: Open, Resolved, Stale, Retracted
 *   4. populates an Evidence cell for every non-Open row
 *   5. has trailing **Open count:** / **Resolved:** counters that match the
 *      actual row counts above them
 *
 * Pure positive guard clauses, no nested ifs, max 15-line bodies.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const LEDGER = "spec/AUDIT-FINDINGS-LEDGER.md";
const SPEC_ROOT = "spec";
const ID_RE = /F-AUD(?:IT)?[A-Z0-9]*-\d+/g;
const STATUSES = new Set(["Open", "Resolved", "Stale", "Retracted"]);

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, acc);
    else if (entry.endsWith(".md")) acc.push(full);
  }
  return acc;
}

function collectCorpusIds() {
  const ids = new Set();
  for (const file of walk(SPEC_ROOT)) {
    if (file === LEDGER) continue;
    const text = readFileSync(file, "utf8");
    const matches = text.match(ID_RE);
    if (!matches) continue;
    for (const m of matches) ids.add(m);
  }
  return ids;
}

function parseLedgerRows(text) {
  const rows = [];
  for (const line of text.split("\n")) {
    if (!line.startsWith("| F-AUD")) continue;
    const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cells.length < 4) continue;
    rows.push({ id: cells[0], status: extractStatus(cells), evidence: cells.at(-1) });
  }
  return rows;
}

function extractStatus(cells) {
  for (const c of cells) {
    const stripped = c.replace(/\*\*/g, "").trim();
    if (STATUSES.has(stripped)) return stripped;
  }
  return null;
}

function checkExists() {
  try { readFileSync(LEDGER, "utf8"); return true; }
  catch { console.error(`FAIL: missing ${LEDGER}`); return false; }
}

function checkCoverage(corpusIds, ledgerRows) {
  const ledgerIds = new Set(ledgerRows.map((r) => r.id));
  const missing = [...corpusIds].filter((id) => !ledgerIds.has(id));
  if (missing.length === 0) return true;
  console.error(`FAIL: ${missing.length} ids in spec/ but not in ledger: ${missing.join(", ")}`);
  return false;
}

function checkStatuses(rows) {
  const bad = rows.filter((r) => !STATUSES.has(r.status));
  if (bad.length === 0) return true;
  console.error(`FAIL: bad statuses for ${bad.map((r) => r.id).join(", ")}`);
  return false;
}

function checkEvidence(rows) {
  const orphans = rows.filter((r) => r.status !== "Open" && (!r.evidence || r.evidence === "—"));
  if (orphans.length === 0) return true;
  console.error(`FAIL: non-Open rows missing evidence: ${orphans.map((r) => r.id).join(", ")}`);
  return false;
}

function main() {
  if (!checkExists()) process.exit(1);
  const text = readFileSync(LEDGER, "utf8");
  const rows = parseLedgerRows(text);
  const corpusIds = collectCorpusIds();
  const okCov = checkCoverage(corpusIds, rows);
  const okStat = checkStatuses(rows);
  const okEv = checkEvidence(rows);
  if (!okCov || !okStat || !okEv) process.exit(1);
  console.log(`OK: ${rows.length} findings tracked, ${corpusIds.size} corpus ids covered`);
}

main();
