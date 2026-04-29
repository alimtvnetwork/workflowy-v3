#!/usr/bin/env node
/**
 * Spec Hygiene Check — Enum Sync Guard
 *
 * Asserts that hand-maintained TypeScript literal-union enums in
 * `src/types/index.ts` stay in lock-step with their SSOT row in
 * `spec/20-enums-index.md`.
 *
 * Today this guards `ItemType` (12 cases). Add new entries to the
 * `ENUMS` table below to extend coverage.
 *
 * Failure modes detected:
 *   - missing case in TS that exists in spec
 *   - extra case in TS that does not exist in spec
 *   - duplicate cases on either side
 *
 * Exit codes:  0 = ok, 1 = drift detected, 2 = source files unreadable
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const SPEC_FILE = resolve(ROOT, "spec/20-enums-index.md");
const TS_FILE = resolve(ROOT, "src/types/index.ts");

/** Each entry pairs a spec enum-name with a TS literal-union name. */
const ENUMS = [
  {
    name: "ItemType",
    specEnum: "ItemType",
    tsType: "ItemType",
  },
];

function fail(msg) {
  console.error(`❌ enum-sync: ${msg}`);
  process.exit(1);
}

function readOrAbort(path) {
  if (!existsSync(path)) {
    console.error(`❌ enum-sync: missing required file ${path}`);
    process.exit(2);
  }
  return readFileSync(path, "utf8");
}

/**
 * Extract cases from a `spec/20-enums-index.md` table row of the form:
 *   | `EnumName` | `case1`, `case2`, ... | description |
 *
 * The enum-name cell may carry trailing annotations after the closing
 * backtick (e.g. `` `ItemType` ⚠️ **lowercase exception** ``) — the regex
 * tolerates any non-pipe content between the backtick and the column
 * separator so SSOT rows can self-document deviations inline.
 */
function extractSpecCases(specText, enumName) {
  const re = new RegExp(`\\|\\s*\`${enumName}\`[^|]*\\|([^|]+)\\|`);
  const m = specText.match(re);
  if (!m) return null;
  const cases = m[1]
    .split(",")
    .map((c) => c.trim().replace(/^`|`$/g, ""))
    .filter((c) => c.length > 0);
  return cases;
}

/**
 * Extract cases from a TS type alias of the form:
 *   export type Name = "a" | "b" | "c";
 */
function extractTsCases(tsText, typeName) {
  const re = new RegExp(
    `export\\s+type\\s+${typeName}\\s*=\\s*([^;]+);`,
    "m",
  );
  const m = tsText.match(re);
  if (!m) return null;
  const cases = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  return cases;
}

function diff(a, b) {
  const setB = new Set(b);
  return a.filter((x) => !setB.has(x));
}

function checkDuplicates(label, list) {
  const seen = new Set();
  const dups = [];
  for (const x of list) {
    if (seen.has(x)) dups.push(x);
    seen.add(x);
  }
  if (dups.length > 0) {
    fail(`${label} has duplicate cases: ${dups.join(", ")}`);
  }
}

function compareEnum(entry, specText, tsText) {
  const specCases = extractSpecCases(specText, entry.specEnum);
  if (!specCases) {
    fail(`spec row for \`${entry.specEnum}\` not found in 20-enums-index.md`);
  }
  const tsCases = extractTsCases(tsText, entry.tsType);
  if (!tsCases) {
    fail(`TS type \`${entry.tsType}\` not found in src/types/index.ts`);
  }
  checkDuplicates(`spec.${entry.specEnum}`, specCases);
  checkDuplicates(`ts.${entry.tsType}`, tsCases);

  const missingInTs = diff(specCases, tsCases);
  const extraInTs = diff(tsCases, specCases);
  if (missingInTs.length > 0 || extraInTs.length > 0) {
    console.error(`❌ enum-sync drift on ${entry.name}:`);
    if (missingInTs.length > 0) {
      console.error(`   spec has but TS missing: ${missingInTs.join(", ")}`);
    }
    if (extraInTs.length > 0) {
      console.error(`   TS has but spec missing: ${extraInTs.join(", ")}`);
    }
    process.exit(1);
  }
  console.log(
    `✅ ${entry.name}: ${tsCases.length} cases in sync (${tsCases.join(", ")})`,
  );
}

function main() {
  const specText = readOrAbort(SPEC_FILE);
  const tsText = readOrAbort(TS_FILE);
  for (const entry of ENUMS) compareEnum(entry, specText, tsText);
  console.log(`\n✅ enum-sync: all ${ENUMS.length} enum(s) in sync`);
}

main();
