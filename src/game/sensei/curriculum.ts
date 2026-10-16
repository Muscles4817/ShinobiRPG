import type { CurriculumBeat, CurriculumBeatId, PersonDef, SenseiPhilosophy } from '@/content';
import { stageOf } from '@/systems/bonds';
import { hungerLevel } from '@/systems/vitals';

import type { GameContext } from '../context';
import { nominationMissions } from '../exam/entry';
import { bondOf } from '../people/cast';
import { hasLibraryPermit } from '../permits';
import type { GameState } from '../state';
import { mentorOf } from './plan';
import { waysOf } from './generate';

/**
 * The curriculum: what your sensei shows you, one thing a day at most, in the order their
 * philosophy puts first, each once it makes sense (the job prep after your first job, the
 * library once you hold the permit). It is the tutorial; nothing is locked behind it. Told at
 * the first meeting that you know it all, they show you nothing.
 */

export const CURRICULUM_ORDER: Readonly<Record<SenseiPhilosophy, readonly CurriculumBeatId[]>> = {
  body: [
    'spar',
    'drills',
    'eat',
    'board',
    'prep',
    'intel',
    'cooking',
    'pass',
    'exercise',
    'permit',
    'exam',
  ],
  teamwork: [
    'board',
    'spar',
    'prep',
    'intel',
    'drills',
    'eat',
    'pass',
    'cooking',
    'exercise',
    'permit',
    'exam',
  ],
  fundamentals: [
    'drills',
    'eat',
    'permit',
    'spar',
    'board',
    'prep',
    'intel',
    'exercise',
    'cooking',
    'pass',
    'exam',
  ],
  edge: [
    'spar',
    'drills',
    'board',
    'intel',
    'prep',
    'exercise',
    'permit',
    'eat',
    'cooking',
    'pass',
    'exam',
  ],
  survival: [
    'board',
    'prep',
    'eat',
    'cooking',
    'intel',
    'spar',
    'drills',
    'pass',
    'exercise',
    'permit',
    'exam',
  ],
  control: [
    'drills',
    'exercise',
    'permit',
    'eat',
    'spar',
    'board',
    'prep',
    'intel',
    'cooking',
    'pass',
    'exam',
  ],
  shadow: [
    'intel',
    'board',
    'prep',
    'spar',
    'drills',
    'eat',
    'cooking',
    'pass',
    'exercise',
    'permit',
    'exam',
  ],
};

/** Regard for hearing them out. */
export const HEEDED_REGARD = 1;

type Timely = (state: GameState, sensei: PersonDef) => boolean;

const always: Timely = () => true;
const jobsDone =
  (n: number): Timely =>
  (state) =>
    state.standing.missionsCompleted >= n;

/** Whether each beat makes sense yet. */
const TIMELY: Readonly<Record<CurriculumBeatId, Timely>> = {
  week: always,
  drills: always,
  spar: always,
  board: always,
  eat: always,
  cooking: always,
  prep: jobsDone(1),
  intel: jobsDone(2),
  pass: (state, sensei) =>
    stageOf(bondOf(state, sensei.id).points) >= (waysOf(sensei)?.gatekeeping.passStage ?? 1),
  permit: (state) => hasLibraryPermit(state),
  exercise: (state) => Object.keys(state.character.exercises ?? {}).length > 0,
  exam: (state, sensei) => state.standing.missionsCompleted * 2 >= nominationMissions(sensei),
};

/**
 * The beats every sensei puts first, whatever their order: the slip itself, since everything
 * else comes through it, and food once you go hungry, before hunger slows everything down.
 */
function firstBeats(state: GameState): CurriculumBeatId[] {
  return hungerLevel(state.character.vitals) === 'satisfied' ? ['week'] : ['week', 'eat'];
}

/** What your sensei has to show you today, if anything. */
export function beatDue(state: GameState, ctx: GameContext): CurriculumBeat | null {
  const { mentor } = state;
  if (mentor.curriculum === 'skipped' || mentor.opening || mentor.lastBeatDay === state.time.day) {
    return null;
  }
  const sensei = mentorOf(state, ctx);
  const philosophy = sensei ? waysOf(sensei)?.philosophy : undefined;
  if (!sensei || !philosophy) return null;
  const id = [...firstBeats(state), ...CURRICULUM_ORDER[philosophy]].find(
    (beat) => !mentor.beats.includes(beat) && TIMELY[beat](state, sensei),
  );
  return id ? (ctx.content.curriculum.get(id) ?? null) : null;
}
