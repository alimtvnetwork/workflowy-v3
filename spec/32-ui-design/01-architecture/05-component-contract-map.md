# Component Contract Map

> **Generated:** 2026-04-28
> **Source:** every `## Component Contract` table in `spec/31-app/01-features/`
> **Generator:** `scripts/spec-hygiene/07-extract-contract-map.mjs`
> **DO NOT EDIT BY HAND** — re-run the generator after editing feature files.

---

## Overview

This file is the single global bridge from feature spec → component path → `data-testid` → acceptance tests. Use it to:

- Find which component implements a feature surface.
- Find which acceptance tests cover a given component.
- Find which `data-testid` to grep when wiring tests.

Total surfaces mapped: **227** across **26** feature file(s).

---

## Per-Feature Surfaces

### `01-information-model.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Root item container | ``src/components/tree/RootContainer.tsx`` | `root-item` | AT-INFOMODEL-01 |
| Root delete error toast | ``src/components/feedback/ErrorToast.tsx`` | `root-delete-error` | AT-INFOMODEL-02 |
| Item row | ``src/components/tree/ItemRow.tsx`` | `item-row` | AT-INFOMODEL-03, AT-INFOMODEL-09 |
| Mirror badge | ``src/components/items/MirrorBadge.tsx`` | `mirror-badge` | AT-INFOMODEL-04 |
| Share status pill | ``src/components/items/ShareStatusPill.tsx`` | `share-status-pill` | AT-INFOMODEL-05 |
| Trash restore button | ``src/components/trash/TrashRestoreButton.tsx`` | `trash-restore-button` | AT-INFOMODEL-06 |
| Delete confirm dialog | ``src/components/items/DeleteConfirmDialog.tsx`` | `delete-confirm-dialog` | AT-INFOMODEL-07 |
| Tag chip | ``src/components/tags/TagChip.tsx`` | `tag-chip` | AT-INFOMODEL-08 |
| Bulk create progress | ``src/components/feedback/BulkCreateProgress.tsx`` | `bulk-create-progress` | AT-INFOMODEL-10 |

### `02-personas.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| App-ready performance marker | ``src/lib/perf/AppReadyMarker.ts`` | `app-ready-marker` | AT-PERSONAS-01 |
| Keyboard action registry | ``src/hooks/useKeyboardActions.ts`` | `keyboard-action-coverage` | AT-PERSONAS-02 |
| Shared-user row | ``src/components/share/SharedUsersList.tsx`` | `share-user-row` | AT-PERSONAS-03 |
| Bullet item (deep nesting) | ``src/components/items/BulletItem.tsx`` | `bullet-item` | AT-PERSONAS-04, 09 |
| View-only affordance wrapper | ``src/components/items/ViewOnlyAffordance.tsx`` | `view-only-affordance` | AT-PERSONAS-05 |
| Offline pending badge | ``src/components/items/PendingBadge.tsx`` | `offline-pending-badge` | AT-PERSONAS-06 |
| Paste progress indicator | ``src/components/feedback/PasteProgress.tsx`` | `paste-progress` | AT-PERSONAS-07 |
| Zoom breadcrumb (URL-restorable) | ``src/components/navbar/Breadcrumbs.tsx`` | `zoom-breadcrumb` | AT-PERSONAS-08 |
| Access-removed toast | ``src/components/feedback/InfoToast.tsx`` | `access-removed-toast` | AT-PERSONAS-10 |

### `03-layout-structure.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| NavBar shell | ``src/components/layout/NavBar.tsx`` | `navbar` | AT-LAYOUT-01..03 |
| Home button | ``src/components/layout/NavBarHome.tsx`` | `navbar-home` | AT-LAYOUT-01 |
| Back button | ``src/components/layout/NavBarBack.tsx`` | `navbar-back` | AT-LAYOUT-03 |
| Forward button | ``src/components/layout/NavBarForward.tsx`` | `navbar-forward` | AT-LAYOUT-03 |
| Breadcrumb | ``src/components/layout/Breadcrumb.tsx`` | `breadcrumb` | AT-LAYOUT-02 |
| Breadcrumb overflow dropdown | ``src/components/layout/BreadcrumbOverflow.tsx`` | `breadcrumb-overflow` | AT-LAYOUT-02 |
| Sidebar panel | ``src/components/layout/Sidebar.tsx`` | `sidebar-panel` | AT-LAYOUT-04..06 |
| Sidebar toggle | ``src/components/layout/SidebarToggle.tsx`` | `sidebar-toggle` | AT-LAYOUT-06 |
| Sidebar backdrop (mobile) | ``src/components/layout/SidebarBackdrop.tsx`` | `sidebar-backdrop` | AT-LAYOUT-05 |
| Settings dropdown | ``src/components/layout/SettingsDropdown.tsx`` | `settings-dropdown` | AT-LAYOUT-07 |
| Handbook panel | ``src/components/layout/HandbookPanel.tsx`` | `handbook-panel` | AT-LAYOUT-11 |
| Favorite button | ``src/components/layout/FavoriteButton.tsx`` | `favorite-button` | AT-LAYOUT-12 |
| Usage quota indicator | ``src/components/layout/UsageQuota.tsx`` | `usage-quota`, `usage-quota-over` | AT-LAYOUT-08..10 |

### `04-page-content-area.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Item row container | ``src/components/tree/ItemRow.tsx`` | `item-row` | AT-PAGE-01..15 |
| Expand/collapse toggle | ``src/components/tree/ExpandToggle.tsx`` | `expand-toggle` | AT-PAGE-01 |
| Bullet dot (default) | ``src/components/tree/BulletDot.tsx`` | `bullet-dot`, `bullet-dot-empty` | AT-PAGE-02..03 |
| Mirror badge | ``src/components/items/MirrorBadge.tsx`` | `mirror-badge` | AT-PAGE-04 |
| Child count badge | ``src/components/tree/ChildCountBadge.tsx`` | `child-count-badge` | AT-PAGE-05 |
| Hover actions group | ``src/components/tree/HoverActions.tsx`` | `hover-actions` | AT-PAGE-06 |
| Comment button | ``src/components/comments/CommentButton.tsx`` | `comment-button` | AT-PAGE-06 |
| Context-menu trigger | ``src/components/tree/ContextMenuTrigger.tsx`` | `context-menu-trigger` | AT-PAGE-06 |
| Floating format toolbar | ``src/components/editor/FormatToolbar.tsx`` | `format-toolbar` | AT-PAGE-07..10 |
| Bold/Italic/Underline buttons | ``src/components/editor/FormatButtons.tsx`` | `format-bold`, `format-italic`, `format-underline` | AT-PAGE-08 |
| Type-conversion buttons | ``src/components/editor/TypeButtons.tsx`` | `format-h1`, `format-h2`, `format-h3`, `format-paragraph` | AT-PAGE-09 |
| Color picker | ``src/components/editor/ColorPicker.tsx`` | `color-picker` | AT-PAGE-10 |
| To-do checkbox | ``src/components/items/TodoCheckbox.tsx`` | `todo-checkbox` | AT-PAGE-11 |
| Note editor | ``src/components/items/NoteEditor.tsx`` | `note-editor` | AT-PAGE-12 |
| Bulk-paste progress | ``src/components/feedback/BulkPasteProgress.tsx`` | `bulk-paste-progress` | AT-PAGE-13 |
| Inline link | ``src/components/editor/InlineLink.tsx`` | `inline-link` | AT-PAGE-14 |
| Divider row | ``src/components/items/DividerRow.tsx`` | `divider-row` | AT-PAGE-15 |

