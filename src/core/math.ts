export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Rounds to one decimal place — the precision stats are displayed and stored at. */
export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Logistic curve mapping any number to (0, 1). Used for skill-check probabilities. */
export function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}
