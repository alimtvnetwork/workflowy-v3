import { describe, it, expect } from "vitest";
import {
  asItemId,
  asOwnerId,
  asSortKey,
  isItemType,
  assertNeverItemType,
  ITEM_TYPES,
  type ItemType,
} from "./index";

/**
 * Branded ID constructors must reject empty strings (trust-boundary
 * invariant) and round-trip non-empty input.
 */

describe("asItemId()", () => {
  it("returns the input for non-empty strings", () => {
    expect(asItemId("abc-123")).toBe("abc-123");
  });

  it("throws on empty string", () => {
    expect(() => asItemId("")).toThrow(/ItemId cannot be empty/);
  });
});

describe("asOwnerId()", () => {
  it("returns the input for non-empty strings", () => {
    expect(asOwnerId("user-1")).toBe("user-1");
  });

  it("throws on empty string", () => {
    expect(() => asOwnerId("")).toThrow(/OwnerId cannot be empty/);
  });
});

describe("asSortKey()", () => {
  it("returns the input for valid base-62 strings", () => {
    expect(asSortKey("aU")).toBe("aU");
    expect(asSortKey("0")).toBe("0");
    expect(asSortKey("zzZZ09")).toBe("zzZZ09");
  });

  it("throws on empty string", () => {
    expect(() => asSortKey("")).toThrow(/SortKey cannot be empty/);
  });

  it("throws on out-of-alphabet characters per ADR-0016", () => {
    expect(() => asSortKey("a-b")).toThrow(/base-62/);
    expect(() => asSortKey("a.b")).toThrow(/base-62/);
    expect(() => asSortKey("a b")).toThrow(/base-62/);
    expect(() => asSortKey("a/b")).toThrow(/base-62/);
  });
});

describe("ItemType registry (ADR-0015 — closed set of 12)", () => {
  const EXPECTED: ReadonlyArray<ItemType> = [
    "bullet",
    "h1",
    "h2",
    "h3",
    "paragraph",
    "todo",
    "numbered",
    "board",
    "dashboard",
    "quote",
    "code",
    "divider",
  ];

  it("ITEM_TYPES contains exactly the 12 ADR-0015 values", () => {
    expect(ITEM_TYPES.size).toBe(12);
    for (const t of EXPECTED) expect(ITEM_TYPES.has(t)).toBe(true);
  });

  it("isItemType accepts every canonical value", () => {
    for (const t of EXPECTED) expect(isItemType(t)).toBe(true);
  });

  it("isItemType rejects out-of-set strings", () => {
    expect(isItemType("mirror")).toBe(false); // ADR-0015 D3
    expect(isItemType("Bullet")).toBe(false); // case-sensitive
    expect(isItemType("")).toBe(false);
    expect(isItemType("widget")).toBe(false);
  });

  it("assertNeverItemType throws when called (exhaustive-switch trap)", () => {
    // Cast forces runtime reach — in real code this branch is unreachable
    // when the switch is exhaustive over ItemType.
    expect(() => assertNeverItemType("rogue" as never)).toThrow(/Unhandled ItemType/);
  });
});
