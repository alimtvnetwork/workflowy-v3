#!/usr/bin/env node
/**
 * Spec Hygiene Guard — Required Files
 *
 * For every spec/ folder numbered ≥18 (the editable scope), require:
 *   - 00-overview.md
 *   - 99-consistency-report.md
 *
 * Subfolders inside an editable folder are also checked.
 * Folders 01–17 are READ-ONLY and skipped.
 *
 * Exit code: 1 if any required file is missing.
 *
 * Implements suggestion S04 (.lovable/memory/suggestions/04-ci-gate-overview-and-consistency.md).
 */
import { readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, basename } from "node:path";

const ROOT = "spec";
const MIN_EDITABLE = 18;
const REQUIRED = ["00-overview.md", "99-consistency-report.md"];
const FOLDER_PREFIX_RE = /^(\d{2})-[a-z0-9-]+$/;

const errors = [];

function isEditableTopLevel(name) {
  const m = name.match(FOLDER_PREFIX_RE);
  if (!m) return false;
  return Number(m[1]) >= MIN_EDITABLE;
}

function checkFolder(dir) {
  for (const required of REQUIRED) {
    if (!existsSync(join(dir, required))) {
      errors.push(`${relative(".", dir)}/ missing ${required}`);
    }
  }
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (!FOLDER_PREFIX_RE.test(name)) continue;
    checkFolder(full);
  }
}

for (const name of readdirSync(ROOT)) {
  const full = join(ROOT, name);
  if (!statSync(full).isDirectory()) continue;
  if (!isEditableTopLevel(name)) continue;
  checkFolder(full);
}

if (errors.length > 0) {
  console.error(`❌ Required files missing (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("✅ All editable spec folders have 00-overview.md + 99-consistency-report.md");
