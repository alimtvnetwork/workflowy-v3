# ItemType — Canonical SSOT for `spec/31-app/`

> **Status:** Canonical · **Authority:** [`spec/00-adrs/0015-twelve-itemtypes-enum.md`](../00-adrs/0015-twelve-itemtypes-enum.md) (ln) + [`spec/20-enums-index.md` Rule #10 + `ItemType` row](../20-enums-index.md)
> **Resolves:** `F-AUD42-03` (ItemType case drift across `spec/31-app/`)
> **Gate:** **G-15-ITEMTYPE-LOWERCASE** — CI fails on any PascalCase `ItemType` literal (`'Bullet'`, `ItemType.Bullet`, etc.)

## 1. The 12 closed `ItemType` values (lowercase, exhaustive)

`ItemType` is a **closed** enum of exactly **12** values. No 13th value may be added without a superseding ADR. Casing is **lowercase** across all 4 runtime layers (TypeScript value, PHP backed-enum value, Go string label, SQLite `CHECK` literal) — this is the **single deliberate exception** to the PascalCase Universal Rule (see Rule #10 in `20-enums-index.md`).

| # | Value | Self-renders? | Child-renders? | One-line semantic |
|---|-------|---------------|----------------|-------------------|
|  1 | `bullet`     | ✅ | — | Default outliner node. |
|  2 | `h1`         | ✅ | — | Heading level 1. |
|  3 | `h2`         | ✅ | — | Heading level 2. |
|  4 | `h3`         | ✅ | — | Heading level 3. |
|  5 | `paragraph`  | ✅ | — | Free-flowing prose block. |
|  6 | `todo`       | ✅ | — | Checkbox-bearing actionable. |
|  7 | `numbered`   | ✅ | — | Numbered list item. |
|  8 | `board`      | — | ✅ | Renders **direct children** as Kanban columns × cards. |
|  9 | `dashboard`  | — | ✅ | Renders **direct children** as inline-editable card grid (depth = 1). |
| 10 | `quote`      | ✅ | — | Block-quote prose. |
| 11 | `code`       | ✅ | — | Monospaced code block. |
| 12 | `divider`    | ✅ | — | Horizontal rule, no content. |

### What is NOT an `ItemType`

- **`mirror`** — Mirrors are **rows in the `Mirrors` table** referencing a source `Items` row. Mirror is a **peer-group relation**, not a turn-into target. Forbidden as an `ItemType` literal anywhere in `spec/31-app/`.
- **`Root`**, **`root`**, **`page`**, **`document`**, **`note`**, **`task`**, **`project`**, **`embed`**, **`image`**, **`file`**, **`link`**, **`heading`**, **`template`** — none of these are members of `ItemType`. If any such literal appears in App-folder spec text, it is a **bug** (see §3).

## 2. Forbidden casings (G-15 violations)

Any of the following in `spec/31-app/**/*.md` MUST fail CI:

```
'Bullet'   'Board'   'Dashboard'   'Todo'   'Paragraph'   'Numbered'
'Quote'    'Code'    'Divider'     'H1'     'H2'          'H3'
ItemType.Bullet      ItemType.Board       ItemType.Dashboard
ItemType = 'Bullet'  ItemType = 'Board'   ItemType = 'Dashboard'
```

The lowercase-only forms above are the **sole** allowed spellings.

## 3. Known drift (catalogued; remediation is per-finding, not in this file)

This SSOT does **not** rewrite drifting files in-place — it pins the canonical reference so each subsequent fix can cite this document. The audit in [`spec/18-spec-issues/12-app-folder-audit-2026-04-30.md`](../18-spec-issues/12-app-folder-audit-2026-04-30.md) enumerates every drifting site. Remediation tasks (per-file rewrites) are tracked in `AUDIT-FINDINGS-LEDGER.md` under successor findings.

## 4. Cross-language wire/storage mapping

| Layer | Form | Example |
|---|---|---|
| TypeScript value | `ItemType.bullet` (object key lowercase, value lowercase) | `node.itemType === ItemType.bullet` |
| PHP backed enum | `ItemType::Bullet` **case name PascalCase**, **value lowercase** | `ItemType::Bullet->value === 'bullet'` |
| Go label | `ItemTypeBullet` constant, **string value lowercase** | `const ItemTypeBullet = "bullet"` |
| SQLite column | `Items.ItemType TEXT NOT NULL CHECK(ItemType IN ('bullet','h1','h2','h3','paragraph','todo','numbered','board','dashboard','quote','code','divider'))` | row literal `'bullet'` |
| API wire (PascalCase envelope, lowercase enum value) | `{"ItemType":"bullet"}` | per ADR-0004 envelope rule + Rule #10 exception |

> The PascalCase envelope rule (Status / Attributes / Results) is unaffected — only the **`ItemType` enum value** is lowercase. Field name `ItemType` itself remains PascalCase per ADR-0004.

## 5. Authority chain

1. [`spec/00-adrs/0015-twelve-itemtypes-enum.md`](../00-adrs/0015-twelve-itemtypes-enum.md) — load-bearing (`ln`) ADR
2. [`spec/20-enums-index.md`](../20-enums-index.md) Rule #10 + `ItemType` row — corpus-wide enum SSOT
3. **This file** (`spec/31-app/00-itemtype-canonical.md`) — App-folder canonical pointer; cited by every App-folder doc that names an `ItemType`

Any conflict between this file and ADR-0015 / `20-enums-index.md` is a bug in **this** file — those upstream docs win.
