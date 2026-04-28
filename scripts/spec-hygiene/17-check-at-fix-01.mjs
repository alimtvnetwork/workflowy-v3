#!/usr/bin/env node
/**
 * AT-FIX-01 — Acceptance-criteria fixture coverage gate.
 *
 * Walks every spec/**\/97-acceptance-criteria.md and 98-acceptance-criteria.md
 * and asserts that the file is paired with fixtures in one of three ways:
 *
 *   (a) a sibling 97a-acceptance-criteria-fixtures.md exists, OR
 *   (b) the file links to spec/97a-acceptance-criteria-fixtures.md (the
 *       global P2g sweep), OR
 *   (c) the file contains an explicit
 *       "> _Fixture: N/A — pure narrative reference, not a testable criterion._"
 *       opt-out line.
 *
 * Exit 0 when all files are paired. Exit 1 with a per-file diagnostic
 * otherwise.
 *
 * Spawned by .lovable/plans/00-active.md § P2g.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function listAtFiles() {
  const out = execSync(
    `find spec -type f \\( -name "97-acceptance-criteria.md" -o -name "98-acceptance-criteria.md" \\)`,
    { cwd: repoRoot, encoding: "utf8" },
  );
  return out.trim().split("\n").filter(Boolean);
}

function isPaired(absFile) {
  const dir = dirname(absFile);
  const sibling = join(dir, "97a-acceptance-criteria-fixtures.md");
  if (existsSync(sibling)) return { ok: true, via: "sibling" };

  const text = readFileSync(absFile, "utf8");
  if (text.includes("spec/97a-acceptance-criteria-fixtures.md") ||
      text.includes("/97a-acceptance-criteria-fixtures.md")) {
    return { ok: true, via: "global-sweep-link" };
  }
  if (text.includes("Fixture: N/A — pure narrative reference")) {
    return { ok: true, via: "explicit-opt-out" };
  }
  return { ok: false };
}

const files = listAtFiles();
const failures = [];
for (const rel of files) {
  const abs = join(repoRoot, rel);
  const result = isPaired(abs);
  if (!result.ok) failures.push(rel);
}

if (failures.length === 0) {
  console.log(`✅ AT-FIX-01 OK — ${files.length} acceptance-criteria files paired with fixtures`);
  process.exit(0);
}

console.error(`❌ AT-FIX-01 FAIL — ${failures.length}/${files.length} acceptance-criteria files lack fixtures:`);
for (const f of failures) console.error(`  - ${f}`);
console.error(
  `\nFix by either:\n` +
    `  (a) creating a sibling 97a-acceptance-criteria-fixtures.md, OR\n` +
    `  (b) linking spec/97a-acceptance-criteria-fixtures.md (global P2g sweep) from the file, OR\n` +
    `  (c) adding the explicit opt-out line:\n` +
    `      > _Fixture: N/A — pure narrative reference, not a testable criterion._`,
);
process.exit(1);
