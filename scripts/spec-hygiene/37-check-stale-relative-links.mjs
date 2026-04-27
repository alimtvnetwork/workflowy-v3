#!/usr/bin/env node
/**
 * G-37 — Stale Relative-Link Detector (v1.0.0)
 *
 * Complements G-03 (which only checks resolution). G-03 says "this link
 * is broken." G-37 says "this link is broken AND the target's basename
 * exists elsewhere in the repo — it was probably renamed/moved." That
 * distinction matters because the fix is different:
 *
 *   - G-03 broken-only ⇒ typo or genuinely missing target → author must
 *     create the file or remove the link.
 *   - G-37 stale-rename ⇒ link path is wrong but the file still exists
 *     elsewhere → mechanical fix (update the path).
 *
 * Two sub-checks:
 *
 *   G-37.1 (stale-rename detection, WARN advisory)
 *     - Severity: WARN — does not influence exit code.
 *     - For each broken relative `[label](./x.md)` link in spec/**/*.md,
 *       look up the basename in a global filename index. If exactly one
 *       match exists elsewhere in the repo (under spec/ or src/), report
 *       as STALE-RENAME with the suggested new path. Multiple matches
 *       reported as STALE-AMBIGUOUS (operator must disambiguate). Zero
 *       matches reported as STALE-MISSING (G-03 already covers this; we
 *       suppress to avoid double-noise unless --verbose).
 *     - Per-link opt-out via `STALE_LINK_EXEMPT` Set keyed on
 *       `"<source-file>::<broken-href>"` composites.
 *
 *   G-37.2 (meta — exempt rationale coverage, ERROR)
 *     - Self-introspects via __filename. Every STALE_LINK_EXEMPT entry
 *       MUST carry inline `// rationale` or contiguous `// …` line above.
 *     - Mirrors G-30.3 / G-31.5 / G-32.4 / G-34.2 / G-36.2 pattern.
 *
 * CLI:
 *   node scripts/spec-hygiene/37-check-stale-relative-links.mjs           default
 *   node scripts/spec-hygiene/37-check-stale-relative-links.mjs --verbose include STALE-MISSING
 *
 * Exit codes:
 *   0  no G-37.2 violations (G-37.1 stale-renames are advisory)
 *   1  one or more unrationaled STALE_LINK_EXEMPT entries
 *   2  runner error (cannot read source)
 *
 * Why scope is spec/ only for source links but spec/+src/ for target index:
 *   Stale links most often occur in spec/ when a file is renumbered or
 *   moved between subfolders. The target may now live under either spec/
 *   or src/ (e.g. a feature spec linking to a code module that moved).
 *   Casting a wide net for the target index keeps false-negatives low.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { resolve, dirname, relative, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..", "..");

// =====================================================================
// Per-link opt-outs keyed on "<source-file-relative-to-repo>::<broken-href>".
// Each line MUST carry a rationale comment (G-37.2 enforces this).
// =====================================================================
const STALE_LINK_EXEMPT = new Set([
  // (none yet — populate after first run reveals legitimate stale links
  // that the author intentionally wants to defer fixing)
]);

const VERBOSE = process.argv.includes("--verbose");

// =====================================================================
// Markdown link parsing — copied verbatim from G-03 by design.
// Cross-runner imports between hygiene scripts would create the kind of
// coupling these gates surface (see G-33 row in 02-ci-quality-gates.md).
// =====================================================================
const LINK_RE = /\[[^\]]+\]\(([^)\s]+)\)/g;

function isSkippable(href) {
  if (href.startsWith("http://") || href.startsWith("https://")) return true;
  if (href.startsWith("mailto:") || href.startsWith("mem://")) return true;
  if (href.startsWith("#")) return true;
  return false;
}

