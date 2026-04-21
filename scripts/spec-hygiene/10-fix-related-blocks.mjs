#!/usr/bin/env node
/**
 * Spec Hygiene — Auto-fixer for H-4.1 (Related blocks in 00-overview.md).
 *
 * For every `00-overview.md` lacking a `## Related` section, append one
 * containing:
 *   - links to all sibling topic files in the same folder (numeric prefix only)
 *   - a link to the parent folder's `00-overview.md` (if any)
 *   - a link to the folder's `97-acceptance-criteria.md` (if present)
 *
 * Idempotent: skips files that already contain `## Related`.
 *
 * Run manually:  node scripts/spec-hygiene/10-fix-related-blocks.mjs
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, basename, relative } from "node:path";

const SPEC_ROOT = "spec";

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const overviews = walk(SPEC_ROOT).filter((f) => f.endsWith("/00-overview.md"));

let fixed = 0;
let skipped = 0;

for (const overview of overviews) {
  const txt = readFileSync(overview, "utf8");
  if (/^##\s+Related\b/m.test(txt)) {
    skipped += 1;
    continue;
  }

  const folder = dirname(overview);
  const siblings = readdirSync(folder)
    .filter((n) => /^\d{2}-/.test(n) && n !== "00-overview.md" && n.endsWith(".md"))
    .filter((n) => !/^(97|98|99)-/.test(n))
    .sort();

  const checklists = readdirSync(folder).filter((n) =>
    /^(97|98)-acceptance-criteria\.md$/.test(n),
  );

  const parentDir = dirname(folder);
  const hasParent =
    parentDir !== folder &&
    parentDir.startsWith(SPEC_ROOT) &&
    readdirSync(parentDir).includes("00-overview.md");

  const lines = ["", "---", "", "## Related", ""];

  if (siblings.length) {
    lines.push("**In this section:**", "");
    for (const s of siblings) {
      const title = s
        .replace(/^\d{2}-/, "")
        .replace(/\.md$/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      lines.push(`- [\`${s}\`](./${s}) — ${title}`);
    }
    lines.push("");
  }

  if (checklists.length || hasParent) {
    lines.push("**See also:**", "");
    if (hasParent) {
      lines.push(`- [\`../00-overview.md\`](../00-overview.md) — Parent overview`);
    }
    for (const c of checklists) {
      lines.push(`- [\`${c}\`](./${c}) — Acceptance criteria`);
    }
    lines.push("");
  }

  // Trim trailing whitespace in original, then append
  const trimmed = txt.replace(/\s+$/g, "");
  const next = `${trimmed}\n${lines.join("\n")}`;

  writeFileSync(overview, next, "utf8");
  fixed += 1;
}

console.log(`✅ Related blocks: fixed ${fixed}, skipped ${skipped} (already had one)`);
