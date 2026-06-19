// ============================================================
// CodePulse Playback Store — Zustand
// Controls everything: step position, speed, mode, narration
// ============================================================

import { create } from "zustand";
import { ExecutionScript, PlaybackStatus, PlaybackMode } from "@/types/codepulse";

interface PlaybackStore {
  // ── Script ───────────────────────────────────────────────
  script: ExecutionScript | null;
  code: string;
  setScript: (script: ExecutionScript, code: string) => void;
  clearScript: () => void;

  // ── Playback state ───────────────────────────────────────
  status: PlaybackStatus;
  mode: PlaybackMode;
  currentStep: number;
  speed: 0.5 | 1 | 1.5 | 2;
  narratingEnabled: boolean;
  explainLevel: "eli5" | "intermediate" | "senior";

  // ── Actions ──────────────────────────────────────────────
  play: () => void;
  pause: () => void;
  reset: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setSpeed: (speed: 0.5 | 1 | 1.5 | 2) => void;
  toggleNarration: () => void;
  setMode: (mode: PlaybackMode) => void;
  setExplainLevel: (level: "eli5" | "intermediate" | "senior") => void;

  // ── UI state ─────────────────────────────────────────────
  selectedLine: number | null;
  setSelectedLine: (line: number | null) => void;
  sidebarTab: "explanation" | "variables" | "concepts" | "quiz";
  setSidebarTab: (tab: "explanation" | "variables" | "concepts" | "quiz") => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  // ── Initial state ────────────────────────────────────────
  script: null,
  code: "",
  status: "idle",
  mode: "normal",
  currentStep: 0,
  speed: 1,
  narratingEnabled: true,
  explainLevel: "intermediate",
  selectedLine: null,
  sidebarTab: "explanation",
  isLoading: false,
  error: null,

  // ── Script management ────────────────────────────────────
  setScript: (script, code) =>
    set({ script, code, status: "idle", currentStep: 0, mode: "normal", error: null }),

  clearScript: () =>
    set({ script: null, code: "", status: "idle", currentStep: 0 }),

  // ── Playback controls ────────────────────────────────────
  play: () => set({ status: "playing" }),
  pause: () => set({ status: "paused" }),

  reset: () => set({ status: "idle", currentStep: 0 }),

  nextStep: () => {
    const { script, currentStep } = get();
    if (!script) return;
    const maxStep = script.steps.length - 1;
    if (currentStep >= maxStep) {
      set({ status: "finished" });
    } else {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) set({ currentStep: currentStep - 1, status: "paused" });
  },

  goToStep: (step) => {
    const { script } = get();
    if (!script) return;
    const clamped = Math.max(0, Math.min(step, script.steps.length - 1));
    set({ currentStep: clamped, status: "paused" });
  },

  setSpeed: (speed) => set({ speed }),
  toggleNarration: () => set((s) => ({ narratingEnabled: !s.narratingEnabled })),
  setMode: (mode) => set({ mode, currentStep: 0, status: "idle" }),
  setExplainLevel: (level) => set({ explainLevel: level }),

  // ── UI ───────────────────────────────────────────────────
  setSelectedLine: (line) => set({ selectedLine: line }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
