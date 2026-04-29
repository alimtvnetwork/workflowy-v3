import { describe, it, expect } from "vitest";
import {
  HOTKEYS,
  getHotkey,
  formatCombo,
  matches,
  resolveHotkey,
  type HotkeyId,
  type KeyCombo,
  type WhenContext,
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

/**
 * Hygiene gate: within a single (scope, combo) cell, every binding MUST
 * carry a `when` predicate, AND those predicates MUST be mutually exclusive
 * across a representative sample of `WhenContext` shapes. This guards
 * against the AUD-05 regression where two `Enter` bindings collided in the
 * `itemRow` scope with no discriminator.
 */
describe("HOTKEYS uniqueness within (scope, combo)", () => {
  function comboKey(c: KeyCombo): string {
    return [c.mod ? "m" : "", c.shift ? "s" : "", c.alt ? "a" : "", c.key].join("|");
  }

  it("collisions exist only when every binding declares `when`", () => {
    const buckets = new Map<string, typeof HOTKEYS[number][]>();
    for (const h of HOTKEYS) {
      const k = `${h.scope}::${comboKey(h.combo)}`;
      const arr = buckets.get(k) ?? [];
      arr.push(h);
      buckets.set(k, arr);
    }
    for (const [, group] of buckets) {
      if (group.length === 1) continue;
      for (const h of group) {
        expect(h.when, `${h.id} shares (scope,combo) and must declare when()`).toBeTypeOf("function");
      }
    }
  });

  it("Enter@itemRow predicates are mutually exclusive over sample contexts", () => {
    const samples: WhenContext[] = [
      { itemContentIsEmpty: true },
      { itemContentIsEmpty: false },
    ];
    const enterRow = HOTKEYS.filter((h) => h.scope === "itemRow" && h.combo.key === "Enter");
    expect(enterRow.length).toBeGreaterThanOrEqual(2);
    for (const ctx of samples) {
      const firing = enterRow.filter((h) => (h.when ? h.when(ctx) : true));
      expect(firing.length, `ctx=${JSON.stringify(ctx)}`).toBe(1);
    }
  });
});

describe("resolveHotkey()", () => {
  function ev(key: string, mod = false, shift = false): KeyboardEvent {
    return new KeyboardEvent("keydown", { key, metaKey: mod, shiftKey: shift });
  }

  it("picks ItemNewSibling when item is empty", () => {
    const hk = resolveHotkey(ev("Enter"), "itemRow", { itemContentIsEmpty: true });
    expect(hk?.id).toBe("ItemNewSibling");
  });

  it("picks ItemSplit when item is non-empty", () => {
    const hk = resolveHotkey(ev("Enter"), "itemRow", { itemContentIsEmpty: false });
    expect(hk?.id).toBe("ItemSplit");
  });

  it("returns null when no binding matches the scope", () => {
    expect(resolveHotkey(ev("Enter"), "searchOverlay", {})).toBeNull();
  });

  it("returns null when all candidates are gated out", () => {
    expect(resolveHotkey(ev("Enter"), "itemRow", {})).toBeNull();
  });
});
