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

  it("setScript sets script, code, and resets status/step/mode/error", () => {
    usePlaybackStore.setState({
      status: "playing",
      currentStep: 5,
      mode: "debug" as any,
      error: "old error",
    });
    const script = makeScript(4);
    usePlaybackStore.getState().setScript(script, "print('hi')");
    const state = usePlaybackStore.getState();
    expect(state.script).toBe(script);
    expect(state.code).toBe("print('hi')");
    expect(state.status).toBe("idle");
    expect(state.currentStep).toBe(0);
    expect(state.mode).toBe("normal");
    expect(state.error).toBeNull();
  });

  it("clearScript resets script, code, status, and step", () => {
    usePlaybackStore.setState({
      script: makeScript(3),
      code: "some code",
      status: "playing",
      currentStep: 2,
    });
    usePlaybackStore.getState().clearScript();
    const state = usePlaybackStore.getState();
    expect(state.script).toBeNull();
    expect(state.code).toBe("");
    expect(state.status).toBe("idle");
    expect(state.currentStep).toBe(0);
  });

  it("reset sets status to idle and currentStep to zero", () => {
    usePlaybackStore.setState({ status: "playing", currentStep: 7 });
    usePlaybackStore.getState().reset();
    expect(usePlaybackStore.getState().status).toBe("idle");
    expect(usePlaybackStore.getState().currentStep).toBe(0);
  });

  it("play sets status to playing", () => {
    usePlaybackStore.setState({ status: "idle" });
    usePlaybackStore.getState().play();
    expect(usePlaybackStore.getState().status).toBe("playing");
  });

  it("pause sets status to paused", () => {
    usePlaybackStore.setState({ status: "playing" });
    usePlaybackStore.getState().pause();
    expect(usePlaybackStore.getState().status).toBe("paused");
  });

  it("setSpeed updates the speed value", () => {
    usePlaybackStore.getState().setSpeed(1.5);
    expect(usePlaybackStore.getState().speed).toBe(1.5);
  });

  it("setExplainLevel updates the explain level", () => {
    usePlaybackStore.getState().setExplainLevel("eli5");
    expect(usePlaybackStore.getState().explainLevel).toBe("eli5");
  });

  it("setSelectedLine updates the selected line", () => {
    usePlaybackStore.getState().setSelectedLine(42);
    expect(usePlaybackStore.getState().selectedLine).toBe(42);
  });

  it("setSelectedLine accepts null to clear selection", () => {
    usePlaybackStore.setState({ selectedLine: 10 });
    usePlaybackStore.getState().setSelectedLine(null);
    expect(usePlaybackStore.getState().selectedLine).toBeNull();
  });

  it("setSidebarTab updates the active tab", () => {
    usePlaybackStore.getState().setSidebarTab("variables");
    expect(usePlaybackStore.getState().sidebarTab).toBe("variables");
  });

  it("setLoading updates the loading flag", () => {
    usePlaybackStore.getState().setLoading(true);
    expect(usePlaybackStore.getState().isLoading).toBe(true);
  });

  it("setError updates the error message", () => {
    usePlaybackStore.getState().setError("something broke");
    expect(usePlaybackStore.getState().error).toBe("something broke");
  });

  it("setError accepts null to clear the error", () => {
    usePlaybackStore.setState({ error: "old error" });
    usePlaybackStore.getState().setError(null);
    expect(usePlaybackStore.getState().error).toBeNull();
  });
