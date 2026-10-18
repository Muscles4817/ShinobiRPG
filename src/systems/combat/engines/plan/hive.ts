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
