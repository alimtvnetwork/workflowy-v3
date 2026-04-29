#!/usr/bin/env node
/**
 * @file Meta-test for G-00-GRADUATION-LEDGER-FRESH (gate #60).
 *
 * Locks the L9 visibility-line contract documented in the runner's header
 * and cited verbatim in the registry row:
 *
 *   "tracking <N> WARN gate(s); <M> graduated"
 *
 * Same defence-in-depth pattern as `_tests/57.test.mjs` (AT-30-I8) and
 * `_tests/59.test.mjs` (density visibility). Without this lock, a future
 * edit could silently drop the always-on WARN-gate count signal.
 *
 * Usage:
 *   node scripts/spec-hygiene/_tests/60.test.mjs
 *
 * Exit codes:
 *   0 — visibility line present and well-formed.
 *   1 — visibility line missing or malformed.
 *   2 — runner #60 itself failed (cannot evaluate the contract in isolation).
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNNER = path.resolve(HERE, '../60-check-graduation-ledger-fresh.mjs');
// Contract: "tracking <N> WARN gate(s); <M> graduated"
const VISIBILITY_RE = /tracking\s+\d+\s+WARN\s+gate\(s\);\s+\d+\s+graduated/;

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
  console.log(`[meta-test 60] ✓ L9 holds — visibility line present: "${matched[0]}"`);
}

main();
