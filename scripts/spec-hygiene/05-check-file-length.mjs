#!/usr/bin/env node
/**
 * Spec Hygiene Guard — File Length
 *
 * Enforces the spec authoring file-size cap (see
 * spec/01-spec-authoring-guide/12-file-length-cap.md):
 *
 *   - WARN at >400 lines  (recommended ceiling — consider splitting)
 *   - FAIL at >600 lines  (hard cap — must be split into a same-name subfolder)
 *
 * The FAIL threshold was tightened from 800 → 600 on 2026-04-20 (L-5)
 * after the H-1 tier completed. Override via SPEC_LENGTH_FAIL_AT env var
 * (e.g. SPEC_LENGTH_FAIL_AT=800) for emergency bypass.
 *
 * Excludes auto-generated and aggregate files where length is expected:
 *   - spec/spec-index.md            (auto-generated index)
 *   - any 99-consistency-report.md (aggregated audit reports)
 *   - any 98-changelog.md          (append-only history)
 *
 * Exit code: 1 if any file exceeds the FAIL threshold.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "spec";
const WARN_AT = 400;
const FAIL_AT = Number(process.env.SPEC_LENGTH_FAIL_AT ?? 600);

const EXCLUDED = new Set([
  "spec/spec-index.md",
]);

const EXCLUDED_BASENAMES = new Set([
  "99-consistency-report.md",
  "98-changelog.md",
]);

const warnings = [];
const failures = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const s = statSync(path);
    if (s.isDirectory()) {
      walk(path);
      continue;
    }
    if (!entry.endsWith(".md")) continue;
    const normalized = path.replace(/\\/g, "/");
    if (EXCLUDED.has(normalized)) continue;
    if (EXCLUDED_BASENAMES.has(entry)) continue;
    check(normalized);
  }
}

function check(file) {
  const lines = readFileSync(file, "utf8").split("\n").length;
  if (lines > FAIL_AT) {
    failures.push({ file, lines });
    return;
  }
  if (lines > WARN_AT) {
    warnings.push({ file, lines });
  }
}

walk(ROOT);

if (warnings.length > 0) {
  console.warn(`⚠️  ${warnings.length} file(s) over ${WARN_AT} lines (consider splitting):`);
  for (const w of warnings) {
    console.warn(`  ${w.file}: ${w.lines} lines`);
  }
}

if (failures.length > 0) {
  console.error(`\n❌ ${failures.length} file(s) over ${FAIL_AT} lines (HARD CAP exceeded):`);
  for (const f of failures) {
    console.error(`  ${f.file}: ${f.lines} lines`);
  }
  process.exit(1);
}

console.log(`✅ File length OK — 0 over ${FAIL_AT}, ${warnings.length} over ${WARN_AT}`);
