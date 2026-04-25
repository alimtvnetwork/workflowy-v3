/**
 * App-wide constants. Keep this file flat — no logic, no imports.
 *
 * SSOT for numeric / string invariants referenced across the codebase
 * and the spec. Each constant cites its spec source so future changes
 * stay traceable.
 */

export const APP_NAME = "WorkFlowy";

/** Autosave debounce window. Spec: spec/31-app/01-features/14-concurrency-and-sync.md */
export const DEBOUNCE_SAVE_MS = 1500;

/** Network retry cap. Spec: spec/31-app/01-features/14-concurrency-and-sync.md */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Hard cap on items rendered in a single outliner view. Drives
 * virtualization decisions and pagination boundaries.
 *
 * SSOT: core memory rule "250-item limit per view"
 *       (`mem://architecture/data-model`).
 * Spec: spec/31-app/01-features/04-page-content-area.md (virtualization).
 */
export const MAX_ITEMS_PER_VIEW = 250;

/* ── Layout (px) ──────────────────────────────────────────────────── */

export const INDENT_PER_LEVEL_PX = 24;
export const BULLET_DOT_SIZE_PX = 6;
export const BULLET_CLICK_TARGET_PX = 20;
export const NAVBAR_HEIGHT_PX = 48;
export const SIDEBAR_WIDTH_PX = 280;
export const BOARD_COLUMN_WIDTH_PX = 280;
