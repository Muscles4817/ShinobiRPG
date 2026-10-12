import { stageOf } from '@/systems/bonds';
import { study as studyTechnique, type TechniqueBook } from '@/systems/techniques';

import type { GameContext } from '../context';
import { studyPointsFor } from '../profile';
import type { GameState } from '../state';
import { bondOf } from './cast';
import type { Teaching } from './teachers';

/**
 * A teacher's signature techniques (`TeacherProfile.teaches`): taught in order, a little each
 * session, once you are close enough. Personal teaching beats reading a scroll.
 */

/** Friendship stage at which a teacher starts teaching signature techniques. */
export const TEACHES_AT_STAGE = 2;
/** A teacher's personal teaching beats reading a scroll. */
const TEACHER_STUDY_BOOST = 1.5;

export interface Taught {
  readonly book: TechniqueBook;
  readonly name: string;
  readonly mastered: boolean;
  readonly percent: number;
}

/**
 * The next signature technique this teacher will teach you, if any are left. A clan's own
 * techniques stay in the clan: a clan head teaches them only to their own.
 */
export function nextSignature(
  state: GameState,
  ctx: GameContext,
  teaching: Teaching,
): string | null {
  const forYou = (id: string) => {
    const clan = ctx.content.techniques.require(id).clan;
    return clan === undefined || clan === state.character.clanId;
  };
  return teaching.teaches.find((id) => !state.techniques.known.includes(id) && forYou(id)) ?? null;
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
  if (state.character.aptitude[def.discipline] <= 0) return null;
  const points = studyPointsFor(state.character, def, ctx) * TEACHER_STUDY_BOOST;
  const result = studyTechnique(state.techniques, def, points);
  return {
    book: result.book,
    name: def.name,
    mastered: result.mastered,
    percent: Math.round((result.progress / def.difficulty) * 100),
  };
}
