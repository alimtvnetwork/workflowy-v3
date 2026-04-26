# Template Application Flow

> **Version:** 2.3.0
> **Updated:** 2026-04-26 — APP-FIX-08: aspirational-paths disclaimer added to Component Contract (closes audit F-07 for this file). Prior: 2026-04-26 — APP-FIX-05: Settings Keys (Seedable Config) section added (closes audit F-04 for this file). v2.1.0 added Storage section.
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)

---

## Overview

Templates serialize an item's full subtree (content, types, notes, children) into a reusable snapshot. Users apply a template to spawn a fresh independent copy under any target item — no link to the template, no shared edits. Templates accelerate recurring structures (weekly review, project kickoff, meeting agenda).

## User Story

As a user with recurring outline structures, I want to save one as a template and stamp out fresh copies on demand, so that I never rebuild the same skeleton from scratch.

---

### 13.1 Creating a Template (recap from §5.2)
User clicks "Make template" in the item context menu → a dialog opens to name and describe the template → the item's full subtree (content, types, notes, children recursively) is serialized and saved.

### 13.2 Applying a Template — Step by Step

| Step | Behavior |
|------|----------|
| 1. User triggers "Apply template" | Available from: the Add button (+) dropdown, the command palette (⌘K → "Apply template"), or the item context menu. |
| 2. Template picker opens | A dialog showing all the user's saved templates. Each template shows: name, description, preview of the top-level structure (first 3 items), and creation date. |
| 3. User selects a template | The template is highlighted. A preview panel on the right shows the full tree structure. |
| 4. User confirms | Clicking "Apply" or pressing Enter creates the template's items as children of the currently focused/zoomed item. |
| 5. Items are created | All items from the template are created as new independent items (new IDs, no link to the template). They appear below existing children. |
| 6. Confirmation | Toast: "Template '{name}' applied — {X} items created." The first new item briefly highlights. |

### 13.3 Template Management

| Action | Where | Behavior |
|--------|-------|----------|
| View all templates | Settings → Templates | List of all saved templates with name, description, item count, and date. |
| Edit template name/description | Template list | Inline edit or edit dialog. |
| Delete template | Template list | Confirmation: "Delete template '{name}'? This won't affect items already created from it." |
| Duplicate template | Template list | Creates a copy with name "{name} (copy)". |
| Re-save / update template | Item context menu → "Update template" (only visible if item was created from a template) | Overwrites the template with the current item's subtree. Confirmation required. |

### 13.4 Template Edge Cases (Behavior Reference)

| Scenario | Behavior |
|----------|----------|
| Apply template to root | Creates top-level items. |
| Apply template to a leaf item | Creates children under that item. |
| Template contains to-dos | To-dos are created uncompleted regardless of original state. |
| Template contains mirrors | Mirrors are NOT preserved — all items become independent. |
| Template contains dates | Dates are cleared on application (user assigns new dates). |

---

## Storage

| Layer | Tables | Notes |
|-------|--------|-------|
| **Root DB** | `Template` (workspace-scoped catalog metadata: `TemplateId`, `Name`, `WorkspaceId`, `CreatedAt`) | Templates are listed in the Settings UI before any App DB is opened, so the catalog lives in Root DB. |
| **App DB** (per workspace) | `Items` (rows materialized from template snapshot on apply) | Snapshot JSON is stored in `Template.SnapshotJson` (Root DB) and *expanded* into `Items` rows in the target workspace's App DB. |
| **Cross-DB joins** | **Forbidden.** | Apply flow: read snapshot from Root DB → open App DB → INSERT batch. Two transactions, never joined. |

---

## Settings Keys (Seedable Config)

> **Why this section:** The "Settings → Templates" surface (§User Story, AT-TEMPLATES-11) and template-apply preferences MUST be enum-backed per [`spec/06-seedable-config-architecture/`](../../06-seedable-config-architecture/00-overview.md) + [`spec/15-wp-plugin-how-to/15-settings-architecture/`](../../15-wp-plugin-how-to/15-settings-architecture/00-overview.md). Templates themselves are content (Root DB `Template` table) — these keys are the *user preferences* governing how the catalog and apply flow behave.

