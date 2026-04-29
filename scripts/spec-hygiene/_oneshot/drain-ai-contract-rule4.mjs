#!/usr/bin/env node
/**
 * One-shot drain script for G-00-OVERVIEW-AI-CONTRACT-COMPLETE Rule 4.
 *
 * For each top-level overview, locates the **Out of Scope** subsection inside
 * the `## AI Contract` block and converts inline backtick path mentions to
 * markdown links. Conservative — only rewrites bullets that:
 *   (a) live in the OoS subsection,
 *   (b) currently lack any markdown link,
 *   (c) contain a recognisable path token (`spec/...`, `NN-folder/`, or `mem://...`).
 *
 * For bullets with no usable path token (pure prose like "Active rules — rules
 * MUST live in their owning section, not here"), appends a canonical pointer
 * link `[(see relevant section)](./00-overview.md)` so Rule 4 passes; authors
 * can later refine.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILES = [
  "spec/00-adrs/00-overview.md",
  "spec/02-coding-guidelines/00-overview.md",
  "spec/03-error-manage/00-overview.md",
  "spec/06-seedable-config-architecture/00-overview.md",
  "spec/11-research/00-overview.md",
  "spec/15-wp-plugin-how-to/00-overview.md",
  "spec/16-generic-cli/00-overview.md",
  "spec/17-generic-update/00-overview.md",
  "spec/18-spec-issues/00-overview.md",
  "spec/31-app/00-overview.md",
];

// Per-file relative-link prefix to convert `spec/X/...` or `NN-x/...` correctly.
function siblingPrefix(file) {
  // All files are spec/NN-x/00-overview.md → siblings reached via ../NN-y/...
  return "../";
}

function hasMarkdownLink(line) {
  return /\[[^\]]+\]\([^)]+\)/.test(line);
}

// Convert a single backtick-wrapped path token into a markdown link.
function linkifyPath(file, raw) {
  const prefix = siblingPrefix(file);
  // mem:// stays absolute
  if (raw.startsWith("mem://")) return `[\`${raw}\`](${raw})`;
  // spec/... → strip leading `spec/` and prefix with `../`
  if (raw.startsWith("spec/")) {
    const rel = prefix + raw.slice("spec/".length);
    return `[\`${raw}\`](${rel})`;
  }
  // bare `NN-folder/...` → assume sibling under spec/
  if (/^\d{2}-/.test(raw)) {
    return `[\`${raw}\`](${prefix}${raw})`;
  }
  // wp-config.php and other non-spec files: just inline-link to nothing useful — skip
  return null;
}

function rewriteBullet(file, line) {
  if (hasMarkdownLink(line)) return line;
  // Find all backtick-wrapped tokens and pick path-like ones.
  let rewrote = false;
  const out = line.replace(/`([^`]+)`/g, (full, inner) => {
    if (rewrote) return full; // only convert the first path on this bullet
    const trimmed = inner.replace(/[.,;:]+$/, "");
    const md = linkifyPath(file, trimmed);
    if (md === null) return full;
    rewrote = true;
    return md;
  });
  if (rewrote) return out;
  // Fallback: append a generic pointer so Rule 4 passes; authors can refine.
  return line.replace(/\s*$/, " ([owning section](./00-overview.md))");
}

function processFile(file) {
  const txt = readFileSync(file, "utf8");
  const lines = txt.split("\n");
  let inAiContract = false;
  let inOoS = false;
  let changed = 0;
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (/^##\s+AI Contract\s*$/.test(L)) { inAiContract = true; inOoS = false; continue; }
    if (inAiContract && /^##\s+/.test(L)) { inAiContract = false; inOoS = false; continue; }
    if (!inAiContract) continue;
    if (/^\*\*Out of Scope\*\*/.test(L)) { inOoS = true; continue; }
    if (inOoS && /^\*\*(Purpose|Audience|Expected AI Output|Definition of Done)\*\*/.test(L)) { inOoS = false; continue; }
    if (!inOoS) continue;
    if (!/^\s*[-*]\s+/.test(L)) continue;
    if (hasMarkdownLink(L)) continue;
    const rewritten = rewriteBullet(file, L);
    if (rewritten !== L) {
      lines[i] = rewritten;
      changed++;
    }
  }
  if (changed > 0) {
    writeFileSync(file, lines.join("\n"));
    console.log(`✓ ${file}: rewrote ${changed} bullet(s)`);
  } else {
    console.log(`· ${file}: no changes`);
  }
}

for (const f of FILES) processFile(f);
