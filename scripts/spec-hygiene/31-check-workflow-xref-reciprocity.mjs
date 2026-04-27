#!/usr/bin/env node
/**
 * G-31 — Cross-Reference Reciprocity Gate (v2.5.0)
 *
 * Asserts that every cross-sibling Related-section link in a scoped
 * folder is reciprocated by a back-link in the target's own
 * Related/Cross-References section.
 *
 * Sub-checks (one per registered scope, plus a meta sub-check):
 *
 *   G-31.1 (workflows, ERROR, v1.0.0)  — 02-workflows/NN-*-flow.md
 *                                       reciprocity. Drained queue from
 *                                       6 asymmetries (F25) to 0.
 *   G-31.2 (features,  ERROR, v2.3.0)  — 01-features/NN[a-z]?-*.md
 *                                       reciprocity. Drained 2026-04-27
 *                                       (30 → 0) and promoted to ERROR.
 *   G-31.3 (endpoints, ERROR, v2.1.0)  — 06-endpoints/NN[a-z]?-*.md
 *                                       reciprocity. Drained 2026-04-27
 *                                       (8 → 0) and promoted to ERROR.
 *   G-31.4 (db-diagram,ERROR, v2.2.0)  — 07-db-diagram/NN-*.md
 *                                       reciprocity. Drained 2026-04-27
 *                                       (6 → 0) and promoted to ERROR.
 *   G-31.5 (meta,      ERROR, v2.4.0)  — every entry in each per-scope
 *                                       exemption Set MUST carry a
 *                                       rationale comment (trailing
 *                                       inline `// …` OR a contiguous
 *                                       `// …` line directly above with
 *                                       no blank-line gap). Mirrors the
 *                                       G-32.4 pattern verbatim. All 4
 *                                       Sets currently empty so this
 *                                       ships green; the gate locks the
 *                                       convention before any exemption
 *                                       is added (F-future-G31b).
 *   G-31.6 (islands,   WARN,  v2.5.0)  — files with **zero in + zero out**
 *                                       cross-sibling Related-section
 *                                       references are flagged as
 *                                       documentation islands. Per-scope
 *                                       `*_ISLAND_EXEMPT` Sets opt out
 *                                       genuine leaves (G-31.5-enforced
 *                                       rationale required). WARN-only:
 *                                       does not fail CI; cleanup happens
 *                                       by authoring a peer link or
 *                                       allow-listing (F-future-G31c).
 *
 * Mode semantics:
 *   - ERROR scopes contribute to exit code 1 on any asymmetry.
 *   - WARN  scopes report violations but never fail the gate. Used as
 *     a staged-rollout pattern (mirrors F24/F27/F28 G-30.2 rollout):
 *     introduce the check, surface drift in CI output, drain via
 *     follow-up tasks, then promote to ERROR (F-future-G31a-promote).
 *
 * Scope config (per entry):
 *   id           — sub-check identifier (e.g. "G-31.2")
 *   label        — short human label for output
 *   dir          — folder relative to repo root
 *   filenameRx   — regex matching scoped sibling files
 *   excludeRx    — regex for siblings to skip (overviews, AT registries,
 *                  consistency reports — these are aggregator pages, not
 *                  cross-referencing peers)
 *   relatedHeads — array of H2 heading texts that mark the back-link
 *                  section (different folders use different conventions:
 *                  workflows use "## Related"; db-diagram uses
 *                  "## Cross-References"; we accept either when present)
 *   mode         — "error" | "warn"
 *   exemptions       — Set<`${from} → ${to}`> intentionally one-way pairs
 *   islandExemptions — Set<bareFilename> opting a leaf out of G-31.6
 *
 * Exit codes:
 *   0  No asymmetries in any ERROR scope and no unrationaled exemption
 *      entries (WARN-scope drift and island advisories are reported but
 *      do not fail)
 *   1  At least one ERROR-scope asymmetry OR unrationaled exemption
 *   2  Runner error (missing dir, malformed file, etc.)
 *
 * Algorithm SSOT: spec/31-app/05-conventions/24-g31-workflow-xref-reciprocity-gate.md
 *
 * Promoted from one-shot prototype `/tmp/audit_xrefs.mjs` (built during
 * F25). v1.0.0 added typed exit codes, allow-list, suppression hint.
 * v2.0.0 (F-future-G31a) generalised to N scopes with per-scope mode.
 * v2.1.0 (F-future-G31a-promote-endpoints) drained 8 endpoint asymmetries
 *        by adding back-link rows to the Cross-References tables of
 *        14-concurrency-and-sync.md (×5), 15-roles-and-permissions.md (×2),
 *        and 11-trash-view.md (×1); promoted G-31.3 from WARN to ERROR.
 * v2.2.0 (F-future-G31a-promote-db-diagram) drained 6 db-diagram
 *        asymmetries by adding back-link rows to 02-root-db-erd.md (×1),
 *        03-app-db-erd.md (×2), 06-indexes.md (×2), 04-feature-slices.md
 *        (×1), and 05-lifecycle-flows.md (×1); promoted G-31.4 from
 *        WARN to ERROR. Only G-31.2 (features, 30 asymmetries) remained
 *        in WARN mode at end of v2.2.0.
 * v2.3.0 (F-future-G31a-promote-features) drained 30 features
 *        asymmetries by appending back-link rows across 12 target files
 *        via /tmp/drain_g312.py (programmatic insertion under existing
 *        ## Related / ## Cross-References sections, preserving each
 *        target's native bullet-vs-table format); promoted G-31.2 from
 *        WARN to ERROR. All 4 G-31 sub-checks now ERROR-mode at 0
 *        asymmetries — staged WARN-then-ERROR rollout complete.
 * v2.4.0 (F-future-G31b) added the **G-31.5 meta sub-check** enforcing
 *        that every entry in `WORKFLOWS_EXEMPT`, `FEATURES_EXEMPT`,
 *        `ENDPOINTS_EXEMPT`, and `DB_DIAGRAM_EXEMPT` carries a rationale
 *        comment (trailing inline `// …` OR contiguous `// …` line(s)
 *        directly above with no blank-line gap). Algorithm ported
 *        verbatim from G-32.4 (`32-check-ddl-unique-coverage.mjs`),
 *        swapping the self-path and allow-list names. All 4 Sets are
 *        currently empty so the gate ships green; this locks in the
 *        convention before the first exemption is added so authors
 *        can't sneak in silent suppressions. Sample template entries
 *        (lines starting with `// "…"`) are skipped — they are not
 *        active entries, just stylistic hints for future authors.
 * v2.5.0 (F-future-G31c) added the **G-31.6 island-detection sub-check**
 *        (WARN advisory). For each scope, files with zero outgoing AND
 *        zero incoming cross-sibling Related-section references are
 *        flagged as documentation islands. New helper `findIslands()`
 *        derives an incoming-link tally from the existing outgoing
 *        matrix in O(N²), then filters files where both tallies are 0
 *        and the bare filename is not in the per-scope `*_ISLAND_EXEMPT`
 *        Set. New helper `printIslandReport()` emits a per-scope ⚠️
 *        block with the cleanup hint. Added 4 new exemption Sets
 *        (`WORKFLOWS_ISLAND_EXEMPT` / `FEATURES_ISLAND_EXEMPT` /
 *        `ENDPOINTS_ISLAND_EXEMPT` / `DB_DIAGRAM_ISLAND_EXEMPT`, all
 *        empty at v2.5.0) and registered them in `ALLOWLIST_NAMES` so
 *        G-31.5 enforces rationale comments on island opt-outs too.
 *        Each scope entry gained an `islandExemptions` field. Initial
 *        probe found: workflows 0, features 5, endpoints 9, db-diagram 0
 *        (14 total). Exit semantics unchanged: islands are advisory and
 *        do NOT influence the exit code; only ERROR-asymmetries and
 *        unrationaled exemptions fail. Cleanup deferred — surfaced for
 *        author triage.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// =====================================================================
// Per-scope allow-lists. Format: `${from} → ${to}` (bare filenames).
// Each entry MUST carry a one-line rationale (trailing inline `// …` OR
// a `// …` line directly above with no blank-line gap). Machine-enforced
// by G-31.5 since v2.4.0 (mirrors G-32.4 in `32-check-ddl-unique-coverage.mjs`).
// =====================================================================

const WORKFLOWS_EXEMPT = new Set([
  // "10-migration-execution-flow.md → 02-template-application-flow.md",
  // (reason: migration is bootstrap-time only; template flow is user-time only)
]);

const FEATURES_EXEMPT = new Set([
  // (empty at v2.0.0 — drift is genuine and surfaced in WARN mode)
]);

const ENDPOINTS_EXEMPT = new Set([
  // (empty at v2.0.0)
]);

const DB_DIAGRAM_EXEMPT = new Set([
  // (empty at v2.0.0)
]);

// =====================================================================
// Per-scope ISLAND allow-lists (G-31.6, v2.5.0+). Format: bare filename.
// An "island" is a sibling file with neither incoming nor outgoing
// cross-sibling Related-section references. Allow-list opts a file out
// of the WARN advisory when it is genuinely a leaf (e.g. a self-contained
// reference page with no semantic peers). Each entry MUST carry a
// rationale (machine-enforced by G-31.5).
// =====================================================================

const WORKFLOWS_ISLAND_EXEMPT = new Set([
  // (empty at v2.5.0 — workflows scope has 0 islands)
]);

const FEATURES_ISLAND_EXEMPT = new Set([
  // (empty at v2.5.0 — 5 islands surfaced as advisory; cleanup deferred)
]);

const ENDPOINTS_ISLAND_EXEMPT = new Set([
  // (empty at v2.5.0 — 9 islands surfaced as advisory; cleanup deferred)
]);

const DB_DIAGRAM_ISLAND_EXEMPT = new Set([
  // (empty at v2.5.0 — db-diagram scope has 0 islands)
]);

// =====================================================================
// Scope registry. Order = output order.
// =====================================================================

const SCOPES = [
  {
    id: "G-31.1",
    label: "workflows",
    dir: "spec/31-app/02-workflows",
    filenameRx: /^\d{2}-.+-flow\.md$/,
    excludeRx: /^$/,                       // filename regex already restrictive
    relatedHeads: ["## Related"],
    mode: "error",
    exemptions: WORKFLOWS_EXEMPT,
    islandExemptions: WORKFLOWS_ISLAND_EXEMPT,
  },
  {
    id: "G-31.2",
    label: "features",
    dir: "spec/31-app/01-features",
    filenameRx: /^\d{2}[a-z]?-.+\.md$/i,
    // Aggregator pages — not first-class cross-referencing peers.
    excludeRx: /^(00-overview|02-personas|05a-hotkey-table|97-acceptance-criteria|99-consistency-report)\.md$/,
    relatedHeads: ["## Related", "## Cross-References", "## See also"],
    mode: "error",
    exemptions: FEATURES_EXEMPT,
    islandExemptions: FEATURES_ISLAND_EXEMPT,
  },
  {
    id: "G-31.3",
    label: "endpoints",
    dir: "spec/31-app/06-endpoints",
    filenameRx: /^\d{2}[a-z]?-.+\.md$/i,
    excludeRx: /^(00-overview|16-endpoint-at-matrix|97-acceptance-criteria|99-consistency-report)\.md$/,
    relatedHeads: ["## Related", "## Cross-References", "## See also"],
    mode: "error",
    exemptions: ENDPOINTS_EXEMPT,
    islandExemptions: ENDPOINTS_ISLAND_EXEMPT,
  },
  {
    id: "G-31.4",
    label: "db-diagram",
    dir: "spec/31-app/07-db-diagram",
    // Restrict to top-level NN-*.md (skip the sql/ subfolder; that's
    // schema, not prose siblings).
    filenameRx: /^\d{2}-.+\.md$/,
    excludeRx: /^(00-overview|97-acceptance-criteria|99-consistency-report)\.md$/,
    relatedHeads: ["## Cross-References", "## Related", "## See also"],
    mode: "error",
    exemptions: DB_DIAGRAM_EXEMPT,
    islandExemptions: DB_DIAGRAM_ISLAND_EXEMPT,
  },
];

function fail(msg, code = 2) {
  console.error(`G-31 runner error: ${msg}`);
  process.exit(code);
}

function listSiblingFiles(scope) {
  let entries;
  try {
    entries = readdirSync(scope.dir);
  } catch (e) {
    fail(`cannot read ${scope.dir}: ${e.message}`);
  }
  return entries
    .filter((f) => scope.filenameRx.test(f))
    .filter((f) => !scope.excludeRx.test(f))
    .sort();
}

/**
 * Extract the back-link section from a file. Tries each heading in
 * `scope.relatedHeads` in order; returns the slice from the first hit
 * to the next H2, or "" if none present. We deliberately stop only at
 * H2s that don't begin with one of the related-head initials, so the
 * captured block can include sub-headings.
 */
