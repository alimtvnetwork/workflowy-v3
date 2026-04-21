#!/usr/bin/env node
/**
 * Spec Hygiene Guard — Metadata Header Format
 *
 * Every spec/**\/*.md file must have a blockquote-form header:
 *   > **Version:** X.Y.Z
 *   > **Updated:** YYYY-MM-DD
 *
 * - Flags plain (non-blockquote) Version/Updated lines.
 * - Flags forbidden label "Last Updated:" (must be "Updated:").
 * - Flags forbidden metadata fields in 00-overview.md files.
 *
 * Exit code: 1 if any violation is found.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "spec";
const FORBIDDEN_FIELDS = ["AI Confidence", "Ambiguity", "Health Score", "Keywords", "Scoring"];

const errors = [];

function scan(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      scan(full);
      continue;
    }
    if (full.endsWith(".md") === false) continue;

    const text = readFileSync(full, "utf8");
    const lines = text.split("\n").slice(0, 25);

    // Only scan the metadata header region (first 25 lines) — body content
    // (templates, tables, examples) is allowed to mention these labels.
    const headerRegion = lines.join("\n");

    const hasPlainVersion = lines.some((l) => /^\*\*Version:\*\*/.test(l.trim()));
    const hasPlainUpdated = lines.some((l) => /^\*\*(Last )?Updated:\*\*/.test(l.trim()));
    const hasLastUpdated = lines.some((l) => /\*\*Last Updated:\*\*/.test(l));

    if (hasPlainVersion) errors.push(`${full}: plain Version line (must use blockquote '> ')`);
    if (hasPlainUpdated) errors.push(`${full}: plain Updated line (must use blockquote '> ')`);
    if (hasLastUpdated) errors.push(`${full}: forbidden label 'Last Updated:' (use 'Updated:')`);

    if (name === "00-overview.md") {
      for (const field of FORBIDDEN_FIELDS) {
        const re = new RegExp(`^>?\\s*\\*\\*${field}( Score)?:\\*\\*`, "m");
        if (re.test(headerRegion)) {
          errors.push(`${full}: forbidden metadata field '${field}'`);
        }
      }
    }
  }
}

scan(ROOT);

if (errors.length > 0) {
  console.error("❌ Header errors:");
  errors.forEach((e) => console.error("  " + e));
  process.exit(1);
}
console.log("✅ Headers OK");
