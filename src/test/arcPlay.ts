import { missionScene, type GameContext, type GameState } from '@/game';
import { stock } from '@/systems/inventory';

import { act, fightOut, newGame, veteran, withAllStats } from './gameFixtures';

/**
 * Playing long stories in tests: a seasoned, well-fed genin who takes jobs one after another,
 * picking the choices a test prefers and fighting their way through the rest.
 */

export interface ArcPlayer {
  /** A capable genin with a record, rations for the road and no reports waiting. */
  readonly ready: () => GameState;
  /** Plays a job to its end, taking the first preferred choice on offer, else the first. */
  readonly play: (start: GameState, id: string, prefer?: readonly string[]) => GameState;
  /** Starts a job and plays up to the first choice whose label starts with `at`. */
  readonly upTo: (start: GameState, id: string, at: string) => GameState;
  /** The labels on offer at the job's current choice. */
  readonly labels: (s: GameState) => string[];
}

export function arcPlayer(context: GameContext): ArcPlayer {
  const ready = (): GameState => {
    const s = withAllStats(veteran(newGame({}, context), 6), 60);
    return { ...s, inventory: stock(s.inventory, 'travel-rations', 12), reports: [] };
  };
  // Rested between jobs, with any promotion a deadly job earned already celebrated.
  const rested = (s: GameState): GameState => ({
    ...s,
    character: { ...s.character, vitals: ready().character.vitals },
    exams: { ...s.exams, ceremony: null },
  });
  const labels = (s: GameState) => (missionScene(s, context)?.choices ?? []).map((c) => c.label);
  const play = (start: GameState, id: string, prefer: readonly string[] = []): GameState => {
    let s = act(rested(start), { type: 'startMission', missionId: id }, context);
    for (let i = 0; i < 60 && s.mission; i++) {
      if (s.combat) s = fightOut(s, context);
      else if (s.mission.encounter) {
        s = act(s, { type: 'encounterApproach', approach: 'head-on' }, context);
      } else {
        const choices = missionScene(s, context)?.choices ?? [];
        const pick =
          prefer.map((p) => choices.find((c) => c.label === p)).find(Boolean) ?? choices[0];
        s = act(s, pick!.action, context);
      }
    }
    return { ...s, combatFinale: null, reports: [] };
  };
  const upTo = (start: GameState, id: string, at: string): GameState => {
    let s = act(rested(start), { type: 'startMission', missionId: id }, context);
    for (let i = 0; i < 30 && s.mission && !labels(s).some((l) => l.startsWith(at)); i++) {
      s = act(s, missionScene(s, context)!.choices[0]!.action, context);
    }
    return s;
  };
  return { ready, play, upTo, labels };
}

/** The village's count of something set by hand, as if earlier jobs had counted it. */
export function withTally(s: GameState, tally: string, n: number): GameState {
  return { ...s, village: { ...s.village, tallies: { ...s.village.tallies, [tally]: n } } };
}
