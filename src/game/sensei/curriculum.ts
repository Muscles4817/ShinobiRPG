import type { CurriculumBeat, CurriculumBeatId, PersonDef, SenseiPhilosophy } from '@/content';
import { fillSlots } from '@/core';
import { stageOf } from '@/systems/bonds';
import { hungerLevel } from '@/systems/vitals';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { nominationMissions } from '../exam/entry';
import { log } from '../ops';
import { bondOf } from '../people/cast';
import { personSlots } from '../people/pronouns';
import { hasLibraryPermit } from '../permits';
import type { GameState } from '../state';
import { mentorOf } from './plan';
import { meetingPlace } from './settle';
import { withAttendance } from './state';
import { waysOf } from './generate';

/**
 * The curriculum: what your sensei shows you, in their manner, each thing once it makes sense
 * (the job prep after your first job, the library once you hold the permit). Most beats come
 * just before the thing they are about: the first drill, the first spar, the first job, the
 * first time you go hungry (`curriculumBefore`, `curriculumAfter`, from `dispatch`). The rest
 * wait on the slip, one a day, in the order their philosophy puts first. It is the tutorial;
 * nothing is locked behind it. Told at the first meeting that you know it all, they show you
 * nothing.
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

/**
 * A beat as your sensei shows it: what they do (as they stop you just `before` the thing, or
 * anywhere), then what they say, in their manner.
 */
export function beatText(
  beat: CurriculumBeat,
  sensei: PersonDef,
  ctx: GameContext,
  before = false,
): string {
  const feedback = waysOf(sensei)?.feedback ?? 'warm';
  const scene = before ? (beat.before ?? beat.scene) : beat.scene;
  return fillSlots(`${scene} ${beat.says[feedback]}`, {
    ...personSlots('sensei', sensei),
    place: meetingPlace(ctx),
  });
}

/**
 * Hears a beat out: told and remembered. Asking for it from the slip earns a little regard
 * (`heeded`); a beat they stop you for on the way to something earns none.
 */
export function hearBeat(
  state: GameState,
  ctx: GameContext,
  beat: CurriculumBeat,
  heeded: boolean,
): GameState {
  const sensei = mentorOf(state, ctx);
  if (!sensei) return state;
  const mentor = withAttendance(
    { ...state.mentor, beats: [...state.mentor.beats, beat.id], lastBeatDay: state.time.day },
    heeded ? HEEDED_REGARD : 0,
  );
  return log(
    { ...state, mentor },
    { heading: beat.title, text: beatText(beat, sensei, ctx, !heeded), tone: 'info' },
  );
}

/** The beats an action is the first of: shown just before it, if not yet. */
const BEFORE: Partial<Record<GameAction['type'], readonly CurriculumBeatId[]>> = {
  senseiSession: ['week'],
  train: ['drills'],
  spar: ['spar'],
  startMission: ['board', 'prep', 'intel'],
  buyIntel: ['intel'],
  eat: ['eat'],
  cook: ['cooking'],
  experiment: ['cooking'],
  travel: ['pass'],
  study: ['permit'],
  practise: ['exercise'],
};

/** The beat your sensei would show you right now, before this, if any. */
function beatFor(state: GameState, ctx: GameContext, ids: readonly CurriculumBeatId[]) {
  const { mentor } = state;
  const sensei = mentorOf(state, ctx);
  const home = state.locationId === ctx.content.startLocationId && state.mission === null;
  if (mentor.curriculum === 'skipped' || mentor.opening || !sensei || !home) return null;
  if (!waysOf(sensei)) return null;
  const id = ids.find((beat) => !mentor.beats.includes(beat) && TIMELY[beat](state, sensei));
  return id ? (ctx.content.curriculum.get(id) ?? null) : null;
}

/** Before an action that a beat is about, the first time: your sensei shows you first. */
export function curriculumBefore(
  state: GameState,
  action: GameAction,
  ctx: GameContext,
): GameState {
  const beat = beatFor(state, ctx, BEFORE[action.type] ?? []);
  return beat ? hearBeat(state, ctx, beat, false) : state;
}

/** After an action that left you hungry for the first time: your sensei sees to it. */
export function curriculumAfter(state: GameState, ctx: GameContext): GameState {
  if (hungerLevel(state.character.vitals) === 'satisfied') return state;
  const beat = beatFor(state, ctx, ['eat']);
  return beat ? hearBeat(state, ctx, beat, false) : state;
}
