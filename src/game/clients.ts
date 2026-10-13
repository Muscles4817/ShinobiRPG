import { addLedger, type MissionDef, type MissionRun } from '@/systems/missions';

import type { GameState } from './state';

/**
 * Clients remember who did good work for them. The village counts the jobs done for each; a
 * client you have worked for before asks for you by name, and pays a little more for it (not
 * for routine work like the standing patrols).
 */

/** The extra share of the pay a returning client adds. */
export const CLIENT_RETURN_SHARE = 0.1;

export function jobsFor(state: GameState, client: string): number {
  return state.village.clients[client] ?? 0;
}

/** Whether a job's client asks for you: one you've worked for, on a job that isn't routine. */
export function asksForYou(state: GameState, def: MissionDef): boolean {
  return def.standing !== true && jobsFor(state, def.client) > 0;
}

/** A returning client's welcome on a job just begun: the extra pay, and the line that says why. */
export function welcomeBack(state: GameState, def: MissionDef, run: MissionRun): MissionRun {
  if (!asksForYou(state, def)) return run;
  const paid = { ...run, rewardMultiplier: run.rewardMultiplier + CLIENT_RETURN_SHARE };
  const text = `${def.client} asked for you by name.`;
  return addLedger(paid, { text, tone: 'gain', pay: CLIENT_RETURN_SHARE });
}

/** One more job done for a client. */
export function workedFor(state: GameState, client: string): GameState {
  const clients = { ...state.village.clients, [client]: jobsFor(state, client) + 1 };
  return { ...state, village: { ...state.village, clients } };
}
