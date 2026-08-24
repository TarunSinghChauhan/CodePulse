"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { truncateNarration } from "@/utils/playbackCalc";

export type Character = "batman" | "spiderman" | "superman" | "none";

const CHARACTERS = {
  batman: {
    name: "Batman",
    rate: 0.7,
    pitch: 0.55,
    color: "#e94560",
    bgColor: "#1a1a2e",
  },
  spiderman: {
    name: "Spiderman",
    rate: 1.1,
    pitch: 1.35,
    color: "#c0392b",
    bgColor: "#922b21",
  },
  superman: {
    name: "Superman",
    rate: 0.85,
    pitch: 0.85,
    color: "#2980b9",
    bgColor: "#1a5276",
  },
};

function BatmanSVG({ mouthOpen }: { mouthOpen: boolean }) {
  return (
    <svg width="72" height="80" viewBox="0 0 60 70">
      <ellipse cx="30" cy="42" rx="18" ry="22" fill="#1a1a2e"/>
      <ellipse cx="30" cy="38" rx="14" ry="16" fill="#16213e"/>
      <polygon points="14,28 8,12 22,24" fill="#1a1a2e"/>
      <polygon points="46,28 52,12 38,24" fill="#1a1a2e"/>
      <ellipse cx="30" cy="36" rx="12" ry="10" fill="#1a1a2e"/>
      <rect x="22" y="30" width="16" height="3" rx="1" fill="#0f3460"/>
      <ellipse cx="24" cy="37" rx="4" ry="3" fill="#e94560"/>
      <ellipse cx="36" cy="37" rx="4" ry="3" fill="#e94560"/>
      <ellipse cx="30" cy="44" rx="5" ry={mouthOpen ? 4 : 1.5} fill="#0f3460"
        style={{ transition: "ry 0.15s ease" }}/>
      <ellipse cx="30" cy="60" rx="16" ry="8" fill="#1a1a2e"/>
      <polygon points="20,55 14,68 26,62" fill="#1a1a2e"/>
      <polygon points="40,55 46,68 34,62" fill="#1a1a2e"/>
      <ellipse cx="30" cy="58" rx="6" ry="3" fill="#e94560" opacity="0.6"/>
    </svg>
  );
}

function SpidermanSVG({ mouthOpen }: { mouthOpen: boolean }) {
  return (
    <svg width="72" height="80" viewBox="0 0 60 70">
      <ellipse cx="30" cy="38" rx="18" ry="20" fill="#c0392b"/>
      <ellipse cx="30" cy="38" rx="18" ry="20" fill="none" stroke="#1a1a2e" strokeWidth="1"/>
      <line x1="30" y1="18" x2="30" y2="58" stroke="#1a1a2e" strokeWidth="0.8"/>
      <line x1="12" y1="38" x2="48" y2="38" stroke="#1a1a2e" strokeWidth="0.8"/>
      <line x1="15" y1="25" x2="45" y2="51" stroke="#1a1a2e" strokeWidth="0.8"/>
      <line x1="45" y1="25" x2="15" y2="51" stroke="#1a1a2e" strokeWidth="0.8"/>
      <ellipse cx="22" cy="35" rx="6" ry="5" fill="#1a1a2e"/>
      <ellipse cx="38" cy="35" rx="6" ry="5" fill="#1a1a2e"/>
      <ellipse cx="22" cy="35" rx="4" ry="3" fill="white"/>
      <ellipse cx="38" cy="35" rx="4" ry="3" fill="white"/>
      <ellipse cx="30" cy="46" rx="6" ry={mouthOpen ? 4.5 : 1.5} fill="#922b21"
        style={{ transition: "ry 0.12s ease" }}/>
      <ellipse cx="30" cy="60" rx="14" ry="7" fill="#c0392b"/>
      <ellipse cx="30" cy="58" rx="5" ry="2" fill="#1a1a2e" opacity="0.4"/>
    </svg>
  );
}

function SupermanSVG({ mouthOpen }: { mouthOpen: boolean }) {
  return (
    <svg width="72" height="80" viewBox="0 0 60 70">
      <ellipse cx="30" cy="36" rx="17" ry="19" fill="#f5cba7"/>
      <rect x="16" y="18" width="28" height="6" rx="3" fill="#1a1a2e"/>
      <rect x="13" y="22" width="34" height="4" rx="2" fill="#1a1a2e"/>
      <ellipse cx="23" cy="34" rx="4" ry="3" fill="#2980b9"/>
      <ellipse cx="37" cy="34" rx="4" ry="3" fill="#2980b9"/>
      <ellipse cx="23" cy="34" rx="2.5" ry="2" fill="#1a5276"/>
      <ellipse cx="37" cy="34" rx="2.5" ry="2" fill="#1a5276"/>
      <ellipse cx="30" cy="43" rx="5" ry={mouthOpen ? 4 : 1.5} fill="#e59866"
        style={{ transition: "ry 0.15s ease" }}/>
      <ellipse cx="30" cy="59" rx="15" ry="8" fill="#2980b9"/>
      <polygon points="22,54 16,66 24,60" fill="#2471a3"/>
      <polygon points="38,54 44,66 36,60" fill="#2471a3"/>
      <text x="30" y="62" textAnchor="middle" fontSize="8" fontWeight="700" fill="#f1c40f">S</text>
    </svg>
  );
}

