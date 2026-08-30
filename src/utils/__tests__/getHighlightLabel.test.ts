import { describe, it, expect } from "vitest";
import { getHighlightLabel } from "../playbackCalc";

describe("getHighlightLabel", () => {
  it("returns the correct label for a known type", () => {
    expect(getHighlightLabel("loop").label).toBe("Loop");
  });

  it("returns the correct color for error type", () => {
    expect(getHighlightLabel("error").color).toBe("#E24B4A");
  });

  it("falls back to Step for an unknown type", () => {
    expect(getHighlightLabel("nonexistent").label).toBe("Step");
  });

  it("function_call maps to Call label", () => {
    expect(getHighlightLabel("function_call").label).toBe("Call");
  });
});
