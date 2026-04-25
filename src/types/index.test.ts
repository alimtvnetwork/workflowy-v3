import { describe, it, expect } from "vitest";
import { asItemId, asOwnerId } from "./index";

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
