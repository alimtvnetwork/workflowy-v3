# G-34 — Allow-List Entry Age Gate (Algorithm SSOT)

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [02-ci-quality-gates.md](./02-ci-quality-gates.md)
> **Runner:** `scripts/spec-hygiene/34-check-allow-list-age.mjs`
> **Closes:** F-future-G34

---

## Why this gate exists

Allow-list entries (G-30 / G-31 / G-32 exemptions) are technical debt: each one is a "yes-but" carve-out around an otherwise enforced invariant. The G-30.3 / G-31.5 / G-32.4 **meta** sub-checks force every entry to carry a rationale, and the G-35 **inventory** reporter surfaces the full content of every list — but neither applies *time pressure*. Without it, exemptions accumulate forever: yesterday's "temporary" carve-out becomes next year's load-bearing rule no one remembers.

G-34 closes that loop by reading `git blame` for each allow-list entry's source line and bucketing by author-age:

| Bucket | Threshold | Severity | Action |
|--------|-----------|----------|--------|
| INFO   | < 180 days | suppressed (`--info` to show) | none |
| WARN   | ≥ 180 days | warning (exit 0) | review recommended |
| ERROR  | ≥ 365 days | failure (exit 1) | justify (move to `AGE_EXEMPT`) or remove |

## Algorithm (G-34.1 — age bucketing)

1. For each runner in `RUNNERS = [{ G-30 file + lists }, { G-31 file + lists }, { G-32 file + lists }]`:
   1. Read source, locate every `const NAME = new Set([` listed for that runner.
   2. Walk lines until `]`; for each `"value"` line capture `(value, lineNumber)`.
2. For each `(file, line, value, listName)`:
   1. Spawn `git -C <REPO_ROOT> blame -L <line>,<line> --porcelain <file>`.
   2. Parse the leading `<sha>` and the `author-time <unix-seconds>` line.
   3. Compute `ageDays = floor((now - authorTime) / 86400)`.
   4. Look up `AGE_EXEMPT.has("<listName>::<value>")` — if true, force bucket to INFO.
   5. Otherwise bucket by threshold table above.
3. Print: bucket counts, then ERROR rows, then WARN rows, then (under `--info`) INFO rows.
4. Exit `1` if any ERROR row exists or if G-34.2 fails; else exit `0`.

## Algorithm (G-34.2 — meta: exempt rationale coverage)

Runner self-introspects via `__filename`:

1. Read this script's own source.
2. Locate `const AGE_EXEMPT = new Set([`.
3. For each `"key"` entry:
   - Inline trailing `// rationale` ⇒ pass.
   - Otherwise check the immediately preceding line is a non-trivial `// …` comment ⇒ pass.
   - Else record as unrationaled.
4. Any unrationaled entry ⇒ contribute to overall fail.

This is recursive G-30.3-style — the runner that polices rationale on other runners' allow-lists must police its own.

## Opt-out semantics

`AGE_EXEMPT` is a `Set<string>` with composite keys:

```
"<LIST_NAME>::<entry-value>"
```

Examples (none active yet — list is empty by design):

```js
"REDUNDANCY_ALLOWLIST::AT-FOO-",        // permanent, owner-acknowledged
"WORKFLOWS_EXEMPT::W-billing-x",        // pinned by external integration contract
```

An exempt entry is **still scanned** and **still reported**, but its severity is forced to INFO regardless of age. The opt-out is intentionally noisy in console output (annotated `(AGE_EXEMPT)` on the line) so reviewers see what is being silenced.

## Why composite keys (`<list>::<value>` not bare `<value>`)

Same value can appear in different allow-lists with different rationales (e.g. an at-prefix exempted from G-30 redundancy is unrelated to the same string appearing in a G-31 island list). G-33 already enforces no cross-gate duplicates, but exemption lifetime is per-list — bare-value keys would couple two unrelated review timelines.

## Why git-blame (not file-mtime, not git-log on the file)

- File mtime resets on every save/format and is useless.
- `git log <file>` gives the most recent change to the *file*, not the *line*.
- `git blame -L line,line --porcelain` returns the commit that last touched the specific line, which is the closest available proxy for "when this exemption was introduced".

Caveat: a re-save that touches the line (formatter, comment edit) resets the line's blame. This is acceptable — substantive edits to an exemption *should* reset its review clock; trivial reformatting usually doesn't change the line content. Operators who want to preserve age across reformats should commit allow-list edits in isolated commits.

## Wiring

- Master runner: registered in `scripts/spec-hygiene/00-run-all.mjs` between G-33 and G-35.
- CI registry: row `G-34` in `02-ci-quality-gates.md`.
- Sub-check labels: `G-34.1` (age bucketing), `G-34.2` (exempt rationale meta).

## Verification at ship

| Test | Result |
|------|--------|
| Bare invocation on current tree | ✅ 65 fresh / 0 stale / 0 rotted, exit 0 |
| Bucketing logic with synthetic 400-day entry (standalone test) | ✅ classified ERROR, exit 1 |
| G-34.2 with injected `"FAKE::no-rationale-here"` | ✅ flagged, exit 1; restored to clean |
| `--info` flag | ✅ surfaces all 65 fresh entries |

## Forbidden patterns

- Do **not** rewrite history to "freshen" an entry's blame — defeats the purpose.
- Do **not** add entries to `AGE_EXEMPT` without a rationale comment (G-34.2 will catch it, but reviewers should reject upstream).
- Do **not** use `AGE_EXEMPT` as a workaround for "we don't want to fix this right now" — that is what WARN is for; ERROR exists precisely to force the conversation.

## Change history

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-04-27 | Initial implementation. 2 sub-checks (G-34.1 bucketing, G-34.2 meta). Empty `AGE_EXEMPT`. |
