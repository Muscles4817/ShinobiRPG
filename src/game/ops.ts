import { write, type JournalTone } from '@/systems/journal';
import { advanceSlots } from '@/systems/time';
import { adjustVitals, maxHealth, passTime, type VitalsDelta } from '@/systems/vitals';

import type { GameState } from './state';

/**
 * Small state-transition helpers shared by action handlers. Each returns a new state;
 * none of them validate — validation lives in each handler's `check`.
 */

export function spendTime(state: GameState, slots: number): GameState {
  if (slots <= 0) return state;
  const { character } = state;
  return {
    ...state,
    time: advanceSlots(state.time, slots),
    character: { ...character, vitals: passTime(character.vitals, slots, character.stats) },
  };
}

export function adjust(state: GameState, delta: VitalsDelta): GameState {
  const { character } = state;
  return {
    ...state,
    character: { ...character, vitals: adjustVitals(character.vitals, delta, character.stats) },
  };
}

export function log(state: GameState, text: string, tone: JournalTone = 'info'): GameState {
  return { ...state, journal: write(state.journal, state.time.day, text, tone) };
}

/** Reason the character can't start a new activity, or null if they're free. */
export function busyReason(state: GameState): string | null {
  if (state.combat) return 'You are in the middle of a fight.';
  if (state.mission) return 'You are on a mission.';
  return null;
}

export function healthFraction(state: GameState): number {
  return state.character.vitals.health / maxHealth(state.character.stats);
}

/** Composes blocker checks: returns the first non-null reason. */
export function firstBlocker(...reasons: (string | null | false)[]): string | null {
  for (const reason of reasons) if (reason) return reason;
  return null;
}
