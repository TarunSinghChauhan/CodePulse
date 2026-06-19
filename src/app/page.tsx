"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { VariableTracker } from "@/components/player/VariableTracker";
import { PlayerControls } from "@/components/player/PlayerControls";
import { NarrationOverlay } from "@/components/player/NarrationOverlay";
import { BreakMode } from "@/components/player/BreakMode";
import { CharacterNarrator, Character } from "@/components/player/CharacterNarrator";
import { usePlaybackStore } from "@/stores/playback";
import { usePlayback } from "@/hooks/usePlayback";
import { ExecutionScript } from "@/types/codepulse";

const DEMOS = [
  {
    label: "Bubble Sort",
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubble_sort(numbers)
print(sorted_numbers)`,
  },
  {
    label: "Fibonacci",
    code: `def fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    sequence = [0, 1]
    while len(sequence) < n:
        next_val = sequence[-1] + sequence[-2]
        sequence.append(next_val)
    return sequence

result = fibonacci(10)
print(result)`,
  },
  {
    label: "Binary Search",
    code: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

numbers = [1, 3, 5, 7, 9, 11, 13, 15]
result = binary_search(numbers, 7)
print(f"Found at index: {result}")`,
  },
  {
    label: "Palindrome",
    code: `def is_palindrome(s):
    s = s.lower().replace(" ", "")
    left = 0
    right = len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True

result = is_palindrome("racecar")
print(result)`,
  },
];

