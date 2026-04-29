#!/usr/bin/env node
/**
 * Spec Hygiene Guard — Scoring Section Value Format
 *
 * Enforces gate `G-00-OVERVIEW-SCORING-VALUE-FORMAT` (Layer-2.5 of the
 * overview-root contract trio). Locks one canonical value shape per Scoring
 * row across all 25 top-level `spec/[0-9][0-9]-*\/00-overview.md` files.
 *
 * Four hard-fail rules:
 *   1. Health Score / Overall / Total value MUST match
 *      /^\d{1,3}%\s\([A-F][+\-]?\)$/   e.g. "95% (A)", "100% (A+)"
 *      Forbidden: "100/100" denominator, decoration, bare grade.
 *   2. AI Confidence / AI Implementability value MUST be one of
 *      {Very High, High, Medium, Low, Very Low} — exact case, no decoration.
 *      Legacy "Production-Ready" maps to "Very High".
 *   3. Ambiguity value MUST be one of
 *      {None, Low, Medium, High, Very High} — exact case, no decoration.
 *   4. Single Scoring section per file — exactly one
 *      /^(##|###)\s+Scoring(\s|$)/ heading. Per-feature criterion grids MUST
 *      use a different heading (e.g. "## Quality Breakdown",
 *      "## Per-Feature Scoring").
 *
 * Scope: top-level `spec/[0-9][0-9]-*\/00-overview.md` only. Sub-overview tier
 * is out of scope (Scoring lives at section root only — see
 * G-00-OVERVIEW-SCORING-TABLE-PRESENT scope rule).
 *
 * Exempt zones: fenced code blocks; `spec/01-spec-authoring-guide/14-scoring-metrics.md`
 * (the schema-defining file itself, also out of top-level glob).
 *
 * SSOT: spec/01-spec-authoring-guide/97-acceptance-criteria.md §G-00-OVERVIEW-SCORING-VALUE-FORMAT
 * Audit ledger: .lovable/memory/audit/at-overview-scoring-value-format-gate.md
 *
 * Exit code: 1 if any violation is found.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SPEC_ROOT = "spec";
const TOP_LEVEL_RE = /^[0-9]{2}-/;

const AI_CONF_TOKENS = new Set(["Very High", "High", "Medium", "Low", "Very Low"]);
const AMBIGUITY_TOKENS = new Set(["None", "Low", "Medium", "High", "Very High"]);
const HEALTH_RE = /^\d{1,3}%\s\([A-F][+\-]?\)$/;

const SCORING_HEADING_RE = /^(##|###)\s+Scoring(\s|$)/;

const errors = [];

function listTopLevelOverviews() {
  const out = [];
  for (const name of readdirSync(SPEC_ROOT)) {
    if (TOP_LEVEL_RE.test(name) === false) continue;
    const overview = join(SPEC_ROOT, name, "00-overview.md");
    try {
      readFileSync(overview, "utf8");
      out.push(overview);
    } catch {
      // Missing 00-overview.md is caught by 12-check-required-files.mjs — skip here.
    }
  }
  return out;
}

function stripFencedCodeBlocks(lines) {
  // Returns a parallel array where lines inside ```fences``` are replaced with "".
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

function extractScoringHeadings(lines) {
  const hits = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (SCORING_HEADING_RE.test(lines[i])) hits.push(i);
  }
  return hits;
}

function extractRowValue(line) {
  // "| Health Score | 95% (A) |" → "95% (A)"
  const cells = line.split("|");
  if (cells.length < 4) return null;
  return cells[2].trim();
}

function checkBlock(file, lines, startIdx) {
  // Walk from startIdx+1 until next heading or EOF.
  for (let i = startIdx + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^#{1,3}\s/.test(line)) break;
    if (line.startsWith("|") === false) continue;

    const labelMatch = line.match(/^\|\s*([^|]+?)\s*\|/);
    if (labelMatch === null) continue;
    const label = labelMatch[1];
    const value = extractRowValue(line);
    if (value === null) continue;

    if (/^(AI Confidence|AI Implementability)$/.test(label)) {
      if (AI_CONF_TOKENS.has(value) === false) {
        errors.push(
          `${file}:${i + 1}: AI Confidence value '${value}' is not one of ` +
          `{Very High, High, Medium, Low, Very Low} — Rule 2 ` +
          `(see G-00-OVERVIEW-SCORING-VALUE-FORMAT).`
        );
      }
      continue;
    }
    if (label === "Ambiguity") {
      if (AMBIGUITY_TOKENS.has(value) === false) {
        errors.push(
          `${file}:${i + 1}: Ambiguity value '${value}' is not one of ` +
          `{None, Low, Medium, High, Very High} — Rule 3 ` +
          `(see G-00-OVERVIEW-SCORING-VALUE-FORMAT).`
        );
      }
      continue;
    }
    if (/^(Health Score|Overall|Total)$/.test(label)) {
      if (HEALTH_RE.test(value) === false) {
        errors.push(
          `${file}:${i + 1}: ${label} value '${value}' does not match canonical ` +
          `'\\d{1,3}% (A-F[+-]?)' — Rule 1 ` +
          `(see G-00-OVERVIEW-SCORING-VALUE-FORMAT).`
        );
      }
    }
  }
}

function checkFile(file) {
  const text = readFileSync(file, "utf8");
  const rawLines = text.split("\n");
  const lines = stripFencedCodeBlocks(rawLines);
  const headings = extractScoringHeadings(lines);

  if (headings.length !== 1) {
    errors.push(
      `${file}: file contains ${headings.length} '## Scoring' headings — ` +
      `Rule 4 requires exactly 1. Rename per-feature criterion grids to ` +
      `'## Quality Breakdown' or '## Per-Feature Scoring' ` +
      `(see G-00-OVERVIEW-SCORING-VALUE-FORMAT).`
    );
  }

  for (const idx of headings) checkBlock(file, lines, idx);
}

for (const file of listTopLevelOverviews()) checkFile(file);

if (errors.length > 0) {
  console.error(`\n❌ G-00-OVERVIEW-SCORING-VALUE-FORMAT: ${errors.length} violation(s)\n`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log("✅ G-00-OVERVIEW-SCORING-VALUE-FORMAT: 25/25 top-level overviews clean");
