export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Rounds to one decimal place — the precision stats are displayed at. */
export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Rounds to two decimal places — the precision small stat gains are shown at. */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Rounds to three decimal places — the precision stats grow and are stored at. */
export function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Logistic curve mapping any number to (0, 1). Used for skill-check probabilities. */
export function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}