function extractRelatedSection(content, scope) {
  for (const head of scope.relatedHeads) {
    const idx = content.indexOf(head);
    if (idx < 0) continue;
    const rest = content.slice(idx);
    // Stop at next H2 that isn't another related-head variant.
    const nextH2 = rest.search(/\n## (?!Related|Cross-References|See also)/);
    return nextH2 > 0 ? rest.slice(0, nextH2) : rest;
  }
  return "";
}

function buildLinkMatrix(scope, files) {
  const matrix = {};
  for (const f of files) {
    let content;
    try {
      content = readFileSync(join(scope.dir, f), "utf8");
    } catch (e) {
      fail(`cannot read ${join(scope.dir, f)}: ${e.message}`);
    }
    const block = extractRelatedSection(content, scope);
    matrix[f] = new Set();
    for (const other of files) {
      if (other === f) continue;
      if (block.includes(other)) matrix[f].add(other);
    }
  }
  return matrix;
}

function findAsymmetries(scope, files, matrix) {
  const out = [];
  for (const a of files) {
    for (const b of files) {
      if (a === b) continue;
      if (matrix[a].has(b) && !matrix[b].has(a)) {
        const key = `${a} → ${b}`;
        if (scope.exemptions.has(key)) continue;
        out.push({ from: a, to: b });
      }
    }
  }
  return out;
}

function printScopeReport(scope, files, matrix, asymmetries) {
  const totalLinks = files.reduce((n, f) => n + matrix[f].size, 0);
  const modeTag = scope.mode.toUpperCase();
  console.log("");
  console.log(`${scope.id} (${scope.label}, ${modeTag}) cross-sibling reciprocity:`);
  console.log(`  scope:                              ${scope.dir}`);
  console.log(`  files scanned:                      ${files.length}`);
  console.log(`  cross-sibling Related links found:  ${totalLinks}`);
  console.log(`  asymmetric-by-design (allow-list):  ${scope.exemptions.size}`);
  console.log(`  unreciprocated forward-links:       ${asymmetries.length}`);

  if (asymmetries.length === 0) {
    console.log(`  ✅ all cross-sibling Related links reciprocated`);
    return;
  }

  const verdict = scope.mode === "error" ? "❌" : "⚠️";
  console.log("");
  console.log(`  ${verdict} ${asymmetries.length} asymmetric link(s) — target is missing back-link in its Related section:`);
  console.log("");
  for (const { from, to } of asymmetries) {
    console.log(`    ${from}  →  ${to}    (add back-link in ${to})`);
  }
  if (scope.mode === "warn") {
    console.log("");
    console.log(`  (WARN scope — does not fail the gate; drain via reciprocity follow-up,`);
    console.log(`   then promote to ERROR mode in the runner's SCOPES registry.)`);
  } else {
    console.log("");
    console.log(`  To suppress an intentional one-way reference, add the directed`);
    console.log(`  pair to this scope's exemptions Set in the runner with a rationale.`);
  }
}

// =====================================================================
// G-31.5 — Meta: every per-scope exemption Set entry MUST carry a
// rationale comment. Parses the runner's own source; for each named
// exemption Set, extracts every active string-literal entry and verifies
// rationale presence:
//   * trailing inline `// …` on the same line (preferred), OR
//   * one or more `// …` lines immediately above (no blank-line gap).
// Sample/template lines (`// "Foo → Bar"`) are skipped — those are not
// active entries, just hints for future authors.
//
// Algorithm ported verbatim from G-32.4 in
// scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs (v4.0.0).
// =====================================================================

const ALLOWLIST_NAMES = [
  "WORKFLOWS_EXEMPT",
  "FEATURES_EXEMPT",
  "ENDPOINTS_EXEMPT",
  "DB_DIAGRAM_EXEMPT",
  "WORKFLOWS_ISLAND_EXEMPT",
  "FEATURES_ISLAND_EXEMPT",
  "ENDPOINTS_ISLAND_EXEMPT",
  "DB_DIAGRAM_ISLAND_EXEMPT",
];

const SELF_PATH = "scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs";

function findUnrationaledEntries() {
  let lines;
  try {
    lines = readFileSync(SELF_PATH, "utf8").split("\n");
  } catch (e) {
    fail(`G-31.5: cannot read self at ${SELF_PATH}: ${e.message}`);
  }
  const violations = []; // [{listName, entry, line}]

  for (const listName of ALLOWLIST_NAMES) {
    const startRe = new RegExp(`^const\\s+${listName}\\s*=\\s*new\\s+Set\\(\\[`);
    let i = lines.findIndex((l) => startRe.test(l));
    if (i < 0) {
      fail(`G-31.5: cannot find allow-list \`${listName}\` in ${SELF_PATH}`);
    }
    i += 1; // first line inside the array literal

    while (i < lines.length) {
      const raw = lines[i];
      const trimmed = raw.trim();

      // End of array literal.
      if (trimmed.startsWith("]")) break;

      // Active entry: starts with `"` (after optional whitespace).
      // We deliberately ignore `// "..."` sample-template lines.
      const entryMatch = raw.match(/^\s*"([^"]+)"\s*,?\s*(\/\/.*)?$/);
      if (entryMatch) {
        const entry = entryMatch[1];
        const inlineComment = entryMatch[2];

        // Trailing inline rationale satisfies the rule.
        if (inlineComment) {
          i += 1;
          continue;
        }

        // Otherwise scan upwards for contiguous `// …` lines (no blank gap).
        let j = i - 1;
        let hasAbove = false;
        while (j >= 0) {
          const t = lines[j].trim();
          if (t === "") break; // blank line breaks the block
          if (t.startsWith("//")) {
            // Skip pure section separators like `// ----` or `// ===`.
            if (/^\/\/\s*[-=*_]{3,}\s*$/.test(t)) {
              j -= 1;
              continue;
            }
            hasAbove = true;
            break;
          }
          break; // anything non-blank, non-comment ends the search
        }

        if (!hasAbove) {
          violations.push({ listName, entry, line: i + 1 });
        }
      }

      i += 1;
    }
  }

  return violations;
}

