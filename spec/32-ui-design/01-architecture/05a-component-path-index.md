# Component-Path Index

> **Split from** [`05-component-contract-map.md`](./05-component-contract-map.md) on 2026-04-25 to keep both files under the 400-line guideline (closes F-08).
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Component-Path Index

Sorted alphabetically. Each row is one planned/implemented component file.

| Component path | `data-testid`(s) |
|---------------|-----------------|
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
| ``src/components/items/ExpandToggle.tsx`` | `mirror-expand-toggle` |
| ``src/components/items/HighlightFlash.tsx`` | `template-first-item-highlight` |
| ``src/components/items/MirrorBadge.tsx`` | `mirror-badge`, `mirror-badge-tooltip` |
| ``src/components/items/MirrorContent.tsx`` | `mirror-content` |
| ``src/components/items/MirrorConvertButton.tsx`` | `mirror-convert-button` |
| ``src/components/items/MirrorDeleteButton.tsx`` | `mirror-delete-button` |
| ``src/components/items/MirrorPendingBadge.tsx`` | `mirror-pending-state` |
| ``src/components/items/MirrorPickerDialog.tsx`` | `mirror-picker-dialog` |
| ``src/components/items/MirrorSourceLink.tsx`` | `mirror-source-link` |
| ``src/components/items/MoveToDialog.tsx`` | `move-error-toast`, `move-to-dialog` |
| ``src/components/items/NoteEditor.tsx`` | `note-editor` |
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
| ``src/components/share/CascadeNotice.tsx`` | `cascade-notice` |
| ``src/components/share/CopyLinkButton.tsx`` | `copy-link-button` |
| ``src/components/share/PublicLinkToggle.tsx`` | `public-link-toggle` |
| ``src/components/share/PublicViewBanner.tsx`` | `public-view-banner` |
| ``src/components/share/ShareDialog.tsx`` | `share-dialog` |
| ``src/components/share/ShareDialogTrigger.tsx`` | `share-dialog-trigger` |
| ``src/components/share/ShareEmailInput.tsx`` | `share-email-error`, `share-email-input` |
| ``src/components/share/ShareInviteButton.tsx`` | `share-invite-button` |
| ``src/components/share/SharePermissionDropdown.tsx`` | `share-permission-dropdown` |
| ``src/components/share/SharePublicToggle.tsx`` | `share-public-toggle` |
| ``src/components/share/ShareRemoveButton.tsx`` | `share-remove-button` |
| ``src/components/share/SharedUsersList.tsx`` | `share-search`, `share-user-row` |
| ``src/components/share/TransferOwnershipButton.tsx`` | `transfer-ownership-button` |
| ``src/components/shared/LoadMoreSentinel.tsx`` | `today-load-more` |
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
| ``src/hooks/useKeyboardActions.ts`` | `keyboard-action-coverage` |
| ``src/lib/interactions/useBeforeUnload.ts`` | `unsaved-warning` |
| ``src/lib/interactions/useGlobalKeys.ts`` | `— (hook)` |
| ``src/lib/perf/AppReadyMarker.ts`` | `app-ready-marker` |
| ``src/lib/sync/MirrorSyncBroadcaster.ts`` | `concurrency-mirror-sync` |
| ``src/lib/sync/OfflineReplayQueue.ts`` | `concurrency-offline-replay` |
| ``src/lib/sync/StaleTabDetector.ts`` | `concurrency-stale-tab` |
| ``src/pages/SettingsTemplates.tsx`` | `templates-settings-list` |
| ``src/pages/Today.tsx`` | `today-view-root` |
| ``src/pages/Trash.tsx`` | `trash-view-root` |
| ``src/server/concurrency/conflictLog.ts`` | `concurrency-conflict-log` |
| ``src/server/concurrency/fieldLevelLWW.ts`` | `concurrency-bulk-vs-single`, `concurrency-split-state` |
| ``src/server/concurrency/idempotent.ts`` | `concurrency-idempotent` |
| ``src/server/concurrency/monotonicTs.ts`` | `concurrency-monotonic-ts` |
| ``src/server/concurrency/serverClock.ts`` | `concurrency-server-clock` |
| ``src/server/concurrency/tieBreak.ts`` | `concurrency-tiebreak` |

---

## Notes

- Component paths marked here may be **planned** (not yet on disk). The contract is the spec; implementation order follows the contract.
- Re-run `node scripts/spec-hygiene/07-extract-contract-map.mjs` after any feature-file edit; it will fail if a Component Contract row references an undefined acceptance test ID.
