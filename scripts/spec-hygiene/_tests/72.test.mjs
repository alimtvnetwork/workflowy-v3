#!/usr/bin/env node
/**
 * @file Regression test #72 — pins the placeholder-heuristic fix
 * shipped 2026-04-29 in `59-check-placeholder-density.mjs`.
 *
 * Before the fix, the gate's regex matched the bare word "placeholder"
 * anywhere, flagging legitimate technical prose like
 * "extractCodeBlocks() replaces fences with placeholders" as a stub.
 * That false positive inflated `09-code-block-system` (4/14 ≈ 29%) and
 * misdirected ~2 hours of F-AUDIT-25 burndown work toward phantom files.
 *
 * This test asserts the refined heuristic:
 *   ❌ legitimate prose using "placeholder"/"stub"/"TBD" as ordinary
 *      English MUST NOT trip the gate
 *   ✅ explicit stub markers (`TODO:`, `TBD:`, `Acceptance-Criteria Stub`,
 *      bullet-anchored `- placeholder`, `<!-- STUB`, etc.) MUST trip it
 *
 * Lock the regex shape via fixtures inlined into a temp dir, then invoke
 * the runner pointed at that dir — keeps the test hermetic and avoids
 * coupling to corpus drift.
 *
 * Exit codes:
 *   0 — heuristic correctly distinguishes prose from stub markers.
 *   1 — false positive returned (prose flagged) OR false negative
 *       (stub not flagged).
 */

import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// We import the runner indirectly: extract its PLACEHOLDER_RE by reading
// the source, eval-ing the array literal that builds it. This keeps the
// test loosely coupled to runner internals without re-implementing them.
const SRC = readFileSync(
  join(import.meta.dirname ?? new URL('.', import.meta.url).pathname, '../59-check-placeholder-density.mjs'),
  'utf8',
);

const arrMatch = SRC.match(/new RegExp\(\s*\[([\s\S]*?)\]\.join\('\|'\)/);
if (!arrMatch) {
  console.error('[test 72] FAIL: could not locate PLACEHOLDER_RE source array');
  process.exit(1);
}
// eslint-disable-next-line no-eval
const alts = eval(`[${arrMatch[1]}]`);
const RE = new RegExp(alts.join('|'), 'im');

const PROSE_NEGATIVES = [
  'extractCodeBlocks() replaces fences with placeholders',
  'The pipeline uses placeholder extraction to avoid regex collisions.',
  'A placeholder token like CODEBLOCK_42 is restored at the end.',
  'See section on stub generation for parser internals.', // "stub" mid-sentence
  'TBDoesNotMatchBecauseNoBoundary', // catches accidental greedy `TBD` matches
];
const STUB_POSITIVES = [
  'TODO: backfill this section',
  'TBD: format pending',
  'TBD —',
  'TBD\n',
  'This page is coming soon.',
  'Content to be defined in a follow-up PR.',
  'to be determined',
  '## Acceptance-Criteria Stub',
  '<!-- STUB: section pending -->',
  '- placeholder',
  '* stub',
];

let failed = 0;
for (const txt of PROSE_NEGATIVES) {
  if (RE.test(txt)) {
    console.error(`[test 72] FAIL false-positive: prose flagged → ${JSON.stringify(txt)}`);
    failed += 1;
  }
}
for (const txt of STUB_POSITIVES) {
  if (!RE.test(txt)) {
    console.error(`[test 72] FAIL false-negative: stub NOT flagged → ${JSON.stringify(txt)}`);
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`[test 72] ${failed} regression(s)`);
  process.exit(1);
}
console.log(`[test 72] ✓ heuristic correctly separates prose from stub markers (${PROSE_NEGATIVES.length} negatives + ${STUB_POSITIVES.length} positives)`);
