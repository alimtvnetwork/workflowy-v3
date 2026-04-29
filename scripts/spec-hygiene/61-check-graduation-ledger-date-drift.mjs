#!/usr/bin/env node
/**
 * @file G-00-GRADUATION-LEDGER-DATE-DRIFT — auto-detects overdue WARN gates.
 *
 * **Closes:** task #40 (overdue-detection gap surfaced after seeding the
 * graduation ledger in #35 and shipping its schema gate #60).
 *
 * The graduation ledger declares a `targetDate` for every WARN-only gate.
 * Without enforcement, those dates rot — a gate scheduled to flip on
 * 2026-05-13 silently slips to 2027 if nobody notices. This gate compares
 * each row's `targetDate` against today's UTC date and:
 *
 *   - HARD-FAIL if `targetDate < today` (overdue → flip the gate or push the date).
 *   - WARN if `targetDate < today + 14 days` (due soon → reviewer awareness).
 *   - PASS otherwise.
 *
 * Companion to `G-00-GRADUATION-LEDGER-FRESH` (schema validation): that
 * gate locks the row shape; this gate locks the row freshness.
 *
 * Visibility line (mandatory): `<O> overdue, <D> due-soon, <T> on-track`
 *
 * @see spec/_GATE-GRADUATION-LEDGER.md
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { splitMdRow } from './_lib/md-table.mjs';

const ROOT = process.cwd();
const LEDGER = join(ROOT, 'spec', '_GATE-GRADUATION-LEDGER.md');
const DUE_SOON_DAYS = 14;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function fail(msg) { console.error(`[G-00-GRADUATION-LEDGER-DATE-DRIFT] ✗ ${msg}`); return 1; }
function ok(msg) { console.log(`[G-00-GRADUATION-LEDGER-DATE-DRIFT] ✓ ${msg}`); }

function extractRows(src) {
  const lines = src.split('\n');
  const h2Idx = lines.findIndex((l) => /^## Entries\s*$/.test(l));
  if (h2Idx < 0) throw new Error('missing "## Entries" H2 (relies on G-00-GRADUATION-LEDGER-FRESH for schema)');
  const headerLine = lines.slice(h2Idx + 1).find((l) => l.includes('|') && /\bgate\b/i.test(l));
  if (!headerLine) throw new Error('header row missing');
  const headerIdx = lines.indexOf(headerLine);
  const rows = [];
  for (let i = headerIdx + 2; i < lines.length; i += 1) {
    const l = lines[i];
    if (!l.trim() || l.startsWith('#')) break;
    if (!l.includes('|')) continue;
    const cells = splitMdRow(l);
    if (cells.length === 7) rows.push({ gate: cells[0], mode: cells[1], targetDate: cells[4] });
  }
  return rows;
}

function classify(row, today, dueSoon) {
  if (row.mode.split(/\s+/)[0] !== 'WARN') return 'skip';
  if (!ISO_DATE.test(row.targetDate)) return 'skip';
  const target = new Date(`${row.targetDate}T00:00:00Z`);
  if (target < today) return 'overdue';
  if (target < dueSoon) return 'due-soon';
  return 'on-track';
}

function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function main() {
  let src;
  try { src = readFileSync(LEDGER, 'utf8'); } catch { return fail(`ledger missing at ${LEDGER}`); }
  let rows;
  try { rows = extractRows(src); } catch (e) { return fail(e.message); }
  const today = todayUtc();
  const dueSoon = new Date(today.getTime() + DUE_SOON_DAYS * 86400000);
  const buckets = { overdue: [], 'due-soon': [], 'on-track': [], skip: [] };
  for (const r of rows) buckets[classify(r, today, dueSoon)].push(r);
  const o = buckets.overdue.length;
  const d = buckets['due-soon'].length;
  const t = buckets['on-track'].length;
  ok(`${o} overdue, ${d} due-soon, ${t} on-track`);
  for (const r of buckets['due-soon']) console.warn(`[G-00-GRADUATION-LEDGER-DATE-DRIFT] ⚠ due-soon: ${r.gate} (target ${r.targetDate})`);
  if (o === 0) return 0;
  console.error(`[G-00-GRADUATION-LEDGER-DATE-DRIFT] ✗ ${o} WARN gate(s) past targetDate:`);
  for (const r of buckets.overdue) console.error(`  ${r.gate} — target ${r.targetDate} (today ${today.toISOString().slice(0, 10)})`);
  console.error(`\nFix: either flip the gate to HARD-FAIL OR push targetDate in spec/_GATE-GRADUATION-LEDGER.md (cite reason in commit).`);
  return 1;
}

process.exit(main());
