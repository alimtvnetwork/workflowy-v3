#!/usr/bin/env node
/**
 * G-32 — DDL ↔ Doc Index Coverage Gate (v5.0.0)
 *
 * Five sub-checks:
 *   G-32.1 (forward, v1.0.0)  — every UNIQUE declaration in DDL is
 *                              documented in 06-indexes.md.
 *   G-32.2 (reverse, v2.0.0)  — every Idx{Name} / sqlite_autoindex_{T} name
 *                              in 06-indexes.md backticks resolves to
 *                              real DDL, an autoindex, or an alias.
 *   G-32.3 (forward, v3.0.0)  — every CREATE INDEX (UNIQUE OR plain)
 *                              across all SQL files is documented in
 *                              06-indexes.md by its DDL name OR its
 *                              prose-alias name (resolved via
 *                              sql/00-overview.md §Index-name aliases).
 *   G-32.4 (meta,    v4.0.0)  — every entry in COVERAGE_EXEMPT,
 *                              REVERSE_EXEMPT, and NONUNIQUE_EXEMPT
 *                              MUST carry a rationale: either a
 *                              trailing inline `// …` on the same line,
 *                              or a `// …` line within the array block
 *                              immediately above the entry (no blank
 *                              line between).
 *   G-32.5 (parity,  v5.0.0)  — for every CREATE [UNIQUE] INDEX, the
 *                              doc row in 06-indexes.md must mention:
 *                              (a) every column from the DDL `(cols)`
 *                                  list (case-sensitive identifier
 *                                  match in backticked content),
 *                              (b) the literal `UNIQUE` token if the
 *                                  DDL declares UNIQUE,
 *                              (c) the word `partial` and the WHERE
 *                                  predicate (normalised) if DDL has
 *                                  a `WHERE …` clause.
 *                              Name-only matching (G-32.3) ensures a
 *                              row exists; G-32.5 ensures the row
 *                              describes that index correctly.
 *
 * Asserts that every `UNIQUE` declaration in the SQLite DDL files
 * (`spec/31-app/07-db-diagram/sql/01-root-schema.sql` and
 * `spec/31-app/07-db-diagram/sql/02-app-schema.sql`) is documented in
 * `spec/31-app/07-db-diagram/06-indexes.md` either explicitly (named
 * index) or implicitly (sqlite_autoindex_* in the §Implicit Indexes
 * subsection).
 *
 * Algorithm SSOT: spec/31-app/05-conventions/25-g32-ddl-unique-coverage-gate.md
 *
 * Exit codes:
 *   0  All UNIQUE declarations documented
 *   1  One or more undocumented UNIQUE declarations detected
 *   2  Runner error (missing file, parse failure, etc.)
 *
 * Promoted from one-shot prototype `/tmp/audit_unique.mjs` (built during
 * F26). The prototype reported coverage but had no exit code, no
 * allow-list, no precise matching (used substring), no structured
 * output. This runner adds all four.
 *
 * Drift class this catches (from F26 findings):
 *   - Fabricated soft-delete columns referenced in 06-indexes.md but
 *     absent from DDL (see ambiguity #23).
 *   - Explicit CREATE UNIQUE INDEX rows added to DDL but never
 *     mentioned in 06-indexes.md (e.g. `IdxUserRole_User_Role`).
 *   - Misclassified UNIQUE-side-effect indexes documented as
 *     "required indexes" (e.g. `IdxUser_Email` was wrongly listed in
 *     Required-Indexes table; F26 moved it to Implicit-Indexes).
 */

import { readFileSync, statSync } from "node:fs";

const SCHEMA_FILES = [
  "spec/31-app/07-db-diagram/sql/01-root-schema.sql",
  "spec/31-app/07-db-diagram/sql/02-app-schema.sql",
];
const APP_INDEXES_FILE = "spec/31-app/07-db-diagram/sql/03-app-indexes.sql";
const NAMING_BRIDGE = "spec/31-app/07-db-diagram/sql/00-overview.md";
const INDEXES_DOC = "spec/31-app/07-db-diagram/06-indexes.md";

