import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BreakMode } from "../BreakMode";
import { usePlaybackStore } from "@/stores/playback";
import type { ExecutionScript } from "@/types/codepulse";

function makeScriptWithBreakMode(): ExecutionScript {
  return {
    steps: [],
    break_mode: {
      line_to_modify: 7,
      bug_description: "Off-by-one error in the loop bound.",
      original_line: "for i in range(len(arr)):",
      buggy_line: "for i in range(len(arr) + 1):",
      failure_narration: "And there it is — the index runs one step too far.",
      fix_explanation: "Remove the '+ 1' to stay within bounds.",
    },
  } as unknown as ExecutionScript;
}

describe("BreakMode", () => {
  beforeEach(() => {
    usePlaybackStore.setState({ script: null, mode: "normal" } as any);
  });

  it("renders nothing when mode is not 'break'", () => {
    usePlaybackStore.setState({ script: makeScriptWithBreakMode(), mode: "normal" as any });
    const { container } = render(<BreakMode />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when there is no script, even in break mode", () => {
    usePlaybackStore.setState({ script: null, mode: "break" as any });
    const { container } = render(<BreakMode />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders bug details when mode is 'break' and a script is present", () => {
    usePlaybackStore.setState({ script: makeScriptWithBreakMode(), mode: "break" as any });
    render(<BreakMode />);

    expect(screen.getByText(/Bug Injected — Line 7/)).toBeInTheDocument();
    expect(screen.getByText("Off-by-one error in the loop bound.")).toBeInTheDocument();
    expect(screen.getByText("for i in range(len(arr)):")).toBeInTheDocument();
    expect(screen.getByText("for i in range(len(arr) + 1):")).toBeInTheDocument();
    expect(screen.getByText(/And there it is/)).toBeInTheDocument();
    expect(screen.getByText("Remove the '+ 1' to stay within bounds.")).toBeInTheDocument();
  });
});
