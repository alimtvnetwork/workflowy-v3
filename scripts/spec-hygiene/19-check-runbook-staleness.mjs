#!/usr/bin/env node
/**
 * Spec Hygiene Guard — Runbook Staleness Checker
 *
 * Promised in spec/15-wp-plugin-how-to/23-operator-runbooks/00-overview.md §"Hygiene gate":
 *
 *   "A runbook is stale if its referenced policy SSOT version is newer than
 *    the runbook's `_(matches A-XX vYY.ZZ.W)_` annotation. The next CI hygiene
 *    check (`19-check-runbook-staleness.mjs`, future) will fail builds where
 *    runbook ↔ policy versions drift."
 *
 * What this script does:
 *   1. Walk every `*.md` under spec/15-wp-plugin-how-to/23-operator-runbooks/
 *      that is NOT 00-overview.md / 97-* / 99-*.
 *   2. Extract the `_(matches A-XX vYY.ZZ.W)_` annotation from the
 *      `> **Implements:**` line. Both the A-id AND the version are mandatory.
 *   3. Resolve the linked policy SSOT and read its `> **Version:** X.Y.Z`
 *      header line + verify `> **Closes:** A-XX` matches the runbook A-id.
 *   4. Compare semver. Runbook annotation MUST equal policy SSOT version.
 *      Drift (policy newer OR mismatched A-id) = ❌.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const RUNBOOK_DIR = "spec/15-wp-plugin-how-to/23-operator-runbooks";
const EXEMPT = new Set([
  "00-overview.md",
  "97-acceptance-criteria.md",
  "99-consistency-report.md",
]);

const IMPLEMENTS_RE =
  /^>\s*\*\*Implements:\*\*\s*\[`([^`]+)`\]\(([^)]+)\)[^\n]*?_\(matches\s+(A-\d+)\s+v(\d+\.\d+\.\d+)\)_/m;
const POLICY_VERSION_RE = /^>\s*\*\*Version:\*\*\s*(\d+\.\d+\.\d+)/m;
const POLICY_CLOSES_RE = /^>\s*\*\*Closes:\*\*\s*(A-\d+)\b/m;

function listRunbooks() {
  let entries;
  try {
    entries = readdirSync(RUNBOOK_DIR);
  } catch {
    console.warn(`⚠ ${RUNBOOK_DIR} not found — skipping runbook-staleness check`);
    return [];
  }
  const files = [];
  for (const name of entries) {
    const full = join(RUNBOOK_DIR, name);
    if (!statSync(full).isFile()) continue;
    if (!name.endsWith(".md")) continue;
    if (EXEMPT.has(name)) continue;
    files.push(full);
  }
  return files.sort();
}

function semverCmp(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

function checkRunbook(runbookPath) {
  const issues = [];
  const body = readFileSync(runbookPath, "utf8");
  const m = body.match(IMPLEMENTS_RE);
  if (!m) {
    issues.push(
      `${runbookPath}: missing or malformed > **Implements:** line — required format ` +
        `\`> **Implements:** [\`<ssot-path>\`](<rel-link>) §<n> _(matches A-XX vYY.ZZ.W)_\``,
    );
    return issues;
  }
  const [, , relLink, runbookAId, runbookVersion] = m;
  const policyPath = resolve(dirname(runbookPath), relLink);
  let policyBody;
  try {
    policyBody = readFileSync(policyPath, "utf8");
  } catch {
    issues.push(`${runbookPath}: linked policy SSOT not readable: ${policyPath}`);
    return issues;
  }
  const vm = policyBody.match(POLICY_VERSION_RE);
  if (!vm) {
    issues.push(
      `${runbookPath}: linked policy ${policyPath} has no \`> **Version:** X.Y.Z\` header`,
    );
    return issues;
  }
  const policyVersion = vm[1];
  const cm = policyBody.match(POLICY_CLOSES_RE);
  if (cm && cm[1] !== runbookAId) {
    issues.push(
      `${runbookPath}: A-id mismatch — runbook claims ${runbookAId}, ` +
        `policy SSOT closes ${cm[1]}`,
    );
  }
  const cmp = semverCmp(policyVersion, runbookVersion);
  if (cmp > 0) {
    issues.push(
      `${runbookPath}: STALE — policy SSOT is v${policyVersion}, runbook annotation is v${runbookVersion}. ` +
        `Bump the runbook annotation or update the runbook content.`,
    );
  } else if (cmp < 0) {
    issues.push(
      `${runbookPath}: runbook annotation v${runbookVersion} is AHEAD of policy SSOT v${policyVersion} — ` +
        `version drift in the wrong direction.`,
    );
  }
  return issues;
}

function main() {
  const runbooks = listRunbooks();
  if (runbooks.length === 0) {
    console.log("✅ Runbook-staleness: no runbooks to check");
    return;
  }
  const all = [];
  for (const rb of runbooks) all.push(...checkRunbook(rb));
  if (all.length === 0) {
    console.log(
      `✅ Runbook-staleness: all ${runbooks.length} runbook(s) match their policy SSOT versions`,
    );
    return;
  }
  console.log(`❌ Runbook-staleness drift on ${all.length} item(s):`);
  for (const i of all) console.log(`  - ${i}`);
  process.exit(1);
}

main();
