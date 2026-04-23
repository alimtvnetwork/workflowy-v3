# 05 — Token System

> **Version:** 2.0.0 · **Created:** 2026-04-23 (UTC+8) · **Status:** ✅ Authored
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Screenshots:** img-43, img-44

---

## Purpose

Specify how typed text becomes **inline token chips** inside the search input — commit triggers, edit/delete behavior, paste-parse rules, and the visual contract for chip variants. Grammar (what tokens MEAN) lives in [`06-query-grammar.md`](./06-query-grammar.md); this file is concerned with **how tokens behave in the input**.

---

## 1. Token = chip

A **token** is a discrete query unit displayed as a pill/chip rendered inline within the single-line input. Tokens and free text coexist; the input is a sequence of nodes:

```
[chip] freeText [chip] [chip] freeText
```

Tokens NEVER mix with free text inside the same node. Whitespace between nodes is the canonical separator.

---

## 2. Token kinds

| Kind | Example | Source |
|------|---------|--------|
| Keyword token | `is:todo`, `date:2026-04-23` | Typed `key:value` or picked via Region 4 |
| Mention token | `@alice` | Typed `@` then name, or picked from Mentions tab |
| Standalone keyword | `me`, `today`, `weekend` | Typed bare or picked from quick chips |
| Negated token | `-is:complete`, `-@bob` | Any token with leading `-` |
| Quoted text token | `text:"deep work"` | `text:` key with quoted value |

Free-text fragments (no `key:`, no `@`) remain plain text and are matched as a substring against node content at query time.

---

## 3. Commit triggers

A typed fragment becomes a chip when ANY of these fires:

| Trigger | Behavior |
|---------|----------|
| Typing whitespace after a complete `key:value` pattern | Commit the fragment to the left as a chip |
| Pressing `Enter` while a `key:` partial is open | If value valid → commit; if invalid → show error (file 09) |
| Picking a value from Region 4 listbox | Commit the assembled `key:value` chip |
| Picking a quick chip from Region 3 | Commit the corresponding chip |
| Pressing `Tab` mid-pattern | If a value picker is open, accepts highlighted item; else moves focus per file 08 |

Commit is **non-destructive**: caret stays at the position immediately after the new chip + a single space.

---

## 4. Edit & delete

| Action | Result |
|--------|--------|
| Click on a chip | Selects the chip (visual selection ring); does not enter edit mode |
| Double-click on a chip | Converts chip back into raw text at that position; caret placed at end of text |
| `Backspace` with caret right after a chip | Selects the chip (single selection ring) |
| `Backspace` again on a selected chip | Removes the chip |
| `Delete` with caret immediately before a chip | Selects then removes on second press (mirror of Backspace) |
| `←` / `→` near a chip | Moves caret across, treating the chip as a single character |
| Type characters while a chip is selected | Replaces the chip with the typed character(s) |
| Drag a chip | NOT supported in v1 |

---

## 5. Negation toggle

- Typing `-` immediately before a `key:` or `@` partial creates a **negated token** when committed.
- A committed chip can be toggled negated by pressing `!` while the chip is selected (shortcut). Visual: chip variant flips to `negated` style.
- A chip context menu is NOT provided in v1; the `!` shortcut is the only post-commit toggle.

---

## 6. Paste-parse

When the user pastes text into the input:

1. Split the pasted string by whitespace **respecting double-quoted spans** (`"…"` is one token).
2. For each fragment, attempt to match against grammar (file 06).
3. Matching fragments commit as chips; non-matching fragments stay as free text.
4. Caret lands at the end of the pasted content.

Paste of a previously-copied "query as link" URL: the URL is decoded and its query portion is parsed as above (the URL itself is not retained as a token).

---

## 7. Validation

| Case | Behavior |
|------|----------|
| `key:` typed but key unknown | Do NOT commit; underline the partial in red; show inline error in Region 3 |
| `key:value` with valid key but invalid value format (e.g. `date:abc`) | Commit blocked on whitespace/Enter; show error explaining expected format |
| Duplicate identical chip | Allowed; AND-combination is naturally a no-op for identical filters |
| Conflicting chips (e.g. `is:complete` and `-is:complete`) | Allowed; results will be empty — Region 5 shows zero-results UI (file 07/09) |
| Chip count > 20 | Soft cap warning; performance only — no hard block |

Full value formats are enumerated in [`06-query-grammar.md`](./06-query-grammar.md).

---

## 8. Chip visual variants

| Variant | When |
|---------|------|
| Default | Standard `key:value`, mention, or standalone keyword |
| Negated | Token has leading `-` or was toggled with `!` |
| Selected | Click or `Backspace`-from-right; shows selection ring |
| Invalid (transient) | Pre-commit error state; red border |
| Highlighted color (special) | `highlight:<color>` chip uses the selected color as its background swatch |

Concrete colors / radii defer to [`11-design-tokens.md`](./11-design-tokens.md).

---

## 9. Cross-references

- [`03-hint-and-suggestions.md`](./03-hint-and-suggestions.md) — value pickers that produce chips
- [`06-query-grammar.md`](./06-query-grammar.md) — what each chip means
- [`08-keyboard-shortcuts.md`](./08-keyboard-shortcuts.md) — full shortcut matrix
- [`13-data-contracts.md`](./13-data-contracts.md) — `Token` shape
