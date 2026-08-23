"use client";
import { motion } from "framer-motion";
import { usePlaybackStore } from "@/stores/playback";
import { usePlayback } from "@/hooks/usePlayback";
import { calculateStepFromClickRatio } from "@/utils/playbackCalc";

export function PlayerControls() {
  const {
    status, speed, narratingEnabled, mode,
    play, pause, reset, nextStep, prevStep, goToStep,
    setSpeed, toggleNarration, setMode,
    script, currentStep,
  } = usePlaybackStore();

  const { progress, totalSteps } = usePlayback();

  const isPlaying = status === "playing";
  const isFinished = status === "finished";

  return (
    <div className="flex flex-col gap-3 p-4 border-t border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]" style={{ borderColor: "#1E1E2A", background: "#0D0D12" }}>
      <div className="flex items-center gap-3">
        <span className="text-xs text-[var(--color-text-tertiary)] w-8 text-right tabular-nums" style={{ color: "#55556A" }}>
          {currentStep + 1}
        </span>
        <div className="relative flex-1 h-1.5 rounded-full cursor-pointer" style={{ background: "#1C1C24" }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            goToStep(calculateStepFromClickRatio(e.clientX, rect.left, rect.width, totalSteps));
          }}
        >
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: "#7F77DD" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.15 }}
          />
        </div>
        <span className="text-xs w-8 tabular-nums" style={{ color: "#55556A" }}>
          {totalSteps}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={prevStep} disabled={currentStep === 0}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30"
            style={{ color: "#9898B0" }}>⏮</button>

          <button
            onClick={() => isPlaying ? pause() : (isFinished ? reset() : play())}
            disabled={!script}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-base disabled:opacity-30"
            style={{ background: "#7F77DD" }}
          >
            {isFinished ? "↺" : isPlaying ? "⏸" : "▶"}
          </button>

          <button onClick={nextStep} disabled={isFinished || !script}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30"
            style={{ color: "#9898B0" }}>⏭</button>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: "#141419" }}>
          {(["normal", "break"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); reset(); }}
              className="text-xs px-3 py-1 rounded-md transition-all"
              style={{
                background: mode === m ? (m === "break" ? "#E24B4A" : "#7F77DD") : "transparent",
                color: mode === m ? "#fff" : "#55556A",
                fontWeight: mode === m ? 500 : 400,
              }}
            >
              {m === "normal" ? "▶ Play" : "🐛 Break"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleNarration}
            className="text-xs px-2 py-1 rounded-md border transition-all"
            style={{
              borderColor: narratingEnabled ? "#7F77DD" : "#1E1E2A",
              color: narratingEnabled ? "#7F77DD" : "#55556A",
              background: narratingEnabled ? "#EEEDFE" : "transparent",
            }}
          >
            {narratingEnabled ? "🔊" : "🔇"}
          </button>

          <div className="flex items-center gap-1">
            {([0.5, 1, 1.5, 2] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="text-xs px-2 py-0.5 rounded transition-all"
                style={{
                  background: speed === s ? "#EEEDFE" : "transparent",
                  color: speed === s ? "#7F77DD" : "#55556A",
                  fontWeight: speed === s ? 500 : 400,
                }}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}