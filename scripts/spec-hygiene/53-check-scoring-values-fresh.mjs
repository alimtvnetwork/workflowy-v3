#!/usr/bin/env node
/**
 * G-00-OVERVIEW-SCORING-VALUES-FRESH
 * --------------------------------------------------------------------------
 * Layer-2.6 of the overview Scoring trio. Catches **stale Scoring tables**
 * — values that haven't been re-evaluated in >90 days even as the spec
 * underneath has churned.
 *
 * Heuristic (cheap + author-driven, no git introspection):
 *   For every top-level `spec/[0-9][0-9]-*/00-overview.md`:
 *     1. Find the canonical Scoring block (heading `^(##|###)\s+Scoring\b`
 *        OR the legacy `^\| Criterion \|` table marker).
 *     2. Within the same file, find the most recent date in:
 *          a) The `> **Updated:** YYYY-MM-DD` blockquote (canonical SSOT).
 *          b) An optional inline `> Scoring fresh as of YYYY-MM-DD` marker
 *             that authors can add to refresh the clock without bumping
 *             the file's overall version.
 *     3. If max(dates) is older than 90 days from today (UTC), WARN.
 *     4. If older than 180 days, HARD-FAIL.
 *
 * Tier:  WARN-only initial mode (no hard-fail until 2026-07-28 to give
 *        authors a 90-day grace window to add freshness markers).
 *
 * Exits 0 always in WARN-only mode; exits 1 on hard-fail when promoted.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SPEC = "spec";
const OVERVIEW = "00-overview.md";
const SCORING = /^(?:##|###)\s+Scoring\b|^\| Criterion \|/m;
const UPDATED = /^>\s*\*\*Updated:\*\*\s*(\d{4}-\d{2}-\d{2})/m;
const FRESH   = /^>\s*Scoring fresh as of\s*(\d{4}-\d{2}-\d{2})/m;

const WARN_DAYS = 90;
const HARD_DAYS = 180;
const PROMOTED_HARDFAIL = false; // flips true 2026-07-28

function listTopLevelOverviews() {
  const out = [];
  for (const e of readdirSync(SPEC, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (!/^\d{2}-/.test(e.name)) continue;
    const p = join(SPEC, e.name, OVERVIEW);
    try { statSync(p); out.push(p); } catch { /* missing — handled by other gates */ }
  }
  return out.sort();
}

function daysBetween(isoA, isoB) {
  const a = Date.parse(isoA + "T00:00:00Z");
  const b = Date.parse(isoB + "T00:00:00Z");
  return Math.round((b - a) / 86_400_000);
}

const today = new Date().toISOString().slice(0, 10);
const warnings = [];
const hardFails = [];

for (const file of listTopLevelOverviews()) {
  const txt = readFileSync(file, "utf8");
  if (!SCORING.test(txt)) continue; // covered by SCORING-TABLE-PRESENT
  const updated = txt.match(UPDATED)?.[1];
  const fresh = txt.match(FRESH)?.[1];
  const candidates = [updated, fresh].filter(Boolean);
  if (candidates.length === 0) {
    warnings.push(`${file}: Scoring block present but no \`**Updated:**\` or \`> Scoring fresh as of …\` date found — cannot evaluate freshness.`);
    continue;
  }
  const newest = candidates.sort().at(-1);
  const age = daysBetween(newest, today);
  if (age >= HARD_DAYS) {
    hardFails.push(`${file}: Scoring values ${age} days stale (newest date ${newest}; >${HARD_DAYS} day hard-fail threshold).`);
  } else if (age >= WARN_DAYS) {
    warnings.push(`${file}: Scoring values ${age} days stale (newest date ${newest}; >${WARN_DAYS} day warn threshold). Add \`> Scoring fresh as of ${today}\` after re-evaluating, or bump \`**Updated:**\`.`);
  }
}

if (warnings.length > 0) {
  console.error(`[WARN] G-00-OVERVIEW-SCORING-VALUES-FRESH: ${warnings.length} stale Scoring block(s)`);
  for (const w of warnings) console.error(`  ${w}`);
}

if (PROMOTED_HARDFAIL && hardFails.length > 0) {
  console.error(`\n❌ G-00-OVERVIEW-SCORING-VALUES-FRESH: ${hardFails.length} hard-fail violation(s)`);
  for (const e of hardFails) console.error(`  ${e}`);
  process.exit(1);
}

if (hardFails.length > 0) {
  console.error(`[WARN→pending hard-fail 2026-07-28] G-00-OVERVIEW-SCORING-VALUES-FRESH: ${hardFails.length} block(s) past 180-day threshold`);
  for (const e of hardFails) console.error(`  ${e}`);
}

if (warnings.length === 0 && hardFails.length === 0) {
  const total = listTopLevelOverviews().length;
  console.log(`✅ G-00-OVERVIEW-SCORING-VALUES-FRESH: all Scoring blocks fresh (≤${WARN_DAYS} days)`);
}
process.exit(0);
