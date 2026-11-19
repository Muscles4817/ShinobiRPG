/**
 * An illusion held on a fighter, as a shape only so `PlanFighter` can carry it (`illusions.ts`):
 * who keeps it up, and what keeping it costs them each exchange.
 */
export interface HeldIllusion {
  /** The caster keeping it up. */
  readonly by: string;
  /** Chakra it costs them at the end of each exchange it holds. */
  readonly upkeep: number;
}

export interface UnderIllusion {
  /** A lasting illusion (a confusion, a binding) someone keeps up on them; absent: none. */
  readonly illusion?: HeldIllusion;
}