### `05-interactions.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Global key handler | ``src/lib/interactions/useGlobalKeys.ts`` | `— (hook)` | AT-INTERACT-01..08 |
| Item row keyboard handlers | ``src/components/tree/ItemRow.tsx`` | `item-row` | AT-INTERACT-01..07 |
| To-do checkbox | ``src/components/items/TodoCheckbox.tsx`` | `todo-checkbox` | AT-INTERACT-08 |
| Drag-and-drop layer | ``src/components/tree/DragLayer.tsx`` | `dnd-layer` | AT-INTERACT-09 |
| DnD error toast | ``src/components/feedback/ErrorToast.tsx`` | `dnd-error-toast` | AT-INTERACT-09 |
| Search overlay shell | ``src/components/search/SearchOverlay.tsx`` | `search-overlay` | AT-INTERACT-10..13 |
| Search results list | ``src/components/search/SearchResults.tsx`` | `search-results`, `search-result-row` | AT-INTERACT-11..12 |
| Recent items list | ``src/components/search/SearchRecent.tsx`` | `search-recent` | AT-INTERACT-13 |
| Autosave indicator | ``src/components/feedback/SaveIndicator.tsx`` | `save-indicator` | AT-INTERACT-14 |
| Offline banner | ``src/components/feedback/OfflineBanner.tsx`` | `offline-banner` | AT-INTERACT-15 |
| Unsaved-changes warning hook | ``src/lib/interactions/useBeforeUnload.ts`` | `unsaved-warning` | AT-INTERACT-16 |

### `05a-hotkey-table.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Hotkey registry map | ``src/lib/hotkeys.ts`` | `— (module)` | AT-HK-01, AT-HK-03, AT-HK-04 |
| Global key dispatcher | ``src/lib/interactions/useGlobalKeys.ts`` | `— (hook)` | AT-HK-02, AT-HK-05, AT-HK-06 |
| Hygiene check | ``scripts/spec-hygiene/17-check-hotkeys.mjs`` | `— (script)` | AT-HK-04 |
| Save indicator | ``src/components/feedback/SaveIndicator.tsx`` | `save-indicator` | AT-HK-05 |
| Search overlay shell | ``src/components/search/SearchOverlay.tsx`` | `search-overlay` | AT-HK-06, AT-HK-08 |
| Item row | ``src/components/tree/ItemRow.tsx`` | `item-row` | AT-HK-07 |
| Search result row | ``src/components/search/SearchResults.tsx`` | `search-result-row` | AT-HK-08 |

### `06-item-context-menu.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Context-menu trigger (⋮) | ``src/components/tree/ContextMenuTrigger.tsx`` | `context-menu-trigger` | AT-CTXMENU-15 |
| Context menu shell | ``src/components/items/ContextMenu.tsx`` | `context-menu`, `context-menu-disabled`, `context-menu-root` | AT-CTXMENU-01..02, 09 |
| Turn-Into submenu | ``src/components/items/TurnIntoSubmenu.tsx`` | `turn-into-h1`, `turn-into-h2`, `turn-into-h3`, `turn-into-paragraph`, `turn-into-todo`, `turn-into-board`, `turn-into-dashboard`, `turn-into-quote`, `turn-into-code`, `turn-into-divider` | AT-CTXMENU-03 |
| Action: Complete | ``src/components/items/actions/CompleteAction.tsx`` | `action-complete` | AT-CTXMENU-04 |
| Note editor (slide-in) | ``src/components/items/NoteEditor.tsx`` | `note-editor` | AT-CTXMENU-05 |
| Date picker + badge | ``src/components/items/DatePicker.tsx`` | `date-badge` | AT-CTXMENU-06 |
| Move-To dialog | ``src/components/items/MoveToDialog.tsx`` | `move-to-dialog`, `move-error-toast` | AT-CTXMENU-07 |
| Action: Mirror | ``src/components/items/actions/MirrorAction.tsx`` | `action-mirror` | AT-CTXMENU-08 |
| Action: Duplicate | ``src/components/items/actions/DuplicateAction.tsx`` | `action-duplicate`, `action-duplicate-disabled` | AT-CTXMENU-10 |
| Upload file action | ``src/components/items/actions/UploadAction.tsx`` | `upload-button`, `upload-error-toast` | AT-CTXMENU-11 |
| Action: Copy internal link | ``src/components/items/actions/CopyLinkAction.tsx`` | `action-copy-link` | AT-CTXMENU-12 |
| Action: Sort A-Z / Z-A | ``src/components/items/actions/SortAction.tsx`` | `action-sort` | AT-CTXMENU-13 |
| Delete-mirror warning dialog | ``src/components/items/DeleteMirrorWarningDialog.tsx`` | `delete-mirror-warning` | AT-CTXMENU-14 |
| Metadata footer | ``src/components/items/ContextMenuMetadata.tsx`` | `metadata-changed`, `metadata-created`, `metadata-mirrored-from` | AT-CTXMENU-16 |

### `07-board-view.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Board container | ``src/components/board/BoardContainer.tsx`` | `board-container`, `board-empty` | AT-BOARD-01..02, 15 |
| Column | ``src/components/board/BoardColumn.tsx`` | `board-column` | AT-BOARD-03..05 |
| Column header (editable) | ``src/components/board/BoardColumnHeader.tsx`` | `board-column-header`, `board-column-name` | AT-BOARD-03..04 |
| Add-column button | ``src/components/board/AddColumnButton.tsx`` | `board-add-column` | AT-BOARD-05 |
| Column collapse toggle | ``src/components/board/ColumnCollapseToggle.tsx`` | `board-column-collapse` | AT-BOARD-12 |
| Column delete confirm | ``src/components/board/ColumnDeleteDialog.tsx`` | `board-delete-column` | AT-BOARD-13 |
| Card | ``src/components/board/BoardCard.tsx`` | `board-card`, `board-card-content` | AT-BOARD-06..09 |
| Mirror badge on card | ``src/components/items/MirrorBadge.tsx`` | `mirror-badge` | AT-BOARD-10 |
| DnD error toast | ``src/components/feedback/ErrorToast.tsx`` | `dnd-error-toast` | AT-BOARD-11 |
| Quota toast | ``src/components/feedback/QuotaToast.tsx`` | `quota-toast` | AT-BOARD-14 |
| Drop indicator | ``src/components/board/DropIndicator.tsx`` | `board-drop-indicator` | AT-BOARD-06..07 |