// Allow-list — UNIQUE declarations whose documentation is intentionally
// elsewhere (not in 06-indexes.md). Format: `${file}:${table}:${columns}` for
// table-level/column-level, or `${file}:explicit:${indexName}` for explicit
// CREATE UNIQUE INDEX. Empty as of v1.0.0 (F26 drained the queue to 0).
//
// To suppress an intentional omission, add the key here with a one-line
// `// rationale` comment. Mirrors the F27/F28 G-30.2 allow-list pattern.
const COVERAGE_EXEMPT = new Set([
  // "01-root-schema.sql:User(Email):docs-in-auth-spec",
]);

// G-32.2 allow-list — index identifiers that legitimately appear in
// `06-indexes.md` prose without a literal DDL match. The canonical
// entries live in the per-(gate, path) ledger:
//   spec/31-app/05-conventions/_LEDGER-G-32-EXEMPTIONS.md
// `loadG32Exemptions()` unions ledger entries into this Set at
// module-load. The Set below is RESERVED FOR EMERGENCY OVERRIDES only.
// Sibling pattern: see G-30 (`30-check-at-citation-validity.mjs`) and
// G-31 (`31-check-workflow-xref-reciprocity.mjs`).
const REVERSE_EXEMPT = new Set([
  // (in-source override slot — empty; canonical entries in ledger.)
]);

// G-32.3 allow-list — DDL CREATE INDEX names whose documentation is
// intentionally absent from `06-indexes.md`. Empty as of v3.0.0 — every
// CREATE INDEX in DDL is currently documented (DDL alias resolution via
// sql/00-overview.md handles the `IdxMirrorMember_*`/`IdxMirrorGroup_*`
// → `IdxMirrorPeerGroup*` rename automatically).
const NONUNIQUE_EXEMPT = new Set([
  // "IdxFoo_BarBaz",  // rationale: ...
]);

// G-32.5 allow-list — DDL index names whose doc row legitimately diverges
// from the DDL signature (columns / UNIQUE / WHERE). Use sparingly. Format:
// `${ddlName}:${aspect}` where aspect ∈ {columns, unique, predicate}. Each
// entry suppresses one aspect of the parity check, not the whole row.
const PARITY_EXEMPT = new Set([
  // "IdxFoo_Bar:predicate",  // rationale: doc paraphrases predicate for clarity
]);

// =====================================================================
// Per-(gate, path) ledger loader (Phase-2 sibling #3 of G-30/G-31).
// Reads `spec/31-app/05-conventions/_LEDGER-G-32-EXEMPTIONS.md`, parses
// the `## Entries` table, and unions each row into the matching in-source
// override Set above. Hard-fails on schema violations so a malformed
// ledger row cannot silently weaken the gate.
// =====================================================================

const G32_LEDGER_PATH = "spec/31-app/05-conventions/_LEDGER-G-32-EXEMPTIONS.md";

const G32_CATEGORY_TO_SET = {
  coverage:  COVERAGE_EXEMPT,
  reverse:   REVERSE_EXEMPT,
  nonunique: NONUNIQUE_EXEMPT,
  parity:    PARITY_EXEMPT,
};

function fail(msg, code = 2) {
  console.error(`G-32 runner error: ${msg}`);
  process.exit(code);
}

// Phase-3 path-glob matcher (mirrors G-30/G-31; ≤15-line logic per ADR-0007 R3).
function globToRegExp(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const pattern = escaped.replace(/\*\*/g, "::DS::").replace(/\*/g, "[^/]*").replace(/::DS::/g, ".*");
  return new RegExp(`^${pattern}$`);
}

// Phase-3: per-(category, entry) → list of compiled pathGlob regexes.
const G32_GLOBS_BY_KEY = new Map();
function g32Key(category, entry) { return `${category}::${entry}`; }

