#!/usr/bin/env node
/**
 * Bulk Header Converter — F-21
 *
 * Converts plain-form metadata headers to blockquote form across spec/.
 * Idempotent: safe to re-run.
 *
 * Rules applied (per file, only in the first 25 lines):
 *   1. **Last Updated:** X      →  > **Updated:** X
 *   2. **Version:** X           →  > **Version:** X
 *   3. **Updated:** X           →  > **Updated:** X
 *   4. Removes forbidden metadata fields ONLY in 00-overview.md:
 *      AI Confidence, Ambiguity, Health Score, Keywords, Scoring
 *
 * A line is converted only if:
 *   - It does not already start with `> `
 *   - It matches the canonical form `**Label:**` (optionally bold)
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "spec";
const HEADER_SCAN_LINES = 25;
const FORBIDDEN_FIELDS = ["AI Confidence", "Ambiguity", "Health Score", "Keywords", "Scoring"];

let touched = 0;
let scanned = 0;

function convertFile(full, isOverview) {
  const original = readFileSync(full, "utf8");
  const lines = original.split("\n");
  let changed = false;

  for (let i = 0; i < Math.min(HEADER_SCAN_LINES, lines.length); i += 1) {
    let line = lines[i];

    // Drop forbidden fields in 00-overview.md (handles both plain and blockquote)
    if (isOverview) {
      const stripped = line.replace(/^>\s*/, "");
      const isForbidden = FORBIDDEN_FIELDS.some((f) =>
        stripped.startsWith(`**${f}:**`) ||
        stripped.startsWith(`**${f} Score:**`)
      );
      if (isForbidden) {
        lines[i] = "";
        changed = true;
        continue;
      }
    }

    // Normalize blockquoted "Last Updated" -> "Updated"
    const bqLastUpdatedMatch = line.match(/^>\s*\*\*Last Updated:\*\*\s*(.*)$/);
    if (bqLastUpdatedMatch) {
      lines[i] = `> **Updated:** ${bqLastUpdatedMatch[1]}`;
      changed = true;
      continue;
    }

    // Skip lines that are already blockquoted (and not Last Updated)
    if (line.trimStart().startsWith("> ")) continue;

    // Normalize plain Last Updated -> Updated
    const lastUpdatedMatch = line.match(/^\*\*Last Updated:\*\*\s*(.*)$/);
    if (lastUpdatedMatch) {
      lines[i] = `> **Updated:** ${lastUpdatedMatch[1]}`;
      changed = true;
      continue;
    }

    // Convert plain Version: line
    const versionMatch = line.match(/^\*\*Version:\*\*\s*(.*)$/);
    if (versionMatch) {
      lines[i] = `> **Version:** ${versionMatch[1]}`;
      changed = true;
      continue;
    }

    // Convert plain Updated: line
    const updatedMatch = line.match(/^\*\*Updated:\*\*\s*(.*)$/);
    if (updatedMatch) {
      lines[i] = `> **Updated:** ${updatedMatch[1]}`;
      changed = true;
      continue;
    }
  }

  if (changed) {
    writeFileSync(full, lines.join("\n"), "utf8");
    touched += 1;
  }
}

function scan(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      scan(full);
      continue;
    }
    if (full.endsWith(".md") === false) continue;
    scanned += 1;
    convertFile(full, name === "00-overview.md");
  }
}

scan(ROOT);
console.log(`Scanned: ${scanned} files`);
console.log(`Touched: ${touched} files`);
