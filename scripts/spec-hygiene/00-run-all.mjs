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
  "scripts/spec-hygiene/17-check-at-fix-01.mjs",
  "scripts/spec-hygiene/38-check-ambiguous-wording.mjs",
  "scripts/spec-hygiene/39-check-feature-block-format.mjs",
  "scripts/spec-hygiene/15-check-enums-in-sync.mjs",
  "scripts/spec-hygiene/16-check-tailwind-tokens.mjs",
  "scripts/spec-hygiene/18-check-scoring-value-format.mjs",
  "scripts/spec-hygiene/19-check-runbook-staleness.mjs",
  "scripts/spec-hygiene/20-check-scoring-table-complete.mjs",
  "scripts/spec-hygiene/29-check-endpoint-matrix-coverage.mjs",
  "scripts/spec-hygiene/30-check-at-citation-validity.mjs",
  "scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs",
  "scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs",
  "scripts/spec-hygiene/33-check-cross-runner-duplicates.mjs",
  "scripts/spec-hygiene/34-check-allow-list-age.mjs",
  "scripts/spec-hygiene/35-allow-list-inventory.mjs --check",
  "scripts/spec-hygiene/36-check-cross-scope-islands.mjs",
  "scripts/spec-hygiene/37-check-stale-relative-links.mjs",
  "scripts/spec-hygiene/40-generate-contract-json.mjs",
  "scripts/spec-hygiene/41-generate-skeletons.mjs",
  "scripts/spec-hygiene/43-generate-condensed-overviews.mjs",
  "scripts/spec-hygiene/50-append-fixtures-to-condensed.mjs",
  "scripts/spec-hygiene/46-check-at-citation-completeness.mjs",
  "scripts/spec-hygiene/48-check-ledger-uses-shared-lib.mjs",
  "scripts/spec-hygiene/57-check-audit-exemption-review.mjs",
  "scripts/spec-hygiene/_tests/57.test.mjs",
  "scripts/spec-hygiene/58-check-at-fix-companion-shape.mjs",
  "scripts/spec-hygiene/59-check-placeholder-density.mjs",
  "scripts/spec-hygiene/52-check-adr-consequences-xlink.mjs",
  "scripts/spec-hygiene/53-check-scoring-values-fresh.mjs",
  "scripts/spec-hygiene/54-check-ai-contract-complete.mjs",
  "scripts/spec-hygiene/55-check-runner-regex-anchors.mjs",
  "scripts/spec-hygiene/56-check-adr-xlink-symmetry.mjs",
  "scripts/spec-hygiene/04-generate-index.mjs",
];

let failed = 0;
for (const script of checks) {
  console.log(`\n--- ${script} ---`);
  const parts = script.split(/\s+/);
  const r = spawnSync("node", parts, { stdio: "inherit" });
  if (r.status !== 0) failed += 1;
}

if (failed > 0) {
  console.error(`\n❌ ${failed} check(s) failed`);
  process.exit(1);
}
console.log("\n✅ All spec-hygiene checks passed");