function stripCode(text) {
  let out = "";
  let inFence = false;
  for (const line of text.split("\n")) {
    const dequoted = line.replace(/^(?:\s*>\s?)+/, "");
    const trimmed = dequoted.trimStart();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inFence = inFence === false;
      out += "\n";
      continue;
    }
    if (inFence) {
      out += "\n";
      continue;
    }
    out += line.replace(/`[^`]*`/g, (m) => " ".repeat(m.length)) + "\n";
  }
  return out;
}

// =====================================================================
// Recursive directory walker (excludes node_modules, .git, dist, build).
// =====================================================================
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", ".cache"]);

function walk(dir, predicate, accumulator) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, predicate, accumulator);
      continue;
    }
    if (predicate(full)) accumulator.push(full);
  }
}

// =====================================================================
// Build global filename index: bare-basename → [absolute paths under
// spec/ + src/]. Used to resolve "where did this file move to?".
// =====================================================================
function buildFilenameIndex() {
  const index = new Map();
  const files = [];
  const specDir = join(REPO_ROOT, "spec");
  const srcDir = join(REPO_ROOT, "src");

  if (existsSync(specDir)) {
    walk(specDir, (p) => p.endsWith(".md"), files);
  }
  if (existsSync(srcDir)) {
    walk(srcDir, (p) => /\.(ts|tsx|md|css)$/.test(p), files);
  }

  for (const file of files) {
    const base = basename(file);
    const list = index.get(base) ?? [];
    list.push(file);
    index.set(base, list);
  }
  return index;
}

// =====================================================================
// Scan spec/ for relative markdown links that fail to resolve.
// =====================================================================
function findStaleLinks(filenameIndex) {
  const specDir = join(REPO_ROOT, "spec");
  const specFiles = [];
  walk(specDir, (p) => p.endsWith(".md"), specFiles);

  const stales = []; // {sourceRel, href, kind, suggestion}

  for (const file of specFiles) {
    const raw = readFileSync(file, "utf8");
    const text = stripCode(raw);
    const here = dirname(file);
    let m;
    while ((m = LINK_RE.exec(text)) !== null) {
      const href = m[1].split("#")[0].trim();
      if (href === "" || isSkippable(href)) continue;
      const target = resolve(here, href);
      if (existsSync(target)) continue; // G-03's domain — only continue when broken

      const wantBase = basename(href);
      const matches = filenameIndex.get(wantBase) ?? [];
      // Exclude the (non-existent) attempted target from candidates.
      const candidates = matches.filter((p) => p !== target);

      const sourceRel = relative(REPO_ROOT, file);
      let kind, suggestion;
      if (candidates.length === 1) {
        kind = "STALE-RENAME";
        suggestion = relative(here, candidates[0]);
      } else if (candidates.length > 1) {
        kind = "STALE-AMBIGUOUS";
        suggestion = candidates.map((p) => relative(REPO_ROOT, p)).join(" | ");
      } else {
        kind = "STALE-MISSING";
        suggestion = "(no candidates found anywhere — true missing target)";
      }
      stales.push({ sourceRel, href, kind, suggestion });
    }
  }
  return stales;
}

// =====================================================================
// G-37.2 — meta: every STALE_LINK_EXEMPT entry needs a rationale
// comment. Self-introspect by reading our own source file.
// Algorithm: ported verbatim from G-30.3 / G-31.5 / G-32.4 / G-34.2 / G-36.2.
// =====================================================================
function checkExemptRationales() {
  const src = readFileSync(__filename, "utf8");
  const lines = src.split("\n");
  let inSet = false;
  const violations = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/STALE_LINK_EXEMPT\s*=\s*new Set\(\[/.test(line)) {
      inSet = true;
      continue;
    }
    if (inSet === false) continue;
    if (/^\s*\]\s*\)/.test(line)) {
      inSet = false;
      continue;
    }
    // Look for a string-literal entry on this line.
    const entry = line.match(/^\s*"([^"]+)"\s*,?\s*(\/\/.*)?$/);
    if (entry === null) continue;

    const inlineRationale = entry[2];
    if (typeof inlineRationale === "string" && inlineRationale.trim().length > 2) continue;

    // No inline rationale — check for `// …` line directly above (no blank gap).
    const above = lines[i - 1] ?? "";
    if (/^\s*\/\/\s*\S/.test(above)) continue;

    violations.push(`  line ${i + 1}: "${entry[1]}" has no rationale comment`);
  }
  return violations;
}

// =====================================================================
// Main
// =====================================================================
try {
  const filenameIndex = buildFilenameIndex();
  const stales = findStaleLinks(filenameIndex);

  // Apply STALE_LINK_EXEMPT.
  const filtered = stales.filter((s) => {
    const key = `${s.sourceRel}::${s.href}`;
    return STALE_LINK_EXEMPT.has(key) === false;
  });

  // G-37.1 reporting (advisory).
  const renames = filtered.filter((s) => s.kind === "STALE-RENAME");
  const ambiguous = filtered.filter((s) => s.kind === "STALE-AMBIGUOUS");
  const missing = filtered.filter((s) => s.kind === "STALE-MISSING");

  if (renames.length > 0) {
    console.warn(`⚠️  G-37.1: ${renames.length} stale-rename link(s) — target moved:`);
    for (const s of renames) {
      console.warn(`    ${s.sourceRel}`);
      console.warn(`        broken: ${s.href}`);
      console.warn(`        suggest: ${s.suggestion}`);
    }
  }
  if (ambiguous.length > 0) {
    console.warn(`⚠️  G-37.1: ${ambiguous.length} stale-ambiguous link(s) — multiple candidates:`);
    for (const s of ambiguous) {
      console.warn(`    ${s.sourceRel}`);
      console.warn(`        broken: ${s.href}`);
      console.warn(`        candidates: ${s.suggestion}`);
    }
  }
  if (VERBOSE && missing.length > 0) {
    console.warn(`⚠️  G-37.1 (verbose): ${missing.length} broken link(s) with no rename candidate (G-03 territory):`);
    for (const s of missing) {
      console.warn(`    ${s.sourceRel}: ${s.href}`);
    }
  }

  // G-37.2 enforcement.
  const exemptViolations = checkExemptRationales();
  if (exemptViolations.length > 0) {
    console.error(`❌ G-37.2: ${exemptViolations.length} unrationaled STALE_LINK_EXEMPT entry(ies):`);
    exemptViolations.forEach((v) => console.error(v));
    process.exit(1);
  }

  const summary = `${renames.length} rename, ${ambiguous.length} ambiguous, ${missing.length} missing`;
  if (renames.length === 0 && ambiguous.length === 0) {
    console.log(`✅ G-37: no stale-rename links (${summary})`);
  } else {
    console.log(`✅ G-37: ${summary} (advisory; meta-check passed)`);
  }
  process.exit(0);
} catch (err) {
  console.error(`❌ G-37: runner error — ${err.message}`);
  process.exit(2);
}