function loadG32Exemptions() {
  let raw;
  try {
    raw = readFileSync(G32_LEDGER_PATH, "utf8");
  } catch (e) {
    fail(`G-32 ledger: cannot read ${G32_LEDGER_PATH}: ${e.message}`);
  }
  const lines = raw.split("\n");
  const entriesIdx = lines.findIndex((l) => /^##\s+Entries\s*$/.test(l));
  if (entriesIdx < 0) fail(`G-32 ledger: missing '## Entries' section`);

  const stripBackticks = (s) => s.replace(/^`(.*)`$/, "$1");
  let imported = 0;
  for (let i = entriesIdx + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^##\s/.test(line)) break;
    if (!line.trim().startsWith("|")) continue;
    if (/^\|\s*-+/.test(line)) continue;
    if (/^\|\s*gate\s*\|/i.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 5) continue;
    const [gate, pathGlobRaw, entryRaw, rationale] = cells;
    const pathGlob = stripBackticks(pathGlobRaw);
    const entry = stripBackticks(entryRaw);
    const m = gate.match(/^G-32\.\d+\.(coverage|reverse|nonunique|parity)$/);
    if (!m) fail(`G-32 ledger: malformed gate \`${gate}\` at line ${i + 1}`);
    const category = m[1];
    if (!entry) fail(`G-32 ledger: empty entry at line ${i + 1}`);
    if (!pathGlob) fail(`G-32 ledger: empty pathGlob for \`${entry}\` at line ${i + 1}`);
    if (!rationale) fail(`G-32 ledger: empty rationale for \`${entry}\` at line ${i + 1}`);
    G32_CATEGORY_TO_SET[category].add(entry);
    const key = g32Key(category, entry);
    if (!G32_GLOBS_BY_KEY.has(key)) G32_GLOBS_BY_KEY.set(key, []);
    G32_GLOBS_BY_KEY.get(key).push(globToRegExp(pathGlob));
    imported += 1;
  }
  return imported;
}

const G32_LEDGER_IMPORTED = loadG32Exemptions();

// Phase-3 path-aware exemption check. Returns true iff:
//   (a) entry exists in the in-source override Set (path-agnostic), AND
//       has no ledger row → emergency hotfix; OR
//   (b) entry has ≥1 ledger row whose pathGlob matches the host file.
function isG32Exempt(category, entry, hostFile) {
  if (!G32_CATEGORY_TO_SET[category].has(entry)) return false;
  const globs = G32_GLOBS_BY_KEY.get(g32Key(category, entry));
  if (!globs) return true;
  if (!hostFile) return true;
  return globs.some((re) => re.test(hostFile));
}


function readOrFail(path) {
  try {
    statSync(path);
  } catch (e) {
    fail(`cannot stat ${path}: ${e.message}`);
  }
  try {
    return readFileSync(path, "utf8");
  } catch (e) {
    fail(`cannot read ${path}: ${e.message}`);
  }
}

/**
 * Parse a SQL file for UNIQUE declarations.
 * Returns {kind, table, columns?, indexName?, file, line, key}[]
 *   kind = "column" | "table" | "explicit"
 *   key = stable identifier used for allow-list lookup
 */
function parseUniqueDecls(filePath) {
  const fileBase = filePath.split("/").pop();
  const lines = readOrFail(filePath).split("\n");
  const out = [];
  let currentTable = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const tableMatch = line.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
    if (tableMatch) currentTable = tableMatch[1];

    // Explicit CREATE UNIQUE INDEX — must be checked before column-level
    // since the line also contains the word UNIQUE.
    const explicit = line.match(/CREATE UNIQUE INDEX\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
    if (explicit) {
      out.push({
        kind: "explicit",
        indexName: explicit[1],
        file: fileBase,
        filePath,
        line: i + 1,
        key: `${fileBase}:explicit:${explicit[1]}`,
      });
      continue;
    }

    // Column-level UNIQUE: "  ColName TYPE ... UNIQUE"
    const colUnique = line.match(/^\s+(\w+)\s+\w+(?:\([^)]*\))?[^,]*\bUNIQUE\b/);
    if (colUnique) {
      out.push({
        kind: "column",
        table: currentTable,
        columns: [colUnique[1]],
        file: fileBase,
        filePath,
        line: i + 1,
        key: `${fileBase}:${currentTable}(${colUnique[1]})`,
      });
      continue;
    }

    // Table-level UNIQUE(...)
    const tblUnique = line.match(/^\s+UNIQUE\s*\(([^)]+)\)/i);
    if (tblUnique) {
      const cols = tblUnique[1].split(",").map((s) => s.trim());
      out.push({
        kind: "table",
        table: currentTable,
        columns: cols,
        file: fileBase,
        filePath,
        line: i + 1,
        key: `${fileBase}:${currentTable}(${cols.join(",")})`,
      });
    }
  }
  return out;
}

/**
 * For a non-explicit decl, compute the candidate names that would
 * legitimately document it in 06-indexes.md. We accept ANY match.
 *   - Idx{Table}_{Cols joined by _}    (explicit-named index convention)
 *   - sqlite_autoindex_{Table}         (implicit autoindex convention)
 */
