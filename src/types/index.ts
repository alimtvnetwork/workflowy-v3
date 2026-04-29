/**
 * Branded ID types — runtime-agnostic, prevent accidental string mixing.
 *
 * Per `mem://constraints/backend-runtime-deferred` and audit finding F-06,
 * the concrete shape of an owner identifier (UUID for Supabase, int for
 * WordPress, etc.) is decided by the chosen backend. Branding keeps call
 * sites type-safe today and makes the eventual concrete type a one-line
 * swap (replace `string` with the runtime-specific primitive).
 *
 * Usage:
 *   const id = "abc-123" as OwnerId;       // explicit cast at boundary
 *   function fetchUser(id: OwnerId) {...}  // accepts only branded values
 *   fetchUser("plain string");             // ❌ compile error
 */
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

/** Item primary key. Replace `string` with backend type when chosen. */
export type ItemId = Brand<string, "ItemId">;

/** User / owner identifier. Replace `string` with backend type when chosen. */
export type OwnerId = Brand<string, "OwnerId">;

/**
 * Fractional-index sort key — base-62, lexicographically ordered STRING.
 *
 * SSOT: ADR-0016 (`spec/00-adrs/0016-fractional-index-sort-order.md`) +
 * core memory line 11: "SortOrder is a fractional-index STRING (base-62,
 * lexicographic), never a number."
 *
 * Why a string, not a number:
 *   - O(1) midpoint inserts: `between("a","b") === "aU"` (no sibling rewrites).
 *   - Lexicographic compare matches insertion intent across clients.
 *   - Survives offline-queue replay (ADR-0023) without renumbering races.
 *
 * Branded so a raw string cannot be passed where a fractional key is required.
 * The `between(a,b)` algorithm + alphabet live in a future `src/lib/sortKey.ts`
 * (lands with F-IMPL-03 reorder/DnD work); the type alone is shipped now to
 * unblock the loader/queue contract per audit-v8 finding F-IMPL-AUD-02.
 */
export type SortKey = Brand<string, "SortKey">;

/**
 * All possible item types in the outliner.
 *
 * SSOT: `spec/20-enums-index.md` §3.5 + `spec/32-ui-design/02-state-and-data/03-data-types.md`.
 * Lowercase per DB column convention. 12 distinct types.
 *
 * NOTE: `dashboard` is a VIEW, not an item type — do not add it here.
 */
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
  | "code"
  | "divider";

/** Core item as stored in the database. */
export interface Item {
  readonly id: ItemId;
  readonly parentId: ItemId | null;
  readonly content: string;
  readonly richContent: string | null;
  readonly note: string | null;
  readonly itemType: ItemType;
  readonly sortOrder: SortKey;
  readonly isCompleted: boolean;
  readonly isCollapsed: boolean;
  readonly dateAssigned: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly ownerId: OwnerId;
}

/** Zoom navigation history entry. */
export interface ZoomState {
  readonly currentItemId: ItemId | null;
  readonly history: readonly ItemId[];
  readonly historyIndex: number;
}

/** Drop position during drag operations. */
export type DropPosition = "before" | "after" | "child";

/** Drag state during reorder operations. */
export interface DragState {
  readonly sourceItemId: ItemId;
  readonly targetItemId: ItemId | null;
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
  readonly itemId: ItemId;
  readonly beforeState: Partial<Item> | null;
  readonly afterState: Partial<Item> | null;
  readonly timestamp: string;
}

/** Search result with match highlighting. */
export interface SearchResult {
  readonly itemId: ItemId;
  readonly content: string;
  readonly note: string | null;
  readonly breadcrumbPath: readonly string[];
  readonly matchRanges: readonly [number, number][];
}

/**
 * Construct an OwnerId from a raw string.
 *
 * Use only at trust boundaries (DB rows, auth session, URL params).
 * Throws on empty input — IDs must be non-empty.
 */
export function asOwnerId(raw: string): OwnerId {
  if (raw.length === 0) throw new Error("OwnerId cannot be empty");
  return raw as OwnerId;
}

/**
 * Construct an ItemId from a raw string.
 * Use only at trust boundaries.
 */
export function asItemId(raw: string): ItemId {
  if (raw.length === 0) throw new Error("ItemId cannot be empty");
  return raw as ItemId;
}

/**
 * Construct a SortKey from a raw fractional-index string.
 *
 * Use only at trust boundaries (DB rows, API envelope decode, queue replay).
 * Throws on empty input AND on any character outside the base-62 alphabet
 * `[0-9A-Za-z]` — the alphabet is fixed by ADR-0016 and out-of-band keys
 * would break lexicographic compare across clients.
 */
const SORT_KEY_PATTERN = /^[0-9A-Za-z]+$/;

export function asSortKey(raw: string): SortKey {
  if (raw.length === 0) throw new Error("SortKey cannot be empty");
  if (!SORT_KEY_PATTERN.test(raw)) {
    throw new Error("SortKey must be base-62 [0-9A-Za-z] per ADR-0016");
  }
  return raw as SortKey;
}