### `07b-dashboard-view.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Dashboard container | ``src/components/dashboard/DashboardContainer.tsx`` | `dashboard-container` | AT-DV-01, AT-DV-02 |
| Dashboard card | ``src/components/dashboard/DashboardCard.tsx`` | `dashboard-card`, `dashboard-card-title`, `dashboard-card-checkbox` | AT-DV-03, AT-DV-04, AT-DV-05 |
| Convert action | ``src/components/contextmenu/TurnIntoDashboard.tsx`` | `turn-into-dashboard` | AT-DV-06, AT-DV-07, AT-DV-08 |

### `08-share-dialog.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Share dialog shell | ``src/components/share/ShareDialog.tsx`` | `share-dialog` | AT-SHARE-01, 15 |
| Email input | ``src/components/share/ShareEmailInput.tsx`` | `share-email-input`, `share-email-error` | AT-SHARE-02..03 |
| Invite button | ``src/components/share/ShareInviteButton.tsx`` | `share-invite-button` | AT-SHARE-04, 10..11, 13 |
| Permission dropdown | ``src/components/share/SharePermissionDropdown.tsx`` | `share-permission-dropdown` | AT-SHARE-05 |
| Shared-users list | ``src/components/share/SharedUsersList.tsx`` | `share-user-row`, `share-search` | AT-SHARE-04..06, 12, 14 |
| Remove-grantee button | ``src/components/share/ShareRemoveButton.tsx`` | `share-remove-button` | AT-SHARE-06 |
| Public-link toggle | ``src/components/share/PublicLinkToggle.tsx`` | `public-link-toggle` | AT-SHARE-07, 09 |
| Copy-link button | ``src/components/share/CopyLinkButton.tsx`` | `copy-link-button` | AT-SHARE-08 |
| Cascade notice | ``src/components/share/CascadeNotice.tsx`` | `cascade-notice` | AT-SHARE-01 |
| Quota toast | ``src/components/feedback/QuotaToast.tsx`` | `share-quota-toast` | AT-SHARE-13 |
| Item-deleted toast | ``src/components/feedback/InfoToast.tsx`` | `share-dialog-closed-toast` | AT-SHARE-15 |

### `08b-sharing-mirror-interaction.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Share dialog (per-instance) | ``src/components/share/ShareDialog.tsx`` | `share-dialog`, `share-grant`, `share-revoke` | AT-SM-01, AT-SM-02, AT-SM-03 |
| Mirror peer-group propagator | ``src/lib/sync/peerGroupPropagator.ts`` | `n/a (pure module)` | AT-SM-04, AT-SM-05 |

### `09-mirrors.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Mirror badge | ``src/components/items/MirrorBadge.tsx`` | `mirror-badge`, `mirror-badge-tooltip` | AT-MIRRORS-05, 06 |
| Mirror picker dialog | ``src/components/items/MirrorPickerDialog.tsx`` | `mirror-picker-dialog` | AT-MIRRORS-02, 03 |
| Mirror creation toast | ``src/components/feedback/MirrorCreateToast.tsx`` | `mirror-create-toast` | AT-MIRRORS-04 |
| Mirror content renderer | ``src/components/items/MirrorContent.tsx`` | `mirror-content` | AT-MIRRORS-01 |
| Mirror source link (context menu) | ``src/components/items/MirrorSourceLink.tsx`` | `mirror-source-link` | AT-MIRRORS-07 |
| Cycle/duplicate error toast | ``src/components/feedback/MirrorErrorToast.tsx`` | `mirror-cycle-error`, `mirror-duplicate-error`, `mirror-root-error` | AT-MIRRORS-08, 09, 15 |
| Broken-mirror banner | ``src/components/items/BrokenMirrorBanner.tsx`` | `mirror-broken-banner` | AT-MIRRORS-10 |
| Convert-to-independent button | ``src/components/items/MirrorConvertButton.tsx`` | `mirror-convert-button` | AT-MIRRORS-11 |
| Mirror delete button | ``src/components/items/MirrorDeleteButton.tsx`` | `mirror-delete-button` | AT-MIRRORS-12 |
| Per-instance expand toggle | ``src/components/items/ExpandToggle.tsx`` | `mirror-expand-toggle` | AT-MIRRORS-13 |
| Mirror to-do checkbox | ``src/components/items/TodoCheckbox.tsx`` | `mirror-todo-checkbox` | AT-MIRRORS-14 |
| Pending mirror state | ``src/components/items/MirrorPendingBadge.tsx`` | `mirror-pending-state` | AT-MIRRORS-16 |

### `09a-mirror-cycle-detection.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Server cycle-check algorithm | ``wp-plugin/Repository/CycleCheck.php`` | `cycle-move-rejected`, `cycle-mirror-rejected` | AT-CYCLE-01, AT-CYCLE-02, AT-CYCLE-03, AT-CYCLE-04, AT-CYCLE-07, AT-CYCLE-08, AT-CYCLE-09 |
| Recursive CTE constant (SSOT SQL) | ``wp-plugin/Repository/sql/cycle-check.sql`` | `cycle-hygiene-drift` | AT-CYCLE-10 |
| Client optimistic cycle check | ``src/lib/mirror-cycle.ts`` | `cycle-self-parent`, `cycle-clean-target` | AT-CYCLE-01, AT-CYCLE-05, AT-CYCLE-06 |
| Cycle error toast | ``src/components/feedback/MirrorErrorToast.tsx`` | `mirror-cycle-error` | AT-CYCLE-08 |
| Hygiene drift check (SQL byte-equality) | ``scripts/spec-hygiene/18-check-cycle-algo.mjs`` | `cycle-hygiene-drift` | AT-CYCLE-10 |

### `09b-mirror-peer-group-model.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Diamond peer badge | ``src/components/items/MirrorBadge.tsx`` | `mirror-badge` | AT-MPG-01 |
| Cross-peer content sync | ``src/state/mirrorGroupStore.ts`` | `mirror-content-sync` | AT-MPG-02 |
| Per-peer position lane | ``src/components/items/PeerPositionLane.tsx`` | `mirror-position-isolation` | AT-MPG-03 |
| Singleton-dissolve handler | ``src/state/mirrorDissolveSaga.ts`` | `mirror-singleton-dissolve` | AT-MPG-04 |
| Survivor preservation | ``src/state/mirrorDetachSaga.ts`` | `mirror-detach-survivors` | AT-MPG-05 |
| "See them" peer list | ``src/components/items/MirrorPeerList.tsx`` | `mirror-see-them` | AT-MPG-06 |
| Per-instance collapse | ``src/components/items/ExpandToggle.tsx`` | `mirror-collapse-isolation` | AT-MPG-07 |
| Canonical promotion | ``src/state/mirrorCanonicalPromotionSaga.ts`` | `mirror-canonical-promotion` | AT-MPG-08 |
| LWW tiebreak | ``src/state/lwwResolver.ts`` | `mirror-lww-tiebreak` | AT-MPG-09 |
| Cycle guard | ``src/components/items/MirrorPicker.tsx`` | `mirror-cycle-error` | AT-MPG-10 |

