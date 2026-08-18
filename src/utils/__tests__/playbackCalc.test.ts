import { describe, it, expect } from "vitest";
import { calculateProgress, calculateActiveLines } from "../playbackCalc";

describe("calculateProgress", () => {
  it("returns 0 when totalSteps is 1 or fewer", () => {
    expect(calculateProgress(0, 1)).toBe(0);
    expect(calculateProgress(0, 0)).toBe(0);
  });

  it("returns 0 at the first step", () => {
    expect(calculateProgress(0, 5)).toBe(0);
  });

  it("returns 100 at the last step", () => {
    expect(calculateProgress(4, 5)).toBe(100);
  });

  it("returns 50 at the midpoint", () => {
    expect(calculateProgress(2, 5)).toBe(50);
  });
});

describe("calculateActiveLines", () => {
  it("returns a single-element array for a single line", () => {
    expect(calculateActiveLines(10, 10)).toEqual([10]);
  });

  it("returns a consecutive range for a multi-line block", () => {
    expect(calculateActiveLines(5, 8)).toEqual([5, 6, 7, 8]);
  });

  it("returns an empty array when end is before start", () => {
    expect(calculateActiveLines(10, 5)).toEqual([]);
  });
});
