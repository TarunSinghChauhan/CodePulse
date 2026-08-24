"use client";
// ============================================================
// NarrationOverlay — the cinematic subtitle bar
// Shows explanation text in sync with playback
// ============================================================

import { motion, AnimatePresence } from "framer-motion";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlaybackStore } from "@/stores/playback";
import { formatLineRange } from "@/utils/playbackCalc";

const HIGHLIGHT_LABELS: Record<string, { label: string; color: string }> = {
  execute:       { label: "Execute",       color: "#7F77DD" },
  declare:       { label: "Declare",       color: "#1D9E75" },
  condition:     { label: "Condition",     color: "#EF9F27" },
  loop:          { label: "Loop",          color: "#378ADD" },
  return:        { label: "Return",        color: "#1D9E75" },
  error:         { label: "Error",         color: "#E24B4A" },
  function_call: { label: "Call",          color: "#7F77DD" },
  import:        { label: "Import",        color: "#888"    },
};

export function NarrationOverlay() {
  const { status, mode } = usePlaybackStore();
  const { currentStepData, totalSteps } = usePlayback();

  const visible = status === "playing" || status === "paused";
  if (!visible || !currentStepData) return null;

  const typeInfo = HIGHLIGHT_LABELS[currentStepData.highlight_type] ??
    { label: "Step", color: "#7F77DD" };

  const isBreakMode = mode === "break";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStepData.step_id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
        style={{
          background: isBreakMode
            ? "linear-gradient(to top, rgba(226,75,74,0.95), rgba(226,75,74,0.7) 70%, transparent)"
            : "linear-gradient(to top, rgba(10,10,16,0.95), rgba(10,10,16,0.7) 70%, transparent)",
          padding: "48px 24px 80px",
        }}
      >
        {/* Type badge + step counter */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: typeInfo.color + "30",
              color: typeInfo.color,
              border: `0.5px solid ${typeInfo.color}60`,
            }}
          >
            {typeInfo.label}
          </span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            {formatLineRange(currentStepData.line_start, currentStepData.line_end)}
          </span>
          <span className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
            {currentStepData.step_id} / {totalSteps}
          </span>
        </div>

        {/* Explanation subtitle */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: "rgba(255,255,255,0.9)", maxWidth: 680 }}
        >
          {currentStepData.explanation}
        </p>

        {/* Call stack */}
        {currentStepData.call_stack.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              Stack:
            </span>
            {currentStepData.call_stack.map((frame, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && (
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
                )}
                <code
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {frame}
                </code>
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
