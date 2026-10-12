import type { GameState } from '../state';

/**
 * The genin who go out with you on a team mission: the two sitting the exam with you while you
 * are in one (a replacement among them), otherwise your team's.
 */
export function fieldTeamIds(state: Pick<GameState, 'exams' | 'people'>): readonly string[] {
  return state.exams.run?.teamIds ?? state.people.team?.teammateIds ?? [];
}
