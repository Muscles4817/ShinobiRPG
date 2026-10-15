import type { RangeBand } from '../../contract';

/**
 * What a fighter keeps for the ground between them and their foes (`zoning.ts`): the attack
 * kept ready at each distance to hold off anyone closing in, and when they last moved. Kept apart from `state.ts`, which builds on it.
 */

/** The attack kept ready at each distance to hold off anyone closing in, by card id. */
export type HoldOff = Readonly<Record<RangeBand, string | null>>;

export interface Footing {
  /** What they hold off with at each distance; absent: nothing (and in fights saved before). */
  readonly holdOff?: HoldOff;
  /** The exchange they last stepped: on the move, only a Dodge defends them. */
  readonly movedAt?: number;
}
