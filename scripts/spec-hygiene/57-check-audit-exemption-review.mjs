#!/usr/bin/env node
/**
 * @file G-00-AUDIT-EXEMPTION-REVIEW — closes F-AUDIT-31.
 *
 * `spec/_AUDIT-EXEMPTIONS.md` is a manual override on the audit heuristic that
 * masks files from the placeholder-density count. Without a review gate, future
 * authors could silently widen the manifest's globs and hide real abandoned
 * stubs behind a one-line edit.
 *
 * This gate enforces the manifest's STRUCTURAL invariants on every CI run, so a
 * widening change either (a) keeps the manifest well-formed and forces the diff
 * into reviewer awareness, or (b) trips here and demands explanation.
 *
 * Invariants enforced:
 *   I1. File exists at canonical path `spec/_AUDIT-EXEMPTIONS.md`.
 *   I2. Contains exactly one `## Exemption rows` H2 (frozen schema).
 *   I3. Table header MUST be `pathGlob | category | rationale | closes | addedOn`
 *       (case-sensitive, in order).
 *   I4. Every row's `pathGlob` cell MUST start with `spec/` (no repo-root escapes).
 *   I5. Every row's `pathGlob` MUST NOT be a bare corpus-wide glob (e.g.
 *       `spec/**` or any pattern matching every markdown file under `spec/`).
 *       Such blank-cheque globs would mask the entire corpus.
 *   I6. Every row MUST cite at least one of: an audit finding ID
 *       (`AUD-*` or `F-AUDIT-*` or `F-AUD\d+-*`), an ADR ID (`ADR-\d{4}`),
 *       or `n/a` (explicit acknowledgement that no audit ratifies it).
 *   I7. Every row's `addedOn` MUST be ISO date `YYYY-MM-DD`.
 *   I8. Total exempted-file count (computed by walking the globs) MUST be
 *       printed in the gate output for reviewer awareness on every CI run.
 *
 * @see spec/_AUDIT-EXEMPTIONS.md
 * @see /mnt/documents/spec-ai-implementability-audit-v2.json (F-AUDIT-31)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { globToRegExp } from './_lib/per-gate-path-ledger.mjs';
import { splitMdRow, splitMdHeader } from './_lib/md-table.mjs';

const ROOT = process.cwd();
const MANIFEST = join(ROOT, 'spec', '_AUDIT-EXEMPTIONS.md');
const REQUIRED_HEADER = ['pathGlob', 'category', 'rationale', 'closes', 'addedOn'];
const FORBIDDEN_GLOBS = new Set(['spec/**', 'spec/**/*', 'spec/**/*.md', 'spec/*', '**/*']);
const CITATION = /\b(AUD-[A-Z0-9-]+|F-AUDIT-\d+|F-AUD\d+-\d+|ADR-\d{4}|n\/a)\b/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function fail(msg) { console.error(`[G-00-AUDIT-EXEMPTION-REVIEW] ✗ ${msg}`); return 1; }
function ok(msg) { console.log(`[G-00-AUDIT-EXEMPTION-REVIEW] ✓ ${msg}`); }

function loadManifest() {
  try { return readFileSync(MANIFEST, 'utf8'); }
  catch { throw new Error(`I1 violated: ${MANIFEST} missing`); }
}

function parseHeader(line) {
  return splitMdHeader(line);
}

function extractRows(src) {
  const lines = src.split('\n');
  const h2Idx = lines.findIndex((l) => /^## Exemption rows\s*$/.test(l));
  if (h2Idx < 0) throw new Error('I2 violated: missing "## Exemption rows" H2');
  const dup = lines.slice(h2Idx + 1).findIndex((l) => /^## Exemption rows\s*$/.test(l));
  if (dup >= 0) throw new Error('I2 violated: duplicate "## Exemption rows" H2');
  const headerLine = lines.slice(h2Idx + 1).find((l) => l.includes('|') && /pathGlob/i.test(l));
  if (!headerLine) throw new Error('I3 violated: header row missing');
  const header = parseHeader(headerLine);
  const headerOk = REQUIRED_HEADER.every((c, i) => header[i] === c);
  if (!headerOk) throw new Error(`I3 violated: header is [${header.join('|')}], expected [${REQUIRED_HEADER.join('|')}]`);
  const headerIdx = lines.indexOf(headerLine);
  const rows = [];
  for (let i = headerIdx + 2; i < lines.length; i += 1) {
    const l = lines[i];
    if (!l.trim() || l.startsWith('#')) break;
    if (!l.includes('|')) continue;
    const cells = splitMdRow(l);
    if (cells.length !== 5) throw new Error(`I3 violated: row at line ${i + 1} has ${cells.length} cells (expected 5) — check for unescaped \`|\` outside backtick spans`);
    rows.push({ pathGlob: cells[0], category: cells[1], rationale: cells[2], closes: cells[3], addedOn: cells[4] });
  }
  return rows;
}

function validateRow(row, idx) {
  const errs = [];
  if (!row.pathGlob.startsWith('spec/')) errs.push(`I4: pathGlob must start with "spec/" (got "${row.pathGlob}")`);
  if (FORBIDDEN_GLOBS.has(row.pathGlob)) errs.push(`I5: blank-cheque glob "${row.pathGlob}" forbidden`);
  if (!CITATION.test(row.closes)) errs.push(`I6: "closes" must cite AUD-*/F-AUDIT-*/ADR-NNNN or "n/a" (got "${row.closes}")`);
  if (!ISO_DATE.test(row.addedOn)) errs.push(`I7: "addedOn" must be ISO YYYY-MM-DD (got "${row.addedOn}")`);
  return errs.map((e) => `  row ${idx + 1}: ${e}`);
}

// globToRegExp is imported from _lib/per-gate-path-ledger.mjs (ADR-0029 D1).

function walk(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else acc.push(p.replace(`${ROOT}/`, ''));
  }
  return acc;
}

function countMatches(rows) {
  const allFiles = walk(join(ROOT, 'spec'));
  const regexes = rows.map((r) => globToRegExp(r.pathGlob));
  let n = 0;
  for (const f of allFiles) if (regexes.some((rx) => rx.test(f))) n += 1;
  return { matched: n, total: allFiles.length };
}

function main() {
  let src;
  try { src = loadManifest(); } catch (e) { return fail(e.message); }
  let rows;
  try { rows = extractRows(src); } catch (e) { return fail(e.message); }
  if (rows.length === 0) return fail('manifest has zero exemption rows — empty exemptions render the gate moot');
  const allErrs = rows.flatMap(validateRow);
  if (allErrs.length > 0) {
    console.error(`[G-00-AUDIT-EXEMPTION-REVIEW] ✗ ${allErrs.length} validation error(s):`);
    for (const e of allErrs) console.error(e);
    console.error(`\nFix: edit spec/_AUDIT-EXEMPTIONS.md and re-run this gate.`);
    console.error(`See: F-AUDIT-31 in /mnt/documents/spec-ai-implementability-audit-v2.json`);
    return 1;
  }
  const { matched, total } = countMatches(rows);
  const pct = ((matched / total) * 100).toFixed(1);
  ok(`${rows.length} exemption row(s) valid; matches ${matched}/${total} files (${pct}%)`);
  if (matched / total > 0.10) {
    console.warn(`[G-00-AUDIT-EXEMPTION-REVIEW] ⚠ exemptions cover >10% of corpus — reviewer attention recommended`);
  }
  return 0;
}

process.exit(main());