### `10-today-view.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Today view root | ``src/pages/Today.tsx`` | `today-view-root` | AT-TODAY-01, 11, 13 |
| Empty state | ``src/components/today/TodayEmptyState.tsx`` | `today-empty-state` | AT-TODAY-02 |
| Overdue section | ``src/components/today/OverdueSection.tsx`` | `today-overdue-section` | AT-TODAY-03 |
| Breadcrumb group header | ``src/components/today/BreadcrumbGroup.tsx`` | `today-breadcrumb-group` | AT-TODAY-04, 12 |
| Today item row | ``src/components/today/TodayItemRow.tsx`` | `today-item-row`, `today-item-content` | AT-TODAY-05, 08, 10, 14 |
| Todo checkbox | ``src/components/items/TodoCheckbox.tsx`` | `today-todo-checkbox` | AT-TODAY-06 |
| Date picker | ``src/components/items/DatePicker.tsx`` | `today-date-picker` | AT-TODAY-07 |
| Load-more sentinel | ``src/components/shared/LoadMoreSentinel.tsx`` | `today-load-more` | AT-TODAY-09 |

### `11-trash-view.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Trash view root | ``src/pages/Trash.tsx`` | `trash-view-root` | AT-TRASH-01, 11 |
| Empty state | ``src/components/trash/TrashEmptyState.tsx`` | `trash-empty-state` | AT-TRASH-02 |
| Trash row | ``src/components/trash/TrashRow.tsx`` | `trash-row`, `trash-expiry-label` | AT-TRASH-01, 10 |
| Restore button | ``src/components/trash/RestoreButton.tsx`` | `trash-restore-button` | AT-TRASH-03, 12, 14 |
| Restore toast | ``src/components/feedback/RestoreToast.tsx`` | `trash-restore-toast`, `trash-restore-error` | AT-TRASH-04, 13 |
| Delete-permanently confirm dialog | ``src/components/trash/DeletePermanentlyDialog.tsx`` | `trash-delete-confirm`, `trash-delete-confirm-yes`, `trash-delete-confirm-no` | AT-TRASH-05..07 |
| Empty-trash button | ``src/components/trash/EmptyTrashButton.tsx`` | `trash-empty-button` | AT-TRASH-08 |
| Empty-trash confirm dialog | ``src/components/trash/EmptyTrashDialog.tsx`` | `trash-empty-confirm`, `trash-empty-confirm-yes` | AT-TRASH-08, 09 |
| Empty-trash progress toast | ``src/components/feedback/ProgressToast.tsx`` | `trash-empty-progress` | AT-TRASH-15 |
| Pending-restore badge | ``src/components/trash/PendingBadge.tsx`` | `trash-pending-state` | AT-TRASH-14 |

### `11b-trash-reaper.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Reaper edge function | ``wp-plugin/src/Cron/ReapTrash.php`` | `n/a (server-side)` | AT-TR-01, AT-TR-02, AT-TR-03 |
| Reaper audit log surface | ``wp-plugin/src/Cron/ReaperRunsLogger.php`` | `n/a (server-side)` | AT-TR-04, AT-TR-05 |

### `12-multi-select.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Selectable item row | ``src/components/items/BulletItem.tsx`` | `multiselect-row` | AT-MULTISELECT-01..04 |
| Selection badge | ``src/components/multiselect/SelectionBadge.tsx`` | `multiselect-badge` | AT-MULTISELECT-05 |
| Bulk action bar | ``src/components/multiselect/BulkActionBar.tsx`` | `multiselect-action-bar` | AT-MULTISELECT-06, 15 |
| Bulk Complete button | ``src/components/multiselect/BulkCompleteButton.tsx`` | `bulk-complete-button` | AT-MULTISELECT-07 |
| Bulk Delete button | ``src/components/multiselect/BulkDeleteButton.tsx`` | `bulk-delete-button` | AT-MULTISELECT-08 |
| Bulk Delete confirm | ``src/components/multiselect/BulkDeleteDialog.tsx`` | `bulk-delete-confirm` | AT-MULTISELECT-09 |
| Bulk Move dialog | ``src/components/multiselect/BulkMoveDialog.tsx`` | `bulk-move-dialog` | AT-MULTISELECT-10 |
| Bulk Indent button | ``src/components/multiselect/BulkIndentButton.tsx`` | `bulk-indent-button` | AT-MULTISELECT-16 |
| Mirror warning | ``src/components/multiselect/MirrorWarning.tsx`` | `multiselect-mirror-warning` | AT-MULTISELECT-11 |
| Permission-disabled tooltip | ``src/components/multiselect/PermissionDisabledTooltip.tsx`` | `bulk-permission-disabled` | AT-MULTISELECT-12 |
| Drag-block toast | ``src/components/feedback/InfoToast.tsx`` | `multiselect-drag-block-toast` | AT-MULTISELECT-13 |
| Selection-cleared toast | ``src/components/feedback/InfoToast.tsx`` | `multiselect-cleared-toast` | AT-MULTISELECT-14 |

### `12b-multi-select-zoom.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Virtual zoom scope store | ``src/stores/useZoomStore.ts`` | `n/a (pure store)` | AT-MZ-01, AT-MZ-02, AT-MZ-03 |
| Zoom breadcrumb (virtual) | ``src/components/zoom/ZoomBreadcrumb.tsx`` | `zoom-breadcrumb-virtual` | AT-MZ-04, AT-MZ-05, AT-MZ-06 |

### `13-templates.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Template picker dialog | ``src/components/templates/TemplatePicker.tsx`` | `template-picker` | AT-TEMPLATES-01, 02 |
| Empty state | ``src/components/templates/TemplatesEmptyState.tsx`` | `template-empty-state` | AT-TEMPLATES-03 |
| Template picker row | ``src/components/templates/TemplatePickerRow.tsx`` | `template-picker-row` | AT-TEMPLATES-04 |
| Preview panel | ``src/components/templates/TemplatePreviewPanel.tsx`` | `template-preview-panel` | AT-TEMPLATES-05 |
| Apply confirmation toast | ``src/components/feedback/TemplateApplyToast.tsx`` | `template-apply-toast` | AT-TEMPLATES-06 |
| First-item highlight | ``src/components/items/HighlightFlash.tsx`` | `template-first-item-highlight` | AT-TEMPLATES-07 |
| Applied item (read) | ``src/components/items/BulletItem.tsx`` | `template-applied-item`, `template-applied-todo` | AT-TEMPLATES-08..10 |
| Settings templates list | ``src/pages/SettingsTemplates.tsx`` | `templates-settings-list` | AT-TEMPLATES-11 |
| Delete confirm | ``src/components/templates/TemplateDeleteDialog.tsx`` | `template-delete-confirm` | AT-TEMPLATES-12 |
| Duplicate button | ``src/components/templates/TemplateDuplicateButton.tsx`` | `template-duplicate-button` | AT-TEMPLATES-13 |
| Update template action | ``src/components/templates/UpdateTemplateAction.tsx`` | `template-update-action` | AT-TEMPLATES-14 |
| Update confirm | ``src/components/templates/TemplateUpdateDialog.tsx`` | `template-update-confirm` | AT-TEMPLATES-15 |
| Apply progress toast | ``src/components/feedback/ProgressToast.tsx`` | `template-apply-progress` | AT-TEMPLATES-16 |
| Pending badge | ``src/components/items/PendingBadge.tsx`` | `template-pending-badge` | AT-TEMPLATES-17 |
| Apply-blocked toast | ``src/components/feedback/InfoToast.tsx`` | `template-apply-blocked-toast` | AT-TEMPLATES-18 |

