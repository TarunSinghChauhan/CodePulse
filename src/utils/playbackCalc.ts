export function calculateProgress(currentStep: number, totalSteps: number): number {
  if (totalSteps <= 1) return 0;
  return (currentStep / (totalSteps - 1)) * 100;
}

export function calculateActiveLines(lineStart: number, lineEnd: number): number[] {
  const length = lineEnd - lineStart + 1;
  if (length <= 0) return [];
  return Array.from({ length }, (_, i) => lineStart + i);
}
