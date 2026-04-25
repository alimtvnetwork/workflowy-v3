# Terminal Output Design — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 18 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-TERMINALOUTPUTDESIGN-01` … `AT-TERMINALOUTPUTDESIGN-18`

---

## Criteria

### Section structure (files 01–07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TERMINALOUTPUTDESIGN-01 | Banner MUST render tool name + version in a box-drawing frame; the frame width is config-driven (default 60 cols) and MUST be drawn from a constant — hardcoded widths are forbidden. | [`01-banner.md`](./01-banner.md) |
| AT-TERMINALOUTPUTDESIGN-02 | Summary line MUST start with one of `✓ / ⚠ / ✗` glyphs followed by a count; using free-text without the glyph is forbidden because it breaks scannability. | [`02-summary-line.md`](./02-summary-line.md) |
| AT-TERMINALOUTPUTDESIGN-03 | Item list MUST use two-line blocks (line 1 = identity, line 2 = actionable detail); collapsing into a single line is forbidden. | [`03-item-list.md`](./03-item-list.md) |
| AT-TERMINALOUTPUTDESIGN-04 | Every list item MUST be prefixed with `[N/Total]` so users know progress; missing the counter fails review. | [`03-item-list.md`](./03-item-list.md) |
| AT-TERMINALOUTPUTDESIGN-05 | Tree view MUST use Unicode box-drawing characters (`├── └── │`) for hierarchy; ASCII fallback (`+-- |`) is allowed ONLY when stderr is not a TTY OR `NO_COLOR=1` is set. | [`04-tree-view.md`](./04-tree-view.md) |
| AT-TERMINALOUTPUTDESIGN-06 | Output Files section MUST list each generated artifact with absolute path + size; relative paths are forbidden because users may copy them out-of-context. | [`05-output-files.md`](./05-output-files.md) |
| AT-TERMINALOUTPUTDESIGN-07 | Action Guide MUST be a numbered list of copy-pasteable commands; prose-only guides are forbidden. | [`06-action-guide.md`](./06-action-guide.md) |
| AT-TERMINALOUTPUTDESIGN-08 | File-write confirmations MUST emit `✓ wrote <path> (<bytes>)` per file; suppressing confirmations on `--quiet` is allowed but the count MUST still appear in the summary. | [`07-file-write-confirmations.md`](./07-file-write-confirmations.md) |

### Color & emoji systems (files 08–09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TERMINALOUTPUTDESIGN-09 | Color MUST be applied via a single ANSI helper that respects `NO_COLOR`, `TERM=dumb`, AND non-TTY stderr; bypassing the helper is a Code-Red accessibility bug. | [`08-color-system.md`](./08-color-system.md) |
| AT-TERMINALOUTPUTDESIGN-10 | Color assignments MUST follow the documented role map (success=green, warning=yellow, error=red, info=cyan, dim=gray); using colors decoratively (e.g., random rainbow) is forbidden. | [`08-color-system.md`](./08-color-system.md) |
| AT-TERMINALOUTPUTDESIGN-11 | Emoji MUST be used as type indicators (one emoji = one item type), NEVER decoratively; the full set is enumerated in `09-emoji-reference.md` and adding new emoji requires updating that file. | [`09-emoji-reference.md`](./09-emoji-reference.md) |
| AT-TERMINALOUTPUTDESIGN-12 | Output containing emoji MUST gracefully degrade to a text label when `LANG`/`LC_ALL` lacks UTF-8 OR when `--no-emoji` is set. | [`09-emoji-reference.md`](./09-emoji-reference.md) |

### Spacing (file 10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TERMINALOUTPUTDESIGN-13 | Sections MUST be separated by exactly one blank line; double-blank or zero-blank separations fail review. | [`10-spacing-and-indentation.md`](./10-spacing-and-indentation.md) |
| AT-TERMINALOUTPUTDESIGN-14 | Indentation MUST use exactly 2 spaces per level (NOT tabs); mixed indentation is a Code-Red rendering bug across terminals. | [`10-spacing-and-indentation.md`](./10-spacing-and-indentation.md) |

### Implementation contract (files 11–12)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TERMINALOUTPUTDESIGN-15 | All visual output (banner, sections, colors, file-write confirmations) MUST go to **stderr**; **stdout** is reserved for machine-parseable data. Mixing the two is a Code-Red pipeline-breaking bug. | [`00-overview.md`](./00-overview.md), [`12-implementation-checklist.md`](./12-implementation-checklist.md) |
| AT-TERMINALOUTPUTDESIGN-16 | Every format string, emoji, label, and divider MUST live in a `constants/` package; inline string literals in renderers fail review. | [`12-implementation-checklist.md`](./12-implementation-checklist.md) |
| AT-TERMINALOUTPUTDESIGN-17 | Each section renderer MUST be independently invocable (a tool that needs only Banner + Summary MUST NOT pull in Tree-View dependencies); cross-section coupling is forbidden. | [`12-implementation-checklist.md`](./12-implementation-checklist.md) |
| AT-TERMINALOUTPUTDESIGN-18 | Full examples in `11-full-examples.md` MUST be regression fixtures: the rendered output MUST be byte-stable across runs (with timestamps/durations stubbed) so CI can diff against the golden file. | [`11-full-examples.md`](./11-full-examples.md) |

---

## Verification

```bash
# Stdout/stderr discipline
./mycli scan --json > /tmp/data.json 2> /tmp/visual.txt
test -s /tmp/data.json && jq . /tmp/data.json >/dev/null  # stdout is parseable JSON
test -s /tmp/visual.txt                                    # stderr has the visual report

# Constants discipline
rg -nP 'fmt\.(Print|Sprint)f?\(' internal/cli/render/ | grep -v 'constants\.'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../06-output-formatting.md`](../06-output-formatting.md) — Multi-format output strategy
- [`../15-constants-reference.md`](../15-constants-reference.md) — Format-string & color constants
- [`../17-progress-tracking.md`](../17-progress-tracking.md) — `[N/Total]` counter pattern

---

*Curated 2026-04-25 — closes batch-15 item 4. Replaces v0.1.0 stub.*