function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6"
      style={{ background: "rgba(13,13,18,0.92)", backdropFilter: "blur(4px)" }}
    >
      <div className="relative flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{ borderColor: "#7F77DD" }}
            initial={{ width: 40, height: 40, opacity: 0.8 }}
            animate={{ width: 40 + i * 40, height: 40 + i * 40, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
          />
        ))}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: "#7F77DD" }}>
          ⚡
        </div>
      </div>
      <div className="text-center space-y-2">
        <motion.p className="text-sm font-medium" style={{ color: "#F0F0F5" }}
          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
          Reading your code...
        </motion.p>
        <motion.p className="text-xs" style={{ color: "#55556A" }}
          animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
          Building execution script · Crafting narration · Mapping variables
        </motion.p>
      </div>
      <div className="w-48 h-0.5 rounded-full overflow-hidden" style={{ background: "#1C1C24" }}>
        <motion.div className="h-full rounded-full" style={{ background: "#7F77DD" }}
          animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} />
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [code, setCode] = useState(DEMOS[0].code);
  const [activeDemo, setActiveDemo] = useState(0);
  const [character, setCharacter] = useState<Character>("none");

  const {
    script, setScript, isLoading, setLoading,
    error, setError, status, sidebarTab, setSidebarTab,
    explainLevel, setExplainLevel,
  } = usePlaybackStore();

  const { currentStepData, isSpeaking } = usePlayback(character);

  const handleAnalyze = useCallback(async () => {
    if (!code.trim() || isLoading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }
      const { script } = await res.json() as { script: ExecutionScript };
      setScript(script, code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [code, isLoading, setLoading, setError, setScript]);

  const handleDemoSelect = (index: number) => {
    setActiveDemo(index);
    setCode(DEMOS[index].code);
    setError(null);
  };

  return (
    // ⚠️ NOTE: This root div must NOT have overflow-hidden — CharacterNarrator uses
    // position:fixed and needs to escape all parent containers freely.
    <div className="flex flex-col h-screen"
      style={{ background: "#0D0D12", color: "#F0F0F5", fontFamily: "Inter, sans-serif", overflow: "hidden" }}>

      {/* Top bar */}
      <header className="flex items-center justify-between px-5 h-12 flex-shrink-0"
        style={{ borderBottom: "0.5px solid #1E1E2A" }}>
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold tracking-tight">
            Code<span style={{ color: "#7F77DD" }}>Pulse</span>
          </span>
          {script && (
            <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "#EEEDFE", color: "#3C3489", border: "0.5px solid #AFA9EC" }}>
              {script.language} · {script.complexity} · {script.steps.length} steps
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {script && (
            <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: "#141419" }}>
              {(["eli5", "intermediate", "senior"] as const).map((level) => (
                <button key={level} onClick={() => setExplainLevel(level)}
                  className="text-xs px-2.5 py-1 rounded-md transition-all"
                  style={{
                    background: explainLevel === level ? "#7F77DD" : "transparent",
                    color: explainLevel === level ? "#fff" : "#55556A",
                    fontWeight: explainLevel === level ? 500 : 400,
                  }}>
                  {level === "eli5" ? "ELI5" : level === "intermediate" ? "Mid" : "Senior"}
                </button>
              ))}
            </div>
          )}
          <button onClick={handleAnalyze} disabled={isLoading || !code.trim()}
            className="text-sm px-4 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40"
            style={{ background: "#7F77DD", color: "#fff" }}>
            {isLoading ? "Analyzing…" : script ? "Re-analyze" : "▶ Analyze"}
          </button>
        </div>
      </header>

      {/* Demo selector */}
      <div className="flex items-center gap-2 px-5 py-2 flex-shrink-0 overflow-x-auto"
        style={{ borderBottom: "0.5px solid #1E1E2A" }}>
        <span className="text-xs flex-shrink-0" style={{ color: "#55556A" }}>Try:</span>
        {DEMOS.map((demo, i) => (
          <button key={i} onClick={() => handleDemoSelect(i)}
            className="text-xs px-3 py-1 rounded-full flex-shrink-0 transition-all"
            style={{
              background: activeDemo === i ? "#EEEDFE" : "#141419",
              color: activeDemo === i ? "#3C3489" : "#9898B0",
              border: `0.5px solid ${activeDemo === i ? "#AFA9EC" : "#1E1E2A"}`,
              fontWeight: activeDemo === i ? 500 : 400,
            }}>
            {demo.label}
          </button>
        ))}
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="text-sm px-5 py-2 flex items-center justify-between flex-shrink-0"
            style={{ background: "#FAECE7", color: "#712B13", borderBottom: "0.5px solid #F0997B" }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-lg leading-none">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor — overflow-hidden here is fine, CharacterNarrator is NOT inside this div anymore */}
        <div className="relative flex flex-col flex-1 overflow-hidden">
          <CodeEditor value={code} onChange={setCode} readOnly={status === "playing"} />
          <AnimatePresence>{isLoading && <LoadingSkeleton />}</AnimatePresence>
          <NarrationOverlay />
          <BreakMode />

          <AnimatePresence>
            {script && currentStepData && status === "paused" && (
              <motion.div key={explainLevel} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 p-4 text-sm leading-relaxed"
                style={{ background: "linear-gradient(to top, #0D0D12 80%, transparent)", color: "#9898B0", pointerEvents: "none" }}>
                {script.explain_levels[explainLevel]}
              </motion.div>
            )}
          </AnimatePresence>

          {!script && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-3">
                <p className="text-4xl">⚡</p>
                <p className="text-sm font-medium" style={{ color: "#9898B0" }}>
                  Pick a demo above or paste your own code
                </p>
                <p className="text-xs" style={{ color: "#55556A" }}>
                  Then click Analyze to watch it come alive
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 flex flex-col overflow-hidden" style={{ borderLeft: "0.5px solid #1E1E2A" }}>
          <div className="flex items-center flex-shrink-0" style={{ borderBottom: "0.5px solid #1E1E2A" }}>
            {(["explanation", "variables", "concepts"] as const).map((tab) => (
              <button key={tab} onClick={() => setSidebarTab(tab)}
                className="flex-1 text-xs py-2.5 capitalize transition-all"
                style={{
                  color: sidebarTab === tab ? "#F0F0F5" : "#55556A",
                  borderBottom: sidebarTab === tab ? "1.5px solid #7F77DD" : "1.5px solid transparent",
                  fontWeight: sidebarTab === tab ? 500 : 400,
                }}>
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {sidebarTab === "explanation" && (
                <motion.div key="explanation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-4">
                  {script && currentStepData ? (
                    <>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: "#55556A" }}>Narration</p>
                        <p className="text-sm leading-relaxed" style={{ color: "#9898B0" }}>{currentStepData.narration}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: "#55556A" }}>Technical</p>
                        <p className="text-sm leading-relaxed" style={{ color: "#9898B0" }}>{currentStepData.explanation}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-center pt-16" style={{ color: "#55556A" }}>
                      {script ? "Click ▶ Play to start" : "Analyze code to begin"}
                    </p>
                  )}
                </motion.div>
              )}

              {sidebarTab === "variables" && (
                <motion.div key="variables" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VariableTracker />
                </motion.div>
              )}

              {sidebarTab === "concepts" && (
                <motion.div key="concepts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
                  {script?.concepts.map((concept, i) => (
                    <div key={i} className="rounded-lg p-3" style={{ background: "#141419", border: "0.5px solid #1E1E2A" }}>
                      <p className="text-sm font-medium mb-1 capitalize" style={{ color: "#F0F0F5" }}>{concept.name}</p>
                      <p className="text-xs leading-relaxed" style={{ color: "#9898B0" }}>{concept.explanation}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {concept.line_references.map((line) => (
                          <span key={line} className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: "#EEEDFE", color: "#3C3489", fontFamily: "monospace" }}>
                            L{line}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {!script && <p className="text-sm text-center pt-16" style={{ color: "#55556A" }}>Concepts appear after analysis</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {script && (
            <div className="p-4 flex-shrink-0" style={{ borderTop: "0.5px solid #1E1E2A" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "#F0F0F5" }}>{script.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "#55556A" }}>{script.summary}</p>
            </div>
          )}
        </aside>
      </div>

      {script && <PlayerControls />}

      {/*
        ✅ CharacterNarrator is rendered HERE — at the ROOT level, OUTSIDE the overflow-hidden editor div.
        It uses position:fixed internally (z-index: 9999) so it floats above everything.
        It's always mounted so the "+ Add narrator character" button shows even before analysis.
      */}
      <CharacterNarrator
        character={character}
        onCharacterChange={setCharacter}
        currentNarration={currentStepData?.narration ?? ""}
        isSpeaking={isSpeaking}
      />
    </div>
  );
}