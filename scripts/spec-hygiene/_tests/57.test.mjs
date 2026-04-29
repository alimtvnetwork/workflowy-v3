#!/usr/bin/env node
/**
 * @file Meta-test for G-00-AUDIT-EXEMPTION-REVIEW (gate #57).
 *
 * Locks AT-30-I8: every CI run of `57-check-audit-exemption-review.mjs` MUST
 * emit a visibility line of the form `matches N/M files (P.P%)` so reviewers
 * can detect drift in PR output (e.g. a sudden jump from 3.4% → 12% triggers
 * human review). This test prevents a future runner edit from silently
 * dropping that line.
 *
 * Adds MIN-count regression guards (task #59, generalizes the floor pattern
 * established for gate #60 by task #56 after the parser bug fixed in #54).
 * Floors are conservative — exemption rows and matched files only grow as
 * the corpus grows; a sudden drop indicates a parser regression silently
 * dropped table rows. If a count legitimately drops below a floor, lower
 * the floor in the same commit that documents the deliberate retirement.
 *
 * Authority:
 *   - ADR-0030 §D5 "Discoverability mandate"
 *   - spec/00-adrs/97-acceptance-criteria.md AT-30-I8
 *   - spec/00-adrs/97a-acceptance-criteria-fixtures.md §2.8
 *
 * Usage:
 *   node scripts/spec-hygiene/_tests/57.test.mjs
 *
 * Exit codes:
 *   0 — visibility line present, AT-30-I8 holds, counts ≥ floors.
 *   1 — visibility line missing, malformed, or counts below floor.
 *   2 — runner #57 itself failed (cannot evaluate AT-30-I8 in isolation).
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNNER = path.resolve(HERE, '../57-check-audit-exemption-review.mjs');
// AT-30-I8 contract: the line must announce row-count, file-match ratio, and pct.
const VISIBILITY_RE = /matches?\s+(\d+)\/(\d+)\s+files?\s+\(\d+(?:\.\d+)?%\)/;
// Captures "N exemption row(s)" preceding the visibility line.
const ROWS_RE = /(\d+)\s+exemption\s+row\(s\)/;

// Regression floors — established 2026-04-29 (task #59).
const MIN_EXEMPTION_ROWS = 20;
const MIN_MATCHED_FILES = 64;

function captureRunner() {
  try {
    return {
      ok: true,
      stdout: execFileSync('node', [RUNNER], { encoding: 'utf8' }),
    };
  } catch (err) {
    return { ok: false, stdout: err.stdout?.toString() ?? '', stderr: err.stderr?.toString() ?? '' };
  }
}

function main() {
  const result = captureRunner();
  if (!result.ok) {
    console.error('[meta-test 57] FAIL: runner #57 itself errored — cannot evaluate AT-30-I8');
    console.error(result.stderr || result.stdout);
    process.exit(2);
  }
  const matched = VISIBILITY_RE.exec(result.stdout);
  if (!matched) {
    console.error('[meta-test 57] FAIL AT-30-I8: runner stdout missing visibility line matching /matches N/M files (P.P%)/');
    console.error('--- captured stdout ---');
    console.error(result.stdout);
    process.exit(1);
  }
  const matchedFiles = Number(matched[1]);
  if (matchedFiles < MIN_MATCHED_FILES) {
    console.error(`[meta-test 57] FAIL MIN-FILES: matched ${matchedFiles} files < floor ${MIN_MATCHED_FILES}. Likely a parser regression silently dropped exemption rows (cf. tasks #54/#56/#59). If intentional, lower MIN_MATCHED_FILES in this file in the same commit.`);
    process.exit(1);
  }
  const rowsMatch = ROWS_RE.exec(result.stdout);
  if (rowsMatch) {
    const rows = Number(rowsMatch[1]);
    if (rows < MIN_EXEMPTION_ROWS) {
      console.error(`[meta-test 57] FAIL MIN-ROWS: ${rows} exemption row(s) < floor ${MIN_EXEMPTION_ROWS}. Likely a parser regression silently dropped table rows. If intentional, lower MIN_EXEMPTION_ROWS in this file in the same commit.`);
      process.exit(1);
    }
  }
  console.log(`[meta-test 57] ✓ AT-30-I8 holds — visibility line present: "${matched[0]}" (≥ floors ROWS ${MIN_EXEMPTION_ROWS} / FILES ${MIN_MATCHED_FILES})`);
}

main();
