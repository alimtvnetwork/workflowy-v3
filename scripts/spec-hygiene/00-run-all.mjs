#!/usr/bin/env node
/**
 * Spec Hygiene Guard — Runner
 *
 * Runs all three checks in order and aggregates the exit code.
 * Use in CI:  node scripts/spec-hygiene/00-run-all.mjs
 */
import { spawnSync } from "node:child_process";

const checks = [
  "scripts/spec-hygiene/01-check-numbering.mjs",
  "scripts/spec-hygiene/02-check-headers.mjs",
  "scripts/spec-hygiene/03-check-links.mjs",
  "scripts/spec-hygiene/05-check-file-length.mjs",
  "scripts/spec-hygiene/06-check-feature-shape.mjs",
  "scripts/spec-hygiene/07-extract-contract-map.mjs",
  "scripts/spec-hygiene/08-check-acceptance-coverage.mjs",
  "scripts/spec-hygiene/09-check-xrefs.mjs",
  "scripts/spec-hygiene/11-generate-auto-toc.mjs",
  "scripts/spec-hygiene/12-check-required-files.mjs",
  "scripts/spec-hygiene/13-generate-at-stubs.mjs",
  "scripts/spec-hygiene/15-check-enums-in-sync.mjs",
  "scripts/spec-hygiene/04-generate-index.mjs",
];

let failed = 0;
for (const script of checks) {
  console.log(`\n--- ${script} ---`);
  const r = spawnSync("node", [script], { stdio: "inherit" });
  if (r.status !== 0) failed += 1;
}

if (failed > 0) {
  console.error(`\n❌ ${failed} check(s) failed`);
  process.exit(1);
}
console.log("\n✅ All spec-hygiene checks passed");