function printRationaleReport(violations) {
  console.log("");
  console.log(`G-31.5 (meta, ERROR) exemption-Set rationale-comment coverage:`);
  console.log(`  allow-lists scanned:                ${ALLOWLIST_NAMES.length} (${ALLOWLIST_NAMES.join(", ")})`);
  console.log(`  entries missing rationale:          ${violations.length}`);

  if (violations.length === 0) {
    console.log(`  ✅ every exemption-Set entry carries a rationale (inline or above)`);
    return;
  }

  console.log("");
  console.log(`  ❌ ${violations.length} unrationaled entry/entries:`);
  for (const v of violations) {
    console.log(`    [${v.listName}] "${v.entry}"`);
    console.log(`      source:    ${SELF_PATH}:${v.line}`);
  }
  console.log("");
  console.log(`  To fix: add either (a) a trailing \`// rationale\` on the same line, or`);
  console.log(`  (b) a \`// …\` comment line immediately above (no blank line in between).`);
}

// =====================================================================
// G-31.6 — Documentation-island detection (WARN advisory). For each
// scope, a sibling file with **zero outgoing AND zero incoming**
// cross-sibling Related-section references is flagged as an island.
// Surfaces likely-orphaned spec pages without failing CI; cleanup
// happens via authoring back-links or opting in via the per-scope
// `*_ISLAND_EXEMPT` Set with a rationale (G-31.5-enforced).
// =====================================================================

