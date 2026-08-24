import { describe, it, expect } from "vitest";
import { truncateNarration } from "../playbackCalc";

describe("truncateNarration", () => {
  it("returns text unchanged when under the limit", () => {
    expect(truncateNarration("short text")).toBe("short text");
  });

  it("returns text unchanged when exactly at the limit", () => {
    const text = "x".repeat(120);
    expect(truncateNarration(text)).toBe(text);
  });

  it("truncates and appends ellipsis when over the limit", () => {
    const text = "x".repeat(150);
    const result = truncateNarration(text);
    expect(result).toBe("x".repeat(120) + "...");
  });

  it("respects a custom maxLength", () => {
    expect(truncateNarration("hello world", 5)).toBe("hello...");
  });
});
