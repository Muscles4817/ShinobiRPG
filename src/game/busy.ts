import type { GameState } from './state';

/**
 * Whether you are free to start something: one answer, read by every verb's check (through
 * `ops`) and by the happenings' `free` need, kept apart from `ops` so the happenings can ask it
 * without importing what passes time.
 */

/** What a run in progress keeps you to: a trip, a venture or a job. */
function awayOn(run: NonNullable<GameState['mission']>): string {
  if (run.journey) return 'You are on the road.';
  return run.venture ? 'You are out in the wild.' : 'You are on a mission.';
}

/** Reason the character can't start a new activity, or null if they're free. */
export function busyReason(state: GameState): string | null {
  if (state.combat) return 'You are in the middle of a fight.';
  if (state.mission) return awayOn(state.mission);
  if (state.exams.run) return 'You are sitting an exam.';
  if (state.exams.ceremony) return 'Your promotion ceremony is waiting.';
  if (state.people.conversation) return 'You are in the middle of a conversation.';
  if (!state.people.team?.senseiId) return 'Your team has not been assigned yet.';
  if (state.rival?.beat) return 'Your rival is waiting for an answer.';
  if (state.rival?.race) return 'You’re in the middle of a race.';
  if (!state.character.natureKnown) return 'Your sensei is waiting with the chakra paper.';
  if (state.mentor.opening) return 'Your sensei is waiting to see what you can do.';
  return null;
}
