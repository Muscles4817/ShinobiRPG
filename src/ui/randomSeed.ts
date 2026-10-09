/** A fresh seed for a new life. The only randomness outside the game's seeded Rng. */
export function randomSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}
