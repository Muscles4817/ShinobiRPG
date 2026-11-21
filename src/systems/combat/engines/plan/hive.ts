import type { CombatTechnique } from '../../contract';
import { swarmAffords } from '../../rules/swarms';
import type { CombatSwarm } from '../../swarmContract';

/** What a fighter carries of hives in a planned fight (`swarm.ts`). */

/** Insects sitting on a fighter, and whose they are. */
export interface Settled {
  readonly hostId: string;
  readonly perExchange: number;
  readonly exchanges: number;
}

export interface Hive {
  /** The hive in their body; absent for most. */
  readonly swarm?: CombatSwarm;
  /** Someone's insects sitting on them. */
  readonly settled?: Settled;
}

/**
 * Whether a fighter has the insects a technique asks of their hive. Kept here, beside the hive's
 * shape, so the cards can ask it without reaching the swarm's play (which hurts through `wound`).
 */
export function hasInsectsFor(fighter: Hive, t: CombatTechnique): boolean {
  return swarmAffords(fighter.swarm, t.swarmCost);
}
