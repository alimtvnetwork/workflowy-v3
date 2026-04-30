# Workflowy Feature-Reference Appendix — Block Format SSOT (F8)

> **Version:** 1.0.0
> **Updated:** 2026-04-28 (UTC+8)
> **Status:** ✅ Canonical — enforced by `scripts/spec-hygiene/39-check-feature-block-format.mjs` (gate G-39)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Predecessor:** [`../../.lovable/plans/archive/09-f07-reconciliation.md`](../../.lovable/plans/archive/09-f07-reconciliation.md) (F7 reconciliation)

---

## Why

The F1–F6 passes inserted "Workflowy Feature Reference" appendices into 14 spec files. Each pass used a slightly different micro-format (em-dash vs colon; shortcut placement; backtick discipline). F8 standardises the block shape so AI agents and humans can parse appendix rows without ambiguity.

---

## The four rules

### R1 — Feature row shape

Every feature row in an appendix MUST use the form (gate G-39-R1-ROW-SHAPE):

```
**<Feature Title>** — <Description sentence>.
```

- The separator MUST be a true em-dash (`—`, U+2014), not `-` or `--` (gate G-39-R1-ROW-SHAPE).
- The title MUST be in `**bold**` and contain only the feature name (no shortcut, no slash command) (gate G-39-R1-ROW-SHAPE).
- The description MUST be a single sentence ending in a period (gate G-39-R1-ROW-SHAPE).

### R2 — Shortcut placement

When a feature carries a keyboard shortcut, the shortcut MUST appear at the END of the line, wrapped in backticks, prefixed with `Shortcut:` (gate G-39-R2-SHORTCUT-PLACEMENT):

```
**Add Date** — Insert a date chip at the cursor. Shortcut: `⌘;`
```

Multiple shortcuts: comma-separated inside one backtick group → `` `⌘↵, ⌘.` ``.
The shortcut MUST also appear in the canonical hotkey table at [`spec/31-app/01-features/05-interactions.md`](../31-app/01-features/05-interactions.md) (per F7 flag #1) (gate G-39-R2-SHORTCUT-PLACEMENT).

### R3 — Slash commands inline

Slash commands MUST appear inline as `/command` wrapped in backticks (gate G-39-R3-SLASH-INLINE):

```
**Turn Into** — Convert the focused item to another type via `/turn-into <type>`.
```

Bare `/command` outside backticks is forbidden (G-39 rule R3). URL paths (`/wp-json/…`, `/api/…`, `/items/…`) are exempt.

### R4 — Search operators in backticks

Search operators (e.g. `is:todo`, `in:Inbox`, `has:note`, `tag:#work`, `due:7d`) MUST be wrapped in backticks wherever they appear in prose (gate G-39-R4-SEARCH-OPERATORS):

```
**Date Search** — Filter today's items with `is:todo due:1d`.
```

Bare `is:todo` in prose is forbidden (G-39 rule R4).

---

## Appendix block markers

A file is in scope for G-39 when EITHER:

1. Its `## ` heading matches `Workflowy … Reference` or `F[1-6] … Appendix`, OR
2. The file contains the explicit opt-in marker comment immediately after the heading:
   ```
   <!-- f8-format-block: enforce -->
   ```

The script's hard-coded list of 14 F1–F6 files is the floor; the marker lets future appendices opt in without editing the script.

---

## Files in scope (F1–F6)

| Pass | File |
|------|------|
| F1 | [`spec/31-app/01-features/00-overview.md`](../31-app/01-features/00-overview.md), [`05-interactions.md`](../31-app/01-features/05-interactions.md) |
| F2 | [`03-layout-structure.md`](../31-app/01-features/03-layout-structure.md), [`16-search-ranking.md`](../31-app/01-features/16-search-ranking.md), [`10-today-view.md`](../31-app/01-features/10-today-view.md) |
| F3 | [`06-item-context-menu.md`](../31-app/01-features/06-item-context-menu.md), [`09-mirrors.md`](../31-app/01-features/09-mirrors.md), [`09b-mirror-peer-group-model.md`](../31-app/01-features/09b-mirror-peer-group-model.md), [`12-multi-select.md`](../31-app/01-features/12-multi-select.md) |
| F4 | [`07-board-view.md`](../31-app/01-features/07-board-view.md), [`08-share-dialog.md`](../31-app/01-features/08-share-dialog.md), [`13-templates.md`](../31-app/01-features/13-templates.md), [`11-trash-view.md`](../31-app/01-features/11-trash-view.md) |
| F5 | [`spec/36-user-management/01-account-and-settings.md`](../36-user-management/01-account-and-settings.md) |
| F6 | [`spec/31-app/01-features/18-integrations.md`](../31-app/01-features/18-integrations.md) |

---

## Acceptance criteria

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-F8-01` | Every appendix feature row in the 15 in-scope files matches `**Title** — Description.` (R1). | G-39 |
| `AT-F8-02` | Every appendix line that mentions a shortcut ends with a backticked shortcut token (R2). | G-39 |
| `AT-F8-03` | Every slash command in appendix prose is backtick-wrapped (R3). | G-39 |
| `AT-F8-04` | Every search operator in appendix prose is backtick-wrapped (R4). | G-39 |

---

## Verification

```bash
node scripts/spec-hygiene/39-check-feature-block-format.mjs
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Fixtures

This SSOT is gate-enforced — the script's pass/fail output IS the fixture, in the same lint-shape pattern as `G-WORDING-AMBIGUOUS-LINT` (legacy alias `G-38`). No separate fixtures file is needed; covered by the global P2g sweep — see [`../97a-acceptance-criteria-fixtures.md`](../97a-acceptance-criteria-fixtures.md).

---

## Related

- [`./20-rfc-2119-wording-policy.md`](./20-rfc-2119-wording-policy.md) — Sister SSOT for keyword discipline (`G-WORDING-AMBIGUOUS-LINT`, legacy alias `G-38`)
- [`./19-acceptance-criteria-io-table.md`](./19-acceptance-criteria-io-table.md) — Fixture format SSOT
- [`../../.lovable/plans/archive/09-f07-reconciliation.md`](../../.lovable/plans/archive/09-f07-reconciliation.md) — F7 reconciliation log

---

*Created 2026-04-28 — closes F8 (uniform feature-block format pass).*
