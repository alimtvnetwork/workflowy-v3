#!/usr/bin/env node
/**
 * @file Meta-test for G-00-PLACEHOLDER-DENSITY (gate #59).
 *
 * Locks the visibility-line contract documented in the runner's header and
 * cited verbatim in `spec/_GATE-REGISTRY.md` row for G-00-PLACEHOLDER-DENSITY:
 *
 *   "density <pct>% across <scopes> scope(s); cap 15%"
 *
 * Adds MIN-scope regression guard (task #59, generalizes the floor pattern
 * from #56). Scope count is monotonic-up as the spec corpus grows; a sudden
 * drop indicates a parser regression silently dropped scopes from the scan.
 * Density % itself is volatile and intentionally trends downward — no floor
 * needed there because the existing 15% cap already gates the upper bound.
 *
 * Without this lock, a future edit could silently drop the always-on
 * density signal — exactly the regression that gate #57's meta-test was
 * created to prevent for AT-30-I8. This is the same defence-in-depth
 * pattern, applied to the corpus-wide placeholder metric.
 *
 * Usage:
 *   node scripts/spec-hygiene/_tests/59.test.mjs
 *
 * Exit codes:
 *   0 — visibility line present, well-formed, and scope count ≥ floor.
 *   1 — visibility line missing, malformed, or scope count below floor.
 *   2 — runner #59 itself failed (cannot evaluate the contract in isolation).
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNNER = path.resolve(HERE, '../59-check-placeholder-density.mjs');
// Contract: "density <pct>% across <N> scope(s); cap <C>%"
const VISIBILITY_RE = /density\s+\d+(?:\.\d+)?%\s+across\s+(\d+)\s+scope\(s\);\s+cap\s+\d+%/;

// Regression floor — established 2026-04-29 (task #59).
// Scope count is monotonic-up as the spec corpus grows.
const MIN_SCOPES = 25;

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
    console.error('[meta-test 59] FAIL: runner #59 itself errored — cannot evaluate visibility contract');
    console.error(result.stderr || result.stdout);
    process.exit(2);
  }
  const matched = VISIBILITY_RE.exec(result.stdout);
  if (!matched) {
    console.error('[meta-test 59] FAIL: runner stdout missing visibility line matching /density P% across N scope(s); cap C%/');
    console.error('--- captured stdout ---');
    console.error(result.stdout);
    process.exit(1);
  }
  const scopes = Number(matched[1]);
  if (scopes < MIN_SCOPES) {
    console.error(`[meta-test 59] FAIL MIN-SCOPES: scanned ${scopes} scope(s) < floor ${MIN_SCOPES}. Likely a parser/glob regression silently dropped scopes (cf. tasks #54/#56/#59). If intentional (e.g. scope merge), lower MIN_SCOPES in this file in the same commit that documents the change.`);
    process.exit(1);
  }
  console.log(`[meta-test 59] ✓ visibility contract holds — line present: "${matched[0]}" (≥ floor SCOPES ${MIN_SCOPES})`);
}

main();
