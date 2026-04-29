#!/usr/bin/env node
/**
 * @file G-13-LEDGER-USES-SHARED-LIB — enforces ADR-0029.
 *
 * Flags any runner under `scripts/spec-hygiene/` (excluding `_lib/`) that:
 *   1. Defines `globToRegExp` inline (function or const).
 *   2. Defines `walkLedger` inline (function or const).
 *   3. Reads a `_LEDGER-G-*-EXEMPTIONS.md` path via fs.readFile* directly.
 *   4. Mentions a ledger file but does NOT import from
 *      `./_lib/per-gate-path-ledger.mjs`.
 *
 * Exit non-zero when violations exist.
 *
 * @see spec/00-adrs/0029-per-gate-path-ledger-shared-lib.md
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const RUNNER_DIR = join(ROOT, 'scripts', 'spec-hygiene');
const LIB_REL = '_lib/per-gate-path-ledger.mjs';

const LEDGER_MENTION = /_LEDGER-G-[A-Z0-9-]+-EXEMPTIONS\.md/;
const INLINE_GLOB = /(?:^|\s)(?:function\s+globToRegExp|const\s+globToRegExp\s*=)/;
const INLINE_WALK = /(?:^|\s)(?:function\*?\s+walkLedger|const\s+walkLedger\s*=)/;
const DIRECT_READ = /readFile(?:Sync)?\s*\([^)]*_LEDGER-G-[A-Z0-9-]+-EXEMPTIONS\.md/;
const SHARED_IMPORT = /from\s+["']\.\/_lib\/per-gate-path-ledger\.mjs["']/;

function listRunners(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === '_lib') continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isFile() && name.endsWith('.mjs')) out.push(full);
  }
  return out;
}

function checkRunner(absPath) {
  const src = readFileSync(absPath, 'utf8');
  const rel = relative(ROOT, absPath);
  const issues = [];
  if (INLINE_GLOB.test(src)) issues.push(`inline globToRegExp (use ${LIB_REL})`);
  if (INLINE_WALK.test(src)) issues.push(`inline walkLedger (use ${LIB_REL})`);
  if (DIRECT_READ.test(src)) issues.push(`direct readFile of ledger (route through walkLedger)`);
  const mentionsLedger = LEDGER_MENTION.test(src);
  const importsLib = SHARED_IMPORT.test(src);
  if (mentionsLedger && !importsLib) issues.push(`references ledger without importing ${LIB_REL}`);
  return { rel, issues };
}

function main() {
  const runners = listRunners(RUNNER_DIR);
  const violations = runners
    .map(checkRunner)
    .filter((r) => r.issues.length > 0);
  if (violations.length === 0) {
    console.log(`[G-13-LEDGER-USES-SHARED-LIB] ✓ ${runners.length} runners conform.`);
    return 0;
  }
  console.error(`[G-13-LEDGER-USES-SHARED-LIB] ✗ ${violations.length} runner(s) violate ADR-0029:\n`);
  for (const v of violations) {
    console.error(`  ${v.rel}`);
    for (const issue of v.issues) console.error(`    - ${issue}`);
  }
  console.error(`\nFix: import the 5 primitives from scripts/spec-hygiene/${LIB_REL}`);
  console.error(`See: spec/00-adrs/0029-per-gate-path-ledger-shared-lib.md`);
  return 1;
}

process.exit(main());