function candidateNames(decl) {
  if (decl.kind === "explicit") return [decl.indexName];
  return [
    `Idx${decl.table}_${decl.columns.join("_")}`,
    `sqlite_autoindex_${decl.table}`,
  ];
}

function findUndocumented(decls, indexesText) {
  const violations = [];
  for (const d of decls) {
    if (COVERAGE_EXEMPT.has(d.key)) continue;
    const names = candidateNames(d);
    const matched = names.find((n) => indexesText.includes(n));
    if (!matched) violations.push({ decl: d, candidates: names });
  }
  return violations;
}

function printReport(decls, violations) {
  const explicitCount = decls.filter((d) => d.kind === "explicit").length;
  const columnCount = decls.filter((d) => d.kind === "column").length;
  const tableCount = decls.filter((d) => d.kind === "table").length;

  console.log("G-32 DDL UNIQUE documentation coverage:");
  console.log(`  schema files scanned:               ${SCHEMA_FILES.length}`);
  console.log(`  UNIQUE declarations found:          ${decls.length}`);
  console.log(`    column-level:                     ${columnCount}`);
  console.log(`    table-level:                      ${tableCount}`);
  console.log(`    explicit CREATE UNIQUE INDEX:     ${explicitCount}`);
  console.log(`  coverage-exempt (allow-list):       ${COVERAGE_EXEMPT.size}`);
  console.log(`  undocumented declarations:          ${violations.length}`);

  if (violations.length === 0) {
    console.log("  ✅ all UNIQUE declarations documented in 06-indexes.md");
    return;
  }

  console.log("");
  console.log(`  ❌ ${violations.length} undocumented declaration(s) — expected mention in ${INDEXES_DOC}:`);
  console.log("");
  for (const { decl, candidates } of violations) {
    const sig =
      decl.kind === "explicit"
        ? `[explicit] ${decl.indexName}`
        : `[${decl.kind}] ${decl.table}(${decl.columns.join(",")})`;
    console.log(`    ${sig}`);
    console.log(`      source:    ${decl.filePath}:${decl.line}`);
    console.log(`      expected:  one of ${candidates.map((n) => `\`${n}\``).join(" / ")}`);
  }
  console.log("");
  console.log("  To fix: add the index to 06-indexes.md (Required-Indexes for explicit");
  console.log("  CREATE INDEX, or §Implicit Indexes for UNIQUE-implied autoindexes).");
  console.log("  To suppress an intentional omission, add the decl key to");
  console.log("  COVERAGE_EXEMPT in this runner with a rationale comment.");
}

// =====================================================================
// G-32.2 — Reverse drift: every Idx*/sqlite_autoindex_* identifier
// mentioned in 06-indexes.md must resolve to a real DDL backing.
// =====================================================================

/**
 * Collect every distinct identifier matching /Idx[A-Z]\w+/ or
 * /sqlite_autoindex_\w+/ that appears inside backticks in the doc.
 * We restrict to backticked occurrences to avoid prose noise.
 */
function collectDocIndexNames(docText) {
  const names = new Set();
  const re = /`(Idx[A-Z]\w+|sqlite_autoindex_\w+)`/g;
  let m;
  while ((m = re.exec(docText)) !== null) names.add(m[1]);
  // Also catch ~~strikethrough~~ form used to mark reversed decisions:
  //   `~~`IdxItem_UpdatedAt`~~`. The backtick capture above already gets it.
  return [...names].sort();
}

/**
 * Build the universe of DDL-backed index identifiers:
 *   - Every CREATE [UNIQUE] INDEX name across all SQL files.
 *   - Every `sqlite_autoindex_<Table>_*` derived from UNIQUE declarations.
 *   - Every alias from sql/00-overview.md §Index-name aliases (LHS↔RHS rows).
 */
function collectDdlIndexNames(allDecls) {
  const names = new Set();

  // Explicit CREATE INDEX names from every SQL file (not just UNIQUE).
  const sqlFiles = [...SCHEMA_FILES, APP_INDEXES_FILE];
  for (const f of sqlFiles) {
    const text = readOrFail(f);
    const re = /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF NOT EXISTS\s+)?(\w+)/gi;
    let m;
    while ((m = re.exec(text)) !== null) names.add(m[1]);
  }

  // sqlite_autoindex names — one per table that has any UNIQUE decl.
  // Authoritatively, SQLite numbers them _1, _2, ... but doc convention
  // uses `sqlite_autoindex_<Table>_*` with a wildcard, so we register the
  // wildcard form. We'll match doc claims by stripping the `_<digit>` or
  // `_*` suffix down to `sqlite_autoindex_<Table>`.
  for (const d of allDecls) {
    if (d.kind === "explicit") continue;
    names.add(`sqlite_autoindex_${d.table}`);
  }

  // Alias bridge from sql/00-overview.md — register both sides as valid.
  const bridge = readOrFail(NAMING_BRIDGE);
  // Match table rows like:
  //   | `IdxMirrorMember_ItemId` ... | `IdxMirrorPeerGroupMember_ItemId` ...
  const rowRe = /\|\s*`(Idx[A-Z]\w+)`[^|]*\|\s*`(Idx[A-Z]\w+)`/g;
  let mm;
  while ((mm = rowRe.exec(bridge)) !== null) {
    names.add(mm[1]);
    names.add(mm[2]);
  }

  return names;
}

/**
 * Normalise a doc-claimed name for comparison.
 *   sqlite_autoindex_User_1  → sqlite_autoindex_User
 *   sqlite_autoindex_User_*  → sqlite_autoindex_User
 *   IdxFoo                   → IdxFoo (unchanged)
 */
function normaliseAutoindex(name) {
  const m = name.match(/^(sqlite_autoindex_[A-Za-z]\w*?)(_\*|_\d+)?$/);
  return m ? m[1] : name;
}

function findFabricatedIndexes(docNames, ddlNames) {
  const fab = [];
  for (const name of docNames) {
    if (REVERSE_EXEMPT.has(name)) continue;
    const probe = normaliseAutoindex(name);
    if (ddlNames.has(probe) || ddlNames.has(name)) continue;
    fab.push(name);
  }
  return fab;
}

function printReverseReport(docNames, ddlNames, fabricated) {
  console.log("");
  console.log("G-32.2 reverse drift (doc-claimed indexes ↔ DDL backing):");
  console.log(`  distinct Idx*/autoindex names in 06-indexes.md: ${docNames.length}`);
  console.log(`  DDL-backed identifiers (incl. aliases):         ${ddlNames.size}`);
  console.log(`  reverse-exempt (allow-list):                    ${REVERSE_EXEMPT.size}`);
  console.log(`  fabricated (no DDL backing):                    ${fabricated.length}`);

  if (fabricated.length === 0) {
    console.log("  ✅ every doc-claimed index resolves to DDL or an alias");
    return;
  }

  console.log("");
  console.log(`  ❌ ${fabricated.length} fabricated identifier(s) in ${INDEXES_DOC}:`);
  for (const n of fabricated) console.log(`    \`${n}\``);
  console.log("");
  console.log("  To fix: either (a) add the missing CREATE [UNIQUE] INDEX to a SQL file,");
  console.log("  (b) register an alias row in sql/00-overview.md §Index-name aliases, or");
  console.log("  (c) remove the fabricated mention from 06-indexes.md.");
  console.log("  Last-resort: add the name to REVERSE_EXEMPT in this runner with rationale.");
}

