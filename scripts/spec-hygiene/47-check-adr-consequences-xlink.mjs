#!/usr/bin/env node
/**
 * G-00-ADR-CONSEQUENCES-XLINK
 * --------------------------------------------------------------------------
 * Enforces AT-ADR-009 (spec/00-adrs/97-acceptance-criteria.md):
 *   "Every ADR with non-trivial downstream impact MUST list at least one
 *    `## Consequences` bullet that cross-links to the spec scope it locks
 *    (e.g. `spec/04-database-conventions/`)."
 *
 * Mode:  WARN-only initial mode, with a baseline allow-list at
 *        spec/00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md
 *        (90-day TTL, drained by ADR Consequences enrichment).
 *
 * Hard-fail: ADRs added/edited AFTER baseline that fail and are NOT in the
 *            ledger MUST fail.
 *
 * Heuristic: A "downstream xlink" is any markdown link in the Consequences
 *            section that targets a `spec/` path (relative or absolute) and
 *            is NOT itself an ADR file (`NNNN-*.md`). Links into other
 *            scope folders (e.g. `../04-database-conventions/`) count;
 *            links to sibling ADRs do not.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ADR_DIR = "spec/00-adrs";
const LEDGER = "spec/00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md";

const ADR_FILE = /^\d{4}-.*\.md$/;
const SECTION  = /^##[^\n]*\bConsequences\b[^\n]*\n([\s\S]*?)(?=^## |\Z)/m;
const ANY_LINK = /\[[^\]]+\]\(([^)\s]+)\)/g;

// A link counts as a "downstream xlink" if its target:
//   - points into spec/ (relative `../` upward, or absolute `spec/`), AND
//   - does NOT resolve to a sibling ADR file (NNNN-*.md in spec/00-adrs/).
function isDownstreamXlink(target) {
  const t = target.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return false;
  if (t.startsWith("#")) return false;
  // Strip any anchor suffix
  const clean = t.split("#")[0];
  if (!clean) return false;
  // Must reach a spec/ path. From spec/00-adrs/NNNN.md:
  //   ../<scope>/...   → spec/<scope>/...   (downstream) ✓
  //   ./NNNN-*.md      → sibling ADR        ✗
  //   NNNN-*.md        → sibling ADR        ✗
  //   spec/<scope>/... → absolute downstream ✓
  if (/^(?:\.\/)?\d{4}-[^/]+\.md$/.test(clean)) return false;
  if (clean.startsWith("../")) return true;
  if (clean.startsWith("spec/")) return true;
  return false;
}

function hasXlink(consequencesBody) {
  let m;
  ANY_LINK.lastIndex = 0;
  while ((m = ANY_LINK.exec(consequencesBody))) {
    if (isDownstreamXlink(m[1])) return true;
  }
  return false;
}

function loadLedger() {
  if (!existsSync(LEDGER)) return new Set();
  const txt = readFileSync(LEDGER, "utf8");
  const ids = new Set();
  for (const m of txt.matchAll(/\bADR-(\d{4})\b/g)) ids.add(m[1]);
  return ids;
}

const ledger = loadLedger();
const files = readdirSync(ADR_DIR).filter(f => ADR_FILE.test(f)).sort();

const missing = [];
const ledgerMisses = [];

for (const f of files) {
  const adrNum = f.slice(0, 4);
  const txt = readFileSync(join(ADR_DIR, f), "utf8");
  const m = txt.match(SECTION);
  if (!m) {
    if (!ledger.has(adrNum)) {
      missing.push({ file: f, reason: "no Consequences section" });
    } else {
      ledgerMisses.push({ file: f, reason: "no Consequences section (allow-listed)" });
    }
    continue;
  }
  if (!hasXlink(m[1])) {
    if (!ledger.has(adrNum)) {
      missing.push({ file: f, reason: "no downstream spec/ xlink in Consequences" });
    } else {
      ledgerMisses.push({ file: f, reason: "no xlink (allow-listed)" });
    }
  }
}

const isCi = process.env.CI === "true" || process.argv.includes("--strict");

if (missing.length === 0) {
  console.log(`✅ G-00-ADR-CONSEQUENCES-XLINK: all ADRs cite downstream scope ` +
              `(${files.length - ledgerMisses.length}/${files.length}; ` +
              `${ledgerMisses.length} allow-listed)`);
  process.exit(0);
}

console.error(`❌ G-00-ADR-CONSEQUENCES-XLINK: ${missing.length} ADR(s) lack a downstream xlink in Consequences:`);
for (const m of missing) console.error(`   - ${m.file}  (${m.reason})`);
console.error(`\n   Fix: add a markdown link in ## Consequences pointing into the spec/ scope this ADR locks (e.g. [spec/04-database-conventions/](../04-database-conventions/)).`);
console.error(`   Or: add ADR-NNNN to ${LEDGER} (90-day TTL).`);

// Hard-fail iff strict mode (CI) AND the file isn't on the ledger.
// In WARN-only mode we exit 0 so the runner stays green pending the ledger backfill.
process.exit(isCi ? 1 : 0);
