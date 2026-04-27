#!/usr/bin/env node
/**
 * G-32 — DDL UNIQUE Documentation Coverage Gate (v1.0.0)
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

process.exit(violations.length === 0 ? 0 : 1);
