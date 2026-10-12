import { stageOf } from '@/systems/bonds';

import type { GameContext } from '../context';
import { learnBlockerFor, studySession, type Studied } from '../learning';
import type { GameState } from '../state';
import { bondOf } from './cast';
import type { Teaching } from './teachers';

/**
 * A teacher's signature techniques (`TeacherProfile.teaches`): taught in order, a little each
 * session, once you are close enough. Personal teaching beats reading a scroll (the `teacher`
 * study source), by the same gate as any scroll: two ranks above your grade, or one your body
 * can't do, waits however willing they are.
 */

/** Friendship stage at which a teacher starts teaching signature techniques. */
export const TEACHES_AT_STAGE = 2;
export interface Taught extends Studied {
  readonly name: string;
}

/** The next signature technique this teacher will teach you: the first you could learn. */
export function nextSignature(
  state: GameState,
  teaching: Teaching,
  ctx: GameContext,
): string | null {
  return (
    teaching.teaches.find((id) => {
      const def = ctx.content.techniques.require(id);
      return (
        learnBlockerFor(state, def, ctx) === null && state.character.aptitude[def.discipline] > 0
      );
    }) ?? null
  );
}

/** A session's progress on the next signature, if the teacher is teaching one yet. */
export function teachSignature(
  state: GameState,
  ctx: GameContext,
  teaching: Teaching,
): Taught | null {
  const id = nextSignature(state, teaching, ctx);
  if (!id || stageOf(bondOf(state, teaching.person.id).points) < TEACHES_AT_STAGE) return null;
  const def = ctx.content.techniques.require(id);
  return { ...studySession(state, def, ctx, 'teacher'), name: def.name };
}
