import {
  advance,
  applyOutcome,
  holds,
  type Ending,
  type EndingStage,
  type MissionDef,
} from '@/systems/missions';

import type { GameState } from '../state';
import { feel } from './personal';
import { storyOf } from './state';

/** How a job ends: the first ending whose condition holds, told and applied. */

export function endingFor(state: GameState, stage: EndingStage): Ending | null {
  const run = state.mission;
  if (!run) return null;
  return stage.endings.find((e) => holds(storyOf(run), e.when)) ?? null;
}

/** The ending played: its line in the story, its outcome applied, and the stage done. */
export function playEnding(state: GameState, def: MissionDef, stage: EndingStage): GameState {
  const run = state.mission;
  const ending = endingFor(state, stage);
  if (!run || !ending) return state;
  const applied = applyOutcome(run, def, ending, 'plain');
  const moved = advance(applied.run, { kind: 'outcome', text: ending.text });
  return feel({ ...state, mission: moved }, applied.personal).state;
}
