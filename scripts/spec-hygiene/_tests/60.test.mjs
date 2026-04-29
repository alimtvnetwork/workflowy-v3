#!/usr/bin/env node
/**
 * @file Meta-test for G-00-GRADUATION-LEDGER-FRESH (gate #60).
 *
 * Locks the L9 visibility-line contract documented in the runner's header
 * and cited verbatim in the registry row:
 *
 *   "tracking <N> WARN gate(s); <M> graduated"
 *
 * Adds MIN-count regression guards (task #56, defence against the bug class
 * fixed in #54): a parser regression that silently drops table rows would
 * lower the reported counts below known floors. Floors are conservative —
 * graduation is monotonic-up and active WARN gates only retire by being
 * graduated (which keeps total ledger entries flat or growing). If a count
 * legitimately drops below a floor, update the floor in the same commit
 * that documents the deliberate retirement.
 *
 * Same defence-in-depth pattern as `_tests/57.test.mjs` (AT-30-I8) and
 * `_tests/59.test.mjs` (density visibility). Without this lock, a future
 * edit could silently drop the always-on WARN-gate count signal.
 *
 * Usage:
 *   node scripts/spec-hygiene/_tests/60.test.mjs
 *
 * Exit codes:
 *   0 — visibility line present, well-formed, and counts ≥ floors.
 *   1 — visibility line missing, malformed, or counts below floor.
 *   2 — runner #60 itself failed (cannot evaluate the contract in isolation).
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNNER = path.resolve(HERE, '../60-check-graduation-ledger-fresh.mjs');
// Contract: "tracking <N> WARN gate(s); <M> graduated"
const VISIBILITY_RE = /tracking\s+(\d+)\s+WARN\s+gate\(s\);\s+(\d+)\s+graduated/;

// Regression floors — established 2026-04-29 after task #54/#56.
// Bumping DOWN requires a documented retirement in the same commit.
const MIN_WARN_GATES = 7;
const MIN_GRADUATED = 1;

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
    console.error('[meta-test 60] FAIL: runner #60 itself errored — cannot evaluate L9');
    console.error(result.stderr || result.stdout);
    process.exit(2);
  }
  const matched = VISIBILITY_RE.exec(result.stdout);
  if (!matched) {
    console.error('[meta-test 60] FAIL L9: runner stdout missing visibility line matching /tracking N WARN gate(s); M graduated/');
    console.error('--- captured stdout ---');
    console.error(result.stdout);
    process.exit(1);
  }
  const warnCount = Number(matched[1]);
  const gradCount = Number(matched[2]);
  if (warnCount < MIN_WARN_GATES) {
    console.error(`[meta-test 60] FAIL MIN-WARN: reported ${warnCount} WARN gate(s) < floor ${MIN_WARN_GATES}. Likely a parser regression silently dropped rows (cf. tasks #54/#56). If this drop is intentional, lower MIN_WARN_GATES in this file in the same commit that documents the retirement.`);
    process.exit(1);
  }
  if (gradCount < MIN_GRADUATED) {
    console.error(`[meta-test 60] FAIL MIN-GRAD: reported ${gradCount} graduated < floor ${MIN_GRADUATED}. Graduation is monotonic-up; a decrease indicates the graduated section was truncated or parsed incorrectly.`);
    process.exit(1);
  }
  console.log(`[meta-test 60] ✓ L9 holds — visibility line present: "${matched[0]}" (≥ floors WARN ${MIN_WARN_GATES} / GRAD ${MIN_GRADUATED})`);
}

main();
