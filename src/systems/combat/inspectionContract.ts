import type { CombatSide } from './sides';

/** One fighter laid open for debugging: who they are, and everything the engine holds on them. */
export interface InspectedFighter {
  readonly id: string;
  readonly name: string;
  readonly side: CombatSide;
  /** The engine's whole record of them, as plain data (stats, kit, plan, conditions, pools). */
  readonly detail: unknown;
}

/**
 * A fight laid open for debugging (a fight record's download, `game/fightRecord/`). Only the
 * engine knows its own state, so it says what each fighter is and holds, as plain data.
 */
export interface CombatInspection {
  readonly round: number;
  readonly fighters: readonly InspectedFighter[];
  /** Every choice made so far with its reasons, when the fight is traced (`CombatSetup.trace`). */
  readonly decisions: readonly unknown[];
  /** The rest of the fight's state an engine thinks worth showing (distances, reads, field). */
  readonly field: unknown;
}
