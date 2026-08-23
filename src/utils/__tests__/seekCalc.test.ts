import { describe, it, expect } from "vitest";
import { calculateStepFromClickRatio } from "../playbackCalc";

describe("calculateStepFromClickRatio", () => {
  it("returns 0 when clicking at the very start", () => {
    expect(calculateStepFromClickRatio(0, 0, 100, 5)).toBe(0);
  });

  it("returns the last step when clicking at the very end", () => {
    expect(calculateStepFromClickRatio(100, 0, 100, 5)).toBe(4);
  });

  it("returns the midpoint step when clicking in the middle", () => {
    expect(calculateStepFromClickRatio(50, 0, 100, 5)).toBe(2);
  });

  it("clamps to 0 when click is before the element start", () => {
    expect(calculateStepFromClickRatio(-20, 0, 100, 5)).toBe(0);
  });

  it("clamps to the last step when click is beyond the element end", () => {
    expect(calculateStepFromClickRatio(150, 0, 100, 5)).toBe(4);
  });

  it("returns 0 when totalSteps is 1 or fewer", () => {
    expect(calculateStepFromClickRatio(50, 0, 100, 1)).toBe(0);
  });

  it("returns 0 when element width is 0", () => {
    expect(calculateStepFromClickRatio(50, 0, 0, 5)).toBe(0);
  });

  it("accounts for element offset (elementLeft not at 0)", () => {
    expect(calculateStepFromClickRatio(150, 100, 100, 5)).toBe(2);
  });
});
