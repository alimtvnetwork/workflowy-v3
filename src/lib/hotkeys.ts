/**
 * Hotkey Registry — Single Source of Truth (F-07)
 *
 * Declarative catalog of every keyboard shortcut in WorkFlowy.
 * Keys mirror `spec/31-app/01-features/05-interactions.md` and
 * `spec/32-ui-design/06-workflowy-ui/01-navbar/04-keyboard-shortcuts.md`.
 *
 * SSOT rule: handlers reference shortcuts by `HotkeyId`, never inline
 * key strings. Adding a binding means appending one entry here.
 *
 * Strict TS: zero `any`, max 3 params per fn, max 15-line bodies,
 * positive guard clauses only. See `mem://constraints/coding-guidelines`.
 */

/** Stable identifier for a single binding. PascalCase per SSOT. */
export type HotkeyId =
  | "ItemSplit"
  | "ItemNewSibling"
  | "ItemIndent"
  | "ItemOutdent"
  | "ItemMoveUp"
  | "ItemMoveDown"
  | "FocusPrev"
  | "FocusNext"
  | "ToggleComplete"
  | "ToggleExpand"
  | "ZoomIn"
  | "ZoomOut"
  | "OpenSearch"
  | "CloseOverlay"
  | "Undo"
  | "Redo";

/** Logical scope where a hotkey is active. */
export type HotkeyScope = "global" | "itemRow" | "searchOverlay";

/** Modifier key combo. `mod` = ⌘ on macOS, Ctrl elsewhere. */
export interface KeyCombo {
  readonly mod?: boolean;
  readonly shift?: boolean;
  readonly alt?: boolean;
  readonly key: string;
}

/**
 * Runtime context passed to a binding's `when` predicate.
 * Kept intentionally narrow — extend only when a binding needs more.
 */
export interface WhenContext {
  readonly itemContentIsEmpty?: boolean;
  readonly caretAtEnd?: boolean;
  readonly hasSelection?: boolean;
}

/** Predicate gating a binding within its (scope, combo) cell. */
export type WhenPredicate = (ctx: WhenContext) => boolean;

/** Single binding entry. */
export interface HotkeyBinding {
  readonly id: HotkeyId;
  readonly combo: KeyCombo;
  readonly scope: HotkeyScope;
  readonly description: string;
  readonly specRef: string;
  /**
   * Optional discriminator. When two bindings share the same (scope, combo),
   * each MUST declare a `when` predicate, and the predicates MUST be mutually
   * exclusive for any given `WhenContext`. Enforced by uniqueness test.
   */
  readonly when?: WhenPredicate;
}

/**
 * Registry. Ordered by scope then by spec line for review ergonomics.
 * Update this array — never hard-code keys in components.
 */
