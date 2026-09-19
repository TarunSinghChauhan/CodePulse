import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { useEffect } from "react";
import { CodeEditor } from "../CodeEditor";
import { usePlaybackStore } from "@/stores/playback";

const mocks = vi.hoisted(() => {
  return {
    editorInstance: {
      onMouseDown: vi.fn(),
      deltaDecorations: vi.fn(() => ["dec1"]),
      revealLineInCenterIfOutsideViewport: vi.fn(),
    },
    monacoInstance: {
      Range: vi.fn(function (this: any, a: number, b: number, c: number, d: number) { this.a = a; this.b = b; this.c = c; this.d = d; }),
      editor: { OverviewRulerLane: { Left: "left" } },
    },
    lastMouseDownCallback: null as any,
  };
});

vi.mock("@monaco-editor/react", () => ({
  default: (props: any) => {
    useEffect(() => {
      props.onMount?.(mocks.editorInstance, mocks.monacoInstance);
    }, []);
    return (
      <div data-testid="mock-monaco">
        <span data-testid="language">{props.language}</span>
        <textarea
          data-testid="editor-textarea"
          value={props.value}
          onChange={(e: any) => props.onChange?.(e.target.value)}
        />
      </div>
    );
  },
}));

vi.mock("@/hooks/usePlayback", () => ({
  usePlayback: vi.fn(),
}));

import { usePlayback } from "@/hooks/usePlayback";

function makeStepData(overrides = {}) {
  return { highlight_type: "declare", ...overrides };
}

describe("CodeEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.editorInstance.onMouseDown.mockImplementation((cb: any) => {
      mocks.lastMouseDownCallback = cb;
    });
    mocks.editorInstance.deltaDecorations.mockReturnValue(["dec1"]);
    usePlaybackStore.setState({
      script: { steps: [] },
      selectedLine: null,
      currentStep: 0,
    } as any);
    (usePlayback as any).mockReturnValue({ activeLines: [], currentStepData: null });
  });

  it("passes the value and detected language to the underlying editor", () => {
    const { getByTestId } = render(<CodeEditor value="print('hi')" />);
    expect(getByTestId("editor-textarea")).toHaveValue("print('hi')");
    expect(getByTestId("language").textContent).toBeTruthy();
  });

  it("forwards onChange with the new value", () => {
    const onChange = vi.fn();
    const { getByTestId } = render(<CodeEditor value="x = 1" onChange={onChange} />);
    const textarea = getByTestId("editor-textarea");
    fireEvent.change(textarea, { target: { value: "x = 2" } });
    expect(onChange).toHaveBeenCalledWith("x = 2");
  });

  it("clicking a line sets selectedLine and switches sidebar tab to explanation", () => {
    render(<CodeEditor value="code" />);
    mocks.lastMouseDownCallback({ target: { position: { lineNumber: 7 } } });
    const state = usePlaybackStore.getState();
    expect(state.selectedLine).toBe(7);
    expect(state.sidebarTab).toBe("explanation");
  });

  it("does nothing on mouse down when there is no line position", () => {
    usePlaybackStore.setState({ selectedLine: null });
    render(<CodeEditor value="code" />);
    mocks.lastMouseDownCallback({ target: { position: null } });
    expect(usePlaybackStore.getState().selectedLine).toBeNull();
  });

  it("applies decorations and reveals the line when activeLines and currentStepData are present", () => {
    (usePlayback as any).mockReturnValue({
      activeLines: [2, 3],
      currentStepData: makeStepData({ highlight_type: "loop" }),
    });
    render(<CodeEditor value="code" />);
    expect(mocks.editorInstance.deltaDecorations).toHaveBeenCalled();
    const [, newDecorations] = mocks.editorInstance.deltaDecorations.mock.calls[0];
    expect(newDecorations).toHaveLength(2);
    expect(mocks.editorInstance.revealLineInCenterIfOutsideViewport).toHaveBeenCalledWith(2, 0);
  });

  it("does not apply decorations when activeLines is empty", () => {
    (usePlayback as any).mockReturnValue({ activeLines: [], currentStepData: makeStepData() });
    render(<CodeEditor value="code" />);
    expect(mocks.editorInstance.deltaDecorations).not.toHaveBeenCalled();
  });

  it("does not apply decorations when there is no currentStepData", () => {
    (usePlayback as any).mockReturnValue({ activeLines: [1], currentStepData: null });
    render(<CodeEditor value="code" />);
    expect(mocks.editorInstance.deltaDecorations).not.toHaveBeenCalled();
  });

  it("falls back to the default highlight color for an unrecognized highlight_type", () => {
    (usePlayback as any).mockReturnValue({
      activeLines: [1],
      currentStepData: makeStepData({ highlight_type: "totally_unknown_type" }),
    });
    render(<CodeEditor value="code" />);
    expect(mocks.editorInstance.deltaDecorations).toHaveBeenCalled();
  });

  it("clears decorations when script becomes null", () => {
    usePlaybackStore.setState({ script: { steps: [] } });
    const { rerender } = render(<CodeEditor value="code" />);
    mocks.editorInstance.deltaDecorations.mockClear();
    usePlaybackStore.setState({ script: null });
    rerender(<CodeEditor value="code" />);
    expect(mocks.editorInstance.deltaDecorations).toHaveBeenCalledWith(expect.anything(), []);
  });
});
