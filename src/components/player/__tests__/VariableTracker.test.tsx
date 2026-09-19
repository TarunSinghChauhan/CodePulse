import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { VariableTracker } from "../VariableTracker";
import { usePlaybackStore } from "@/stores/playback";

vi.mock("@/hooks/usePlayback", () => ({
  usePlayback: vi.fn(),
}));

import { usePlayback } from "@/hooks/usePlayback";

function makeScript(variables: any[] = []) {
  return { variables } as any;
}

function makeStepData(overrides = {}) {
  return {
    step_id: 3,
    variable_states: [],
    memory_note: "",
    ...overrides,
  };
}

describe("VariableTracker", () => {
  beforeEach(() => {
    usePlaybackStore.setState({ script: null } as any);
    (usePlayback as any).mockReturnValue({ currentStepData: null });
  });

  it("shows placeholder text when there is no script", () => {
    usePlaybackStore.setState({ script: null });
    (usePlayback as any).mockReturnValue({ currentStepData: makeStepData() });
    render(<VariableTracker />);
    expect(screen.getByText("Variables will appear here during playback.")).toBeInTheDocument();
  });

  it("shows placeholder text when there is no currentStepData", () => {
    usePlaybackStore.setState({ script: makeScript() });
    (usePlayback as any).mockReturnValue({ currentStepData: null });
    render(<VariableTracker />);
    expect(screen.getByText("Variables will appear here during playback.")).toBeInTheDocument();
  });

  it("renders the step counter header", () => {
    usePlaybackStore.setState({ script: makeScript() });
    (usePlayback as any).mockReturnValue({ currentStepData: makeStepData({ step_id: 5 }) });
    render(<VariableTracker />);
    expect(screen.getByText("Variables — Step 5")).toBeInTheDocument();
  });

  it("renders a variable's name, value, and type when defined in script.variables", () => {
    usePlaybackStore.setState({
      script: makeScript([{ name: "count", type: "int", color: "purple" }]),
    });
    (usePlayback as any).mockReturnValue({
      currentStepData: makeStepData({
        variable_states: [{ name: "count", value: "5", changed: false }],
      }),
    });
    render(<VariableTracker />);
    expect(screen.getByText("count")).toBeInTheDocument();
    expect(screen.getByText("int")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders a variable without a type badge when not defined in script.variables", () => {
    usePlaybackStore.setState({ script: makeScript([]) });
    (usePlayback as any).mockReturnValue({
      currentStepData: makeStepData({
        variable_states: [{ name: "mystery", value: "42", changed: false }],
      }),
    });
    render(<VariableTracker />);
    expect(screen.getByText("mystery")).toBeInTheDocument();
    expect(screen.queryByText("int")).not.toBeInTheDocument();
  });

  it("shows the change_type badge when a variable has changed", () => {
    usePlaybackStore.setState({ script: makeScript([{ name: "x", type: "int" }]) });
    (usePlayback as any).mockReturnValue({
      currentStepData: makeStepData({
        variable_states: [{ name: "x", value: "1", changed: true, change_type: "created" }],
      }),
    });
    render(<VariableTracker />);
    expect(screen.getByText("created")).toBeInTheDocument();
  });

  it("does not show a change_type badge when the variable is unchanged", () => {
    usePlaybackStore.setState({ script: makeScript([{ name: "x", type: "int" }]) });
    (usePlayback as any).mockReturnValue({
      currentStepData: makeStepData({
        variable_states: [{ name: "x", value: "1", changed: false, change_type: "created" }],
      }),
    });
    render(<VariableTracker />);
    expect(screen.queryByText("created")).not.toBeInTheDocument();
  });

  it("renders multiple variables independently", () => {
    usePlaybackStore.setState({
      script: makeScript([{ name: "a", type: "int" }, { name: "b", type: "str" }]),
    });
    (usePlayback as any).mockReturnValue({
      currentStepData: makeStepData({
        variable_states: [
          { name: "a", value: "1", changed: false },
          { name: "b", value: "hello", changed: false },
        ],
      }),
    });
    render(<VariableTracker />);
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders the memory note when present", () => {
    usePlaybackStore.setState({ script: makeScript([]) });
    (usePlayback as any).mockReturnValue({
      currentStepData: makeStepData({ memory_note: "x is now on the heap." }),
    });
    render(<VariableTracker />);
    expect(screen.getByText("x is now on the heap.")).toBeInTheDocument();
    expect(screen.getByText("Memory:")).toBeInTheDocument();
  });

  it("omits the memory note section entirely when empty", () => {
    usePlaybackStore.setState({ script: makeScript([]) });
    (usePlayback as any).mockReturnValue({
      currentStepData: makeStepData({ memory_note: "" }),
    });
    render(<VariableTracker />);
    expect(screen.queryByText("Memory:")).not.toBeInTheDocument();
  });
});
