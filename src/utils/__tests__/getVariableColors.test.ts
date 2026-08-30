import { describe, it, expect } from "vitest";
import { getVariableColors } from "../playbackCalc";

describe("getVariableColors", () => {
  it("returns purple colors when colorKey is undefined", () => {
    expect(getVariableColors(undefined).dot).toBe("#7F77DD");
  });

  it("returns the correct colors for a known key", () => {
    expect(getVariableColors("teal").dot).toBe("#1D9E75");
  });

  it("falls back to purple for an unrecognized key", () => {
    expect(getVariableColors("nonexistent").dot).toBe("#7F77DD");
  });

  it("returns amber colors for amber key", () => {
    expect(getVariableColors("amber").text).toBe("#633806");
  });
});
