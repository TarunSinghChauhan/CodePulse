// ============================================================
// CodePulse — Core Types
// Every piece of the app derives from ExecutionScript
// ============================================================

export type Language =
  | "python" | "javascript" | "typescript" | "java"
  | "cpp" | "c" | "go" | "rust" | "ruby" | "php" | "unknown";

export type Complexity = "beginner" | "intermediate" | "advanced";

export type HighlightType =
  | "execute" | "declare" | "condition" | "loop"
  | "return" | "error" | "function_call" | "import";

export type ChangeType = "created" | "updated" | "deleted" | "read";

export type BugType =
  | "off_by_one" | "wrong_operator" | "wrong_variable"
  | "missing_return" | "infinite_loop" | "type_error" | "index_error";

export type VariableColor = "purple" | "teal" | "amber" | "coral" | "blue";

// ── Variable definition (top-level, declared once) ──────────
export interface VariableDef {
  name: string;
  type: string;
  color: VariableColor;
}

// ── Variable state at a specific execution step ──────────────
export interface VariableState {
  name: string;
  value: string;
  changed: boolean;
  change_type: ChangeType;
}

// ── A single step in the execution walkthrough ───────────────
export interface Step {
  step_id: number;
  line_start: number;
  line_end: number;
  highlight_type: HighlightType;
  narration: string;        // read aloud by Web Speech API
  explanation: string;      // shown as subtitle text
  variable_states: VariableState[];
  call_stack: string[];
  memory_note: string;
  pause_after_ms: number;
}

// ── Break mode — deliberate bug injection ────────────────────
export interface BreakMode {
  bug_description: string;
  line_to_modify: number;
  original_line: string;
  buggy_line: string;
  bug_type: BugType;
  failure_point_step: number;
  failure_narration: string;
  fix_explanation: string;
}

// ── Concept detected in the code ────────────────────────────
export interface Concept {
  name: string;
  explanation: string;
  line_references: number[];
}

// ── The full script returned by the AI ──────────────────────
export interface ExecutionScript {
  language: Language;
  title: string;
  summary: string;
  complexity: Complexity;
  estimated_duration_seconds: number;
  variables: VariableDef[];
  steps: Step[];
  concepts: Concept[];
  explain_levels: {
    eli5: string;
    intermediate: string;
    senior: string;
  };
  break_mode: BreakMode;
  share_metadata: {
    og_title: string;
    og_description: string;
    tags: string[];
  };
}

// ── Playback state managed by Zustand ───────────────────────
export type PlaybackMode = "normal" | "break" | "quiz";
export type PlaybackStatus = "idle" | "playing" | "paused" | "finished";

export interface PlaybackState {
  status: PlaybackStatus;
  mode: PlaybackMode;
  currentStep: number;
  speed: 0.5 | 1 | 1.5 | 2;
  narratingEnabled: boolean;
  explainLevel: "eli5" | "intermediate" | "senior";
}

// ── Click-to-explain response ────────────────────────────────
export interface LineExplanation {
  line_number: number;
  what_it_does: string;
  why_it_exists: string;
  what_if_changed: string;
  related_concept: string;
  concept_explanation: string;
  common_mistake: string;
  equivalent_in: {
    javascript: string;
    java: string;
    rust: string;
  };
}

// ── Shareable story saved to Supabase ───────────────────────
export interface CodeStory {
  id: string;
  code: string;
  language: Language;
  script: ExecutionScript;
  created_at: string;
  view_count: number;
  story_title: string;
  story_subtitle: string;
  hook_sentence: string;
}
