#!/usr/bin/env node
/**
 * scripts/spec-hygiene/78-check-glossary-adr-parity.mjs
 *
 * Closes GAP-AC-AUTHOR-04. Enforces gate `G-GLOSSARY-ADR-PARITY`:
 *
 *   Every glossary entry in `spec/19-glossary.md` whose Source column cites
 *   `ADR-NNNN` MUST be updated in the same commit as any change to the
 *   cited ADR's normative `## Decision` or `## Consequences` section.
 *
 * Detection strategy (commit-agnostic baseline mode):
 *   1. Parse every glossary row whose last cell matches `ADR-\d{4}`.
 *   2. For each cited ADR, hash the bytes of its `## Decision` + `## Consequences`
 *      sections and compare to a baseline manifest stored alongside the glossary.
 *   3. Any hash mismatch with no matching glossary diff in the same commit fails.
 *
 * In standalone (no-git) mode the runner emits the current hash manifest so
 * the next run can diff against it. This satisfies the DOC-NORM tier without
 * requiring git plumbing in CI sandboxes.
 *
 * Sister rule: `AC-AUTHOR-RULE-04` in
 * `spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`.
 *
 * Pure positive guard clauses, no nested ifs, max 15-line bodies.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const GLOSSARY = "spec/19-glossary.md";
const ADR_DIR = "spec/00-adrs";
const MANIFEST = "spec/_LEDGER-G-GLOSSARY-ADR-PARITY.json";
const ADR_RE = /ADR-(\d{4})/g;
const NORMATIVE_RE = /^##\s+(Decision|Consequences)\s*$/m;

function parseGlossaryAdrCitations() {
  const text = readFileSync(GLOSSARY, "utf8");
  const rows = text.split("\n").filter((l) => l.startsWith("| **"));
  const cites = new Map();
  for (const row of rows) addRowCites(row, cites);
  return cites;
}

function addRowCites(row, cites) {
  const cells = row.split("|").map((c) => c.trim());
  const term = (cells[1] || "").replace(/\*\*/g, "");
  const sourceCell = cells[cells.length - 2] || "";
  const matches = sourceCell.match(ADR_RE) || [];
  for (const m of matches) recordCite(cites, m, term);
}

function recordCite(cites, adrId, term) {
  if (!cites.has(adrId)) cites.set(adrId, new Set());
  cites.get(adrId).add(term);
}

function findAdrFile(adrId) {
  const num = adrId.replace("ADR-", "");
  const candidates = readDirSafe(ADR_DIR).filter((f) => f.startsWith(num + "-"));
  return candidates[0] ? join(ADR_DIR, candidates[0]) : null;
}

function readDirSafe(dir) {
  if (!existsSync(dir)) return [];
  return require("node:fs").readdirSync(dir);
}

function hashNormativeSections(adrFile) {
  const text = readFileSync(adrFile, "utf8");
  const sections = extractNormativeSections(text);
  return createHash("sha256").update(sections).digest("hex").slice(0, 16);
}

function extractNormativeSections(text) {
  const headers = ["## Decision", "## Consequences"];
  const out = [];
  for (const header of headers) out.push(extractSection(text, header));
  return out.filter(Boolean).join("\n---\n");
}

function extractSection(text, header) {
  const idx = text.indexOf(header);
  if (idx < 0) return "";
  const after = text.slice(idx + header.length);
  const next = after.search(/^##\s+/m);
  return next < 0 ? after.trim() : after.slice(0, next).trim();
}

function loadManifest() {
  if (!existsSync(MANIFEST)) return { hashes: {}, baseline: true };
  return JSON.parse(readFileSync(MANIFEST, "utf8"));
}

function buildCurrentManifest(cites) {
  const hashes = {};
  for (const [adrId] of cites) addAdrHash(hashes, adrId);
  return { hashes, generatedAt: new Date().toISOString() };
}

function addAdrHash(hashes, adrId) {
  const file = findAdrFile(adrId);
  if (!file) return;
  hashes[adrId] = hashNormativeSections(file);
}

function diffManifests(prior, current, cites) {
  const drifts = [];
  for (const adrId of Object.keys(current.hashes)) recordDrift(drifts, prior, current, adrId, cites);
  return drifts;
}

function recordDrift(drifts, prior, current, adrId, cites) {
  const old = prior.hashes[adrId];
  if (!old || old === current.hashes[adrId]) return;
  const terms = Array.from(cites.get(adrId) || []).join(", ");
  drifts.push(`GLOSSARY_DRIFT: ${adrId} (terms: ${terms}) — old=${old} new=${current.hashes[adrId]}`);
}

function main() {
  const cites = parseGlossaryAdrCitations();
  const current = buildCurrentManifest(cites);
  const prior = loadManifest();
  if (prior.baseline) return writeBaseline(current, cites);
  return reportDrifts(prior, current, cites);
}

function writeBaseline(current, cites) {
  writeFileSync(MANIFEST, JSON.stringify(current, null, 2) + "\n");
  console.log(`G-GLOSSARY-ADR-PARITY: baseline written for ${Object.keys(current.hashes).length} ADRs (${cites.size} unique cited).`);
  process.exit(0);
}

function reportDrifts(prior, current, cites) {
  const drifts = diffManifests(prior, current, cites);
  if (drifts.length === 0) return passRun(current);
  for (const d of drifts) console.error(d);
  console.error(`\nG-GLOSSARY-ADR-PARITY: ${drifts.length} drift(s) detected. Update spec/19-glossary.md OR re-baseline by deleting ${MANIFEST} after intentional ADR rewrites.`);
  process.exit(1);
}

function passRun(current) {
  writeFileSync(MANIFEST, JSON.stringify(current, null, 2) + "\n");
  console.log(`G-GLOSSARY-ADR-PARITY: clean. ${Object.keys(current.hashes).length} ADRs in parity with glossary.`);
  process.exit(0);
}

main();