export const HOTKEYS: ReadonlyArray<HotkeyBinding> = [
  {
    id: "ItemSplit",
    combo: { key: "Enter" },
    scope: "itemRow",
    description: "Split item at caret; text after caret becomes new sibling",
    specRef: "spec/31-app/01-features/05-interactions.md#L24",
    when: (ctx) => ctx.itemContentIsEmpty === false,
  },
  {
    id: "ItemNewSibling",
    combo: { key: "Enter" },
    scope: "itemRow",
    description: "Create empty sibling below when item is empty",
    specRef: "spec/31-app/01-features/05-interactions.md#L25",
    when: (ctx) => ctx.itemContentIsEmpty === true,
  },
  {
    id: "ItemIndent",
    combo: { key: "Tab" },
    scope: "itemRow",
    description: "Indent item under previous sibling",
    specRef: "spec/31-app/01-features/05-interactions.md#L27",
  },
  {
    id: "ItemOutdent",
    combo: { shift: true, key: "Tab" },
    scope: "itemRow",
    description: "Outdent item to parent level",
    specRef: "spec/31-app/01-features/05-interactions.md#L28",
  },
  {
    id: "ItemMoveUp",
    combo: { mod: true, key: "ArrowUp" },
    scope: "itemRow",
    description: "Swap item with sibling above",
    specRef: "spec/31-app/01-features/05-interactions.md#L29",
  },
  {
    id: "ItemMoveDown",
    combo: { mod: true, key: "ArrowDown" },
    scope: "itemRow",
    description: "Swap item with sibling below",
    specRef: "spec/31-app/01-features/05-interactions.md#L30",
  },
  {
    id: "FocusPrev",
    combo: { key: "ArrowUp" },
    scope: "itemRow",
    description: "Move focus to previous visible item",
    specRef: "spec/31-app/01-features/05-interactions.md#L31",
  },
  {
    id: "FocusNext",
    combo: { key: "ArrowDown" },
    scope: "itemRow",
    description: "Move focus to next visible item",
    specRef: "spec/31-app/01-features/05-interactions.md#L32",
  },
  {
    id: "ToggleComplete",
    combo: { mod: true, key: "Enter" },
    scope: "itemRow",
    description: "Toggle item completion state",
    specRef: "spec/31-app/01-features/05-interactions.md#L37",
  },
  {
    id: "ToggleExpand",
    combo: { mod: true, key: "." },
    scope: "itemRow",
    description: "Toggle expand/collapse of item children",
    specRef: "spec/31-app/01-features/05-interactions.md",
  },
  {
    id: "ZoomIn",
    combo: { mod: true, shift: true, key: "." },
    scope: "itemRow",
    description: "Zoom into focused item",
    specRef: "spec/31-app/01-features/05-interactions.md",
  },
  {
    id: "ZoomOut",
    combo: { mod: true, shift: true, key: "," },
    scope: "global",
    description: "Zoom out one level",
    specRef: "spec/31-app/01-features/05-interactions.md",
  },
  {
    id: "OpenSearch",
    combo: { mod: true, key: "k" },
    scope: "global",
    description: "Open full-screen search overlay",
    specRef: "spec/32-ui-design/06-workflowy-ui/02-search/08-keyboard-shortcuts.md",
  },
  {
    id: "CloseOverlay",
    combo: { key: "Escape" },
    scope: "searchOverlay",
    description: "Close search overlay or modal",
    specRef: "spec/31-app/01-features/05-interactions.md#L56",
  },
  {
    id: "Undo",
    combo: { mod: true, key: "z" },
    scope: "global",
    description: "Undo last action",
    specRef: "spec/31-app/01-features/05-interactions.md",
  },
  {
    id: "Redo",
    combo: { mod: true, shift: true, key: "z" },
    scope: "global",
    description: "Redo last undone action",
    specRef: "spec/31-app/01-features/05-interactions.md",
  },
];

/** Lookup by id. Throws on unknown id — fail loud at call site. */
export function getHotkey(id: HotkeyId): HotkeyBinding {
  const found = HOTKEYS.find((h) => h.id === id);
  if (found) return found;
  throw new Error(`Unknown hotkey id: ${id}`);
}

/** Format combo as display string (e.g. "⌘⇧K"). Pure presentation. */
export function formatCombo(combo: KeyCombo, isMac: boolean): string {
  const parts: string[] = [];
  if (combo.mod) parts.push(isMac ? "⌘" : "Ctrl");
  if (combo.shift) parts.push(isMac ? "⇧" : "Shift");
  if (combo.alt) parts.push(isMac ? "⌥" : "Alt");
  parts.push(combo.key);
  return parts.join(isMac ? "" : "+");
}

/**
 * Match a KeyboardEvent against a combo. Pure, no side effects.
 * Use in event handlers: `if (matches(e, getHotkey("ItemIndent").combo)) ...`
 */
export function matches(event: KeyboardEvent, combo: KeyCombo): boolean {
  const modPressed = event.metaKey || event.ctrlKey;
  if (Boolean(combo.mod) !== modPressed) return false;
  if (Boolean(combo.shift) !== event.shiftKey) return false;
  if (Boolean(combo.alt) !== event.altKey) return false;
  return event.key === combo.key;
}

/**
 * Resolve which binding fires for this event in this scope+context.
 * Returns `null` when none match. When multiple structural matches exist
 * (same scope+combo), `when` predicates MUST disambiguate to exactly one.
 */
export function resolveHotkey(
  event: KeyboardEvent,
  scope: HotkeyScope,
  ctx: WhenContext,
): HotkeyBinding | null {
  const candidates = HOTKEYS.filter(
    (h) => h.scope === scope && matches(event, h.combo),
  );
  if (candidates.length === 0) return null;
  const gated = candidates.filter((h) => (h.when ? h.when(ctx) : true));
  if (gated.length === 1) return gated[0];
  if (gated.length === 0) return null;
  throw new Error(
    `Ambiguous hotkey resolution in scope "${scope}": ${gated.map((g) => g.id).join(", ")}`,
  );
}

