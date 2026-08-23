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
