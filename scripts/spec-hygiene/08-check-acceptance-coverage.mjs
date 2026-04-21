#!/usr/bin/env node
/**
 * Spec Hygiene Guard — Acceptance Criteria Coverage
 *
 * Scans spec/ and reports folders that should have a 97-acceptance-criteria.md
 * file but do not.
 *
 * Coverage policy:
 *   1. Every top-level folder under spec/ (e.g. spec/02-coding-guidelines/)
 *      MUST contain a 97-acceptance-criteria.md (severity: error).
 *   2. Every subfolder containing 4+ topic .md files AND a 00-overview.md
 *      SHOULD contain a 97-acceptance-criteria.md (severity: warning).
 *
 * Exempt:
 *   - Folders listed in EXEMPT_FOLDERS below.
 *
 * Exit code: 1 if any policy-1 (error) violation is found.
 *            0 (with warnings printed) if only policy-2 violations.
 */
import { readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "spec";

// Top-level folders that don't need AC (e.g. issue trackers, research dumps).
const EXEMPT_TOP_LEVEL = new Set([
  "11-research",
  "18-spec-issues",
]);

// Subfolders that don't need AC (e.g. pure reference dumps, archives).
const EXEMPT_PATTERNS = [
  /\/99-/,                  // consistency reports & archives
  /\/_/,                    // underscore-prefixed archives
  /\/archive(d)?\//,
  /\/legacy\//,
];

const errors = [];
const warnings = [];

function isExemptSubfolder(rel) {
  return EXEMPT_PATTERNS.some((re) => re.test(rel));
}

function hasAcceptanceFile(dir) {
  // Accept either 97- or 98- prefix (some folders place changelog at 97-)
  return existsSync(join(dir, "97-acceptance-criteria.md"))
    || existsSync(join(dir, "98-acceptance-criteria.md"));
}

function listDirs(dir) {
  return readdirSync(dir).filter((n) => {
    const full = join(dir, n);

    return statSync(full).isDirectory();
  });
}

function countTopicFiles(dir) {
  return readdirSync(dir).filter((n) => {
    const isMd = n.endsWith(".md");
    const isReserved = n.startsWith("99-") || n === "97-acceptance-criteria.md";

    return isMd && !isReserved;
  }).length;
}

function scanSubfolders(dir) {
  const children = listDirs(dir);

  for (const name of children) {
    const full = join(dir, name);
    const rel = relative(".", full);

    if (isExemptSubfolder(rel)) {
      continue;
    }

    const hasOverview = existsSync(join(full, "00-overview.md"));
    const topicCount = countTopicFiles(full);
    const needsAc = hasOverview && topicCount >= 4;

    if (needsAc && !hasAcceptanceFile(full)) {
      warnings.push(`Missing 97-acceptance-criteria.md in ${rel} (${topicCount} topic files)`);
    }

    scanSubfolders(full);
  }
}

function scanTopLevel() {
  const folders = listDirs(ROOT);

  for (const name of folders) {
    if (EXEMPT_TOP_LEVEL.has(name)) {
      continue;
    }

    const full = join(ROOT, name);

    if (!hasAcceptanceFile(full)) {
      errors.push(`Missing 97-acceptance-criteria.md in spec/${name}/`);
    }
  }
}

scanTopLevel();
scanSubfolders(ROOT);

if (warnings.length > 0) {
  console.warn(`⚠️  Acceptance-criteria warnings (${warnings.length}):`);
  warnings.forEach((w) => console.warn("  " + w));
  console.warn("");
}

if (errors.length > 0) {
  console.error(`❌ Acceptance-criteria errors (${errors.length}):`);
  errors.forEach((e) => console.error("  " + e));
  process.exit(1);
}

console.log(`✅ Acceptance coverage OK — ${warnings.length} warning(s)`);
