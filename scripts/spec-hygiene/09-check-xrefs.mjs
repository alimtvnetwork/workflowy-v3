#!/usr/bin/env node
/**
 * Spec Hygiene — Cross-Reference (H-4) Checker
 *
 * Verifies:
 *  H-4.1: Every `00-overview.md` ends with a "## Related" section.
 *  H-4.2: Every checklist file (`97-acceptance-criteria.md`,
 *         `98-acceptance-criteria.md`) back-links to its parent overview
 *         (either in a "## Related" section or via a `Parent:` line).
 *
 * Mode:
 *  - Default: WARN (non-zero exit only if SPEC_XREF_STRICT=1).
 *  - Strict:  errors fail the run.
 *
 * Wired into `scripts/spec-hygiene/00-run-all.mjs`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SPEC_ROOT = "spec";
const STRICT = process.env.SPEC_XREF_STRICT === "1";

/** Recursively collect all files under a directory. */
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

const files = walk(SPEC_ROOT);
const overviews = files.filter((f) => f.endsWith("/00-overview.md"));
const checklists = files.filter((f) =>
  /\/(97|98)-acceptance-criteria\.md$/.test(f),
);

const warnings = [];
const errors = [];

// ---------- H-4.1 ----------
for (const f of overviews) {
  const txt = readFileSync(f, "utf8");
  if (!/^##\s+Related\b/m.test(txt)) {
    warnings.push(`H-4.1 missing "## Related" block in ${relative(".", f)}`);
  }
}

// ---------- H-4.2 ----------
for (const f of checklists) {
  const txt = readFileSync(f, "utf8");
  // accept either a "## Related" section that links to overview OR a Parent: line
  const hasParentLink =
    /\b(Parent|Overview)\s*:\s*\[?[^\n]*00-overview\.md/i.test(txt) ||
    /\[\s*[^\]]*\s*\]\([^)]*00-overview\.md\)/.test(txt);
  if (!hasParentLink) {
    warnings.push(
      `H-4.2 checklist missing back-link to 00-overview.md: ${relative(".", f)}`,
    );
  }
}

// ---------- Report ----------
const total = overviews.length + checklists.length;
console.log(
  `Cross-reference scan: ${overviews.length} overviews + ${checklists.length} checklists = ${total} files`,
);

if (errors.length) {
  for (const e of errors) console.error(`  ❌ ${e}`);
  console.error(`\n❌ ${errors.length} cross-reference error(s)`);
  process.exit(1);
}

if (warnings.length) {
  for (const w of warnings) console.log(`  ⚠️  ${w}`);
  console.log(
    `\n${STRICT ? "❌" : "✅"} Cross-reference scan finished — ${warnings.length} warning(s)`,
  );
  if (STRICT) process.exit(1);
} else {
  console.log("\n✅ All overviews have Related blocks; all checklists back-link to parent");
}