### `13b-templates-snapshot-semantics.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Template instantiation procedure | ``wp-plugin/src/Templates/Instantiate.php`` | `n/a (server-side)` | AT-TPL-01, AT-TPL-02, AT-TPL-03 |
| Template payload storage | ``wp-plugin/src/Templates/PayloadRepository.php`` | `n/a (server-side)` | AT-TPL-04, AT-TPL-05 |

### `14-concurrency-and-sync.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Restored-remote-change banner | ``src/components/concurrency/RemoteChangeBanner.tsx`` | `concurrency-banner` | AT-CONCURRENCY-01, 04, 14 |
| Undo button on banner | ``src/components/concurrency/UndoRemoteChangeButton.tsx`` | `concurrency-undo` | AT-CONCURRENCY-03 |
| Tie-break resolver (server) | ``src/server/concurrency/tieBreak.ts`` | `concurrency-tiebreak` | AT-CONCURRENCY-02 |
| Server-clock authority module | ``src/server/concurrency/serverClock.ts`` | `concurrency-server-clock` | AT-CONCURRENCY-05 |
| Offline-replay queue | ``src/lib/sync/OfflineReplayQueue.ts`` | `concurrency-offline-replay` | AT-CONCURRENCY-06 |
| Item-deleted conflict toast | ``src/components/feedback/InfoToast.tsx`` | `concurrency-deleted-toast` | AT-CONCURRENCY-07 |
| Mirror sync broadcaster | ``src/lib/sync/MirrorSyncBroadcaster.ts`` | `concurrency-mirror-sync` | AT-CONCURRENCY-08 |
| Idempotent-write detector | ``src/server/concurrency/idempotent.ts`` | `concurrency-idempotent` | AT-CONCURRENCY-09 |
| Monotonic-timestamp guard | ``src/server/concurrency/monotonicTs.ts`` | `concurrency-monotonic-ts` | AT-CONCURRENCY-10 |
| Split-state acceptance | ``src/server/concurrency/fieldLevelLWW.ts`` | `concurrency-split-state`, `concurrency-bulk-vs-single` | AT-CONCURRENCY-11, 13 |
| Stale-tab banner trigger | ``src/lib/sync/StaleTabDetector.ts`` | `concurrency-stale-tab` | AT-CONCURRENCY-12 |
| Conflict log writer | ``src/server/concurrency/conflictLog.ts`` | `concurrency-conflict-log` | AT-CONCURRENCY-15 |
| SSE endpoint handler (WP) | ``wp-plugin/Sync/SseEndpoint.php`` | `sse-endpoint-handshake` | AT-CONCURRENCY-16 |
| SSE event framer | ``wp-plugin/Sync/EventFramer.php`` | `sse-event-frame` | AT-CONCURRENCY-17 |
| SSE resume/replay buffer | ``wp-plugin/Sync/ResumeBuffer.php`` | `sse-resume-replay` | AT-CONCURRENCY-18 |
| Cursor-overflow detector | ``wp-plugin/Sync/BackpressureGuard.php`` | `sse-cursor-overflow` | AT-CONCURRENCY-19 |
| Poll-fallback endpoint | ``wp-plugin/Sync/PollEndpoint.php`` | `sse-poll-fallback` | AT-CONCURRENCY-20 |
| Transactional emit hook | ``wp-plugin/Sync/TransactionalEmitter.php`` | `sse-emission-atomic` | AT-CONCURRENCY-21 |
| Forbidden-transport guard (CI) | ``scripts/spec-hygiene/forbidden-transports.mjs`` | `sse-forbidden-transports` | AT-CONCURRENCY-22 |

### `14b-offline-queue.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Offline queue store | ``src/stores/useOfflineQueueStore.ts`` | `n/a (pure store)` | AT-OQ-01, AT-OQ-02, AT-OQ-03 |
| SaveStatus indicator | ``src/components/sync/SaveStatusBadge.tsx`` | `save-status-badge` | AT-OQ-04, AT-OQ-05, AT-OQ-06 |

### `15-roles-and-permissions.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Share dialog trigger button | ``src/components/share/ShareDialogTrigger.tsx`` | `share-dialog-trigger` | `AT-ROLES-01` |
| Share remove button | ``src/components/share/ShareRemoveButton.tsx`` | `share-remove-button` | `AT-ROLES-03` |
| Share public-link toggle | ``src/components/share/SharePublicToggle.tsx`` | `share-public-toggle` | `AT-ROLES-04` |
| Permission badge on item row | ``src/components/items/PermissionBadge.tsx`` | `permission-badge` | `AT-ROLES-05` |
| Permission-denied toast | ``src/components/feedback/PermissionDeniedToast.tsx`` | `permission-denied-toast` | `AT-ROLES-02`, `AT-ROLES-10` |
| Public-view banner | ``src/components/share/PublicViewBanner.tsx`` | `public-view-banner` | `AT-ROLES-06` |
| Transfer-ownership button | ``src/components/share/TransferOwnershipButton.tsx`` | `transfer-ownership-button` | `AT-ROLES-07` |
| Workspace invite button | ``src/components/workspace/WorkspaceInviteButton.tsx`` | `workspace-invite-button` | `AT-ROLES-08` |
| Removed-user badge | ``src/components/items/RemovedUserBadge.tsx`` | `removed-user-badge` | `AT-ROLES-09` |

### `16-search-ranking.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Server-side ranker | ``wp-plugin/src/Search/Ranker.php`` | `n/a (server-side)` | AT-SR-01, AT-SR-02, AT-SR-03 |
| Coarse-grain bucket strategy | ``wp-plugin/src/Search/BucketStrategy.php`` | `n/a (server-side)` | AT-SR-04, AT-SR-05 |

