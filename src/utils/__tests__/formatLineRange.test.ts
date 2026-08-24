import { describe, it, expect } from "vitest";
import { formatLineRange } from "../playbackCalc";

describe("formatLineRange", () => {
  it("formats a single line without a range", () => {
    expect(formatLineRange(5, 5)).toBe("Line 5");
  });

  it("formats a multi-line range with an en dash", () => {
    expect(formatLineRange(5, 8)).toBe("Line 5–8");
  });

  it("handles line 1", () => {
    expect(formatLineRange(1, 1)).toBe("Line 1");
  });
});
