#!/usr/bin/env node
/**
 * @file CI aggregator for spec-hygiene meta-tests (task #61).
 *
 * Auto-discovers every `*.test.mjs` under `scripts/spec-hygiene/_tests/`
 * (excluding this aggregator itself), runs each in a child node process,
 * captures stdout+stderr, and emits a single summary line plus a single
 * exit code (0 = all pass, 1 = ≥1 failure, 2 = aggregator self-error).
 *
 * Why this exists:
 *   Before this aggregator each meta-test was invoked individually in CI,
 *   meaning a newly added test (e.g. `_tests/62.test.mjs`) could ship
 *   without being wired into CI. Discovery is now glob-based, so any new
 *   `*.test.mjs` in the directory is picked up automatically — no CI
 *   config edit required.
 *
 * Output format (per test, on success):
 *   [PASS] 57.test.mjs (123ms)
 * Output format (per test, on failure):
 *   [FAIL] 60.test.mjs (89ms) exit=1
 *   --- stdout ---
 *   ...
 *   --- stderr ---
 *   ...
 *
 * Final summary:
 *   [meta-tests] N/M passed (Tms total)
 *
 * Usage:
 *   node scripts/spec-hygiene/_tests/run-all.mjs
 *
 * Exit codes:
 *   0 — every discovered test passed.
 *   1 — ≥1 test failed (full output of failing tests printed).
 *   2 — aggregator itself errored (e.g. could not read directory).
 */

import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SELF = path.basename(fileURLToPath(import.meta.url));

function discoverTests() {
  const entries = readdirSync(HERE, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.test.mjs') && e.name !== SELF)
    .map((e) => e.name)
    .sort();
}

function runOne(name) {
  const started = Date.now();
  const result = spawnSync('node', [path.join(HERE, name)], { encoding: 'utf8' });
  return {
    name,
    durationMs: Date.now() - started,
    code: result.status ?? 2,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function reportFailure(r) {
  console.error(`[FAIL] ${r.name} (${r.durationMs}ms) exit=${r.code}`);
  if (r.stdout.trim()) {
    console.error('--- stdout ---');
    console.error(r.stdout.trimEnd());
  }
  if (r.stderr.trim()) {
    console.error('--- stderr ---');
    console.error(r.stderr.trimEnd());
  }
}

function main() {
  let tests;
  try {
    tests = discoverTests();
  } catch (err) {
    console.error(`[meta-tests] aggregator error: ${err.message}`);
    process.exit(2);
  }
  if (tests.length === 0) {
    console.error(`[meta-tests] FAIL: no *.test.mjs files discovered in ${HERE}`);
    process.exit(2);
  }
  const startedAll = Date.now();
  const results = tests.map(runOne);
  const passed = results.filter((r) => r.code === 0);
  const failed = results.filter((r) => r.code !== 0);
  for (const r of passed) console.log(`[PASS] ${r.name} (${r.durationMs}ms)`);
  for (const r of failed) reportFailure(r);
  const totalMs = Date.now() - startedAll;
  console.log(`[meta-tests] ${passed.length}/${results.length} passed (${totalMs}ms total)`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
