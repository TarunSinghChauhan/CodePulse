import { describe, it, expect } from "vitest";
import { calculateSpeechTiming } from "../playbackCalc";

describe("calculateSpeechTiming", () => {
  it("computes speechMs proportional to narration length", () => {
    const result = calculateSpeechTiming(110, 1, 1);
    expect(result.speechMs).toBeCloseTo(10000, 0);
  });

  it("totalWait includes the 2000ms pause buffer", () => {
    const result = calculateSpeechTiming(0, 1, 1);
    expect(result.totalWait).toBeCloseTo(2000, 0);
  });

  it("higher speed reduces totalWait", () => {
    const slow = calculateSpeechTiming(110, 1, 1);
    const fast = calculateSpeechTiming(110, 1, 2);
    expect(fast.totalWait).toBeLessThan(slow.totalWait);
  });

  it("higher character rate reduces speechMs", () => {
    const slowChar = calculateSpeechTiming(110, 0.7, 1);
    const fastChar = calculateSpeechTiming(110, 1.1, 1);
    expect(fastChar.speechMs).toBeLessThan(slowChar.speechMs);
  });
});
