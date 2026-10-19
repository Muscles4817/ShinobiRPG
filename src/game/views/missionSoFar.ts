import { crewDebrief, debriefLines } from '../debrief';
import type { GameContext } from '../context';
import type { DebriefCrew, DebriefLine } from '../reports';
import type { GameState } from '../state';

/**
 * A job as it stands, read the way its debrief will read it: the ledger so far, with the pay
 * each line moved, and how much closer you have come to each person along. The desktop layout
 * keeps it beside the story; the phone waits for the debrief.
 */
export interface MissionSoFar {
  readonly road: readonly DebriefLine[];
  readonly crew: readonly DebriefCrew[];
}

/** The job under way so far, or null when there is none (or a fight has the screen). */
export function missionSoFar(state: GameState, ctx: GameContext): MissionSoFar | null {
  const run = state.mission;
  if (!run || state.combat) return null;
  return { road: debriefLines(run.ledger), crew: crewDebrief(state, ctx, run) };
}
