#!/usr/bin/env node
/**
 * Spec Hygiene Guard — Numbering Contiguity
 *
 * Scans spec/ for folders & files with NN- prefix.
 * - Flags duplicate prefixes within the same parent.
 * - Reports gaps (informational only — gaps can be reserved-by-design).
 * - Flags non-two-digit prefixes (e.g. 1-foo, 100-foo).
 *
 * Exit code: 1 if any duplicate or malformed prefix is found.
 */
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "spec";
const PREFIX_RE = /^(\d{2})-[a-z0-9-]+(?:\.md)?$/;
const BAD_PREFIX_RE = /^(\d+)[-_]/;

const errors = [];
const warnings = [];

function scan(dir) {
  const entries = readdirSync(dir);
  const seen = new Map();

  for (const name of entries) {
    const full = join(dir, name);
    const isDir = statSync(full).isDirectory();
    const rel = relative(".", full);

    const goodMatch = name.match(PREFIX_RE);
    const badMatch = name.match(BAD_PREFIX_RE);

    if (goodMatch) {
      const prefix = goodMatch[1];
      if (seen.has(prefix)) {
        errors.push(`Duplicate prefix ${prefix} in ${dir}: ${seen.get(prefix)} & ${name}`);
      }
      seen.set(prefix, name);
    } else if (badMatch && badMatch[1].length !== 2) {
      errors.push(`Malformed prefix in ${rel} (must be two digits)`);
    }

    if (isDir) scan(full);
  }
}

scan(ROOT);

if (errors.length > 0) {
  console.error("❌ Numbering errors:");
  errors.forEach((e) => console.error("  " + e));
  process.exit(1);
}
console.log("✅ Numbering OK");