// =====================================================================
// G-32.3 — Forward (all CREATE INDEX): every named index in DDL —
// UNIQUE OR plain — must appear in 06-indexes.md by its DDL name OR
// its prose-alias name. Aliases come from sql/00-overview.md
// §Index-name aliases (DDL → prose mapping).
// =====================================================================

function collectAllCreateIndexNames() {
  const sqlFiles = [...SCHEMA_FILES, APP_INDEXES_FILE];
  const out = []; // [{name, file, line}]
  for (const f of sqlFiles) {
    const fileBase = f.split("/").pop();
    const lines = readOrFail(f).split("\n");
    const re = /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF NOT EXISTS\s+)?(\w+)/i;
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(re);
      if (m) out.push({ name: m[1], file: fileBase, line: i + 1, filePath: f });
    }
  }
  return out;
}

/**
 * Build a DDL→prose alias map from sql/00-overview.md §Index-name aliases.
 * Returns Map<ddlName, proseName>. Bridge rows look like:
 *   | `IdxMirrorMember_ItemId` ... | `IdxMirrorPeerGroupMember_ItemId` ...
 */
function collectIndexAliasMap() {
  const text = readOrFail(NAMING_BRIDGE);
  const map = new Map();
  const rowRe = /\|\s*`(Idx[A-Z]\w+)`[^|]*\|\s*`(Idx[A-Z]\w+)`/g;
  let m;
  while ((m = rowRe.exec(text)) !== null) map.set(m[1], m[2]);
  return map;
}

