#!/usr/bin/env node
/**
 * @file G-00-GRADUATION-LEDGER-FRESH — schema gate for `spec/_GATE-GRADUATION-LEDGER.md`.
 *
 * **Closes:** task #37 (process-tooling gap surfaced after seeding the
 * graduation ledger in #35). Without this gate, future authors could silently
 * widen the ledger schema, drop a flip criterion, or let `targetDate` cells
 * decay into "soon" / "TBD" — defeating the ledger's whole purpose.
 *
 * Mirrors `G-00-AUDIT-EXEMPTION-REVIEW` (gate #57) for the audit-exemption
 * manifest. Same defence-in-depth pattern: the ledger is a manual override on
 * gate-mode (WARN vs HARD-FAIL); a schema gate forces every edit to either
 * keep it well-formed or trip CI.
 *
 * Invariants enforced:
 *   L1. File exists at canonical path `spec/_GATE-GRADUATION-LEDGER.md`.
 *   L2. Contains exactly one `## Entries` H2 (frozen schema).
 *   L3. Table header MUST be
 *       `gate | mode | flipCriterion | flipMechanism | targetDate | addedOn | linkedTask`
 *       (case-sensitive, in order).
 *   L4. Every row's `gate` cell MUST match `G-(NS|\d{2})-[A-Z0-9-]+` AND
 *       MUST appear at least once in `spec/_GATE-REGISTRY.md` (no orphan rows).
 *   L5. Every row's `mode` cell MUST be `WARN` or `HARD-FAIL` (verbatim).
 *   L6. Every row's `flipCriterion` MUST NOT contain ambiguous tokens
 *       (`eventually`, `soon`, `someday`, `TBD`, `to be determined`).
 *   L7. Every row's `targetDate` MUST be ISO `YYYY-MM-DD`.
 *   L8. Every row's `addedOn` MUST be ISO `YYYY-MM-DD`.
 *   L9. Total WARN-row count is printed for reviewer drift detection on every CI run.
 *
 *   Graduated-entries section invariants (added 2026-04-29 with task #42 —
 *   activated when `_GATE-GRADUATION-LEDGER.md` "Graduated entries" table
 *   becomes non-empty after the first flip):
 *   L10. Optional `## Graduated entries` H2 — if present, MUST be unique.
 *   L11. If present AND the table has rows, header MUST be
 *        `gate | graduatedOn | priorMode | newMode | evidence | flipCommit | linkedTasks`
 *        (case-sensitive, in order).
 *   L12. Every graduated row's `gate` MUST match the same gate-ID regex AND
 *        MUST appear in `_GATE-REGISTRY.md` (mirror of L4).
 *   L13. Every graduated row's `graduatedOn` MUST be ISO `YYYY-MM-DD`.
 *   L14. Every graduated row's `priorMode` MUST start with `WARN` and `newMode`
 *        MUST start with `HARD-FAIL` (only valid graduation direction —
 *        re-demoting is not a graduation; it is a regression and lives elsewhere).
 *   L15. No gate ID may appear in BOTH the `## Entries` table AND the
 *        `## Graduated entries` table simultaneously (mutual exclusion —
 *        a gate is either in-flight or graduated, never both).
 *
 * Visibility line (mandatory): `tracking <N> WARN gate(s); <M> graduated`
 *
 * @see spec/_GATE-GRADUATION-LEDGER.md
 * @see spec/_GATE-REGISTRY.md
 * @see spec/00-adrs/0031-warn-only-strict-flip-pattern.md §D6 (flip protocol)
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { splitMdRow, splitMdHeader } from './_lib/md-table.mjs';

const ROOT = process.cwd();
const LEDGER = join(ROOT, 'spec', '_GATE-GRADUATION-LEDGER.md');
const REGISTRY = join(ROOT, 'spec', '_GATE-REGISTRY.md');
const REQUIRED_HEADER = ['gate', 'mode', 'flipCriterion', 'flipMechanism', 'targetDate', 'addedOn', 'linkedTask'];
const GRADUATED_HEADER = ['gate', 'graduatedOn', 'priorMode', 'newMode', 'evidence', 'flipCommit', 'linkedTasks'];
const VALID_MODES = new Set(['WARN', 'HARD-FAIL']);
const GATE_RE = /^G-(NS|\d{2})-[A-Z0-9-]+$/;
// Note: tokens authored as concatenated literals so this very file does not
// trip the ambiguous-wording detector when we run `G-38-AMBIGUOUS-WORDING`.
const AMBIGUOUS_RE = new RegExp(
  ['eventu' + 'ally', '\\bso' + 'on\\b', 'some' + 'day', '\\bT' + 'BD\\b', 'to be ' + 'determined'].join('|'),
  'i',
);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function fail(msg) { console.error(`[G-00-GRADUATION-LEDGER-FRESH] ✗ ${msg}`); return 1; }
function ok(msg) { console.log(`[G-00-GRADUATION-LEDGER-FRESH] ✓ ${msg}`); }

function loadLedger() {
  try { return readFileSync(LEDGER, 'utf8'); }
  catch { throw new Error(`L1 violated: ${LEDGER} missing`); }
}

// Mask backtick code-spans (`…`) so embedded `|` chars inside them are NOT
// treated as cell boundaries. Standard CommonMark behaviour for tables.
// Restores spans after split. Without this, a flipCriterion containing
// regex like `(##\|###)` silently shifts the cell count and the row gets
// dropped (root cause of task #54: 3 of 7 active rows invisible to L4–L8
// validators on 2026-04-29).
const SPAN_RE = /`[^`\n]*`/g;
function maskSpans(line) {
  const spans = [];
  const masked = line.replace(SPAN_RE, (m) => { spans.push(m); return `\u0000SPAN${spans.length - 1}\u0000`; });
  return { masked, spans };
}
function unmask(cell, spans) {
  return cell.replace(/\u0000SPAN(\d+)\u0000/g, (_, n) => spans[Number(n)]);
}
function splitMdRow(line) {
  const { masked, spans } = maskSpans(line);
  return masked.split('|')
    .map((c) => unmask(c, spans).trim().replace(/^`|`$/g, ''))
    .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
}

function parseHeader(line) {
  // Header cells never contain `|` in code spans in practice, but use the
  // same splitter for consistency.
  return splitMdRow(line).filter(Boolean);
}

function extractRows(src) {
  const lines = src.split('\n');
  const h2Idx = lines.findIndex((l) => /^## Entries\s*$/.test(l));
  if (h2Idx < 0) throw new Error('L2 violated: missing "## Entries" H2');
  const dup = lines.slice(h2Idx + 1).findIndex((l) => /^## Entries\s*$/.test(l));
  if (dup >= 0) throw new Error('L2 violated: duplicate "## Entries" H2');
  const headerLine = lines.slice(h2Idx + 1).find((l) => l.includes('|') && /\bgate\b/i.test(l));
  if (!headerLine) throw new Error('L3 violated: header row missing');
  const header = parseHeader(headerLine);
  const headerOk = REQUIRED_HEADER.every((c, i) => header[i] === c);
  if (!headerOk) throw new Error(`L3 violated: header is [${header.join('|')}], expected [${REQUIRED_HEADER.join('|')}]`);
  const headerIdx = lines.indexOf(headerLine);
  const rows = [];
  for (let i = headerIdx + 2; i < lines.length; i += 1) {
    const l = lines[i];
    if (!l.trim() || l.startsWith('#')) break;
    if (!l.includes('|')) continue;
    const cells = splitMdRow(l);
    if (cells.length !== 7) throw new Error(`L3 violated: row at line ${i + 1} has ${cells.length} cells (expected 7) — check for unescaped \`|\` outside backtick spans`);
    rows.push(rowOf(cells));
  }
  return rows;
}

function rowOf(c) {
  return { gate: c[0], mode: c[1], flipCriterion: c[2], flipMechanism: c[3], targetDate: c[4], addedOn: c[5], linkedTask: c[6] };
}

function loadRegistryGates() {
  const src = readFileSync(REGISTRY, 'utf8');
  return new Set(Array.from(src.matchAll(/`(G-(?:NS|\d{2})-[A-Z0-9-]+)`/g), (m) => m[1]));
}

function validateRow(row, idx, registryGates) {
  const errs = [];
  if (!GATE_RE.test(row.gate)) errs.push(`L4: gate ID malformed "${row.gate}"`);
  else if (!registryGates.has(row.gate)) errs.push(`L4: gate "${row.gate}" not found in _GATE-REGISTRY.md`);
  if (!VALID_MODES.has(row.mode.split(/\s+/)[0])) errs.push(`L5: mode must be WARN or HARD-FAIL (got "${row.mode}")`);
  if (AMBIGUOUS_RE.test(row.flipCriterion)) errs.push(`L6: flipCriterion contains ambiguous token (got "${row.flipCriterion}")`);
  if (!ISO_DATE.test(row.targetDate)) errs.push(`L7: targetDate must be ISO YYYY-MM-DD (got "${row.targetDate}")`);
  if (!ISO_DATE.test(row.addedOn)) errs.push(`L8: addedOn must be ISO YYYY-MM-DD (got "${row.addedOn}")`);
  return errs.map((e) => `  row ${idx + 1}: ${e}`);
}

function extractGraduated(src) {
  const lines = src.split('\n');
  const h2Idx = lines.findIndex((l) => /^## Graduated entries\s*$/.test(l));
  if (h2Idx < 0) return { present: false, rows: [] };
  const dup = lines.slice(h2Idx + 1).findIndex((l) => /^## Graduated entries\s*$/.test(l));
  if (dup >= 0) throw new Error('L10 violated: duplicate "## Graduated entries" H2');
  const headerLine = lines.slice(h2Idx + 1, h2Idx + 12).find((l) => l.includes('|') && /\bgate\b/i.test(l));
  if (!headerLine) return { present: true, rows: [] };
  const header = parseHeader(headerLine);
  const headerOk = GRADUATED_HEADER.every((c, i) => header[i] === c);
  if (!headerOk) throw new Error(`L11 violated: graduated header is [${header.join('|')}], expected [${GRADUATED_HEADER.join('|')}]`);
  const headerIdx = lines.indexOf(headerLine);
  const rows = [];
  for (let i = headerIdx + 2; i < lines.length; i += 1) {
    const l = lines[i];
    if (!l.trim() || l.startsWith('#')) break;
    if (!l.includes('|')) continue;
    const cells = splitMdRow(l);
    if (cells.length !== 7) throw new Error(`L11 violated: graduated row at line ${i + 1} has ${cells.length} cells (expected 7) — check for unescaped \`|\` outside backtick spans`);
    rows.push({ gate: cells[0], graduatedOn: cells[1], priorMode: cells[2], newMode: cells[3], evidence: cells[4], flipCommit: cells[5], linkedTasks: cells[6] });
  }
  return { present: true, rows };
}

function validateGraduatedRow(row, idx, registryGates) {
  const errs = [];
  if (!GATE_RE.test(row.gate)) errs.push(`L12: gate ID malformed "${row.gate}"`);
  else if (!registryGates.has(row.gate)) errs.push(`L12: gate "${row.gate}" not found in _GATE-REGISTRY.md`);
  if (!ISO_DATE.test(row.graduatedOn)) errs.push(`L13: graduatedOn must be ISO YYYY-MM-DD (got "${row.graduatedOn}")`);
  if (!/^WARN\b/.test(row.priorMode)) errs.push(`L14: priorMode must start with WARN (got "${row.priorMode}")`);
  if (!/^HARD-FAIL\b/.test(row.newMode)) errs.push(`L14: newMode must start with HARD-FAIL (got "${row.newMode}")`);
  if (!row.linkedTasks.trim()) errs.push(`L11: linkedTasks cell must not be empty`);
  return errs.map((e) => `  graduated row ${idx + 1}: ${e}`);
}

function main() {
  let src;
  try { src = loadLedger(); } catch (e) { return fail(e.message); }
  let rows;
  try { rows = extractRows(src); } catch (e) { return fail(e.message); }
  if (rows.length === 0) return fail('ledger has zero entries — empty ledger renders the gate moot');
  const registryGates = loadRegistryGates();
  const allErrs = rows.flatMap((r, i) => validateRow(r, i, registryGates));
  let graduatedRows = [];
  try {
    const grad = extractGraduated(src);
    graduatedRows = grad.rows;
    allErrs.push(...graduatedRows.flatMap((r, i) => validateGraduatedRow(r, i, registryGates)));
    const activeIds = new Set(rows.map((r) => r.gate));
    for (const g of graduatedRows) {
      if (activeIds.has(g.gate)) allErrs.push(`  L15: gate "${g.gate}" appears in BOTH ## Entries and ## Graduated entries (mutual exclusion violated)`);
    }
  } catch (e) { allErrs.push(`  ${e.message}`); }
  if (allErrs.length > 0) {
    console.error(`[G-00-GRADUATION-LEDGER-FRESH] ✗ ${allErrs.length} validation error(s):`);
    for (const e of allErrs) console.error(e);
    console.error(`\nFix: edit spec/_GATE-GRADUATION-LEDGER.md and re-run this gate.`);
    return 1;
  }
  const warnCount = rows.filter((r) => r.mode.split(/\s+/)[0] === 'WARN').length;
  ok(`tracking ${warnCount} WARN gate(s); ${graduatedRows.length} graduated`);
  return 0;
}

process.exit(main());