### `18-integrations.md`

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| PAT manager (list) | ``src/components/settings/PatListPanel.tsx`` | `pat-list-panel` | AT-INT-02 |
| PAT create dialog | ``src/components/settings/PatCreateDialog.tsx`` | `pat-create-dialog` | AT-INT-01 |
| PAT revoke button | ``src/components/settings/PatRevokeButton.tsx`` | `pat-revoke-button` | AT-INT-02 |
| Zapier integrations REST controller | ``wp-plugin/src/Rest/Integrations/ItemsController.php`` | `—` | AT-INT-04..06, AT-INT-08..12 |
| Zapier comments controller | ``wp-plugin/src/Rest/Integrations/CommentsController.php`` | `—` | AT-INT-07, AT-INT-13 |
| PAT auth middleware | ``wp-plugin/src/Auth/PersonalAccessTokenAuth.php`` | `—` | AT-INT-01..03 |
| Rate-limit middleware | ``wp-plugin/src/Middleware/RateLimitPerPat.php`` | `—` | AT-INT-19 |
| Idempotency middleware | ``wp-plugin/src/Middleware/IdempotencyKey.php`` | `—` | AT-INT-20 |
| Activity-feed sink | ``wp-plugin/src/ActivityFeed/IntegrationSink.php`` | `—` | AT-INT-21 |
| Apple Shortcuts gallery (link surface only) | ``src/components/settings/ShortcutsGalleryLink.tsx`` | `shortcuts-gallery-link` | AT-INT-14..18 |

---

## Component-Path Index

Sorted alphabetically. Each row is one planned/implemented component file.

