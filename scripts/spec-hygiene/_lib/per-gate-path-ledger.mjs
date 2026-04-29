/**
 * @file Shared library for per-(gate, path) ledger consumption.
 *
 * **Purpose.** Codifies the proven trilogy pattern (G-30 + G-31 + G-32) as
 * a single reusable module so any future hygiene runner that adopts a
 * markdown-table ledger gets the same parser, glob compiler, and
 * path-aware exempt check for free. Eliminates 3-way duplication of:
 *   - `globToRegExp()` (≤15-line POSIX-glob → RegExp)
 *   - markdown `## Entries` table walker
 *   - backtick-stripping cell normaliser
 *   - per-key glob map + `isExempt(key, host)` primitive
 *
 * **Schema (canonical Phase-1, ratified 2026-04-29):**
 *   `gate | pathGlob | entry | rationale | addedOn`
 *
 * **Gate-specific shape stays in the runner.** Each runner owns its own
 * `parseGateCell(gate)` function that returns whatever shape it needs to
 * key its in-source override Sets (e.g. G-31 returns `{scopeId, category}`,
 * G-32 returns `{category}`). This module provides the table walk,
 * cell normalisation, and per-key glob enforcement; the runner provides
 * the gate semantics.
 *
 * **ADR-0007 R-DRY compliance.** Three runners previously held identical
 * 50-line parsers; this module reduces each to ~15 lines of glue.
 *
 * **Logic-line budget.** Every exported function is ≤15 logic lines per
 * ADR-0007 R3 (verified by hand at 2026-04-29 v1.0.0).
 *
 * **Cross-references.**
 *   - Schema: `spec/13-cicd-pipeline-workflows/scripts-as-spec/per-gate-path-ledger-schema.md`
 *   - First consumer: `scripts/spec-hygiene/30-check-at-citation-validity.mjs`
 *   - Sibling consumers: `31-check-workflow-xref-reciprocity.mjs`, `32-check-ddl-unique-coverage.mjs`
 *   - Audits: `.lovable/memory/audit/at-per-gate-path-ledger-phase{1,2,2-g31,2-g32,3-g31-g32}.md`
 */

import { readFileSync } from "node:fs";

/**
 * Compile a minimal POSIX-style glob to a RegExp.
 * Supports `**` (any path), `*` (any single segment), literal chars.
 * @param {string} glob
 * @returns {RegExp}
 */
export function globToRegExp(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const pattern = escaped
    .replace(/\*\*/g, "::DS::")
    .replace(/\*/g, "[^/]*")
    .replace(/::DS::/g, ".*");
  return new RegExp(`^${pattern}$`);
}

/**
 * Strip a single pair of surrounding backticks from a markdown cell.
 * Idempotent on un-quoted values.
 * @param {string} s
 * @returns {string}
 */
export function stripBackticks(s) {
  return s.replace(/^`(.*)`$/, "$1");
}

/**
 * Walk the `## Entries` table of a per-(gate, path) ledger and yield
 * normalised rows. Hard-fails (via the caller-supplied `fail` fn) on:
 *   - missing `## Entries` header
 *   - rows with <5 cells
 *   - empty `gate`, `pathGlob`, `entry`, or `rationale`
 *
 * The caller supplies `parseGateCell` which receives the raw `gate` cell
 * and returns any gate-specific shape (object). The shape is forwarded
 * verbatim on the yielded row as `.parsed`.
 *
 * @param {object} args
 * @param {string} args.ledgerPath           path to the ledger .md file
 * @param {(line: string) => any} args.parseGateCell  returns gate shape (or throws via fail)
 * @param {(msg: string) => never} args.fail   hard-fail handler
 * @yields {{parsed: any, pathGlob: string, entry: string, rationale: string, addedOn: string, line: number}}
 */
export function* walkLedger(args) {
  const { ledgerPath, parseGateCell, fail } = args;
  const raw = readLedger(ledgerPath, fail);
  const lines = raw.split("\n");
  const startIdx = lines.findIndex((l) => /^##\s+Entries\s*$/.test(l));
  if (startIdx < 0) fail(`per-gate-path ledger: missing '## Entries' section in ${ledgerPath}`);

  for (let i = startIdx + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^##\s/.test(line)) break;
    if (!isTableDataRow(line)) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 5) continue;
    yield normaliseRow(cells, i + 1, parseGateCell, fail, ledgerPath);
  }
}

function readLedger(ledgerPath, fail) {
  try {
    return readFileSync(ledgerPath, "utf8");
  } catch (e) {
    fail(`per-gate-path ledger: cannot read ${ledgerPath}: ${e.message}`);
    return ""; // unreachable; satisfies TS-style flow
  }
}

function isTableDataRow(line) {
  if (!line.trim().startsWith("|")) return false;
  if (/^\|\s*-+/.test(line)) return false;       // separator row
  if (/^\|\s*gate\s*\|/i.test(line)) return false; // header row
  return true;
}

function normaliseRow(cells, lineNo, parseGateCell, fail, ledgerPath) {
  const [gateRaw, pathGlobRaw, entryRaw, rationaleRaw, addedOnRaw] = cells;
  const pathGlob = stripBackticks(pathGlobRaw);
  const entry = stripBackticks(entryRaw);
  const rationale = rationaleRaw;
  if (!gateRaw) fail(`${ledgerPath}:${lineNo}: empty gate cell`);
  if (!pathGlob) fail(`${ledgerPath}:${lineNo}: empty pathGlob for entry \`${entry}\``);
  if (!entry) fail(`${ledgerPath}:${lineNo}: empty entry`);
  if (!rationale) fail(`${ledgerPath}:${lineNo}: empty rationale for entry \`${entry}\``);
  const parsed = parseGateCell(gateRaw, lineNo);
  return { parsed, pathGlob, entry, rationale, addedOn: addedOnRaw, line: lineNo };
}

/**
 * Build a per-key → `[RegExp, …]` glob map from an iterable of ledger
 * rows. The caller supplies `keyOf(row)` to derive a stable string key
 * (e.g. `${scopeId}::${category}::${entry}` for G-31).
 *
 * @param {Iterable<{pathGlob: string}>} rows
 * @param {(row: any) => string} keyOf
 * @returns {Map<string, RegExp[]>}
 */
export function buildGlobMap(rows, keyOf) {
  const map = new Map();
  for (const row of rows) {
    const key = keyOf(row);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(globToRegExp(row.pathGlob));
  }
  return map;
}

/**
 * Path-aware exempt check.
 *   - Returns `false` if `entry` not in `overrideSet`.
 *   - Returns `true` (path-agnostic) if no ledger globs registered for `key`
 *     — the entry is an emergency-hotfix override only.
 *   - Returns `true` if `hostFile` is empty (caller had no host context).
 *   - Else requires ≥1 of the key's globs to match `hostFile`.
 *
 * @param {object} args
 * @param {Set<string>} args.overrideSet
 * @param {string} args.entry
 * @param {string} args.key
 * @param {Map<string, RegExp[]>} args.globMap
 * @param {string} args.hostFile
 * @returns {boolean}
 */
export function isExempt(args) {
  const { overrideSet, entry, key, globMap, hostFile } = args;
  if (!overrideSet.has(entry)) return false;
  const globs = globMap.get(key);
  if (!globs) return true;
  if (!hostFile) return true;
  return globs.some((re) => re.test(hostFile));
}