| Setting | `OptionNameType` enum case | Default | Sanitizer | Group | Storage |
|---------|---------------------------|---------|-----------|-------|---------|
| Show Templates in sidebar | `OptionNameType::SIDEBAR_SHOW_TEMPLATES` → `'workflowy_sidebar_show_templates'` | `true` | `Sanitizer::bool()` | `wf_navigation` | Root DB (per-user) |
| Default template picker view | `OptionNameType::TEMPLATE_PICKER_VIEW` → `'workflowy_template_picker_view'` | `'recent'` | `Sanitizer::oneOf(['recent','alphabetical','most-used'])` | `wf_templates` | Root DB (per-user) |
| Confirm before applying template | `OptionNameType::TEMPLATE_CONFIRM_APPLY` → `'workflowy_template_confirm_apply'` | `true` | `Sanitizer::bool()` | `wf_safety` | Root DB (per-user) |
| Max templates per workspace | `OptionNameType::TEMPLATE_MAX_PER_WORKSPACE` → `'workflowy_template_max_per_workspace'` | `50` | `Sanitizer::intRange(1, 500)` | `wf_limits` | App DB (per-workspace) |

**Forbidden:**
- ❌ Hard-coding the `50` cap in PHP — must read `OptionNameType::TEMPLATE_MAX_PER_WORKSPACE`.
- ❌ Bare `get_option('workflowy_template_picker_view')` — go through the Settings facade.
- ❌ Skipping the confirm-apply check when the setting is `true`.

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `currentUser` | `User` | Auth session | Yes | Templates are per-user (no sharing in MVP) |
| `targetItemId` | `string` | Currently focused/zoomed item | Yes | Where new items will be created |
| `templates` | `Template[]` | API: `GET /templates` | Yes | Sorted by `createdAt` DESC |
| `templateId` | `string` | Picker selection | Yes (on apply) | The template to instantiate |
| `triggerSource` | `'add-button' \| 'command-palette' \| 'context-menu'` | UI event | Yes | All three open the same picker |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Template created | ✅ SQLite | `templates` table — name, description, serialized subtree (JSON) | Immutable snapshot at save time |
| Template list render | ❌ | React state | Picker + Settings → Templates |
| Template applied | ✅ SQLite | INSERT N new `Item` rows | New IDs; no link back to template |
| Apply confirmation toast | ❌ | Toast bus | "Template '{name}' applied — {X} items created" |
| First-new-item highlight | ❌ | React state | Brief flash after apply |
| Template renamed | ✅ SQLite | UPDATE `templates.name` / `description` | Inline edit |
| Template deleted | ✅ SQLite | DELETE `templates` row | Items already created from it are unaffected |
| Template duplicated | ✅ SQLite | INSERT new `templates` row | Name "{name} (copy)" |
| Template updated | ✅ SQLite | UPDATE `templates.snapshot` | Overwrites; confirm dialog required |

## Edge Cases

1. User has zero templates — picker shows empty state "No templates yet. Create one from any item's context menu."
2. User applies a template under a leaf item — items become children of that leaf.
3. User applies a template at root — items become top-level under the root.
4. Template subtree contains to-dos — all are created uncompleted regardless of original state.
5. Template subtree contains mirrors — mirrors are NOT preserved; all items become independent.
6. Template subtree contains dates — dates are cleared on application.
7. Template contains 500 items — apply runs in a single transaction; progress toast shown if > 100 items.
8. User deletes a template — items already created from it remain; toast "Template deleted; existing items unaffected".
9. User updates a template — confirm dialog "Overwrite template '{name}'? Existing items already created won't change."
10. Two users update the same template simultaneously — last write wins (templates are user-owned, no co-edit in MVP).
11. Template name conflicts with existing name — picker still allows it; names are not unique.
12. Network drops mid-apply — operation queues per offline-resilience; new items appear with pending badge.
13. User triggers apply on the trash root — block; toast "Cannot apply templates inside Trash".
14. Template snapshot references item types removed in a future schema migration — unknown types fall back to plain text on apply.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-TEMPLATES-01 | User opens Add button (+) dropdown | User clicks "Apply template" | Template picker dialog opens | `template-picker` |
| AT-TEMPLATES-02 | User opens command palette | User selects "Apply template" | Same template picker dialog opens | `template-picker` |
| AT-TEMPLATES-03 | User has 0 templates | Picker opens | Empty state "No templates yet…" appears | `template-empty-state` |
| AT-TEMPLATES-04 | User has 3 templates | Picker opens | All 3 render with name, description, first-3-items preview, created date | `template-picker-row` |
| AT-TEMPLATES-05 | User selects a template | — | Right preview panel shows full tree structure | `template-preview-panel` |
| AT-TEMPLATES-06 | Template selected | User clicks Apply | N new `Item` rows inserted under target; toast "Template '{name}' applied — N items created" | `template-apply-toast` |
| AT-TEMPLATES-07 | Apply succeeds | — | First new item briefly flashes/highlights | `template-first-item-highlight` |
| AT-TEMPLATES-08 | Template contains to-dos marked complete | User applies | All to-dos created uncompleted | `template-applied-todo` |
| AT-TEMPLATES-09 | Template contains mirrors | User applies | All items created as independent (no mirror references) | `template-applied-item` |
| AT-TEMPLATES-10 | Template contains dates | User applies | All `dateAssigned` fields cleared on new items | `template-applied-item` |
| AT-TEMPLATES-11 | User opens Settings → Templates | — | List renders with name, description, item count, date | `templates-settings-list` |
| AT-TEMPLATES-12 | Template list row | User clicks Delete | Confirm "Delete template '{name}'? This won't affect items already created from it." | `template-delete-confirm` |
| AT-TEMPLATES-13 | Template list row | User clicks Duplicate | New row appears named "{name} (copy)" | `template-duplicate-button` |
| AT-TEMPLATES-14 | Item created from a template | User opens context menu | "Update template" entry visible | `template-update-action` |
| AT-TEMPLATES-15 | User clicks "Update template" | — | Confirm dialog "Overwrite template '{name}'?" | `template-update-confirm` |
| AT-TEMPLATES-16 | Template has 500 items | User applies | Progress toast appears; items render in batches | `template-apply-progress` |
| AT-TEMPLATES-17 | Network is offline | User applies | New items appear with pending badge; sync on reconnect | `template-pending-badge` |
| AT-TEMPLATES-18 | User is in Trash view | User triggers apply | Block; toast "Cannot apply templates inside Trash" | `template-apply-blocked-toast` |

