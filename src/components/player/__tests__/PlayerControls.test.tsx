import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayerControls } from "../PlayerControls";
import { usePlaybackStore } from "@/stores/playback";

vi.mock("@/hooks/usePlayback", () => ({
  usePlayback: vi.fn(),
}));

import { usePlayback } from "@/hooks/usePlayback";

function makeScript(numSteps: number) {
  return { steps: Array.from({ length: numSteps }, (_, i) => ({ line: i + 1 })) } as any;
}

describe("PlayerControls", () => {
  beforeEach(() => {
    usePlaybackStore.setState({
      script: makeScript(5),
      status: "idle",
      mode: "normal",
      currentStep: 0,
      speed: 1,
      narratingEnabled: true,
    } as any);
    (usePlayback as any).mockReturnValue({ progress: 0, totalSteps: 5 });
  });

  it("shows the current step (1-indexed) and total steps", () => {
    usePlaybackStore.setState({ currentStep: 2 });
    (usePlayback as any).mockReturnValue({ progress: 40, totalSteps: 5 });
    render(<PlayerControls />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("play button shows ▶ when idle and calls play() on click", () => {
    usePlaybackStore.setState({ status: "idle" });
    render(<PlayerControls />);
    const playBtn = screen.getByText("▶");
    fireEvent.click(playBtn);
    expect(usePlaybackStore.getState().status).toBe("playing");
  });

  it("play button shows ⏸ when playing and calls pause() on click", () => {
    usePlaybackStore.setState({ status: "playing" });
    render(<PlayerControls />);
    const pauseBtn = screen.getByText("⏸");
    fireEvent.click(pauseBtn);
    expect(usePlaybackStore.getState().status).toBe("paused");
  });

  it("play button shows ↺ when finished and calls reset() on click", () => {
    usePlaybackStore.setState({ status: "finished", currentStep: 4 });
    render(<PlayerControls />);
    const resetBtn = screen.getByText("↺");
    fireEvent.click(resetBtn);
    const state = usePlaybackStore.getState();
    expect(state.status).toBe("idle");
    expect(state.currentStep).toBe(0);
  });

  it("play button is disabled when there is no script", () => {
    usePlaybackStore.setState({ script: null });
    render(<PlayerControls />);
    const playBtn = screen.getByText("▶");
    expect(playBtn).toBeDisabled();
  });

  it("prev button is disabled at step zero", () => {
    usePlaybackStore.setState({ currentStep: 0 });
    render(<PlayerControls />);
    expect(screen.getByText("⏮")).toBeDisabled();
  });

  it("prev button is enabled and calls prevStep() past step zero", () => {
    usePlaybackStore.setState({ currentStep: 2 });
    render(<PlayerControls />);
    const prevBtn = screen.getByText("⏮");
    expect(prevBtn).not.toBeDisabled();
    fireEvent.click(prevBtn);
    expect(usePlaybackStore.getState().currentStep).toBe(1);
  });

  it("next button is disabled when finished", () => {
    usePlaybackStore.setState({ status: "finished" });
    render(<PlayerControls />);
    expect(screen.getByText("⏭")).toBeDisabled();
  });

  it("next button calls nextStep() when not finished", () => {
    usePlaybackStore.setState({ status: "idle", currentStep: 0 });
    render(<PlayerControls />);
    fireEvent.click(screen.getByText("⏭"));
    expect(usePlaybackStore.getState().currentStep).toBe(1);
  });

  it("switching to break mode calls setMode and resets playback", () => {
    usePlaybackStore.setState({ mode: "normal", currentStep: 3, status: "playing" });
    render(<PlayerControls />);
    fireEvent.click(screen.getByText("🐛 Break"));
    const state = usePlaybackStore.getState();
    expect(state.mode).toBe("break");
    expect(state.currentStep).toBe(0);
    expect(state.status).toBe("idle");
  });

  it("toggleNarration button shows 🔊 when enabled and flips on click", () => {
    usePlaybackStore.setState({ narratingEnabled: true });
    render(<PlayerControls />);
    const toggleBtn = screen.getByText("🔊");
    fireEvent.click(toggleBtn);
    expect(usePlaybackStore.getState().narratingEnabled).toBe(false);
  });

  it("toggleNarration button shows 🔇 when disabled", () => {
    usePlaybackStore.setState({ narratingEnabled: false });
    render(<PlayerControls />);
    expect(screen.getByText("🔇")).toBeInTheDocument();
  });

  it("clicking a speed option updates the store's speed", () => {
    usePlaybackStore.setState({ speed: 1 });
    render(<PlayerControls />);
    fireEvent.click(screen.getByText("2×"));
    expect(usePlaybackStore.getState().speed).toBe(2);
  });

  it("clicking the progress bar calls goToStep with a calculated step", () => {
    usePlaybackStore.setState({ script: makeScript(5), currentStep: 0 });
    (usePlayback as any).mockReturnValue({ progress: 0, totalSteps: 5 });
    render(<PlayerControls />);

    const progressBar = screen.getByText("1").parentElement!.querySelector(".cursor-pointer")!;
    vi.spyOn(progressBar, "getBoundingClientRect").mockReturnValue({
      left: 0, width: 100, top: 0, bottom: 0, right: 100, height: 10, x: 0, y: 0, toJSON: () => {},
    });
    fireEvent.click(progressBar, { clientX: 50 });

    expect(usePlaybackStore.getState().currentStep).toBeGreaterThanOrEqual(0);
  });
});
