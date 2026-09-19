import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NarrationOverlay } from "../NarrationOverlay";
import { usePlaybackStore } from "@/stores/playback";

vi.mock("@/hooks/usePlayback", () => ({
  usePlayback: vi.fn(),
}));

import { usePlayback } from "@/hooks/usePlayback";

function makeStepData(overrides = {}) {
  return {
    step_id: 2,
    line_start: 3,
    line_end: 5,
    highlight_type: "declare",
    explanation: "This line declares a new variable.",
    call_stack: ["main"],
    ...overrides,
  };
}

describe("NarrationOverlay", () => {
  beforeEach(() => {
    usePlaybackStore.setState({ status: "idle", mode: "normal" } as any);
    (usePlayback as any).mockReturnValue({ currentStepData: null, totalSteps: 0 });
  });

  it("renders nothing when status is idle", () => {
    usePlaybackStore.setState({ status: "idle", mode: "normal" } as any);
    (usePlayback as any).mockReturnValue({ currentStepData: makeStepData(), totalSteps: 5 });
    const { container } = render(<NarrationOverlay />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when there is no currentStepData, even while playing", () => {
    usePlaybackStore.setState({ status: "playing", mode: "normal" } as any);
    (usePlayback as any).mockReturnValue({ currentStepData: null, totalSteps: 0 });
    const { container } = render(<NarrationOverlay />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders explanation and step counter while playing", () => {
    usePlaybackStore.setState({ status: "playing", mode: "normal" } as any);
    (usePlayback as any).mockReturnValue({ currentStepData: makeStepData(), totalSteps: 5 });
    render(<NarrationOverlay />);
    expect(screen.getByText("This line declares a new variable.")).toBeInTheDocument();
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });

  it("renders while paused as well as while playing", () => {
    usePlaybackStore.setState({ status: "paused", mode: "normal" } as any);
    (usePlayback as any).mockReturnValue({ currentStepData: makeStepData(), totalSteps: 3 });
    render(<NarrationOverlay />);
    expect(screen.getByText("This line declares a new variable.")).toBeInTheDocument();
  });

  it("renders call stack frames with separators between them", () => {
    usePlaybackStore.setState({ status: "playing", mode: "normal" } as any);
    (usePlayback as any).mockReturnValue({
      currentStepData: makeStepData({ call_stack: ["main", "helper", "inner"] }),
      totalSteps: 5,
    });
    render(<NarrationOverlay />);
    expect(screen.getByText("main")).toBeInTheDocument();
    expect(screen.getByText("helper")).toBeInTheDocument();
    expect(screen.getByText("inner")).toBeInTheDocument();
    expect(screen.getAllByText("›")).toHaveLength(2);
  });

  it("omits the call stack section entirely when call_stack is empty", () => {
    usePlaybackStore.setState({ status: "playing", mode: "normal" } as any);
    (usePlayback as any).mockReturnValue({
      currentStepData: makeStepData({ call_stack: [] }),
      totalSteps: 5,
    });
    render(<NarrationOverlay />);
    expect(screen.queryByText("Stack:")).not.toBeInTheDocument();
  });

  it("renders with break-mode styling context when mode is 'break'", () => {
    usePlaybackStore.setState({ status: "playing", mode: "break" as any });
    (usePlayback as any).mockReturnValue({ currentStepData: makeStepData(), totalSteps: 5 });
    render(<NarrationOverlay />);
    expect(screen.getByText("This line declares a new variable.")).toBeInTheDocument();
  });
});
