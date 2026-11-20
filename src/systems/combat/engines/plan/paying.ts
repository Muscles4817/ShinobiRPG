/** Paying chakra: the one way a fighter's tank goes down for a cost. */

interface Tank {
  readonly chakra: number;
  readonly chakraSpent?: number;
}

/** The change to a fighter who pays chakra: less left, more spent (never below empty). */
export function paying(f: Tank, cost: number): { chakra: number; chakraSpent: number } {
  const paid = Math.min(f.chakra, cost);
  return { chakra: f.chakra - paid, chakraSpent: (f.chakraSpent ?? 0) + paid };
}
