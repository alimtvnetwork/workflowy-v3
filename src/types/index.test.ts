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
