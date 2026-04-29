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
 * Authority:
 *   - ADR-0030 §D5 "Discoverability mandate"
 *   - spec/00-adrs/97-acceptance-criteria.md AT-30-I8
 *   - spec/00-adrs/97a-acceptance-criteria-fixtures.md §2.8
 *
 * Usage:
 *   node scripts/spec-hygiene/_tests/57.test.mjs
 *
 * Exit codes:
 *   0 — visibility line present, AT-30-I8 holds.
 *   1 — visibility line missing or malformed.
 *   2 — runner #57 itself failed (cannot evaluate AT-30-I8 in isolation).
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNNER = path.resolve(HERE, '../57-check-audit-exemption-review.mjs');
// AT-30-I8 contract: the line must announce row-count, file-match ratio, and pct.
const VISIBILITY_RE = /matches?\s+\d+\/\d+\s+files?\s+\(\d+(?:\.\d+)?%\)/;

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
  console.log(`[meta-test 57] ✓ AT-30-I8 holds — visibility line present: "${matched[0]}"`);
}

main();
