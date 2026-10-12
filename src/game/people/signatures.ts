import { stageOf } from '@/systems/bonds';
import type { TechniqueBook } from '@/systems/techniques';

import type { GameContext } from '../context';
import { learnBlockerFor, studySession } from '../learning';
import type { GameState } from '../state';
import { bondOf } from './cast';
import type { Teaching } from './teachers';

/**
 * A teacher's signature techniques (`TeacherProfile.teaches`): taught in order, a little each
 * session, once you are close enough. Personal teaching beats reading a scroll (the 'teacher'
 * study source), by the same gate and formula as every other source.
 */

/** Friendship stage at which a teacher starts teaching signature techniques. */
export const TEACHES_AT_STAGE = 2;

export interface Taught {
  readonly book: TechniqueBook;
  readonly name: string;
  readonly mastered: boolean;
  /** Mastered, but a rank above you: it arrives unstable. */
  readonly unstable: boolean;
  readonly percent: number;
}

/**
 * The next of these techniques you could learn, if any: one two ranks above your grade, one
 * outside your clan, or one your body can't do waits however willing the teacher is.
 */
export function firstLearnable(
  state: GameState,
  ctx: GameContext,
  ids: readonly string[],
): string | null {
  return (
    ids.find((id) => {
      const def = ctx.content.techniques.require(id);
      return learnBlockerFor(state, def) === null && state.character.aptitude[def.discipline] > 0;
    }) ?? null
  );
}

/** The next signature technique this teacher will teach you, if any are left you could learn. */
export function nextSignature(state: GameState, ctx: GameContext, teaching: Teaching): string | null {
  return firstLearnable(state, ctx, teaching.teaches);
}

/** A session's progress on the next signature, if the teacher is teaching one yet. */
export function teachSignature(
  state: GameState,
  ctx: GameContext,
  teaching: Teaching,
): Taught | null {
  const id = nextSignature(state, ctx, teaching);
  if (!id || stageOf(bondOf(state, teaching.person.id).points) < TEACHES_AT_STAGE) return null;
  const def = ctx.content.techniques.require(id);
  const result = studySession(state, def, ctx, 'teacher');
  return {
    book: result.book,
    name: def.name,
    mastered: result.mastered,
    unstable: result.unstable,
    percent: result.percent,
  };
}
