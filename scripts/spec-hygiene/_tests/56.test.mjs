#!/usr/bin/env node
/**
 * @file Meta-test for G-00-ADR-XLINK-SYMMETRY (gate #56).
 *
 * Locks the visibility-line contract emitted by `56-check-adr-xlink-symmetry.mjs`:
 *
 *   "G-00-ADR-XLINK-SYMMETRY: checked <N> outbound non-ADR Decision-section link(s)."
 *
 * Extends meta-test coverage from #57/#59/#60/#61/#52 to gate #56 (task
 * #66). Same defence-in-depth pattern: a future runner edit could silently
 * drop the always-on link-count signal, masking regressions in the
 * ADR↔scope cross-link symmetry that complements F-AUDIT-21 backfill (#1).
 *
 * MIN-count regression guard (per #56/#59 floor pattern):
 *   - MIN_OUTBOUND_LINKS: outbound non-ADR Decision-section links are
 *     monotonic-up as ADRs accumulate cross-references. A drop indicates
 *     a glob/parser regression silently skipped ADR files or sections.
 *
 * Usage:
 *   node scripts/spec-hygiene/_tests/56.test.mjs
 *
 * Exit codes:
 *   0 — visibility line present, well-formed, and count ≥ floor.
 *   1 — visibility line missing, malformed, or count below floor.
 *   2 — runner #56 itself failed (cannot evaluate the contract in isolation).
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNNER = path.resolve(HERE, '../56-check-adr-xlink-symmetry.mjs');
// Contract: "G-00-ADR-XLINK-SYMMETRY: checked <N> outbound non-ADR Decision-section link(s)."
const VISIBILITY_RE = /G-00-ADR-XLINK-SYMMETRY:\s+checked\s+(\d+)\s+outbound\s+non-ADR\s+Decision-section\s+link\(s\)\./;

// Regression floor — established 2026-04-29 (task #66).
// Outbound link count is monotonic-up as ADRs add cross-references.
const MIN_OUTBOUND_LINKS = 4;

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
    console.error('[meta-test 56] FAIL: runner #56 itself errored — cannot evaluate visibility contract');
    console.error(result.stderr || result.stdout);
    process.exit(2);
  }
  const matched = VISIBILITY_RE.exec(result.stdout);
  if (!matched) {
    console.error('[meta-test 56] FAIL: runner stdout missing visibility line matching /G-00-ADR-XLINK-SYMMETRY: checked N outbound non-ADR Decision-section link(s)./');
    console.error('--- captured stdout ---');
    console.error(result.stdout);
    process.exit(1);
  }
  const links = Number(matched[1]);
  if (links < MIN_OUTBOUND_LINKS) {
    console.error(`[meta-test 56] FAIL MIN-LINKS: ${links} outbound link(s) < floor ${MIN_OUTBOUND_LINKS}. Likely a glob/parser regression silently dropped ADR Decision sections (cf. tasks #54/#56/#59/#64/#66). If intentional (e.g. ADR consolidation), lower MIN_OUTBOUND_LINKS in this file in the same commit.`);
    process.exit(1);
  }
  console.log(`[meta-test 56] ✓ visibility contract holds — line present: "${matched[0]}" (≥ floor LINKS ${MIN_OUTBOUND_LINKS})`);
}

main();
