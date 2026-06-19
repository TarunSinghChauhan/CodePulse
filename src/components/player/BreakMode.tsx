"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePlaybackStore } from "@/stores/playback";

export function BreakMode() {
  const { script, mode } = usePlaybackStore();

  if (mode !== "break" || !script) return null;

  const bug = script.break_mode;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
        style={{ background: "rgba(13,13,18,0.88)", backdropFilter: "blur(3px)" }}
      >
        {/* Red pulse rings */}
        <div className="relative flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border"
              style={{ borderColor: "#E24B4A" }}
              initial={{ width: 40, height: 40, opacity: 0.8 }}
              animate={{ width: 40 + i * 50, height: 40 + i * 50, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3, ease: "easeOut" }}
            />
          ))}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: "#E24B4A" }}
          >
            🐛
          </div>
        </div>

        {/* Bug info */}
        <div className="text-center space-y-3 px-8" style={{ maxWidth: 520 }}>
          <motion.p
            className="text-lg font-semibold"
            style={{ color: "#E24B4A" }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Bug Injected — Line {bug.line_to_modify}
          </motion.p>

          <p className="text-sm" style={{ color: "#55556A" }}>
            {bug.bug_description}
          </p>

          {/* Original vs buggy comparison */}
          <div className="space-y-2 text-left">
            <div className="rounded-lg p-3" style={{ background: "#0D1F14", border: "0.5px solid #1D9E75" }}>
              <p className="text-xs mb-1 font-medium" style={{ color: "#1D9E75" }}>✓ Original</p>
              <code className="text-sm font-mono" style={{ color: "#9CDCFE" }}>{bug.original_line}</code>
            </div>
            <div className="rounded-lg p-3" style={{ background: "#1F0D0D", border: "0.5px solid #E24B4A" }}>
              <p className="text-xs mb-1 font-medium" style={{ color: "#E24B4A" }}>✗ Buggy</p>
              <code className="text-sm font-mono" style={{ color: "#F48771" }}>{bug.buggy_line}</code>
            </div>
          </div>

          {/* Dramatic narration */}
          <p className="text-sm leading-relaxed italic" style={{ color: "#9898B0" }}>
            "{bug.failure_narration}"
          </p>

          {/* Fix box */}
          <div className="rounded-lg p-3 text-left" style={{ background: "#141419", border: "0.5px solid #EF9F27" }}>
            <p className="text-xs mb-1 font-medium" style={{ color: "#EF9F27" }}>💡 The Fix</p>
            <p className="text-sm leading-relaxed" style={{ color: "#9898B0" }}>
              {bug.fix_explanation}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}