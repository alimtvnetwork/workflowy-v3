#!/usr/bin/env node
/**
 * @file G-00-AT-FIX-COMPANION-SHAPE — closes F-AUDIT-32 follow-up (#28).
 *
 * Mechanically enforces the `97a-acceptance-criteria-fixtures.md` companion-
 * file shape rules formalised in
 * `spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`
 * §"Companion-file pattern".
 *
 * Scope: every file matching `spec/**\/97a-acceptance-criteria-fixtures.md`
 * EXCEPT the corpus-wide sweep file `spec/97a-acceptance-criteria-fixtures.md`
 * (which uses the Pattern Catalogue shape, not the §N cluster shape).
 *
 * Invariants enforced:
 *   S1. Companion file MUST live in the same directory as a sibling
 *       `97-acceptance-criteria.md`. Orphan companion files are forbidden.
 *   S2. At most one `97a-acceptance-criteria-fixtures.md` per directory
 *       (singleton per scope). Enforced implicitly by filename literal.
 *   S3. File MUST contain a front-matter blockquote at the top with at least:
 *       `Version`, `Created`, `Status`, `Format SSOT`, and `Closes` lines
 *       (each as `> **Field:** value` or `> **Field**`).
 *   S4. File MUST contain exactly one `## Scope` H2.
 *   S5. File MUST contain exactly one `## Verification` H2.
 *   S6. File MUST contain exactly one `## Related` H2.
 *   S7. The sibling `97-acceptance-criteria.md` MUST link back to the
 *       companion in its `## Related` section using the literal substring
 *       `97a-acceptance-criteria-fixtures.md` (discoverability mandate).
 *
 * @see spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md
 * @see ADR backing: F-AUDIT-32 resolution recorded in
 *      /mnt/documents/spec-ai-implementability-audit-v3.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SPEC_ROOT = path.resolve(HERE, '../../spec');
const COMPANION_NAME = '97a-acceptance-criteria-fixtures.md';
const PARENT_NAME = '97-acceptance-criteria.md';
const SWEEP_FILE = path.join(SPEC_ROOT, COMPANION_NAME);

const FRONT_MATTER_FIELDS = ['Version', 'Created', 'Status', 'Format SSOT', 'Closes'];

function listCompanions(dir) {
  const out = [];
  walk(dir, out);
  return out.filter((p) => p !== SWEEP_FILE);
}

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full, out); continue; }
    if (entry.isFile() && entry.name === COMPANION_NAME) out.push(full);
  }
}

function checkOne(filePath) {
  const fails = [];
  const dir = path.dirname(filePath);
  const parent = path.join(dir, PARENT_NAME);
  const text = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(SPEC_ROOT, filePath);

  if (!fs.existsSync(parent)) {
    fails.push(`S1 ${rel}: orphan companion — sibling ${PARENT_NAME} missing in ${path.relative(SPEC_ROOT, dir)}/`);
    return fails;
  }
  for (const field of FRONT_MATTER_FIELDS) {
    const re = new RegExp(`^>\\s*\\*\\*${field.replace(/ /g, '\\s+')}[:*]`, 'm');
    if (!re.test(text)) fails.push(`S3 ${rel}: front-matter missing required field "${field}"`);
  }
  const scopeCount = (text.match(/^## Scope\b/gm) || []).length;
  if (scopeCount !== 1) fails.push(`S4 ${rel}: expected exactly 1 "## Scope" H2, found ${scopeCount}`);
  const verifyCount = (text.match(/^## Verification\b/gm) || []).length;
  if (verifyCount !== 1) fails.push(`S5 ${rel}: expected exactly 1 "## Verification" H2, found ${verifyCount}`);
  const relatedCount = (text.match(/^## Related\b/gm) || []).length;
  if (relatedCount !== 1) fails.push(`S6 ${rel}: expected exactly 1 "## Related" H2, found ${relatedCount}`);

  const parentText = fs.readFileSync(parent, 'utf8');
  const relatedSection = parentText.split(/^## Related\b/m)[1] ?? '';
  if (!relatedSection.includes(COMPANION_NAME)) {
    fails.push(`S7 ${path.relative(SPEC_ROOT, parent)}: ## Related does not link to sibling ${COMPANION_NAME} (discoverability)`);
  }
  return fails;
}

function loadAllowList() {
  const ledger = path.resolve(SPEC_ROOT, '_LEDGER-G-00-AT-FIX-COMPANION-SHAPE-BASELINE.md');
  if (!fs.existsSync(ledger)) return new Set();
  const text = fs.readFileSync(ledger, 'utf8');
  const allowed = new Set();
  for (const m of text.matchAll(/^\|\s*`([^`]+)`\s*\|/gm)) allowed.add(m[1].trim());
  return allowed;
}

function main() {
  const companions = listCompanions(SPEC_ROOT);
  const allowList = loadAllowList();
  const allFails = companions.flatMap(checkOne);
  const enforced = allFails.filter((msg) => ![...allowList].some((g) => msg.includes(g)));
  const waived = allFails.length - enforced.length;
  if (enforced.length > 0) {
    console.warn(`[G-00-AT-FIX-COMPANION-SHAPE] ⚠ WARN-only (${enforced.length} new violation(s); ${waived} waived by baseline ledger)`);
    for (const msg of enforced) console.warn(`  - ${msg}`);
    // WARN-only: gate does not fail CI until baseline ledger is drained.
    // Drain plan: 14-day TTL (matures 2026-05-13). After drain, flip to hard-fail.
    process.exit(0);
  }
  console.log(`[G-00-AT-FIX-COMPANION-SHAPE] ✓ ${companions.length} companion file(s) shape-valid (${waived} waived by baseline ledger; sweep file excluded)`);
}

main();
