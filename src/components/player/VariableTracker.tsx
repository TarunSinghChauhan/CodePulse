"use client";
// ============================================================
// VariableTracker — live variable badges
// Animate when a variable's value changes
// ============================================================

import { motion, AnimatePresence } from "framer-motion";
import { usePlaybackStore } from "@/stores/playback";
import { usePlayback } from "@/hooks/usePlayback";

const COLOR_MAP = {
  purple: { bg: "#EEEDFE", text: "#3C3489", border: "#AFA9EC", dot: "#7F77DD" },
  teal:   { bg: "#E1F5EE", text: "#085041", border: "#5DCAA5", dot: "#1D9E75" },
  amber:  { bg: "#FAEEDA", text: "#633806", border: "#EF9F27", dot: "#D97706" },
  coral:  { bg: "#FAECE7", text: "#712B13", border: "#F0997B", dot: "#D85A30" },
  blue:   { bg: "#E6F1FB", text: "#0C447C", border: "#85B7EB", dot: "#378ADD" },
};

export function VariableTracker() {
  const { script } = usePlaybackStore();
  const { currentStepData } = usePlayback();

  if (!script || !currentStepData) {
    return (
      <div className="p-4 text-sm text-[var(--color-text-tertiary)]">
        Variables will appear here during playback.
      </div>
    );
  }

  const { variable_states } = currentStepData;

  return (
    <div className="p-4 space-y-2">
      <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">
        Variables — Step {currentStepData.step_id}
      </p>

      <AnimatePresence mode="popLayout">
        {variable_states.map((varState) => {
          const def = script.variables.find((v) => v.name === varState.name);
const colorKey = def?.color ?? "purple";
const colors = COLOR_MAP[colorKey] ?? COLOR_MAP["purple"];

          return (
            <motion.div
              key={varState.name}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: varState.changed ? [1, 1.03, 1] : 1,
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                background: colors.bg,
                border: `0.5px solid ${varState.changed ? colors.dot : colors.border}`,
                borderRadius: 8,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              {/* Name + type */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: colors.dot,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: colors.text,
                      fontFamily: "monospace",
                    }}
                  >
                    {varState.name}
                  </span>
                  {def && (
                    <span
                      style={{
                        fontSize: 11,
                        color: colors.text,
                        opacity: 0.6,
                        marginLeft: 6,
                      }}
                    >
                      {def.type}
                    </span>
                  )}
                </div>
              </div>

              {/* Value + change indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {varState.changed && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      fontSize: 10,
                      padding: "1px 6px",
                      borderRadius: 99,
                      background: colors.dot,
                      color: "#fff",
                      fontWeight: 500,
                    }}
                  >
                    {varState.change_type}
                  </motion.span>
                )}
                <code
                  style={{
                    fontSize: 13,
                    fontFamily: "monospace",
                    color: colors.text,
                    fontWeight: 500,
                    maxWidth: 120,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {varState.value}
                </code>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Memory note */}
      {currentStepData.memory_note && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-[var(--color-text-tertiary)] bg-[var(--color-background-secondary)] rounded-md p-3 leading-relaxed"
        >
          <span className="font-medium text-[var(--color-text-secondary)]">Memory: </span>
          {currentStepData.memory_note}
        </motion.div>
      )}
    </div>
  );
}
