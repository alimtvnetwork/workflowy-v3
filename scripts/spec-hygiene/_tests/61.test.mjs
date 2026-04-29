#!/usr/bin/env node
/**
 * @file Meta-test for G-00-GRADUATION-LEDGER-DATE-DRIFT (gate #61).
 *
 * Locks the visibility-line contract documented in the runner's header
 * and cited verbatim in the registry row:
 *
 *   "<O> overdue, <D> due-soon, <T> on-track"
 *
 * Completes the meta-test triad started by `_tests/57.test.mjs`,
 * `_tests/59.test.mjs`, `_tests/60.test.mjs`. Without this lock, a future
 * edit could silently drop the always-on overdue/due-soon/on-track signal
 * that drives the WARN-gate lifecycle.
 *
 * Usage:
 *   node scripts/spec-hygiene/_tests/61.test.mjs
 *
 * Exit codes:
 *   0 — visibility line present and well-formed.
 *   1 — visibility line missing or malformed.
 *   2 — runner #61 itself failed (cannot evaluate the contract in isolation).
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNNER = path.resolve(HERE, '../61-check-graduation-ledger-date-drift.mjs');
// Contract: "<O> overdue, <D> due-soon, <T> on-track"
const VISIBILITY_RE = /\d+\s+overdue,\s+\d+\s+due-soon,\s+\d+\s+on-track/;

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
    console.error('[meta-test 61] FAIL: runner #61 itself errored — cannot evaluate visibility contract');
    console.error(result.stderr || result.stdout);
    process.exit(2);
  }
  const matched = VISIBILITY_RE.exec(result.stdout);
  if (!matched) {
    console.error('[meta-test 61] FAIL: runner stdout missing visibility line matching /N overdue, N due-soon, N on-track/');
    console.error('--- captured stdout ---');
    console.error(result.stdout);
    process.exit(1);
  }
  console.log(`[meta-test 61] ✓ visibility contract holds — line present: "${matched[0]}"`);
}

main();
