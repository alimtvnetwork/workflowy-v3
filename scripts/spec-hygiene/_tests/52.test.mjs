#!/usr/bin/env node
/**
 * @file Meta-test for G-00-ADR-CONSEQUENCES-XLINK (gate #52).
 *
 * Locks the visibility-line contract emitted by `52-check-adr-consequences-xlink.mjs`:
 *
 *   "all ADRs cite downstream scope (<N>/<M>; <K> allow-listed)"
 *
 * Closes the meta-test coverage gap (task #64): before this, only gates
 * #57/#59/#60/#61 had visibility-line locks. Gate #52 is the next-most-
 * load-bearing visibility signal because it tracks the ADR↔scope back-link
 * ratio that drives F-AUDIT-21 burndown — silently dropping that line
 * would mask regression on the highest-pointer open task (+15 pts).
 *
 * Adds MIN-count regression guards (same pattern as #56/#59 floors):
 *   - MIN_ADR_TOTAL: ADR count is monotonic-up (new ADRs added, never
 *     deleted). A drop indicates the ADR glob silently mis-resolved.
 *   - MIN_ADR_CITED: equal to total today (31/31). If this drops without
 *     a corresponding allow-list bump, the back-link enforcement broke.
 *
 * Usage:
 *   node scripts/spec-hygiene/_tests/52.test.mjs
 *
 * Exit codes:
 *   0 — visibility line present, well-formed, and counts ≥ floors.
 *   1 — visibility line missing, malformed, or counts below floor.
 *   2 — runner #52 itself failed (cannot evaluate the contract in isolation).
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNNER = path.resolve(HERE, '../52-check-adr-consequences-xlink.mjs');
// Contract: "all ADRs cite downstream scope (<cited>/<total>; <allow> allow-listed)"
const VISIBILITY_RE = /all ADRs cite downstream scope\s*\((\d+)\/(\d+);\s*(\d+)\s+allow-listed\)/;

// Regression floors — established 2026-04-29 (task #64).
// ADR count is monotonic-up; bumping DOWN requires documented retirement.
const MIN_ADR_TOTAL = 31;
const MIN_ADR_CITED = 31;

function captureRunner() {
  try {
    return { ok: true, stdout: execFileSync('node', [RUNNER], { encoding: 'utf8' }) };
  } catch (err) {
    return { ok: false, stdout: err.stdout?.toString() ?? '', stderr: err.stderr?.toString() ?? '' };
  }
}

function main() {
  const result = captureRunner();
  if (!result.ok) {
    console.error('[meta-test 52] FAIL: runner #52 itself errored — cannot evaluate visibility contract');
    console.error(result.stderr || result.stdout);
    process.exit(2);
  }
  const matched = VISIBILITY_RE.exec(result.stdout);
  if (!matched) {
    console.error('[meta-test 52] FAIL: runner stdout missing visibility line matching /all ADRs cite downstream scope (N/M; K allow-listed)/');
    console.error('--- captured stdout ---');
    console.error(result.stdout);
    process.exit(1);
  }
  const cited = Number(matched[1]);
  const total = Number(matched[2]);
  if (total < MIN_ADR_TOTAL) {
    console.error(`[meta-test 52] FAIL MIN-TOTAL: ${total} ADR(s) < floor ${MIN_ADR_TOTAL}. Likely a glob regression silently dropped ADR files (cf. tasks #54/#56/#59/#64). If intentional, lower MIN_ADR_TOTAL in this file in the same commit.`);
    process.exit(1);
  }
  if (cited < MIN_ADR_CITED) {
    console.error(`[meta-test 52] FAIL MIN-CITED: ${cited} ADR(s) cite downstream scope < floor ${MIN_ADR_CITED}. Back-link enforcement may have weakened — investigate before merging.`);
    process.exit(1);
  }
  console.log(`[meta-test 52] ✓ visibility contract holds — line present: "${matched[0]}" (≥ floors CITED ${MIN_ADR_CITED} / TOTAL ${MIN_ADR_TOTAL})`);
}

main();
