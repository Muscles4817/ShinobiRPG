import type { CurriculumBeat, CurriculumBeatId, PersonDef, SenseiPhilosophy } from '@/content';
import { stageOf } from '@/systems/bonds';

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

/** Whether a beat makes sense yet. */
function timely(state: GameState, sensei: PersonDef, id: CurriculumBeatId): boolean {
  const done = state.standing.missionsCompleted;
  switch (id) {
    case 'drills':
    case 'spar':
    case 'board':
    case 'eat':
    case 'cooking':
      return true;
    case 'prep':
      return done >= 1;
    case 'intel':
      return done >= 2;
    case 'pass':
      return (
        stageOf(bondOf(state, sensei.id).points) >= (waysOf(sensei)?.gatekeeping.passStage ?? 1)
      );
    case 'permit':
      return hasLibraryPermit(state);
    case 'exercise':
      return Object.keys(state.character.exercises ?? {}).length > 0;
    case 'exam':
      return done * 2 >= nominationMissions(sensei);
  }
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
  const id = CURRICULUM_ORDER[philosophy].find(
    (beat) => !mentor.beats.includes(beat) && timely(state, sensei, beat),
  );
  return id ? (ctx.content.curriculum.get(id) ?? null) : null;
}
