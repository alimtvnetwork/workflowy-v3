#!/usr/bin/env node
/**
 * G-30 — AT Citation Validity Gate
 *
 * Asserts every `AT-*` ID cited in endpoint contract files
 * (spec/31-app/06-endpoints/*.md) is declared in at least one
 * markdown-table registry row across spec/31-app/**.
 *
 * Algorithm SSOT: spec/31-app/05-conventions/23-g30-at-citation-validity-gate.md
 *
 * Exit codes:
 *   0  clean
 *   1  ≥1 unregistered citation
 *   2  runner error
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..", "..");
const APP_ROOT = join(REPO_ROOT, "spec/31-app");
const ENDPOINTS_DIR = join(APP_ROOT, "06-endpoints");

const CONSUMER_EXCLUDED = new Set([
  "99-consistency-report.md",
]);

// Declaration — first table cell holds an AT-* ID, optionally backticked.
// Examples that match:
//   | `AT-APP-01` | something | source |
//   | AT-LAYOUT-01 | When... | Then... |
const RX_DECL_SINGLE = /^\|\s*`?(AT-[A-Z][A-Z0-9-]*-?\d+)`?\s*\|/gm;

// Range declarations like `AT-APPF-01..05` or `AT-APP-58..67` expand
// to every integer in [start, end].
const RX_DECL_RANGE = /`(AT-[A-Z][A-Z0-9-]*-?)(\d+)\.\.(\d+)`/g;

// Citation: any backticked AT-* ID in prose, tables, or lists.
const RX_CITE = /`(AT-[A-Z][A-Z0-9-]*-?\d+)`/g;

function fail(msg, code = 2) {
  console.error(`G-30 runner error: ${msg}`);
  process.exit(code);
}

function walkMd(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      out.push(...walkMd(full));
    } else if (name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

function padToWidth(numStr, width) {
  return numStr.padStart(width, "0");
}

function collectRegistered() {
  if (!existsSync(APP_ROOT)) fail(`app spec dir missing: ${APP_ROOT}`);
  const registered = new Map(); // id -> first declaring file (relative)
  for (const file of walkMd(APP_ROOT)) {
    const content = readFileSync(file, "utf8");
    const relFile = relative(REPO_ROOT, file);

    // Single-ID declarations.
    for (const m of content.matchAll(RX_DECL_SINGLE)) {
      const id = m[1];
      if (!registered.has(id)) registered.set(id, relFile);
    }

    // Range declarations — `AT-APP-58..67` → AT-APP-58, …, AT-APP-67.
    for (const m of content.matchAll(RX_DECL_RANGE)) {
      const prefix = m[1]; // e.g. "AT-APPF-"
      const start = parseInt(m[2], 10);
      const end = parseInt(m[3], 10);
      const width = Math.max(m[2].length, m[3].length);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
        continue;
      }
      for (let n = start; n <= end; n++) {
        const id = `${prefix}${padToWidth(String(n), width)}`;
        if (!registered.has(id)) registered.set(id, relFile);
      }
    }
  }
  return registered;
}

function collectCitations() {
  if (!existsSync(ENDPOINTS_DIR)) fail(`endpoints dir missing: ${ENDPOINTS_DIR}`);
  const citations = [];
  for (const name of readdirSync(ENDPOINTS_DIR)) {
    if (!name.endsWith(".md")) continue;
    if (CONSUMER_EXCLUDED.has(name)) continue;
    const full = join(ENDPOINTS_DIR, name);
    const lines = readFileSync(full, "utf8").split("\n");
    lines.forEach((line, idx) => {
      for (const m of line.matchAll(RX_CITE)) {
        citations.push({
          id: m[1],
          file: relative(REPO_ROOT, full),
          line: idx + 1,
        });
      }
    });
  }
  return citations;
}

function main() {
  const registered = collectRegistered();
  const citations = collectCitations();
  const uniqueCited = new Set(citations.map((c) => c.id));
  const unregistered = citations.filter((c) => !registered.has(c.id));

  if (unregistered.length === 0) {
    console.log("G-30 AT citation validity:");
    console.log(`  registered AT IDs (spec/31-app/**): ${registered.size}`);
    console.log(`  endpoint citations scanned:         ${citations.length}`);
    console.log(`  unique cited IDs:                   ${uniqueCited.size}`);
    console.log(`  unregistered citations:             0`);
    console.log("  ✅ all citations resolve");
    process.exit(0);
  }

  console.error("G-30 AT citation validity FAILED:");
  console.error("");
  console.error(
    `  ❌ ${unregistered.length} unregistered AT citation(s) in spec/31-app/06-endpoints/:`,
  );
  console.error("");
  for (const v of unregistered) {
    console.error(`    ${v.file}:${v.line}  ${v.id}`);
  }
  console.error("");
  console.error("  Resolution:");
  console.error(
    "    1) If the citation is a typo: fix the number to match a registered ID.",
  );
  console.error(
    "    2) If the AT is genuinely new: register it in the appropriate",
  );
  console.error(
    "       97-acceptance-criteria.md as `AT-APP-NN` (canonical) before citing.",
  );
  console.error(
    "    3) Never invent ad-hoc prefixes like AT-MGP-* — see APP-FIX-14.",
  );
  process.exit(1);
}

main();
