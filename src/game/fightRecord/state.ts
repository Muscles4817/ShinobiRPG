import type { CombatantView, CombatEvent, CombatInspection, RangeBand } from '@/systems/combat';
import type { GameTime } from '@/systems/time';

import type { Report } from '../reports';

/**
 * The record of the last fight, kept as it is fought so it can be downloaded whole: the engine
 * lets go of all but its latest events, so the record gathers every one in order, a snapshot of
 * everyone after each step, and the fight laid open at its start and end (`CombatInspection`).
 * It is for debugging, never for play, and it isn't written into saves (`persistence/save.ts`).
 */

/** Everyone as the fight screen showed them after one step (a choice, or the fight's opening). */
export interface FightStep {
  readonly step: number;
  /** The option chosen, or null for the fight as it opened. */
  readonly choice: string | null;
  readonly round: number;
  readonly range: RangeBand | null;
  readonly combatants: readonly CombatantView[];
}

export interface FightRecord {
  /** Still being fought; a closed record is replaced when the next fight begins. */
  readonly open: boolean;
  readonly engineId: string;
  readonly began: GameTime;
  /** The fight laid open as the record began, and as it ended. */
  readonly start: CombatInspection | null;
  readonly end: CombatInspection | null;
  /** Every event of the fight's story in order, as the engine recorded them. */
  readonly story: readonly CombatEvent[];
  readonly steps: readonly FightStep[];
  /** The fight's result card, once it is settled. */
  readonly result: Report | null;
}
