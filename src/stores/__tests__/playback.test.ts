import { describe, it, expect, beforeEach } from "vitest";
import { usePlaybackStore } from "../playback";
import type { ExecutionScript } from "@/types/codepulse";

function makeScript(numSteps: number): ExecutionScript {
  return {
    steps: Array.from({ length: numSteps }, (_, i) => ({ line: i + 1 })),
  } as unknown as ExecutionScript;
}

describe("usePlaybackStore", () => {
  beforeEach(() => {
    usePlaybackStore.setState({
      script: null,
      code: "",
      status: "idle",
      currentStep: 0,
    } as any);
  });

  it("nextStep advances currentStep when not at the last step", () => {
    usePlaybackStore.setState({ script: makeScript(3), currentStep: 0 });
    usePlaybackStore.getState().nextStep();
    expect(usePlaybackStore.getState().currentStep).toBe(1);
  });

  it("nextStep sets status to finished at the last step", () => {
    usePlaybackStore.setState({ script: makeScript(3), currentStep: 2 });
    usePlaybackStore.getState().nextStep();
    expect(usePlaybackStore.getState().status).toBe("finished");
  });

  it("nextStep does nothing when there is no script", () => {
    usePlaybackStore.setState({ script: null, currentStep: 0 });
    usePlaybackStore.getState().nextStep();
    expect(usePlaybackStore.getState().currentStep).toBe(0);
  });

  it("prevStep decrements currentStep and sets status to paused", () => {
    usePlaybackStore.setState({ script: makeScript(3), currentStep: 2 });
    usePlaybackStore.getState().prevStep();
    expect(usePlaybackStore.getState().currentStep).toBe(1);
    expect(usePlaybackStore.getState().status).toBe("paused");
  });

  it("prevStep does not go below zero", () => {
    usePlaybackStore.setState({ script: makeScript(3), currentStep: 0 });
    usePlaybackStore.getState().prevStep();
    expect(usePlaybackStore.getState().currentStep).toBe(0);
  });

  it("goToStep clamps to the last valid step when given a too-high value", () => {
    usePlaybackStore.setState({ script: makeScript(3) });
    usePlaybackStore.getState().goToStep(99);
    expect(usePlaybackStore.getState().currentStep).toBe(2);
  });

  it("goToStep clamps to zero when given a negative value", () => {
    usePlaybackStore.setState({ script: makeScript(3) });
    usePlaybackStore.getState().goToStep(-5);
    expect(usePlaybackStore.getState().currentStep).toBe(0);
  });

  it("goToStep does nothing when there is no script", () => {
    usePlaybackStore.setState({ script: null, currentStep: 0 });
    usePlaybackStore.getState().goToStep(5);
    expect(usePlaybackStore.getState().currentStep).toBe(0);
  });

  it("toggleNarration flips the boolean", () => {
    usePlaybackStore.setState({ narratingEnabled: true });
    usePlaybackStore.getState().toggleNarration();
    expect(usePlaybackStore.getState().narratingEnabled).toBe(false);
  });

  it("setMode resets currentStep and status", () => {
    usePlaybackStore.setState({ currentStep: 5, status: "playing" });
    usePlaybackStore.getState().setMode("normal");
    expect(usePlaybackStore.getState().currentStep).toBe(0);
    expect(usePlaybackStore.getState().status).toBe("idle");
  });
});
