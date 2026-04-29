#!/usr/bin/env node
/**
 * G-13-RUNNER-NO-INVALID-REGEX-ANCHORS
 * --------------------------------------------------------------------------
 * Defensive lint for hygiene-runner regex bug class.
 *
 * JavaScript's RegExp does NOT support `\Z` (end-of-string) or `\A`
 * (start-of-string) anchors used in PCRE/Ruby/Python. When a runner author
 * writes them by mistake, JS treats them as the literal characters `Z`/`A`,
 * silently changing the runner's behavior (most often: premature truncation
 * at any line starting with `Z`/`A`).
 *
 * Real-world cost: 2026-04-29 the gate `G-00-ADR-CONSEQUENCES-XLINK`
 * mis-reported drain progress as `26/28` because its SECTION regex used
 * `(?=^## |\Z)` and the `Z` matched literal `Z` mid-body in ADR-0027
 * ("Zero new infra…"), truncating Consequences before the appended xlink.
 *
 * This runner scans every `scripts/spec-hygiene/*.mjs` and fails CI if any
 * file contains `\Z` or `\A` inside a regex context (between two `/`
 * delimiters or inside `new RegExp("…")`).
 *
 * Tier:  CI, hard-fail from day 1 (clean baseline 2026-04-29).
 *
 * Heuristic:
 *   - Skip the runner's own source (avoid self-match on the documentation).
 *   - Match `\Z` or `\A` followed by a non-letter (so `\Zoo` literal escapes
 *     don't trip — though they shouldn't exist in JS either).
 *   - Match inside `/.../[gimsuy]*` literals OR inside RegExp string args.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";

const DIR = "scripts/spec-hygiene";
const SELF = basename(import.meta.url);

// Match `/.../...[flags]` or `new RegExp("...")` where the body contains \Z or \A
// followed by a non-word boundary. Conservative: match ONLY inside obvious
// regex contexts to avoid false positives in prose comments.
const REGEX_LITERAL = /\/(?![\/*])((?:\\.|\[(?:\\.|[^\]\\])*\]|[^\/\\\n])+)\/[gimsuy]*/g;
const NEW_REGEXP   = /new\s+RegExp\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g;
const BAD_ANCHOR   = /\\[ZA](?![a-zA-Z])/;

const offenders = [];

function scanFile(file) {
  if (file.endsWith(SELF)) return;
  const txt = readFileSync(join(DIR, file), "utf8");
  // Strip block + line comments first to avoid matching examples in JSDoc.
  const stripped = txt
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
  let m;
  REGEX_LITERAL.lastIndex = 0;
  while ((m = REGEX_LITERAL.exec(stripped)) !== null) {
    if (BAD_ANCHOR.test(m[1])) {
      offenders.push({ file, snippet: m[0].slice(0, 80), kind: "regex literal" });
    }
  }
  NEW_REGEXP.lastIndex = 0;
  while ((m = NEW_REGEXP.exec(stripped)) !== null) {
    if (BAD_ANCHOR.test(m[2])) {
      offenders.push({ file, snippet: m[0].slice(0, 80), kind: "RegExp string" });
    }
  }
}

for (const f of readdirSync(DIR)) {
  if (!f.endsWith(".mjs")) continue;
  scanFile(f);
}

if (offenders.length === 0) {
  console.log("✅ G-13-RUNNER-NO-INVALID-REGEX-ANCHORS: 0 offenders across hygiene runners.");
  process.exit(0);
}

console.error(`❌ G-13-RUNNER-NO-INVALID-REGEX-ANCHORS: ${offenders.length} offender(s) — JS RegExp does NOT support \\Z/\\A anchors:`);
for (const o of offenders) {
  console.error(`   ${o.file}  (${o.kind}): ${o.snippet}`);
}
console.error("\n   Fix: replace \\Z with \`$(?![\\s\\S])\` (true EOF assertion).");
console.error("        Replace \\A with \`(?<![\\s\\S])\` or anchor at known position.");
process.exit(1);
