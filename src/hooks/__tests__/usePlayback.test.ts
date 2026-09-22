import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlayback } from "../usePlayback";
import { usePlaybackStore } from "@/stores/playback";

vi.mock("@/utils/playbackCalc", async () => {
  const actual = await vi.importActual<any>("@/utils/playbackCalc");
  return {
    ...actual,
    calculateSpeechTiming: vi.fn(() => ({ speechMs: 1000, totalWait: 1600 })),
    selectBestVoice: vi.fn(() => null),
  };
});

import { calculateSpeechTiming, selectBestVoice } from "@/utils/playbackCalc";

function makeScript(steps: any[]) {
  return { steps } as any;
}

function makeStep(overrides = {}) {
  return { line_start: 1, line_end: 1, narration: "Hello world", ...overrides };
}

describe("usePlayback", () => {
  let mockUtteranceInstances: any[];

  beforeEach(() => {
    vi.useFakeTimers();
    mockUtteranceInstances = [];

    (global as any).SpeechSynthesisUtterance = vi.fn(function (this: any, text: string) {
      this.text = text;
      this.rate = 1;
      this.pitch = 1;
      this.volume = 1;
      this.voice = null;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
      mockUtteranceInstances.push(this);
    });

    (window as any).speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn(() => []),
      paused: false,
    };

    usePlaybackStore.setState({
      script: null,
      status: "idle",
      currentStep: 0,
      speed: 1,
      narratingEnabled: true,
      nextStep: vi.fn(),
    } as any);

    (calculateSpeechTiming as any).mockReturnValue({ speechMs: 1000, totalWait: 1600 });
    (selectBestVoice as any).mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("does nothing when status is not 'playing'", () => {
    usePlaybackStore.setState({ status: "idle", script: makeScript([makeStep()]) });
    renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(2000));
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it("does nothing when there is no script", () => {
    usePlaybackStore.setState({ status: "playing", script: null });
    renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(2000));
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it("does nothing when currentStep is out of range", () => {
    usePlaybackStore.setState({ status: "playing", script: makeScript([]), currentStep: 0 });
    renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(2000));
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it("speaks the narration after the initial delay when narrating is enabled", () => {
    usePlaybackStore.setState({
      status: "playing",
      script: makeScript([makeStep()]),
      currentStep: 0,
      narratingEnabled: true,
    });
    renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(600));
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
    expect(mockUtteranceInstances[0].text).toBe("Hello world");
  });

  it("calls nextStep after totalWait once speech finishes, if still active", () => {
    const nextStep = vi.fn();
    usePlaybackStore.setState({
      status: "playing",
      script: makeScript([makeStep()]),
      currentStep: 0,
      narratingEnabled: true,
      nextStep,
    });
    renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(600)); // fire the speak timeout
    act(() => vi.advanceTimersByTime(1600)); // fire the totalWait timeout
    expect(nextStep).toHaveBeenCalledTimes(1);
  });

  it("sets isSpeaking true/false via utterance onstart/onend callbacks", () => {
    usePlaybackStore.setState({
      status: "playing",
      script: makeScript([makeStep()]),
      currentStep: 0,
      narratingEnabled: true,
    });
    const { result } = renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(600));
    expect(result.current.isSpeaking).toBe(false);
    act(() => mockUtteranceInstances[0].onstart());
    expect(result.current.isSpeaking).toBe(true);
    act(() => mockUtteranceInstances[0].onend());
    expect(result.current.isSpeaking).toBe(false);
  });

  it("sets isSpeaking false on utterance error", () => {
    usePlaybackStore.setState({
      status: "playing",
      script: makeScript([makeStep()]),
      currentStep: 0,
      narratingEnabled: true,
    });
    const { result } = renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(600));
    act(() => mockUtteranceInstances[0].onstart());
    act(() => mockUtteranceInstances[0].onerror());
    expect(result.current.isSpeaking).toBe(false);
  });

  it("resumes speech synthesis if it becomes paused mid-utterance", () => {
    usePlaybackStore.setState({
      status: "playing",
      script: makeScript([makeStep()]),
      currentStep: 0,
      narratingEnabled: true,
    });
    renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(600));
    (window.speechSynthesis as any).paused = true;
    act(() => vi.advanceTimersByTime(500));
    expect(window.speechSynthesis.resume).toHaveBeenCalled();
  });

  it("skips speechSynthesis entirely and just waits when narratingEnabled is false", () => {
    const nextStep = vi.fn();
    usePlaybackStore.setState({
      status: "playing",
      script: makeScript([makeStep()]),
      currentStep: 0,
      narratingEnabled: false,
      nextStep,
    });
    renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(1600));
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    expect(nextStep).toHaveBeenCalledTimes(1);
  });

  it("cancels speech and clears timers when status changes to paused", () => {
    usePlaybackStore.setState({
      status: "playing",
      script: makeScript([makeStep()]),
      currentStep: 0,
      narratingEnabled: true,
    });
    const { result, rerender } = renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(600));
    usePlaybackStore.setState({ status: "paused" });
    rerender();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(result.current.isSpeaking).toBe(false);
  });

  it("cancels speech and clears timers when status changes to idle", () => {
    usePlaybackStore.setState({
      status: "playing",
      script: makeScript([makeStep()]),
      currentStep: 0,
      narratingEnabled: true,
    });
    const { rerender } = renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(600));
    usePlaybackStore.setState({ status: "idle" });
    rerender();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it("cancels speech synthesis on unmount", () => {
    usePlaybackStore.setState({
      status: "playing",
      script: makeScript([makeStep()]),
      currentStep: 0,
      narratingEnabled: true,
    });
    const { unmount } = renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(600));
    unmount();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it("selects and assigns a voice when selectBestVoice returns one", () => {
    const fakeVoice = { name: "Test Voice" };
    (selectBestVoice as any).mockReturnValue(fakeVoice);
    usePlaybackStore.setState({
      status: "playing",
      script: makeScript([makeStep()]),
      currentStep: 0,
      narratingEnabled: true,
    });
    renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(600));
    expect(mockUtteranceInstances[0].voice).toBe(fakeVoice);
  });

  it("computes currentStepData, totalSteps, progress, and activeLines from the script", () => {
    usePlaybackStore.setState({
      status: "idle",
      script: makeScript([makeStep({ line_start: 3, line_end: 5 })]),
      currentStep: 0,
    });
    const { result } = renderHook(() => usePlayback());
    expect(result.current.currentStepData).not.toBeNull();
    expect(result.current.totalSteps).toBe(1);
    expect(result.current.activeLines).toEqual([3, 4, 5]);
  });

  it("returns null currentStepData and empty activeLines when there is no script", () => {
    usePlaybackStore.setState({ script: null, status: "idle", currentStep: 0 });
    const { result } = renderHook(() => usePlayback());
    expect(result.current.currentStepData).toBeNull();
    expect(result.current.totalSteps).toBe(0);
    expect(result.current.activeLines).toEqual([]);
  });

  it("clears an existing timer when currentStep changes rapidly before the previous timeout fires", () => {
    usePlaybackStore.setState({
      status: "playing",
      script: makeScript([makeStep(), makeStep({ narration: "Second step" })]),
      currentStep: 0,
      narratingEnabled: true,
    });
    const { rerender } = renderHook(() => usePlayback());
    // Don't advance timers yet — change step before the first 600ms fires
    usePlaybackStore.setState({ currentStep: 1 });
    rerender();
    act(() => vi.advanceTimersByTime(600));
    // Only the second step's utterance should have been spoken
    expect(mockUtteranceInstances.length).toBe(1);
    expect(mockUtteranceInstances[0].text).toBe("Second step");
  });

  it("ignores a stale speak timeout if globalSpeakId advanced before it fired", () => {
    usePlaybackStore.setState({
      status: "playing",
      script: makeScript([makeStep(), makeStep({ narration: "Second step" })]),
      currentStep: 0,
      narratingEnabled: true,
    });
    const { rerender } = renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(300)); // partway through the 600ms delay
    usePlaybackStore.setState({ currentStep: 1 }); // bumps globalSpeakId via new effect run
    rerender();
    act(() => vi.advanceTimersByTime(600)); // let both timers' 600ms elapse
    // Only one utterance (for step 1) should have actually spoken — the stale one is skipped
    expect(mockUtteranceInstances.length).toBe(1);
  });

  it("ignores a stale totalWait timeout and does not call nextStep if globalSpeakId advanced", () => {
    const nextStep = vi.fn();
    usePlaybackStore.setState({
      status: "playing",
      script: makeScript([makeStep(), makeStep({ narration: "Second" })]),
      currentStep: 0,
      narratingEnabled: true,
      nextStep,
    });
    const { rerender } = renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(600)); // first utterance speaks
    usePlaybackStore.setState({ currentStep: 1 }); // advances globalSpeakId, cleanup cancels old timer
    rerender();
    act(() => vi.advanceTimersByTime(2200)); // let any pending totalWait elapse
    // nextStep should only ever be called once at most (for the current, non-stale step) — not twice
    expect(nextStep.mock.calls.length).toBeLessThanOrEqual(1);
  });

  it("ignores a stale non-narrating timeout if globalSpeakId advanced before it fired", () => {
    const nextStep = vi.fn();
    usePlaybackStore.setState({
      status: "playing",
      script: makeScript([makeStep(), makeStep({ narration: "Second" })]),
      currentStep: 0,
      narratingEnabled: false,
      nextStep,
    });
    const { rerender } = renderHook(() => usePlayback());
    act(() => vi.advanceTimersByTime(500)); // partway through totalWait
    usePlaybackStore.setState({ currentStep: 1 });
    rerender();
    act(() => vi.advanceTimersByTime(1600));
    expect(nextStep.mock.calls.length).toBeLessThanOrEqual(1);
  });
});