function findIslands(scope, files, matrix) {
  // Build incoming-link counts from outgoing matrix.
  const incoming = {};
  for (const f of files) incoming[f] = 0;
  for (const f of files) {
    for (const target of matrix[f]) {
      incoming[target] = (incoming[target] || 0) + 1;
    }
  }
  return files.filter((f) => {
    if (matrix[f].size > 0) return false;
    if (incoming[f] > 0) return false;
    if (scope.islandExemptions.has(f)) return false;
    return true;
  });
}

function printIslandReport(scope, files, islands) {
  console.log("");
  console.log(`G-31.6 (${scope.label}, WARN) documentation-island advisory:`);
  console.log(`  scope:                              ${scope.dir}`);
  console.log(`  files scanned:                      ${files.length}`);
  console.log(`  island-exempt (allow-list):         ${scope.islandExemptions.size}`);
  console.log(`  islands (zero in + zero out):       ${islands.length}`);

  if (islands.length === 0) {
    console.log(`  ✅ no documentation islands in this scope`);
    return;
  }

  console.log("");
  console.log(`  ⚠️  ${islands.length} island file(s) — neither linked-from nor linking-to any sibling:`);
  for (const f of islands) {
    console.log(`    ${f}`);
  }
  console.log("");
  console.log(`  (WARN advisory — does not fail the gate. Either author a peer`);
  console.log(`   cross-reference, or add the bare filename to this scope's`);
  console.log(`   *_ISLAND_EXEMPT Set with a one-line rationale.)`);
}