## Component Contract

> **Note:** None of these components exist yet — paths are the planned implementation order (aspirational, not normative). The disclaimer mirrors `01-information-model.md` L149 and feeds the global component-contract map (M-3). AI implementers MUST NOT treat the paths as binding imports.

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Template picker dialog | `src/components/templates/TemplatePicker.tsx` | `template-picker` | AT-TEMPLATES-01, 02 |
| Empty state | `src/components/templates/TemplatesEmptyState.tsx` | `template-empty-state` | AT-TEMPLATES-03 |
| Template picker row | `src/components/templates/TemplatePickerRow.tsx` | `template-picker-row` | AT-TEMPLATES-04 |
| Preview panel | `src/components/templates/TemplatePreviewPanel.tsx` | `template-preview-panel` | AT-TEMPLATES-05 |
| Apply confirmation toast | `src/components/feedback/TemplateApplyToast.tsx` | `template-apply-toast` | AT-TEMPLATES-06 |
| First-item highlight | `src/components/items/HighlightFlash.tsx` | `template-first-item-highlight` | AT-TEMPLATES-07 |
| Applied item (read) | `src/components/items/BulletItem.tsx` | `template-applied-item`, `template-applied-todo` | AT-TEMPLATES-08..10 |
| Settings templates list | `src/pages/SettingsTemplates.tsx` | `templates-settings-list` | AT-TEMPLATES-11 |
| Delete confirm | `src/components/templates/TemplateDeleteDialog.tsx` | `template-delete-confirm` | AT-TEMPLATES-12 |
| Duplicate button | `src/components/templates/TemplateDuplicateButton.tsx` | `template-duplicate-button` | AT-TEMPLATES-13 |
| Update template action | `src/components/templates/UpdateTemplateAction.tsx` | `template-update-action` | AT-TEMPLATES-14 |
| Update confirm | `src/components/templates/TemplateUpdateDialog.tsx` | `template-update-confirm` | AT-TEMPLATES-15 |
| Apply progress toast | `src/components/feedback/ProgressToast.tsx` | `template-apply-progress` | AT-TEMPLATES-16 |
| Pending badge | `src/components/items/PendingBadge.tsx` | `template-pending-badge` | AT-TEMPLATES-17 |
| Apply-blocked toast | `src/components/feedback/InfoToast.tsx` | `template-apply-blocked-toast` | AT-TEMPLATES-18 |

> **Note:** Components are planned paths — none exist yet. Feeds the global component-contract map (M-3).

---

## Related

- [06-item-context-menu.md](./06-item-context-menu.md) — "Make template" and "Update template" entry points
- [09-mirrors.md](./09-mirrors.md) — mirrors are flattened on template apply
- [11-trash-view.md](./11-trash-view.md) — apply blocked inside trash
- `mem://features/templates` — serialized snapshot rules