function findUndocumentedCreateIndexes(allCreates, aliasMap, indexesText) {
  const undocumented = [];
  // Match only backticked occurrences in the doc to avoid prose noise.
  const docHas = (n) => new RegExp("`" + n + "`").test(indexesText);
  for (const c of allCreates) {
    if (NONUNIQUE_EXEMPT.has(c.name)) continue;
    const aliased = aliasMap.get(c.name);
    if (docHas(c.name) || (aliased && docHas(aliased))) continue;
    undocumented.push({ ...c, aliased });
  }
  return undocumented;
}

function printCreateIndexReport(allCreates, aliasMap, undocumented) {
  console.log("");
  console.log("G-32.3 CREATE INDEX coverage (UNIQUE + plain):");
  console.log(`  CREATE INDEX statements scanned:    ${allCreates.length}`);
  console.log(`  DDL→prose aliases registered:       ${aliasMap.size}`);
  console.log(`  nonunique-exempt (allow-list):      ${NONUNIQUE_EXEMPT.size}`);
  console.log(`  undocumented CREATE INDEX names:    ${undocumented.length}`);

  if (undocumented.length === 0) {
    console.log("  ✅ every CREATE INDEX is documented (by DDL name or alias)");
    return;
  }

  console.log("");
  console.log(`  ❌ ${undocumented.length} undocumented CREATE INDEX name(s):`);
  console.log("");
  for (const u of undocumented) {
    console.log(`    ${u.name}`);
    console.log(`      source:    ${u.filePath}:${u.line}`);
    if (u.aliased) {
      console.log(`      alias:     prose-name \`${u.aliased}\` (also missing from 06-indexes.md)`);
    } else {
      console.log(`      alias:     none registered in sql/00-overview.md §Index-name aliases`);
    }
  }
  console.log("");
  console.log("  To fix: either add the index to 06-indexes.md (Required-Indexes table),");
  console.log("  or register a DDL→prose alias row in sql/00-overview.md §Index-name aliases.");
  console.log("  Last-resort: add the DDL name to NONUNIQUE_EXEMPT in this runner.");
}

// =====================================================================
// G-32.4 — Meta: every allow-list entry MUST carry a rationale comment.
// Parses the runner's own source. For each of the 3 allow-list arrays,
// extract every string-literal entry and verify rationale presence:
//   * trailing inline `// …` on the same line (preferred), OR
//   * one or more `// …` lines immediately above (no blank-line gap).
// Sample comment lines (`// "Foo:Bar:Baz"`) are skipped — those are not
// active entries, just templates for future authors.
// =====================================================================

const ALLOWLIST_NAMES = [
  "COVERAGE_EXEMPT",
  "REVERSE_EXEMPT",
  "NONUNIQUE_EXEMPT",
];

