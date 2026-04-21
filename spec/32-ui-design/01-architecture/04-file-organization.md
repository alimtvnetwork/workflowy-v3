# File Organization

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

The source code is organized into these directories:

| Directory | Purpose | Key Contents |
|-----------|---------|-------------|
| components/layout/ | App structure | AppLayout, NavBar (left + right), Sidebar, ContentArea, ProtectedRoute |
| components/outliner/ | Core bullet list | BulletList, BulletItem, BulletDot, ContentEditor, NoteEditor, AddButton, ExpandToggle, ChildCountBadge, DateBadge, FileChip, MirrorBadge, SelectionCountBadge, BulkActionBar |
| components/board/ | Board/Kanban view | BoardView, BoardColumn, BoardCard |
| components/menus/ | Menus and toolbars | SettingsMenu, ItemContextMenu, TurnIntoSubmenu, TextFormattingToolbar, ColorPicker, TagPicker |
| components/panels/ | Side panels | CommentPanel, CommentThread, CommentInput |
| components/navigation/ | Navigation features | Breadcrumbs, SearchOverlay, SearchResult, CommandPalette, LocationPicker |
| components/dialogs/ | Modal dialogs | ShareDialog, DatePickerDialog, TemplateSaveDialog, TemplatePicker, ExportDialog, DeleteConfirmDialog |
| components/auth/ | Authentication UI | LoginForm, SignupForm, ResetPasswordForm |
| components/ui/ | shadcn/ui base components | Button, DropdownMenu, Dialog, Popover, Tooltip, Sheet, ScrollArea, Separator, Badge, Avatar, Checkbox, Command, Toast, Toaster |
| hooks/ | Custom React hooks | All hooks listed in §4.3 |
| lib/ | Utilities | General utils, database client, constants, item-specific helper functions |
| types/ | TypeScript definitions | All interfaces and type definitions |
| pages/ | Page components | Home, ItemView, Login, Signup, ResetPassword, Trash, Settings, NotFound |
| contexts/ | React contexts | Authentication context/provider |

---