interface CharacterNarratorProps {
  character: Character;
  onCharacterChange: (c: Character) => void;
  currentNarration: string;
  isSpeaking: boolean;
}

export function CharacterNarrator({
  character,
  onCharacterChange,
  currentNarration,
  isSpeaking,
}: CharacterNarratorProps) {
  const [mouthOpen, setMouthOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isSpeaking && character !== "none") {
      intervalRef.current = setInterval(() => {
        setMouthOpen((o) => !o);
      }, 160);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setMouthOpen(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSpeaking, character]);

  // Always render at fixed position — escapes ALL overflow:hidden containers
  return (
    <>
      {/* Add narrator button (when none selected) */}
      {character === "none" && (
        <button
          onClick={() => setShowPicker(true)}
          style={{
            position: "fixed",
            bottom: "88px",
            left: "16px",
            zIndex: 9999,
            background: "#141419",
            border: "0.5px solid #2A2A3C",
            color: "#55556A",
            fontSize: "12px",
            padding: "6px 12px",
            borderRadius: "999px",
            cursor: "pointer",
            pointerEvents: "all",
          }}
        >
          + Add narrator character
        </button>
      )}

      {/* Character display (when one is selected) */}
      {character !== "none" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "fixed",
            bottom: "88px",
            left: "16px",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            pointerEvents: "all",
          }}
        >
          {/* Speech bubble */}
          <AnimatePresence>
            {isSpeaking && currentNarration && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  left: 0,
                  width: "224px",
                  borderRadius: "8px",
                  padding: "10px",
                  fontSize: "12px",
                  lineHeight: 1.5,
                  background: "#141419",
                  border: `0.5px solid ${CHARACTERS[character].color}40`,
                  color: "#9898B0",
                  boxShadow: `0 0 12px ${CHARACTERS[character].color}20`,
                }}
              >
                <p style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: CHARACTERS[character].color }}>
                  {CHARACTERS[character].name}
                </p>
                {truncateNarration(currentNarration)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Avatar */}
          <div
            onClick={() => setShowPicker(true)}
            style={{
              cursor: "pointer",
              borderRadius: "999px",
              padding: "4px",
              background: "#0D0D12",
              border: `1.5px solid ${isSpeaking ? CHARACTERS[character].color : "#2A2A3C"}`,
              boxShadow: isSpeaking ? `0 0 16px ${CHARACTERS[character].color}50` : "none",
              transition: "box-shadow 0.3s ease, border-color 0.3s ease",
            }}
          >
            {character === "batman" && <BatmanSVG mouthOpen={mouthOpen} />}
            {character === "spiderman" && <SpidermanSVG mouthOpen={mouthOpen} />}
            {character === "superman" && <SupermanSVG mouthOpen={mouthOpen} />}
          </div>

          {/* Name tag */}
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              padding: "2px 8px",
              borderRadius: "999px",
              background: CHARACTERS[character].color + "20",
              color: CHARACTERS[character].color,
              border: `0.5px solid ${CHARACTERS[character].color}40`,
            }}
          >
            {CHARACTERS[character].name}
          </span>
        </motion.div>
      )}

      {/* Character picker modal */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPicker(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(13,13,18,0.85)",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                borderRadius: "12px",
                padding: "24px",
                background: "#141419",
                border: "0.5px solid #2A2A3C",
                minWidth: "320px",
              }}
            >
              <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "16px", color: "#F0F0F5" }}>
                Choose your narrator
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
                {(["batman", "spiderman", "superman"] as Character[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => { onCharacterChange(c); setShowPicker(false); }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 8px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: character === c ? "#EEEDFE" : "#0D0D12",
                      border: `0.5px solid ${character === c ? "#AFA9EC" : "#2A2A3C"}`,
                    }}
                  >
                    {c === "batman" && <BatmanSVG mouthOpen={false} />}
                    {c === "spiderman" && <SpidermanSVG mouthOpen={false} />}
                    {c === "superman" && <SupermanSVG mouthOpen={false} />}
                    <span style={{ fontSize: "12px", fontWeight: 500, textTransform: "capitalize", color: character === c ? "#3C3489" : "#9898B0" }}>
                      {CHARACTERS[c as keyof typeof CHARACTERS].name}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => { onCharacterChange("none"); setShowPicker(false); }}
                style={{
                  width: "100%",
                  fontSize: "12px",
                  padding: "8px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "0.5px solid #2A2A3C",
                  color: "#55556A",
                  cursor: "pointer",
                }}
              >
                Remove character
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}