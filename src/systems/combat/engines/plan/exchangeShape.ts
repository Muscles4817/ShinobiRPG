import type { CombatantSetup } from '../../contract';

/**
 * What one exchange keeps while it plays, as a shape only so `Round` can hold it: the elemental
 * hits landed (for clashes and cycles) and the illusions sunk in, by mind and target
 * (`oneNightmare.ts`).
 */

export interface ElementHit {
  readonly targetId: string;
  readonly fighterId: string;
  readonly element: NonNullable<CombatantSetup['nature']>;
}

export interface ExchangeMarks {
  /** Elemental hits landed this exchange. */
  readonly hits?: readonly ElementHit[];
  /** Illusions sunk in this exchange, as `mind>target`. */
  readonly illusions?: readonly string[];
}
