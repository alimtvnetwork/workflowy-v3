# Editor (UI) — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 18 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-UIEDIT-01` … `AT-UIEDIT-18`

---

## Criteria

### Rich text format (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIEDIT-01 | Rich text MUST be stored as a documented JSON tree (NOT raw HTML strings); HTML-string storage is FORBIDDEN as a Code-Red XSS-risk + portability bug. | [`01-rich-text-format.md`](./01-rich-text-format.md) |
| AT-UIEDIT-02 | Allowed inline formats MUST be limited to: bold, italic, underline, strikethrough, inline code, link; arbitrary spans, font sizes, or colors in body content are FORBIDDEN. | [`01-rich-text-format.md`](./01-rich-text-format.md) |
| AT-UIEDIT-03 | Links MUST be normalized to absolute URLs at save time AND open with `rel="noopener noreferrer"`; raw `javascript:` URLs MUST be rejected at parse boundary. | [`01-rich-text-format.md`](./01-rich-text-format.md) |
| AT-UIEDIT-04 | Pasted HTML MUST be sanitized through a documented allow-list parser; raw `innerHTML = pastedContent` is a Code-Red XSS bug. | [`01-rich-text-format.md`](./01-rich-text-format.md) |

### Enter key rules (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIEDIT-05 | Enter behavior MUST be specified for EVERY one of the 12 item types (per `mem://features/core-mechanics`); missing any type fails review. | [`02-enter-key-rules.md`](./02-enter-key-rules.md), [`mem://features/core-mechanics`](mem://features/core-mechanics) |
| AT-UIEDIT-06 | `Enter` on a non-empty bullet MUST create a new sibling at the same indent; `Shift+Enter` MUST insert a soft line-break inside the current bullet. | [`02-enter-key-rules.md`](./02-enter-key-rules.md) |
| AT-UIEDIT-07 | `Enter` on an empty bullet at indent ≥ 1 MUST out-dent (NOT delete); on an empty bullet at indent 0 MUST be a no-op (NOT focus loss). | [`02-enter-key-rules.md`](./02-enter-key-rules.md) |
| AT-UIEDIT-08 | `Tab` MUST indent (only if a previous sibling exists); `Shift+Tab` MUST out-dent; both MUST preserve the cursor offset within the bullet text. | [`02-enter-key-rules.md`](./02-enter-key-rules.md), [`../../31-app/01-features/05-interactions.md`](../../31-app/01-features/05-interactions.md) |

### Drag and drop (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIEDIT-09 | Drag-and-drop MUST distinguish three drop targets: before-sibling, after-sibling, child-of; ambiguous drops fail review. The drop indicator MUST show which target is active. | [`03-drag-and-drop.md`](./03-drag-and-drop.md) |
| AT-UIEDIT-10 | Default drag MUST move the node; `Alt`/`Option` modifier MUST create a mirror (NOT a deep copy); other modifiers MUST be no-ops (no surprise behavior). | [`03-drag-and-drop.md`](./03-drag-and-drop.md), [`mem://features/mirroring`](mem://features/mirroring) |
| AT-UIEDIT-11 | Auto-scroll near viewport edges MUST kick in within 60 px of the edge with a documented velocity curve; fixed-velocity or no-auto-scroll fails review. | [`03-drag-and-drop.md`](./03-drag-and-drop.md) |
| AT-UIEDIT-12 | Dragging a node onto its own descendant MUST be rejected with a visible "not-allowed" cursor; silent rejection is a Code-Red UX bug. | [`03-drag-and-drop.md`](./03-drag-and-drop.md) |

### Interaction clarifications (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIEDIT-13 | All keyboard shortcuts in the editor MUST match `spec/31-app/01-features/05-interactions.md` byte-for-byte; divergence is a Code-Red consistency bug. | [`04-interaction-clarifications.md`](./04-interaction-clarifications.md), [`../../31-app/01-features/05-interactions.md`](../../31-app/01-features/05-interactions.md) |
| AT-UIEDIT-14 | Multi-select MUST follow Shift-click (range) AND Cmd/Ctrl-click (additive) semantics per `mem://features/multi-select`; other semantics fail review. | [`04-interaction-clarifications.md`](./04-interaction-clarifications.md), [`mem://features/multi-select`](mem://features/multi-select) |
| AT-UIEDIT-15 | Cursor position MUST be preserved across every undo/redo, indent/outdent, move, and mirror operation; cursor reset to position 0 on any of these is a Code-Red UX bug. | [`04-interaction-clarifications.md`](./04-interaction-clarifications.md) |

### Additional behaviors (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIEDIT-16 | IME composition events (`compositionstart` / `compositionend`) MUST suppress autosave AND undo-stack pushes during composition; IME-mid-state autosaves are a Code-Red data-corruption bug. | [`05-additional-behaviors.md`](./05-additional-behaviors.md) |
| AT-UIEDIT-17 | Autosave MUST be debounced (≥ 500ms); per-keystroke saves are a Code-Red perf bug. Autosave MUST queue offline per `mem://features/offline-resilience`. | [`05-additional-behaviors.md`](./05-additional-behaviors.md), [`mem://features/offline-resilience`](mem://features/offline-resilience) |
| AT-UIEDIT-18 | Undo/redo MUST be granular per logical operation (NOT per character); per-character undo is a Code-Red UX bug because users expect word-level grouping at minimum. | [`05-additional-behaviors.md`](./05-additional-behaviors.md), [`mem://features/editor-core`](mem://features/editor-core) |

---

## Verification

```bash
# innerHTML scan
rg -nP "innerHTML\s*=" src/

# javascript: URL scan
rg -nP "javascript:" src/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../31-app/01-features/05-interactions.md`](../../31-app/01-features/05-interactions.md) — Keyboard shortcut SSOT
- [`mem://features/editor-core`](mem://features/editor-core) — Editor core SSOT
- [`mem://features/multi-select`](mem://features/multi-select) — Multi-select semantics

---

*Curated 2026-04-25 — closes batch-18 item 4. Replaces v1.0.1 scaffold.*
