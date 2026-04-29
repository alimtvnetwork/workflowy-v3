#!/usr/bin/env node
/**
 * G-00-ADR-XLINK-SYMMETRY (Phase 2 — anchor-locality)
 *
 * Mechanizes the fixture-as-spec at
 *   spec/13-cicd-pipeline-workflows/scripts-as-spec/xlink-symmetry-audit.md
 *
 * Phase 1 (frozen 2026-04-28): file-level back-link presence anywhere in target.
 * Phase 2 (this runner, 2026-04-29): anchor-locality — when the outbound link
 *   includes an `#anchor`, the reciprocal back-link MUST appear within a
 *   ±LOCALITY_LINES window around the matching heading in the target file.
 *   File-level back-link still suffices for anchorless links.
 *
 * Tier: CI / hard-fail (promoted from DOC-NORM ledger baseline of 4 pairs).
 *
 * Negative-test verified: removing the inline ratify blockquote at #01
 * anchor in .lovable/question-and-ambiguity/00-triage-summary.md correctly
 * surfaces an ANCHOR-LOCALITY violation for ADR-0024 §D1.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';

const REPO = resolve(process.cwd());
const ADR_DIR = join(REPO, 'spec/00-adrs');
const LOCALITY_LINES = 8; // back-link must appear within ±8 lines of anchor heading

const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;

function decisionSection(text) {
  const m = text.match(/^## Decision\s*$/m);
  if (!m) return '';
  const start = m.index + m[0].length;
  const rest = text.slice(start);
  const n = rest.match(/^## /m);
  return n ? rest.slice(0, n.index) : rest;
}

function slugify(heading) {
  // GitHub-flavoured slug (approx): lowercase, strip punctuation EXCEPT
  // ASCII alphanumerics, spaces, hyphens, underscores; collapse spaces → '-'.
  // Em/en dashes, em-dash, slash, colon, '?', '.', '`', emoji → removed.
  return heading
    .toLowerCase()
    .replace(/[\u2013\u2014]/g, '') // en-dash, em-dash → removed
    .replace(/[^\p{L}\p{N}\s_-]/gu, '') // strip non-letter/digit (incl. emoji, punct)
    .trim()
    .replace(/\s+/g, '-');
}

function findAnchorLine(lines, anchor) {
  // Match GitHub-style auto-slug from any heading line (#, ##, ###, …).
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^#{1,6}\s+(.+?)\s*$/);
    if (!h) continue;
    if (slugify(h[1]) === anchor) return i;
  }
  return -1;
}

const adrs = readdirSync(ADR_DIR)
  .filter((f) => /^\d{4}-.*\.md$/.test(f))
  .sort();

const violations = [];
let checked = 0;

for (const file of adrs) {
  const adrNum = file.slice(0, 4);
  const adrPath = join(ADR_DIR, file);
  const decision = decisionSection(readFileSync(adrPath, 'utf8'));
  if (!decision) continue;

  for (const m of decision.matchAll(linkRe)) {
    const [, label, url] = m;
    const [pathPart, anchor = ''] = url.split('#');
    if (!pathPart || /^(https?:|mailto:)/.test(pathPart)) continue;
    const target = resolve(dirname(adrPath), pathPart);
    let rel;
    try { rel = relative(REPO, target); } catch { continue; }
    if (rel.startsWith('..')) continue;
    if (rel.startsWith('spec/00-adrs/') || rel.startsWith('spec\\00-adrs\\')) continue;

    let ttext;
    try { ttext = readFileSync(target, 'utf8'); }
    catch { violations.push([adrNum, label, rel, anchor, 'TARGET MISSING']); continue; }
    checked++;

    const backRe = new RegExp(`${adrNum}-[a-z0-9-]+\\.md|ADR-${adrNum}\\b`);
    if (!backRe.test(ttext)) {
      violations.push([adrNum, label, rel, anchor, 'NO BACK-LINK']);
      continue;
    }

    if (!anchor) continue; // Phase-1 file-level pass is sufficient.

    // Phase-2 anchor-locality: back-link must be within ±LOCALITY_LINES of the anchor heading.
    const lines = ttext.split('\n');
    const anchorLine = findAnchorLine(lines, anchor);
    if (anchorLine < 0) {
      violations.push([adrNum, label, rel, anchor, 'ANCHOR MISSING']);
      continue;
    }
    const lo = Math.max(0, anchorLine - LOCALITY_LINES);
    const hi = Math.min(lines.length, anchorLine + LOCALITY_LINES + 1);
    const window = lines.slice(lo, hi).join('\n');
    if (!backRe.test(window)) {
      violations.push([adrNum, label, rel, anchor, 'ANCHOR-LOCALITY']);
    }
  }
}

console.log(`G-00-ADR-XLINK-SYMMETRY: checked ${checked} outbound non-ADR Decision-section link(s).`);
if (violations.length === 0) {
  console.log('  ✅ 0 violations.');
  process.exit(0);
}
console.log(`  ❌ ${violations.length} violation(s):`);
for (const [num, label, rel, anchor, reason] of violations) {
  console.log(`    ADR-${num} "${label}" → ${rel}${anchor ? '#' + anchor : ''} [${reason}]`);
}
process.exit(1);
