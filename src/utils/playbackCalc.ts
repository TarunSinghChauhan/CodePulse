export function calculateProgress(currentStep: number, totalSteps: number): number {
  if (totalSteps <= 1) return 0;
  return (currentStep / (totalSteps - 1)) * 100;
}

export function calculateActiveLines(lineStart: number, lineEnd: number): number[] {
  const length = lineEnd - lineStart + 1;
  if (length <= 0) return [];
  return Array.from({ length }, (_, i) => lineStart + i);
}

export function calculateStepFromClickRatio(clickX: number, elementLeft: number, elementWidth: number, totalSteps: number): number {
  if (elementWidth <= 0 || totalSteps <= 1) return 0;
  const ratio = (clickX - elementLeft) / elementWidth;
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  return Math.round(clampedRatio * (totalSteps - 1));
}

export function truncateNarration(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function formatLineRange(lineStart: number, lineEnd: number): string {
  if (lineEnd === lineStart) return `Line ${lineStart}`;
  return `Line ${lineStart}–${lineEnd}`;
}

export function calculateSpeechTiming(narrationLength: number, rate: number, speed: number): { speechMs: number; totalWait: number } {
  const speechMs = (narrationLength / (rate * 11)) * 1000;
  const totalWait = (speechMs + 2000) / speed;
  return { speechMs, totalWait };
}

interface VoiceLike {
  name: string;
  lang: string;
  localService: boolean;
}

export function selectBestVoice<T extends VoiceLike>(voices: T[]): T | undefined {
  return (
    voices.find((v) => v.name === "Google UK English Male") ||
    voices.find((v) => v.name === "Google US English") ||
    voices.find((v) => v.name.includes("Daniel")) ||
    voices.find((v) => v.name.includes("David")) ||
    voices.find((v) => v.lang === "en-US" && !v.localService) ||
    voices.find((v) => v.lang.startsWith("en"))
  );
}

const VARIABLE_COLOR_MAP = {
  purple: { bg: "#EEEDFE", text: "#3C3489", border: "#AFA9EC", dot: "#7F77DD" },
  teal:   { bg: "#E1F5EE", text: "#085041", border: "#5DCAA5", dot: "#1D9E75" },
  amber:  { bg: "#FAEEDA", text: "#633806", border: "#EF9F27", dot: "#D97706" },
  coral:  { bg: "#FAECE7", text: "#712B13", border: "#F0997B", dot: "#D85A30" },
  blue:   { bg: "#E6F1FB", text: "#0C447C", border: "#85B7EB", dot: "#378ADD" },
} as const;

export function getVariableColors(colorKey: string | undefined) {
  const key = (colorKey ?? "purple") as keyof typeof VARIABLE_COLOR_MAP;
  return VARIABLE_COLOR_MAP[key] ?? VARIABLE_COLOR_MAP["purple"];
}
