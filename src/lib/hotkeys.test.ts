import { describe, it, expect } from "vitest";
import {
  HOTKEYS,
  getHotkey,
  formatCombo,
  matches,
  type HotkeyId,
  type KeyCombo,
} from "./hotkeys";

/**
 * Tests for the hotkey SSOT registry.
 *
 * These lock the public contract of `src/lib/hotkeys.ts`:
 *   - registry shape (count + ids)
 *   - lookup semantics (throw on unknown)
 *   - formatting (mac vs non-mac)
 *   - event matching (mod / shift / alt / key)
 *
 * Adding a binding => update this snapshot count and add the id.
 */

const EXPECTED_IDS: ReadonlyArray<HotkeyId> = [
  "ItemSplit",
  "ItemNewSibling",
  "ItemIndent",
  "ItemOutdent",
  "ItemMoveUp",
  "ItemMoveDown",
  "FocusPrev",
  "FocusNext",
  "ToggleComplete",
  "ToggleExpand",
  "ZoomIn",
  "ZoomOut",
  "OpenSearch",
  "CloseOverlay",
  "Undo",
  "Redo",
];

function makeEvent(init: Partial<KeyboardEvent> & { key: string }): KeyboardEvent {
  return new KeyboardEvent("keydown", {
    key: init.key,
    metaKey: Boolean(init.metaKey),
    ctrlKey: Boolean(init.ctrlKey),
    shiftKey: Boolean(init.shiftKey),
    altKey: Boolean(init.altKey),
  });
}

describe("HOTKEYS registry", () => {
  it("contains exactly the expected ids", () => {
    const ids = HOTKEYS.map((h) => h.id);
    expect(ids).toEqual(EXPECTED_IDS);
  });

  it("every binding has a non-empty description and specRef", () => {
    for (const h of HOTKEYS) {
      expect(h.description.length).toBeGreaterThan(0);
      expect(h.specRef.startsWith("spec/")).toBe(true);
    }
  });

  it("every binding has a key", () => {
    for (const h of HOTKEYS) {
      expect(h.combo.key.length).toBeGreaterThan(0);
    }
  });
});

describe("getHotkey()", () => {
  it("returns the binding for a known id", () => {
    const hk = getHotkey("ItemIndent");
    expect(hk.combo.key).toBe("Tab");
    expect(hk.combo.shift).toBeUndefined();
  });

  it("throws on unknown id", () => {
    expect(() => getHotkey("Bogus" as HotkeyId)).toThrow(/Unknown hotkey id/);
  });
});

describe("formatCombo()", () => {
  it("renders mac glyphs without separators", () => {
    const combo: KeyCombo = { mod: true, shift: true, key: "K" };
    expect(formatCombo(combo, true)).toBe("⌘⇧K");
  });

  it("renders non-mac with plus separators", () => {
    const combo: KeyCombo = { mod: true, shift: true, key: "K" };
    expect(formatCombo(combo, false)).toBe("Ctrl+Shift+K");
  });

  it("renders alt modifier", () => {
    const combo: KeyCombo = { alt: true, key: "F" };
    expect(formatCombo(combo, true)).toBe("⌥F");
    expect(formatCombo(combo, false)).toBe("Alt+F");
  });

  it("renders bare key with no modifiers", () => {
    expect(formatCombo({ key: "Escape" }, false)).toBe("Escape");
  });
});

describe("matches()", () => {
  it("matches mod via metaKey on mac-style events", () => {
    const combo = getHotkey("OpenSearch").combo;
    expect(matches(makeEvent({ key: "k", metaKey: true }), combo)).toBe(true);
  });

  it("matches mod via ctrlKey on non-mac events", () => {
    const combo = getHotkey("OpenSearch").combo;
    expect(matches(makeEvent({ key: "k", ctrlKey: true }), combo)).toBe(true);
  });

  it("rejects when mod missing", () => {
    const combo = getHotkey("OpenSearch").combo;
    expect(matches(makeEvent({ key: "k" }), combo)).toBe(false);
  });

  it("rejects when shift state differs", () => {
    const combo = getHotkey("ItemOutdent").combo; // shift+Tab
    expect(matches(makeEvent({ key: "Tab" }), combo)).toBe(false);
    expect(matches(makeEvent({ key: "Tab", shiftKey: true }), combo)).toBe(true);
  });

  it("rejects on key mismatch", () => {
    const combo = getHotkey("ItemIndent").combo;
    expect(matches(makeEvent({ key: "Enter" }), combo)).toBe(false);
  });

  it("matches Redo (mod+shift+z) and rejects bare Undo combo", () => {
    const redo = getHotkey("Redo").combo;
    const undo = getHotkey("Undo").combo;
    const ev = makeEvent({ key: "z", metaKey: true, shiftKey: true });
    expect(matches(ev, redo)).toBe(true);
    expect(matches(ev, undo)).toBe(false);
  });
});