function findUnrationaledEntries() {
  const selfPath = "scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs";
  const lines = readOrFail(selfPath).split("\n");
  const violations = []; // [{listName, entry, line}]

  for (const listName of ALLOWLIST_NAMES) {
    const startRe = new RegExp(`^const\\s+${listName}\\s*=\\s*new\\s+Set\\(\\[`);
    let i = lines.findIndex((l) => startRe.test(l));
    if (i < 0) {
      fail(`G-32.4: cannot find allow-list \`${listName}\` in ${selfPath}`);
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
          if (t === "") break;          // blank line breaks the block
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
  console.log("G-32.4 allow-list rationale-comment coverage:");
  console.log(`  allow-lists scanned:                ${ALLOWLIST_NAMES.length} (${ALLOWLIST_NAMES.join(", ")})`);
  console.log(`  ledger entries imported:            ${G32_LEDGER_IMPORTED} (${G32_LEDGER_PATH})`);
  console.log(`  entries missing rationale:          ${violations.length}`);

  if (violations.length === 0) {
    console.log("  ✅ every allow-list entry carries a rationale (inline or above)");
    return;
  }

  console.log("");
  console.log(`  ❌ ${violations.length} unrationaled entry/entries:`);
  for (const v of violations) {
    console.log(`    [${v.listName}] "${v.entry}"`);
    console.log(`      source:    scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs:${v.line}`);
  }
  console.log("");
  console.log("  To fix: add either (a) a trailing `// rationale` on the same line, or");
  console.log("  (b) a `// …` comment line immediately above (no blank line in between).");
}

// =====================================================================
// G-32.5 — Column / predicate parity: every CREATE [UNIQUE] INDEX must
// have a doc row in 06-indexes.md whose backticked content mentions all
// declared columns, the UNIQUE token (if applicable), and the WHERE
// predicate (if applicable). Catches drift where a row names the right
// index but describes the wrong columns or omits a partial-predicate.
// =====================================================================

/**
 * Parse every CREATE [UNIQUE] INDEX block (multi-line aware). Returns
 *   {name, unique, table, columns:[…], where:string|null, file, line}
 * `columns` preserves order and qualifiers (e.g. "CreatedAt DESC").
 * `where` is the raw text after `WHERE`, trimmed; trailing `;` removed.
 */
function parseCreateIndexBlocks() {
  const sqlFiles = [...SCHEMA_FILES, APP_INDEXES_FILE];
  const out = [];
  const blockRe =
    /CREATE\s+(UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+ON\s+(\w+)\s*\(([^)]+)\)([^;]*);/gi;
  for (const f of sqlFiles) {
    const text = readOrFail(f);
    const fileBase = f.split("/").pop();
    let m;
    while ((m = blockRe.exec(text)) !== null) {
      const [, uniqueTok, name, table, colsRaw, tail] = m;
      const columns = colsRaw
        .split(",")
        .map((s) => s.trim().replace(/\s+/g, " "));
      const whereMatch = tail.match(/WHERE\s+([\s\S]+?)\s*$/i);
      const where = whereMatch ? whereMatch[1].trim().replace(/\s+/g, " ") : null;
      const line = text.slice(0, m.index).split("\n").length;
      out.push({
        name,
        unique: !!uniqueTok,
        table,
        columns,
        where,
        file: fileBase,
        filePath: f,
        line,
      });
    }
  }
  return out;
}

/**
 * Build a DDL→prose column-alias map from `sql/00-overview.md` §Naming
 * Bridge tables. Returns Map<ddlBareCol, proseBareCol>. Bridge rows look
 * like `\`MirrorMember.MirrorGroupId\` (FK) | \`MirrorPeerGroupMembers.MirrorPeerGroupId\``.
 * We only register entries where the bare column name (after the dot)
 * differs between sides.
 */
function collectColumnAliasMap() {
  const text = readOrFail(NAMING_BRIDGE);
  const map = new Map();
  // Capture two backticked `Table.Col` cells in the same row; tolerate trailing
  // qualifier text like `(PK)` or `(FK)` between the backtick and `|`.
  const rowRe = /\|\s*`([A-Z]\w+)\.(\w+)`[^|]*\|\s*`([A-Z]\w+)\.(\w+)`/g;
  let m;
  while ((m = rowRe.exec(text)) !== null) {
    const ddlCol = m[2];
    const proseCol = m[4];
    if (ddlCol !== proseCol) map.set(ddlCol, proseCol);
  }
  return map;
}

function findDocRow(indexesText, name, alias) {
  const lines = indexesText.split("\n");
  const probes = alias ? [name, alias] : [name];
  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    for (const p of probes) {
      if (new RegExp("`" + p + "`").test(line)) return line;
    }
  }
  return null;
}

function bareColName(col) {
  return col.replace(/\s+(?:ASC|DESC)\b/gi, "").trim();
}

function normalisePredicate(s) {
  return s.replace(/\s+/g, " ").trim();
}

function checkParity(blocks, aliasMap, colAliasMap, indexesText) {
  const violations = [];
  for (const b of blocks) {
    const alias = aliasMap.get(b.name);
    const row = findDocRow(indexesText, b.name, alias);
    if (!row) continue; // G-32.3 already reports missing rows
    const rowNorm = normalisePredicate(row);

    if (!PARITY_EXEMPT.has(`${b.name}:columns`)) {
      const missingCols = b.columns.map(bareColName).filter((c) => {
        const proseAlias = colAliasMap.get(c);
        const probes = proseAlias ? [c, proseAlias] : [c];
        // Pass if ANY probe identifier appears inside backticks on the row.
        return !probes.some((p) =>
          new RegExp("`[^`]*\\b" + p + "\\b[^`]*`").test(row)
        );
      });
      if (missingCols.length > 0) {
        violations.push({
          block: b,
          aspect: "columns",
          detail: `missing column reference(s): ${missingCols.join(", ")}`,
        });
      }
    }

    if (b.unique && !PARITY_EXEMPT.has(`${b.name}:unique`)) {
      if (!/\bUNIQUE\b/.test(row)) {
        violations.push({
          block: b,
          aspect: "unique",
          detail: "DDL declares UNIQUE but doc row omits the token",
        });
      }
    }

    if (b.where && !PARITY_EXEMPT.has(`${b.name}:predicate`)) {
      const wherePart = normalisePredicate(b.where);
      const hasPartial = /\bpartial\b/i.test(rowNorm);
      const hasPredicate = rowNorm.includes(wherePart);
      if (!hasPartial || !hasPredicate) {
        violations.push({
          block: b,
          aspect: "predicate",
          detail:
            (!hasPartial ? "missing word `partial`; " : "") +
            (!hasPredicate ? `missing predicate "WHERE ${wherePart}"` : ""),
        });
      }
    }
  }
  return violations;
}

function printParityReport(blocks, violations) {
  console.log("");
  console.log("G-32.5 column / predicate parity (DDL ↔ doc row):");
  console.log(`  CREATE INDEX blocks parsed:         ${blocks.length}`);
  console.log(`  parity-exempt (allow-list):         ${PARITY_EXEMPT.size}`);
  console.log(`  parity violations:                  ${violations.length}`);

  if (violations.length === 0) {
    console.log("  ✅ every doc row matches its DDL columns / UNIQUE / WHERE");
    return;
  }

  console.log("");
  console.log(`  ❌ ${violations.length} parity violation(s):`);
  console.log("");
  for (const v of violations) {
    console.log(`    ${v.block.name} [${v.aspect}]`);
    console.log(`      source:    ${v.block.filePath}:${v.block.line}`);
    console.log(`      ddl:       ${v.block.unique ? "UNIQUE " : ""}(${v.block.columns.join(", ")})${v.block.where ? " WHERE " + v.block.where : ""}`);
    console.log(`      problem:   ${v.detail}`);
  }
  console.log("");
  console.log("  To fix: edit the doc row in 06-indexes.md to mention every column,");
  console.log("  the UNIQUE token, and the partial WHERE predicate verbatim.");
  console.log("  Last-resort: add `<name>:<aspect>` to PARITY_EXEMPT with rationale.");
}

// --- main ---
const indexesText = readOrFail(INDEXES_DOC);

let allDecls = [];
for (const f of SCHEMA_FILES) {
  allDecls = allDecls.concat(parseUniqueDecls(f));
}

if (allDecls.length === 0) {
  fail("no UNIQUE declarations found in either schema file — parse error?");
}

const violations = findUndocumented(allDecls, indexesText);
printReport(allDecls, violations);

const docNames = collectDocIndexNames(indexesText);
const ddlNames = collectDdlIndexNames(allDecls);
const fabricated = findFabricatedIndexes(docNames, ddlNames);
printReverseReport(docNames, ddlNames, fabricated);

const allCreates = collectAllCreateIndexNames();
if (allCreates.length === 0) {
  fail("no CREATE INDEX statements found across SQL files — parse error?");
}
const aliasMap = collectIndexAliasMap();
const undocCreates = findUndocumentedCreateIndexes(allCreates, aliasMap, indexesText);
printCreateIndexReport(allCreates, aliasMap, undocCreates);

const unrationaled = findUnrationaledEntries();
printRationaleReport(unrationaled);

const blocks = parseCreateIndexBlocks();
if (blocks.length === 0) {
  fail("no CREATE INDEX blocks parseable — regex failure?");
}
const colAliasMap = collectColumnAliasMap();
const parityViolations = checkParity(blocks, aliasMap, colAliasMap, indexesText);
printParityReport(blocks, parityViolations);

const failed =
  violations.length > 0 ||
  fabricated.length > 0 ||
  undocCreates.length > 0 ||
  unrationaled.length > 0 ||
  parityViolations.length > 0;
process.exit(failed ? 1 : 0);
