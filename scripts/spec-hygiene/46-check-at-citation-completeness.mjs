#!/usr/bin/env node
/**
 * G-40 — AT-citation completeness gate.
 *
 * Reads spec/contract.json (produced by 40-generate-contract-json.mjs) and
 * fails if any acceptance-test ID is cited somewhere in spec/ but never
 * defined (orphan citation). Allow-list lives in 40-generate-contract-json.mjs
 * (AT_ALLOW_ORPHAN regex) for documentation-only IDs.
 *
 * Run order: this gate MUST run AFTER 40-generate-contract-json.mjs so the
 * contract.json reflects the current spec state.
 */
import { readFileSync, existsSync } from "node:fs";

const CONTRACT = "spec/contract.json";

if (!existsSync(CONTRACT)) {
  console.error("❌ G-40: spec/contract.json missing — run 40-generate-contract-json.mjs first");
  process.exit(1);
}

const contract = JSON.parse(readFileSync(CONTRACT, "utf8"));
const orphans = contract.orphan_at_citations || [];

if (orphans.length === 0) {
  console.log(`✅ G-40: AT-citation completeness clean (${(contract.acceptance_tests || []).length} ATs defined, 0 orphan citations)`);
  process.exit(0);
}

console.error(`❌ G-40: ${orphans.length} orphan AT citation(s):\n`);
for (const o of orphans) {
  console.error(`  ${o.id}`);
  for (const c of o.citedIn.slice(0, 3)) console.error(`    cited at ${c.file}:${c.line}`);
  if (o.citedIn.length > 3) console.error(`    … +${o.citedIn.length - 3} more`);
}
console.error(`\nResolution:\n  1) Add a definition row in the appropriate 97-acceptance-criteria.md (table or H3 heading), OR\n  2) Use scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs as a template, OR\n  3) If the citation is documentation-only, add the ID to AT_ALLOW_ORPHAN in 40-generate-contract-json.mjs.`);
process.exit(1);
