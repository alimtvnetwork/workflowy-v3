/** All possible item types in the outliner. */
export type ItemType =
  | "bullet"
  | "h1"
  | "h2"
  | "h3"
  | "paragraph"
  | "todo"
  | "numbered"
  | "board"
  | "dashboard"
  | "quote"
  | "codeBlock"
  | "divider";

/** Core item as stored in the database. */
export interface Item {
  readonly id: string;
  readonly parentId: string | null;
  readonly content: string;
  readonly richContent: string | null;
  readonly note: string | null;
  readonly itemType: ItemType;
  readonly sortOrder: number;
  readonly isCompleted: boolean;
  readonly isCollapsed: boolean;
  readonly dateAssigned: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly userId: string;
}

/** Zoom navigation history entry. */
export interface ZoomState {
  readonly currentItemId: string | null;
  readonly history: readonly string[];
  readonly historyIndex: number;
}

/** Drop position during drag operations. */
export type DropPosition = "before" | "after" | "child";

/** Drag state during reorder operations. */
export interface DragState {
  readonly sourceItemId: string;
  readonly targetItemId: string | null;
  readonly dropPosition: DropPosition | null;
}

/** Autosave status indicator. */
export interface SaveStatus {
  readonly isSaving: boolean;
  readonly lastSavedAt: string | null;
  readonly pendingChangeCount: number;
  readonly errorMessage: string | null;
}

/** Undo/redo action type. */
export type UndoActionType =
  | "create"
  | "update"
  | "delete"
  | "move"
  | "reorder";

/** A single undo/redo entry. */
export interface UndoAction {
  readonly type: UndoActionType;
  readonly itemId: string;
  readonly beforeState: Partial<Item> | null;
  readonly afterState: Partial<Item> | null;
  readonly timestamp: string;
}

/** Search result with match highlighting. */
export interface SearchResult {
  readonly itemId: string;
  readonly content: string;
  readonly note: string | null;
  readonly breadcrumbPath: readonly string[];
  readonly matchRanges: readonly [number, number][];
}
