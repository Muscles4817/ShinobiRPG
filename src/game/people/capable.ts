import type { PersonDef } from '@/content';
import { canPerform } from '@/systems/techniques';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { personStats } from './progress';

/**
 * What a person can do today. Their arsenal and their signatures list everything they will ever
 * use; people train and grow, so each technique joins their fights and their lessons only once
 * their current grades can carry it (`canPerform`): a genin never fights with, or teaches, a
 * jutsu ahead of where they are. Natures beyond a sensei's aren't modelled for people, so a
 * nature need is not held against them.
 */

const CLANLESS = 'none';

export function canDoNow(
  person: PersonDef,
  state: GameState,
  ctx: GameContext,
  id: string,
): boolean {
  const def = ctx.content.techniques.require(id);
  return canPerform(def, { stats: personStats(person, state), clanId: person.clanId ?? CLANLESS });
}

/** The techniques among `ids` this person can do now, in the same order. */
export function doableNow(
  person: PersonDef,
  state: GameState,
  ctx: GameContext,
  ids: readonly string[],
): string[] {
  return ids.filter((id) => canDoNow(person, state, ctx, id));
}