| Component path | `data-testid`(s) |
|---------------|-----------------|
| ``scripts/spec-hygiene/17-check-hotkeys.mjs`` | `— (script)` |
| ``scripts/spec-hygiene/18-check-cycle-algo.mjs`` | `cycle-hygiene-drift` |
| ``scripts/spec-hygiene/forbidden-transports.mjs`` | `sse-forbidden-transports` |
| ``src/components/board/AddColumnButton.tsx`` | `board-add-column` |
| ``src/components/board/BoardCard.tsx`` | `board-card`, `board-card-content` |
| ``src/components/board/BoardColumn.tsx`` | `board-column` |
| ``src/components/board/BoardColumnHeader.tsx`` | `board-column-header`, `board-column-name` |
| ``src/components/board/BoardContainer.tsx`` | `board-container`, `board-empty` |
| ``src/components/board/ColumnCollapseToggle.tsx`` | `board-column-collapse` |
| ``src/components/board/ColumnDeleteDialog.tsx`` | `board-delete-column` |
| ``src/components/board/DropIndicator.tsx`` | `board-drop-indicator` |
| ``src/components/comments/CommentButton.tsx`` | `comment-button` |
| ``src/components/concurrency/RemoteChangeBanner.tsx`` | `concurrency-banner` |
| ``src/components/concurrency/UndoRemoteChangeButton.tsx`` | `concurrency-undo` |
| ``src/components/contextmenu/TurnIntoDashboard.tsx`` | `turn-into-dashboard` |
| ``src/components/dashboard/DashboardCard.tsx`` | `dashboard-card`, `dashboard-card-checkbox`, `dashboard-card-title` |
| ``src/components/dashboard/DashboardContainer.tsx`` | `dashboard-container` |
| ``src/components/editor/ColorPicker.tsx`` | `color-picker` |
| ``src/components/editor/FormatButtons.tsx`` | `format-bold`, `format-italic`, `format-underline` |
| ``src/components/editor/FormatToolbar.tsx`` | `format-toolbar` |
| ``src/components/editor/InlineLink.tsx`` | `inline-link` |
| ``src/components/editor/TypeButtons.tsx`` | `format-h1`, `format-h2`, `format-h3`, `format-paragraph` |
| ``src/components/feedback/BulkCreateProgress.tsx`` | `bulk-create-progress` |
| ``src/components/feedback/BulkPasteProgress.tsx`` | `bulk-paste-progress` |
| ``src/components/feedback/ErrorToast.tsx`` | `dnd-error-toast`, `root-delete-error` |
| ``src/components/feedback/InfoToast.tsx`` | `access-removed-toast`, `concurrency-deleted-toast`, `multiselect-cleared-toast`, `multiselect-drag-block-toast`, `share-dialog-closed-toast`, `template-apply-blocked-toast` |
| ``src/components/feedback/MirrorCreateToast.tsx`` | `mirror-create-toast` |
| ``src/components/feedback/MirrorErrorToast.tsx`` | `mirror-cycle-error`, `mirror-duplicate-error`, `mirror-root-error` |
| ``src/components/feedback/OfflineBanner.tsx`` | `offline-banner` |
| ``src/components/feedback/PasteProgress.tsx`` | `paste-progress` |
| ``src/components/feedback/PermissionDeniedToast.tsx`` | `permission-denied-toast` |
| ``src/components/feedback/ProgressToast.tsx`` | `template-apply-progress`, `trash-empty-progress` |
| ``src/components/feedback/QuotaToast.tsx`` | `quota-toast`, `share-quota-toast` |
| ``src/components/feedback/RestoreToast.tsx`` | `trash-restore-error`, `trash-restore-toast` |
| ``src/components/feedback/SaveIndicator.tsx`` | `save-indicator` |
| ``src/components/feedback/TemplateApplyToast.tsx`` | `template-apply-toast` |
| ``src/components/items/BrokenMirrorBanner.tsx`` | `mirror-broken-banner` |
| ``src/components/items/BulletItem.tsx`` | `bullet-item`, `multiselect-row`, `template-applied-item`, `template-applied-todo` |
| ``src/components/items/ContextMenu.tsx`` | `context-menu`, `context-menu-disabled`, `context-menu-root` |
| ``src/components/items/ContextMenuMetadata.tsx`` | `metadata-changed`, `metadata-created`, `metadata-mirrored-from` |
| ``src/components/items/DatePicker.tsx`` | `date-badge`, `today-date-picker` |
| ``src/components/items/DeleteConfirmDialog.tsx`` | `delete-confirm-dialog` |
| ``src/components/items/DeleteMirrorWarningDialog.tsx`` | `delete-mirror-warning` |
| ``src/components/items/DividerRow.tsx`` | `divider-row` |
| ``src/components/items/ExpandToggle.tsx`` | `mirror-collapse-isolation`, `mirror-expand-toggle` |
| ``src/components/items/HighlightFlash.tsx`` | `template-first-item-highlight` |
| ``src/components/items/MirrorBadge.tsx`` | `mirror-badge`, `mirror-badge-tooltip` |
| ``src/components/items/MirrorContent.tsx`` | `mirror-content` |
| ``src/components/items/MirrorConvertButton.tsx`` | `mirror-convert-button` |
| ``src/components/items/MirrorDeleteButton.tsx`` | `mirror-delete-button` |
| ``src/components/items/MirrorPeerList.tsx`` | `mirror-see-them` |
| ``src/components/items/MirrorPendingBadge.tsx`` | `mirror-pending-state` |
| ``src/components/items/MirrorPicker.tsx`` | `mirror-cycle-error` |
| ``src/components/items/MirrorPickerDialog.tsx`` | `mirror-picker-dialog` |
| ``src/components/items/MirrorSourceLink.tsx`` | `mirror-source-link` |
| ``src/components/items/MoveToDialog.tsx`` | `move-error-toast`, `move-to-dialog` |
| ``src/components/items/NoteEditor.tsx`` | `note-editor` |
| ``src/components/items/PeerPositionLane.tsx`` | `mirror-position-isolation` |
| ``src/components/items/PendingBadge.tsx`` | `offline-pending-badge`, `template-pending-badge` |
| ``src/components/items/PermissionBadge.tsx`` | `permission-badge` |
| ``src/components/items/RemovedUserBadge.tsx`` | `removed-user-badge` |
| ``src/components/items/ShareStatusPill.tsx`` | `share-status-pill` |
| ``src/components/items/TodoCheckbox.tsx`` | `mirror-todo-checkbox`, `today-todo-checkbox`, `todo-checkbox` |
| ``src/components/items/TurnIntoSubmenu.tsx`` | `turn-into-board`, `turn-into-code`, `turn-into-dashboard`, `turn-into-divider`, `turn-into-h1`, `turn-into-h2`, `turn-into-h3`, `turn-into-paragraph`, `turn-into-quote`, `turn-into-todo` |
| ``src/components/items/ViewOnlyAffordance.tsx`` | `view-only-affordance` |
| ``src/components/items/actions/CompleteAction.tsx`` | `action-complete` |
| ``src/components/items/actions/CopyLinkAction.tsx`` | `action-copy-link` |
| ``src/components/items/actions/DuplicateAction.tsx`` | `action-duplicate`, `action-duplicate-disabled` |
| ``src/components/items/actions/MirrorAction.tsx`` | `action-mirror` |
| ``src/components/items/actions/SortAction.tsx`` | `action-sort` |
| ``src/components/items/actions/UploadAction.tsx`` | `upload-button`, `upload-error-toast` |
| ``src/components/layout/Breadcrumb.tsx`` | `breadcrumb` |
| ``src/components/layout/BreadcrumbOverflow.tsx`` | `breadcrumb-overflow` |
| ``src/components/layout/FavoriteButton.tsx`` | `favorite-button` |
| ``src/components/layout/HandbookPanel.tsx`` | `handbook-panel` |
| ``src/components/layout/NavBar.tsx`` | `navbar` |
| ``src/components/layout/NavBarBack.tsx`` | `navbar-back` |
| ``src/components/layout/NavBarForward.tsx`` | `navbar-forward` |
| ``src/components/layout/NavBarHome.tsx`` | `navbar-home` |
| ``src/components/layout/SettingsDropdown.tsx`` | `settings-dropdown` |
| ``src/components/layout/Sidebar.tsx`` | `sidebar-panel` |
| ``src/components/layout/SidebarBackdrop.tsx`` | `sidebar-backdrop` |
| ``src/components/layout/SidebarToggle.tsx`` | `sidebar-toggle` |
| ``src/components/layout/UsageQuota.tsx`` | `usage-quota`, `usage-quota-over` |
| ``src/components/multiselect/BulkActionBar.tsx`` | `multiselect-action-bar` |
| ``src/components/multiselect/BulkCompleteButton.tsx`` | `bulk-complete-button` |
| ``src/components/multiselect/BulkDeleteButton.tsx`` | `bulk-delete-button` |
| ``src/components/multiselect/BulkDeleteDialog.tsx`` | `bulk-delete-confirm` |
| ``src/components/multiselect/BulkIndentButton.tsx`` | `bulk-indent-button` |
| ``src/components/multiselect/BulkMoveDialog.tsx`` | `bulk-move-dialog` |
| ``src/components/multiselect/MirrorWarning.tsx`` | `multiselect-mirror-warning` |
| ``src/components/multiselect/PermissionDisabledTooltip.tsx`` | `bulk-permission-disabled` |
| ``src/components/multiselect/SelectionBadge.tsx`` | `multiselect-badge` |
| ``src/components/navbar/Breadcrumbs.tsx`` | `zoom-breadcrumb` |
| ``src/components/search/SearchOverlay.tsx`` | `search-overlay` |
| ``src/components/search/SearchRecent.tsx`` | `search-recent` |
| ``src/components/search/SearchResults.tsx`` | `search-result-row`, `search-results` |
| ``src/components/settings/PatCreateDialog.tsx`` | `pat-create-dialog` |
| ``src/components/settings/PatListPanel.tsx`` | `pat-list-panel` |
| ``src/components/settings/PatRevokeButton.tsx`` | `pat-revoke-button` |
| ``src/components/settings/ShortcutsGalleryLink.tsx`` | `shortcuts-gallery-link` |
| ``src/components/share/CascadeNotice.tsx`` | `cascade-notice` |
| ``src/components/share/CopyLinkButton.tsx`` | `copy-link-button` |
| ``src/components/share/PublicLinkToggle.tsx`` | `public-link-toggle` |
| ``src/components/share/PublicViewBanner.tsx`` | `public-view-banner` |
| ``src/components/share/ShareDialog.tsx`` | `share-dialog`, `share-grant`, `share-revoke` |
| ``src/components/share/ShareDialogTrigger.tsx`` | `share-dialog-trigger` |
| ``src/components/share/ShareEmailInput.tsx`` | `share-email-error`, `share-email-input` |
| ``src/components/share/ShareInviteButton.tsx`` | `share-invite-button` |
| ``src/components/share/SharePermissionDropdown.tsx`` | `share-permission-dropdown` |
| ``src/components/share/SharePublicToggle.tsx`` | `share-public-toggle` |
| ``src/components/share/ShareRemoveButton.tsx`` | `share-remove-button` |
| ``src/components/share/SharedUsersList.tsx`` | `share-search`, `share-user-row` |
| ``src/components/share/TransferOwnershipButton.tsx`` | `transfer-ownership-button` |
| ``src/components/shared/LoadMoreSentinel.tsx`` | `today-load-more` |
| ``src/components/sync/SaveStatusBadge.tsx`` | `save-status-badge` |
| ``src/components/tags/TagChip.tsx`` | `tag-chip` |
| ``src/components/templates/TemplateDeleteDialog.tsx`` | `template-delete-confirm` |
| ``src/components/templates/TemplateDuplicateButton.tsx`` | `template-duplicate-button` |
| ``src/components/templates/TemplatePicker.tsx`` | `template-picker` |
| ``src/components/templates/TemplatePickerRow.tsx`` | `template-picker-row` |
| ``src/components/templates/TemplatePreviewPanel.tsx`` | `template-preview-panel` |
| ``src/components/templates/TemplateUpdateDialog.tsx`` | `template-update-confirm` |
| ``src/components/templates/TemplatesEmptyState.tsx`` | `template-empty-state` |
| ``src/components/templates/UpdateTemplateAction.tsx`` | `template-update-action` |
| ``src/components/today/BreadcrumbGroup.tsx`` | `today-breadcrumb-group` |
| ``src/components/today/OverdueSection.tsx`` | `today-overdue-section` |
| ``src/components/today/TodayEmptyState.tsx`` | `today-empty-state` |
| ``src/components/today/TodayItemRow.tsx`` | `today-item-content`, `today-item-row` |
| ``src/components/trash/DeletePermanentlyDialog.tsx`` | `trash-delete-confirm`, `trash-delete-confirm-no`, `trash-delete-confirm-yes` |
| ``src/components/trash/EmptyTrashButton.tsx`` | `trash-empty-button` |
| ``src/components/trash/EmptyTrashDialog.tsx`` | `trash-empty-confirm`, `trash-empty-confirm-yes` |
| ``src/components/trash/PendingBadge.tsx`` | `trash-pending-state` |
| ``src/components/trash/RestoreButton.tsx`` | `trash-restore-button` |
| ``src/components/trash/TrashEmptyState.tsx`` | `trash-empty-state` |
| ``src/components/trash/TrashRestoreButton.tsx`` | `trash-restore-button` |
| ``src/components/trash/TrashRow.tsx`` | `trash-expiry-label`, `trash-row` |
| ``src/components/tree/BulletDot.tsx`` | `bullet-dot`, `bullet-dot-empty` |
| ``src/components/tree/ChildCountBadge.tsx`` | `child-count-badge` |
| ``src/components/tree/ContextMenuTrigger.tsx`` | `context-menu-trigger` |
| ``src/components/tree/DragLayer.tsx`` | `dnd-layer` |
| ``src/components/tree/ExpandToggle.tsx`` | `expand-toggle` |
| ``src/components/tree/HoverActions.tsx`` | `hover-actions` |
| ``src/components/tree/ItemRow.tsx`` | `item-row` |
| ``src/components/tree/RootContainer.tsx`` | `root-item` |
| ``src/components/workspace/WorkspaceInviteButton.tsx`` | `workspace-invite-button` |
| ``src/components/zoom/ZoomBreadcrumb.tsx`` | `zoom-breadcrumb-virtual` |
| ``src/hooks/useKeyboardActions.ts`` | `keyboard-action-coverage` |
| ``src/lib/hotkeys.ts`` | `— (module)` |
| ``src/lib/interactions/useBeforeUnload.ts`` | `unsaved-warning` |
| ``src/lib/interactions/useGlobalKeys.ts`` | `— (hook)` |
| ``src/lib/mirror-cycle.ts`` | `cycle-clean-target`, `cycle-self-parent` |
| ``src/lib/perf/AppReadyMarker.ts`` | `app-ready-marker` |
| ``src/lib/sync/MirrorSyncBroadcaster.ts`` | `concurrency-mirror-sync` |
| ``src/lib/sync/OfflineReplayQueue.ts`` | `concurrency-offline-replay` |
| ``src/lib/sync/StaleTabDetector.ts`` | `concurrency-stale-tab` |
| ``src/lib/sync/peerGroupPropagator.ts`` | `n/a (pure module)` |
| ``src/pages/SettingsTemplates.tsx`` | `templates-settings-list` |
| ``src/pages/Today.tsx`` | `today-view-root` |
| ``src/pages/Trash.tsx`` | `trash-view-root` |
| ``src/server/concurrency/conflictLog.ts`` | `concurrency-conflict-log` |
| ``src/server/concurrency/fieldLevelLWW.ts`` | `concurrency-bulk-vs-single`, `concurrency-split-state` |
| ``src/server/concurrency/idempotent.ts`` | `concurrency-idempotent` |
| ``src/server/concurrency/monotonicTs.ts`` | `concurrency-monotonic-ts` |
| ``src/server/concurrency/serverClock.ts`` | `concurrency-server-clock` |
| ``src/server/concurrency/tieBreak.ts`` | `concurrency-tiebreak` |
| ``src/state/lwwResolver.ts`` | `mirror-lww-tiebreak` |
| ``src/state/mirrorCanonicalPromotionSaga.ts`` | `mirror-canonical-promotion` |
| ``src/state/mirrorDetachSaga.ts`` | `mirror-detach-survivors` |
| ``src/state/mirrorDissolveSaga.ts`` | `mirror-singleton-dissolve` |
| ``src/state/mirrorGroupStore.ts`` | `mirror-content-sync` |
| ``src/stores/useOfflineQueueStore.ts`` | `n/a (pure store)` |
| ``src/stores/useZoomStore.ts`` | `n/a (pure store)` |
| ``wp-plugin/Repository/CycleCheck.php`` | `cycle-mirror-rejected`, `cycle-move-rejected` |
| ``wp-plugin/Repository/sql/cycle-check.sql`` | `cycle-hygiene-drift` |
| ``wp-plugin/Sync/BackpressureGuard.php`` | `sse-cursor-overflow` |
| ``wp-plugin/Sync/EventFramer.php`` | `sse-event-frame` |
| ``wp-plugin/Sync/PollEndpoint.php`` | `sse-poll-fallback` |
| ``wp-plugin/Sync/ResumeBuffer.php`` | `sse-resume-replay` |
| ``wp-plugin/Sync/SseEndpoint.php`` | `sse-endpoint-handshake` |
| ``wp-plugin/Sync/TransactionalEmitter.php`` | `sse-emission-atomic` |
| ``wp-plugin/src/ActivityFeed/IntegrationSink.php`` | `—` |
| ``wp-plugin/src/Auth/PersonalAccessTokenAuth.php`` | `—` |
| ``wp-plugin/src/Cron/ReapTrash.php`` | `n/a (server-side)` |
| ``wp-plugin/src/Cron/ReaperRunsLogger.php`` | `n/a (server-side)` |
| ``wp-plugin/src/Middleware/IdempotencyKey.php`` | `—` |
| ``wp-plugin/src/Middleware/RateLimitPerPat.php`` | `—` |
| ``wp-plugin/src/Rest/Integrations/CommentsController.php`` | `—` |
| ``wp-plugin/src/Rest/Integrations/ItemsController.php`` | `—` |
| ``wp-plugin/src/Search/BucketStrategy.php`` | `n/a (server-side)` |
| ``wp-plugin/src/Search/Ranker.php`` | `n/a (server-side)` |
| ``wp-plugin/src/Templates/Instantiate.php`` | `n/a (server-side)` |
| ``wp-plugin/src/Templates/PayloadRepository.php`` | `n/a (server-side)` |

---

## Notes

- Component paths marked here may be **planned** (not yet on disk). The contract is the spec; implementation order follows the contract.
- Re-run `node scripts/spec-hygiene/07-extract-contract-map.mjs` after any feature-file edit; it will fail if a Component Contract row references an undefined acceptance test ID.
