/**
 * @file Safe markdown-table cell splitter.
 *
 * **Closes:** task #54 root-cause analysis (graduation-ledger silent skip)
 * generalized to task #55 (5 callers had the same naive `line.split('|')`
 * pattern). Extracted here so a single fix protects every gate that parses
 * a `_GATE-*`, `_AUDIT-*`, `_LEDGER-*`, or in-spec data table.
 *
 * **Why naive split is wrong:** CommonMark tables treat `|` inside backtick
 * code-spans as literal text, not a cell boundary. A row like
 *
 *     | gate | regex `(##\|###)` | … |
 *
 * has 3 logical cells but `'…'.split('|')` yields 5. Callers either silently
 * dropped the row (if they checked `cells.length === N`) or shifted every
 * downstream cell (if they didn't). Both are gate corruption.
 *
 * This splitter:
 *   1. Masks all `` `…` `` spans with `\u0000SPAN<n>\u0000` placeholders.
 *   2. Splits the masked line on `|`.
 *   3. Trims, strips bordering backticks, drops the leading/trailing empty
 *      cells produced by `| … |` framing.
 *   4. Restores spans inside each cell verbatim.
 *
 * Use `splitMdRow` for table data rows; use `splitMdHeader` for header rows
 * (same algorithm, kept as a separate name for call-site clarity).
 *
 * @see scripts/spec-hygiene/60-check-graduation-ledger-fresh.mjs (first user)
 * @see spec/00-adrs/0031-warn-only-strict-flip-pattern.md §D3 (predicate-quality)
 */

const SPAN_RE = /`[^`\n]*`/g;
const PLACEHOLDER_RE = /\u0000SPAN(\d+)\u0000/g;

function maskSpans(line) {
  const spans = [];
  const masked = line.replace(SPAN_RE, (m) => {
    spans.push(m);
    return `\u0000SPAN${spans.length - 1}\u0000`;
  });
  return { masked, spans };
}

function unmask(cell, spans) {
  return cell.replace(PLACEHOLDER_RE, (_, n) => spans[Number(n)]);
}

/**
 * Split a markdown table data row into its cells, respecting backtick
 * code-spans. Strips bordering backticks from each cell (matches the
 * pre-existing `replace(/^`|`$/g, '')` convention used by every caller).
 *
 * @param {string} line — raw line from the table.
 * @returns {string[]} — cell strings, in order, excluding the empty
 *   leading/trailing cells from `| … |` framing.
 */
export function splitMdRow(line) {
  const { masked, spans } = maskSpans(line);
  return masked
    .split('|')
    .map((c) => unmask(c, spans).trim().replace(/^`|`$/g, ''))
    .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
}

/**
 * Split a markdown table header row. Same algorithm as `splitMdRow` but
 * keeps every non-empty cell (header rows historically used
 * `.split('|').map(trim).filter(Boolean)` which dropped framing cells the
 * same way). Provided as a distinct name so call sites read clearly.
 */
export function splitMdHeader(line) {
  return splitMdRow(line).filter(Boolean);
}
