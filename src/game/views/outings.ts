import type { PersonDef, Tone } from '@/content';
import { stageName, stageOf, TALK_BASE } from '@/systems/bonds';

import type { GameContext } from '../context';
import { bondOf } from '../people/cast';
import { toneReaction } from '../people/together';
import type { GameState } from '../state';
import { personFace, TASTES_REVEALED_AT, type PersonFace } from './people';

/** Someone at a bar or in the water you could spend the hour with. */
export interface Companion {
  readonly face: PersonFace;
  /** "Acquaintance": how well you know them. */
  readonly stage: string;
}

/**
 * How a tone sits with them, once you know them well enough to know what they like (the
 * same stage the person sheet shows their tastes): `likes`, `dislikes` or neither.
 */
export type ToneRead = 'likes' | 'dislikes' | null;

export function companion(state: GameState, person: PersonDef): Companion {
  return {
    face: personFace(state, person),
    stage: stageName(stageOf(bondOf(state, person.id).points)),
  };
}

export function toneRead(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
  tone: Tone,
): ToneRead {
  if (stageOf(bondOf(state, person.id).points) < TASTES_REVEALED_AT) return null;
  const reaction = toneReaction(ctx, person, tone);
  if (reaction === TALK_BASE) return null;
  return reaction > TALK_BASE ? 'likes' : 'dislikes';
}
