#!/usr/bin/env node
/**
 * @file G-00-PLACEHOLDER-DENSITY — caps per-scope placeholder density at ≤15%.
 *
 * **Closes:** F-AUDIT-15 follow-up tooling gap.
 * **Companion to:** G-00-AUDIT-EXEMPTION-REVIEW (gate 57). That gate validates
 * the exemption manifest's *shape*; this gate consumes the manifest's globs to
 * exclude intentional stubs from the placeholder count, then enforces the cap.
 *
 * Placeholder heuristic (mirrors the 2026-04-29 Gemini-2.5-Pro audit):
 *   - File size < 600 bytes, OR
 *   - File body matches /placeholder|stub|to be defined|TBD|coming soon/i
 * Applied only to `*.md` files under `spec/`.
 *
 * Exemption-aware: any file matching a `pathGlob` row in
 * `spec/_AUDIT-EXEMPTIONS.md` is excluded from BOTH the placeholder count
 * AND the per-scope denominator (so a folder of 100% legitimate redirect
 * stubs scores 0% density, not 100%).
 *
 * Per-scope = first-level directory under `spec/` (e.g. `00-adrs`, `31-app`).
 * Files at `spec/*.md` (top-level) form the synthetic scope `_root`.
 *
 * Cap: 15% per scope. Violations print scope, count, total, percentage,
 * and the top 5 offending files for triage.
 *
 * **Mode:** warn-only (exit 0) until F-AUDIT-15 closes (172 placeholders
 * scheduled for cleanup). Flip `STRICT = true` when global density ≤ 8%
 * AND no scope exceeds 15%. Tracked in tasks #2/#3/#4/#7.
 *
 * Visibility line (mandatory, parsed by future meta-test):
 *   "density <pct>% across <scopes> scope(s); cap 15%"
 *
 * @see spec/_AUDIT-EXEMPTIONS.md
 * @see /mnt/documents/spec-ai-implementability-audit-v3.json (F-AUDIT-15)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { globToRegExp } from './_lib/per-gate-path-ledger.mjs';

const ROOT = process.cwd();
const SPEC_DIR = join(ROOT, 'spec');
const MANIFEST = join(SPEC_DIR, '_AUDIT-EXEMPTIONS.md');
const CAP = 0.15;
const STRICT = false; // flip to true once F-AUDIT-15 closes
const PLACEHOLDER_RE = /\b(placeholder|stub|to be defined|TBD|coming soon)\b/i;
const SIZE_THRESHOLD = 600;

function fail(msg) { console.error(`[G-00-PLACEHOLDER-DENSITY] ✗ ${msg}`); return 1; }
function ok(msg) { console.log(`[G-00-PLACEHOLDER-DENSITY] ✓ ${msg}`); }

function loadExemptionGlobs() {
  let src;
  try { src = readFileSync(MANIFEST, 'utf8'); } catch { return []; }
  const lines = src.split('\n');
  const h2 = lines.findIndex((l) => /^## Exemption rows\s*$/.test(l));
  if (h2 < 0) return [];
  const headerIdx = lines.slice(h2 + 1).findIndex((l) => l.includes('|') && /pathGlob/i.test(l));
  const globs = [];
  for (let i = h2 + 1 + headerIdx + 2; i < lines.length; i += 1) {
    const l = lines[i];
    if (!l.trim() || l.startsWith('#')) break;
    if (!l.includes('|')) continue;
    const cells = l.split('|').map((c) => c.trim().replace(/^`|`$/g, '')).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    if (cells.length === 5) globs.push(cells[0]);
  }
  return globs.map((g) => globToRegExp(g));
}

function walkMd(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    const st = statSync(p);
    if (st.isDirectory()) walkMd(p, acc);
    else if (n.endsWith('.md')) acc.push(p);
  }
  return acc;
}

function isPlaceholder(absPath) {
  const sz = statSync(absPath).size;
  if (sz < SIZE_THRESHOLD) return true;
  const body = readFileSync(absPath, 'utf8');
  return PLACEHOLDER_RE.test(body);
}

function scopeOf(relPath) {
  const parts = relPath.split(sep);
  return parts.length === 1 ? '_root' : parts[0];
}

function bucket(files, exemptRx) {
  const buckets = new Map();
  for (const abs of files) {
    const rel = relative(ROOT, abs);
    if (exemptRx.some((rx) => rx.test(rel))) continue;
    const sc = scopeOf(relative(SPEC_DIR, abs));
    if (!buckets.has(sc)) buckets.set(sc, { total: 0, placeholders: [] });
    const b = buckets.get(sc);
    b.total += 1;
    if (isPlaceholder(abs)) b.placeholders.push(rel);
  }
  return buckets;
}

function main() {
  const exemptRx = loadExemptionGlobs();
  const files = walkMd(SPEC_DIR);
  const buckets = bucket(files, exemptRx);
  const offenders = [];
  let totalFiles = 0;
  let totalPh = 0;
  for (const [sc, b] of buckets) {
    totalFiles += b.total;
    totalPh += b.placeholders.length;
    const pct = b.total > 0 ? b.placeholders.length / b.total : 0;
    if (pct > CAP) offenders.push({ sc, ...b, pct });
  }
  const globalPct = totalFiles > 0 ? ((totalPh / totalFiles) * 100).toFixed(1) : '0.0';
  ok(`density ${globalPct}% across ${buckets.size} scope(s); cap ${(CAP * 100).toFixed(0)}%`);
  if (offenders.length === 0) return 0;
  console.error(`[G-00-PLACEHOLDER-DENSITY] ✗ ${offenders.length} scope(s) over ${(CAP * 100).toFixed(0)}% cap:`);
  for (const o of offenders) {
    console.error(`  ${o.sc}: ${o.placeholders.length}/${o.total} (${(o.pct * 100).toFixed(1)}%)`);
    for (const f of o.placeholders.slice(0, 5)) console.error(`    - ${f}`);
    if (o.placeholders.length > 5) console.error(`    … +${o.placeholders.length - 5} more`);
  }
  console.error(`\nFix: thicken offending files OR add narrow glob to spec/_AUDIT-EXEMPTIONS.md (cites required).`);
  return 1;
}

process.exit(main());
