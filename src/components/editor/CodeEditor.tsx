"use client";
// ============================================================
// CodeEditor — Monaco with live line highlighting
// Clicking a line triggers the explain-line API
// ============================================================

import { useRef, useEffect, useCallback } from "react";
import Editor, { OnMount, Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { usePlaybackStore } from "@/stores/playback";
import { usePlayback } from "@/hooks/usePlayback";
import { detectLanguage } from "@/utils/detectLanguage";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

// Color map for highlight types
const HIGHLIGHT_COLORS: Record<string, string> = {
  execute:       "rgba(127, 119, 221, 0.18)", // purple
  declare:       "rgba(29, 158, 117, 0.18)",  // teal
  condition:     "rgba(239, 159, 39, 0.18)",  // amber
  loop:          "rgba(55, 138, 221, 0.18)",  // blue
  return:        "rgba(29, 158, 117, 0.22)",  // teal stronger
  error:         "rgba(226, 75, 74, 0.25)",   // red
  function_call: "rgba(127, 119, 221, 0.22)", // purple stronger
  import:        "rgba(150, 150, 150, 0.15)", // grey
};

export function CodeEditor({ value, onChange, readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const { script, selectedLine, setSelectedLine, setSidebarTab, currentStep } =
    usePlaybackStore();
  const { activeLines, currentStepData } = usePlayback();

  // ── Mount handler ────────────────────────────────────────
  const handleMount: OnMount = useCallback((editorInstance, monacoInstance) => {
    editorRef.current = editorInstance;
    monacoRef.current = monacoInstance;

    // Click on line → explain it
    editorInstance.onMouseDown((e) => {
      const line = e.target.position?.lineNumber;
      if (line) {
        setSelectedLine(line);
        setSidebarTab("explanation");
      }
    });
  }, [setSelectedLine, setSidebarTab]);

  // ── Apply decorations when activeLines changes ───────────
  useEffect(() => {
    const ed = editorRef.current;
    const monaco = monacoRef.current;
    if (!ed || !monaco || activeLines.length === 0 || !currentStepData) return;

    const color = HIGHLIGHT_COLORS[currentStepData.highlight_type] ||
      "rgba(127, 119, 221, 0.18)";

    // Unique CSS class per highlight (Monaco needs inline styles via className trick)
    const className = `cp-highlight-${currentStepData.highlight_type}`;

    const newDecorations = activeLines.map((lineNum) => ({
      range: new monaco.Range(lineNum, 1, lineNum, 1),
      options: {
        isWholeLine: true,
        className,
        linesDecorationsClassName: `cp-line-gutter-${currentStepData.highlight_type}`,
        overviewRulerColor: color,
        overviewRulerLane: monaco.editor.OverviewRulerLane.Left,
      },
    }));

    decorationsRef.current = ed.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );

    // Reveal the line smoothly
    ed.revealLineInCenterIfOutsideViewport(activeLines[0], 0);
  }, [activeLines, currentStepData]);

  // ── Clear decorations on reset ───────────────────────────
  useEffect(() => {
    if (!script) {
      const ed = editorRef.current;
      if (ed) {
        decorationsRef.current = ed.deltaDecorations(decorationsRef.current, []);
      }
    }
  }, [script]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-[var(--color-border-tertiary)]">
      {/* Highlight styles injected into head */}
      <style>{`
        .cp-highlight-execute       { background: rgba(127,119,221,0.12) !important; }
        .cp-highlight-declare       { background: rgba(29,158,117,0.12)  !important; }
        .cp-highlight-condition     { background: rgba(239,159,39,0.12)  !important; }
        .cp-highlight-loop          { background: rgba(55,138,221,0.12)  !important; }
        .cp-highlight-return        { background: rgba(29,158,117,0.18)  !important; }
        .cp-highlight-error         { background: rgba(226,75,74,0.20)   !important; }
        .cp-highlight-function_call { background: rgba(127,119,221,0.18) !important; }
        .cp-highlight-import        { background: rgba(150,150,150,0.10) !important; }
        .cp-line-gutter-execute       { border-left: 3px solid #7F77DD; }
        .cp-line-gutter-declare       { border-left: 3px solid #1D9E75; }
        .cp-line-gutter-condition     { border-left: 3px solid #EF9F27; }
        .cp-line-gutter-loop          { border-left: 3px solid #378ADD; }
        .cp-line-gutter-error         { border-left: 3px solid #E24B4A; }
        .cp-line-gutter-return        { border-left: 3px solid #1D9E75; }
        .cp-line-gutter-function_call { border-left: 3px solid #7F77DD; }
        .cp-line-gutter-import        { border-left: 3px solid #aaa; }
      `}</style>

      <Editor
        height="100%"
        language={detectLanguage(value)}
        value={value}
        onChange={(val) => onChange?.(val ?? "")}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          lineHeight: 22,
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          renderLineHighlight: "none",
          padding: { top: 16, bottom: 16 },
          lineNumbers: "on",
          glyphMargin: true,
          folding: false,
          wordWrap: "on",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
        }}
      />
    </div>
  );
}
