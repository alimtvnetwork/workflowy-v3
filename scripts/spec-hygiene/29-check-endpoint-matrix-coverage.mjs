#!/usr/bin/env node
/**
 * G-29 — Endpoint ↔ Matrix Coverage Gate
 *
 * Enforces bidirectional parity between every `EP-*` symbol declared in
 * `spec/31-app/06-endpoints/*.md` and every row of
 * `spec/31-app/06-endpoints/16-endpoint-at-matrix.md`.
 *
 * Also asserts every matrix row cites ≥1 `AT-*` ID.
 *
 * Algorithm SSOT: spec/31-app/05-conventions/22-g29-endpoint-matrix-coverage-gate.md
 *
 * Exit codes:
 *   0  clean
 *   1  ≥1 violation
 *   2  runner error
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..", "..");
const ENDPOINTS_DIR = join(REPO_ROOT, "spec/31-app/06-endpoints");
const MATRIX_FILE = join(ENDPOINTS_DIR, "16-endpoint-at-matrix.md");

const EXCLUDED = new Set([
  "00-overview.md",
  "16-endpoint-at-matrix.md",
  "97-acceptance-criteria.md",
  "99-consistency-report.md",
]);

const RX_TABLE_DECL = /^\|\s*(EP-[A-Z][A-Z0-9-]+)\s*\|/gm;
const RX_HEADER_DECL = /^##\s+(EP-[A-Z][A-Z0-9-]+)\b/gm;
const RX_MATRIX_ROW = /^\|\s*[\w.]+\s*\|\s*`(EP-[A-Z][A-Z0-9-]+)`/;
const RX_AT_CITATION = /`AT-[A-Z][A-Z0-9-]*-?\d+`/g;

function fail(msg, code = 2) {
  console.error(`G-29 runner error: ${msg}`);
  process.exit(code);
}

function collectDeclared() {
  if (!existsSync(ENDPOINTS_DIR)) fail(`endpoints dir missing: ${ENDPOINTS_DIR}`);
  const declared = new Map(); // id -> origin file
  for (const name of readdirSync(ENDPOINTS_DIR)) {
    if (!name.endsWith(".md") || EXCLUDED.has(name)) continue;
    const content = readFileSync(join(ENDPOINTS_DIR, name), "utf8");
    for (const m of content.matchAll(RX_TABLE_DECL)) {
      if (!declared.has(m[1])) declared.set(m[1], name);
    }
    for (const m of content.matchAll(RX_HEADER_DECL)) {
      if (!declared.has(m[1])) declared.set(m[1], name);
    }
  }
  return declared;
}

function collectMatrixed() {
  if (!existsSync(MATRIX_FILE)) fail(`matrix missing: ${MATRIX_FILE}`);
  const lines = readFileSync(MATRIX_FILE, "utf8").split("\n");
  const matrixed = new Map(); // id -> { line, text }
  const dupes = [];
  let inMatrix = false;
  lines.forEach((line, idx) => {
    if (line.startsWith("## Matrix")) {
      inMatrix = true;
      return;
    }
    if (inMatrix && line.startsWith("## ") && !line.startsWith("## Matrix")) {
      inMatrix = false;
    }
    if (!inMatrix) return;
    const m = line.match(RX_MATRIX_ROW);
    if (!m) return;
    const id = m[1];
    if (matrixed.has(id)) {
      dupes.push({ id, line: idx + 1 });
      return;
    }
    matrixed.set(id, { line: idx + 1, text: line });
  });
  return { matrixed, dupes };
}

function main() {
  const declared = collectDeclared();
  const { matrixed, dupes } = collectMatrixed();
  const violations = [];

  for (const { id, line } of dupes) {
    violations.push({
      axis: "duplicate-row",
      id,
      reason: `duplicate matrix row at line ${line}`,
    });
  }

  for (const [id, origin] of declared) {
    if (!matrixed.has(id)) {
      violations.push({
        axis: "orphan-endpoint",
        id,
        reason: `declared in ${origin} but missing from 16-endpoint-at-matrix.md`,
      });
    }
  }

  for (const [id] of matrixed) {
    if (!declared.has(id)) {
      violations.push({
        axis: "phantom-row",
        id,
        reason: `matrix row exists but no endpoint file declares ${id}`,
      });
    }
  }

  for (const [id, row] of matrixed) {
    const ats = row.text.match(RX_AT_CITATION) || [];
    if (ats.length === 0) {
      violations.push({
        axis: "missing-at-citation",
        id,
        reason: `matrix row at line ${row.line} cites zero AT IDs — every endpoint must have at least one acceptance test`,
      });
    }
  }

  if (violations.length === 0) {
    console.log(
      `✅ G-29: ${declared.size} declared, ${matrixed.size} matrixed, all paired with ≥1 AT`,
    );
    process.exit(0);
  }

  for (const v of violations) {
    console.log(`❌ G-29: ${v.axis} ${v.id} ${v.reason}`);
  }
  console.log(`❌ G-29: ${violations.length} violation(s)`);
  process.exit(1);
}

try {
  main();
} catch (e) {
  fail(e.stack || String(e));
}
