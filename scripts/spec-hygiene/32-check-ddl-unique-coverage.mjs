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
// `06-indexes.md` prose without a literal DDL match. Use sparingly; the
// preferred fix is to register the alias in `sql/00-overview.md` §Index-name
// aliases (which the runner reads automatically) rather than adding entries
// here. Format: bare identifier (e.g. `IdxItem_Foo`).
const REVERSE_EXEMPT = new Set([
  // Conceptual / "logical" tags used in §Implicit Indexes prose. The actual
  // index is the autoindex; the Idx* name is doc-only shorthand.
  "IdxUser_Email",         // logical tag for sqlite_autoindex_User_*
  "IdxWorkspace_AppDbPath", // logical tag for sqlite_autoindex_Workspace_*
  // Historic / explicitly-rejected names mentioned in §"Indexes intentionally
  // NOT created" — the runner cannot tell prose-rejected from prose-claimed
  // without parsing section headings, so we suppress these by name.
  "IdxItem_Content",         // §"Indexes NOT created" — FTS5 ships in Phase 2
  "IdxItem_CreatedAt",       // §"Indexes NOT created" — order is by FractionalIndex, not CreatedAt
  "IdxComment_AuthorUserId", // §"Indexes NOT created" — "all my comments" is not an MVP view
  // v2-deprecated names mentioned in the v1.3.0 deprecation note for traceability.
  "IdxItem_MirrorOfItemId",  // dropped by M-117 (legacy Mirror table)
  "IdxMirror_SourceItemId",  // dropped by M-117 (legacy Mirror table)
  "IdxMirror_MirrorItemId",  // dropped by M-117 (legacy Mirror table)
]);

// G-32.3 allow-list — DDL CREATE INDEX names whose documentation is
// intentionally absent from `06-indexes.md`. Empty as of v3.0.0 — every
// CREATE INDEX in DDL is currently documented (DDL alias resolution via
// sql/00-overview.md handles the `IdxMirrorMember_*`/`IdxMirrorGroup_*`
// → `IdxMirrorPeerGroup*` rename automatically).
const NONUNIQUE_EXEMPT = new Set([
  // "IdxFoo_BarBaz",  // rationale: ...
]);

function fail(msg, code = 2) {
  console.error(`G-32 runner error: ${msg}`);
  process.exit(code);
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

const failed =
  violations.length > 0 ||
  fabricated.length > 0 ||
  undocCreates.length > 0 ||
  unrationaled.length > 0;
process.exit(failed ? 1 : 0);
