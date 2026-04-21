#!/usr/bin/env node
/**
 * Spec Hygiene Guard — Link Integrity
 *
 * Scans relative markdown links inside spec/**\/*.md and flags any
 * target that does not resolve to an existing file.
 *
 * Skips:
 *   - External links (http://, https://, mailto:)
 *   - Memory links (mem://)
 *   - Anchor-only links (#section)
 *   - Anything inside fenced code blocks (``` ... ```)
 *   - Anything inside inline code spans (`...`)
 *
 * Why the code-block filter matters:
 *   Code samples frequently contain text like `Fail[MyOutput](result.AppError())`
 *   which the naive `[text](href)` regex would interpret as a markdown link to
 *   `result.AppError(`. These are not links — they are generics + function calls.
 *
 * Exit code: 1 if any broken link is found.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const ROOT = "spec";
const LINK_RE = /\[[^\]]+\]\(([^)\s]+)\)/g;

const errors = [];

function isSkippable(href) {
  if (href.startsWith("http://") || href.startsWith("https://")) return true;
  if (href.startsWith("mailto:") || href.startsWith("mem://")) return true;
  if (href.startsWith("#")) return true;

  return false;
}

/**
 * Strip fenced code blocks and inline code spans from markdown text so
 * pseudo-link patterns inside code samples are not parsed as links.
 *
 * Replaces the stripped regions with whitespace of equal length to keep
 * line/column references useful if we ever add them.
 */
function stripCode(text) {
  let out = "";
  let inFence = false;
  const lines = text.split("\n");

  for (const line of lines) {
    // Strip leading blockquote markers (e.g. "> ", "> > ") so fenced
    // code blocks nested inside blockquotes are still detected.
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

function scan(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      scan(full);
      continue;
    }
    if (full.endsWith(".md") === false) continue;

    const raw = readFileSync(full, "utf8");
    const text = stripCode(raw);
    const here = dirname(full);
    let m;
    while ((m = LINK_RE.exec(text)) !== null) {
      const href = m[1].split("#")[0].trim();
      if (href === "" || isSkippable(href)) continue;

      const target = resolve(here, href);
      if (existsSync(target) === false) {
        errors.push(`${full}: broken link → ${href}`);
      }
    }
  }
}

scan(ROOT);

if (errors.length > 0) {
  console.error("❌ Broken links:");
  errors.forEach((e) => console.error("  " + e));
  console.error(`\n  Total: ${errors.length} broken link(s)`);
  process.exit(1);
}
console.log("✅ Links OK");