// --- main ---
let totalErrorAsym = 0;
let totalWarnAsym = 0;
let totalIslands = 0;

for (const scope of SCOPES) {
  let dirStat;
  try {
    dirStat = statSync(scope.dir);
  } catch (e) {
    fail(`scope directory ${scope.dir} not found: ${e.message}`);
  }
  if (!dirStat.isDirectory()) {
    fail(`${scope.dir} is not a directory`);
  }

  const files = listSiblingFiles(scope);
  if (files.length === 0) {
    fail(`no sibling files matching ${scope.filenameRx} in ${scope.dir}`);
  }

  const matrix = buildLinkMatrix(scope, files);
  const asym = findAsymmetries(scope, files, matrix);
  printScopeReport(scope, files, matrix, asym);

  const islands = findIslands(scope, files, matrix);
  printIslandReport(scope, files, islands);
  totalIslands += islands.length;

  if (scope.mode === "error") totalErrorAsym += asym.length;
  else totalWarnAsym += asym.length;
}

const unrationaled = findUnrationaledEntries();
printRationaleReport(unrationaled);

console.log("");
console.log(`G-31 summary: ${SCOPES.length} scope(s) scanned — ${totalErrorAsym} ERROR-scope asymmetries, ${totalWarnAsym} WARN-scope asymmetries, ${totalIslands} island advisory(ies), ${unrationaled.length} unrationaled exemption entry/entries.`);

const failed = totalErrorAsym > 0 || unrationaled.length > 0;
process.exit(failed ? 1 : 0);
