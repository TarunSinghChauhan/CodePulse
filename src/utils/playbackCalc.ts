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
