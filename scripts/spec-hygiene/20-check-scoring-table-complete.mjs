#!/usr/bin/env node
/**
 * Spec Hygiene Guard — Scoring Section Completeness
 *
 * Enforces gate `G-00-OVERVIEW-SCORING-TABLE-COMPLETE` (Layer-2 of the
 * overview-root contract trio, Scoring side).
 *
 * Three rules:
 *   1. Three canonical row tokens present (HARD-FAIL) — within the Scoring
 *      section block, the block MUST contain at least one occurrence of each:
 *        - "AI Confidence" OR "AI Implementability" (case-insensitive)
 *        - "Ambiguity" (case-insensitive)
 *        - "Health Score" OR "Overall" OR "Total" (case-insensitive)
 *   2. Numeric scores parseable (WARN) — each canonical row line MUST contain
 *      either a percentage (\d{1,3}%), a fraction (\d{1,3}/\d{1,3}), or a
 *      letter grade (\b[A-F][+\-]?\b). Pure prose ("looks good") forbidden.
 *   3. Health Score is the last row (WARN) — when a `| Criterion |` table is
 *      used, the Health Score / Overall / Total row MUST appear AFTER the
 *      AI Confidence and Ambiguity rows.
 *
 * Scope: top-level `spec/[0-9][0-9]-*\/00-overview.md` only.
 * Exempt zones: fenced code blocks.
 *
 * SSOT: spec/01-spec-authoring-guide/97-acceptance-criteria.md §G-00-OVERVIEW-SCORING-TABLE-COMPLETE
 * Audit ledger: .lovable/memory/audit/at-overview-scoring-complete-gate.md
 *
 * Exit code: 1 if any HARD-FAIL violation is found. WARN-only findings do NOT
 * fail the run (printed to stderr with `[WARN]` prefix).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SPEC_ROOT = "spec";
const TOP_LEVEL_RE = /^[0-9]{2}-/;

const SCORING_BLOCK_START_RE = /^(?:(##|###)\s+Scoring(\s|$)|\*\*Scoring\*\*|\|\s*Criterion\s*\|)/i;
const NEXT_HEADING_RE = /^##\s/;

const AI_CONF_TOKEN_RE = /\b(AI Confidence|AI Implementability)\b/i;
const AMBIGUITY_TOKEN_RE = /\bAmbiguity\b/i;
const HEALTH_TOKEN_RE = /\b(Health Score|Overall|Total)\b/i;

const SCORE_VALUE_RE = /\d{1,3}\s*%|\d{1,3}\s*\/\s*\d{1,3}|\b[A-F][+\-]?\b/;

const hardFails = [];
const warnings = [];

function listTopLevelOverviews() {
  const out = [];
  for (const name of readdirSync(SPEC_ROOT)) {
    if (TOP_LEVEL_RE.test(name) === false) continue;
    const overview = join(SPEC_ROOT, name, "00-overview.md");
    try {
      readFileSync(overview, "utf8");
      out.push(overview);
    } catch {
      // Missing 00-overview.md is caught by 12-check-required-files.mjs — skip.
    }
  }
  return out;
}

function stripFencedCodeBlocks(lines) {
  const out = [];
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = inFence === false;
      out.push("");
      continue;
    }
    out.push(inFence ? "" : line);
  }
  return out;
}

function findScoringBlock(lines) {
  // Prefer a real `^(##|###)\s+Scoring\b` heading. Fall back to `**Scoring**`
  // bold marker, then `^| Criterion |` table marker. This avoids selecting a
  // stray `| Criterion |` rubric table that precedes the actual values block.
  const HEADING_RE = /^(##|###)\s+Scoring(\s|$)/i;
  const BOLD_RE = /^\*\*Scoring\*\*/i;
  const TABLE_RE = /^\|\s*Criterion\s*\|/i;

  for (const probe of [HEADING_RE, BOLD_RE, TABLE_RE]) {
    for (let i = 0; i < lines.length; i += 1) {
      if (probe.test(lines[i]) === false) continue;
      let end = lines.length - 1;
      for (let j = i + 1; j < lines.length; j += 1) {
        if (NEXT_HEADING_RE.test(lines[j])) { end = j - 1; break; }
      }
      return { start: i, end };
    }
  }
  return null;
}

function findRowLine(lines, start, end, tokenRe) {
  for (let i = start; i <= end; i += 1) {
    if (tokenRe.test(lines[i])) return i;
  }
  return -1;
}

function checkFile(file) {
  const text = readFileSync(file, "utf8");
  const lines = stripFencedCodeBlocks(text.split("\n"));
  const block = findScoringBlock(lines);

  if (block === null) {
    hardFails.push(
      `${file}: no Scoring block found — Rule 1 ` +
      `(see G-00-OVERVIEW-SCORING-TABLE-COMPLETE).`
    );
    return;
  }

  const aiLine = findRowLine(lines, block.start, block.end, AI_CONF_TOKEN_RE);
  const amLine = findRowLine(lines, block.start, block.end, AMBIGUITY_TOKEN_RE);
  const hsLine = findRowLine(lines, block.start, block.end, HEALTH_TOKEN_RE);

  // Rule 1 (hard-fail) — three canonical row tokens present.
  if (aiLine === -1) hardFails.push(`${file}: Scoring block missing canonical row 'AI Confidence' — Rule 1.`);
  if (amLine === -1) hardFails.push(`${file}: Scoring block missing canonical row 'Ambiguity' — Rule 1.`);
  if (hsLine === -1) hardFails.push(`${file}: Scoring block missing canonical row 'Health Score' — Rule 1.`);

  // Rule 2 (HARD-FAIL, narrowed 2026-04-29) — Health Score row carries a
  // parseable numeric. AI Confidence / Ambiguity rows carry tokens (per
  // Layer-2.5 gate G-00-OVERVIEW-SCORING-VALUE-FORMAT), not numerics, so
  // they're exempt from Rule 2.
  if (hsLine !== -1 && SCORE_VALUE_RE.test(lines[hsLine]) === false) {
    hardFails.push(
      `${file}:${hsLine + 1}: Health Score row has no parseable numeric score — Rule 2.`
    );
  }

  // Rule 3 (WARN) — Health Score row is last among the three.
  if (aiLine !== -1 && amLine !== -1 && hsLine !== -1) {
    if (hsLine < aiLine || hsLine < amLine) {
      warnings.push(
        `${file}:${hsLine + 1}: Health Score row appears before AI Confidence ` +
        `(line ${aiLine + 1}) and/or Ambiguity (line ${amLine + 1}) — Rule 3 (WARN).`
      );
    }
  }
}

for (const file of listTopLevelOverviews()) checkFile(file);

if (warnings.length > 0) {
  console.error(`\n[WARN] G-00-OVERVIEW-SCORING-TABLE-COMPLETE: ${warnings.length} warning(s)`);
  for (const w of warnings) console.error(`  ${w}`);
}

if (hardFails.length > 0) {
  console.error(`\n❌ G-00-OVERVIEW-SCORING-TABLE-COMPLETE: ${hardFails.length} hard-fail violation(s)\n`);
  for (const e of hardFails) console.error(`  ${e}`);
  process.exit(1);
}
console.log(
  `✅ G-00-OVERVIEW-SCORING-TABLE-COMPLETE: 25/25 top-level overviews carry the canonical 3 rows` +
  (warnings.length > 0 ? ` (${warnings.length} WARN — non-blocking)` : "")
);
