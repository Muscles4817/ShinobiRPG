import type { PersonDef } from '@/content';
import type { Stats } from '@/systems/stats';
import { canPerform, type TechniqueDef } from '@/systems/techniques';

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

/**
 * The one rule for whether a person with these stats can do a technique: what their fights,
 * their lessons and the editor all ask. No nature is passed, so a nature need is waived.
 */
export function personPerforms(
  def: TechniqueDef,
  stats: Stats,
  clanId: string | null | undefined,
): boolean {
  return canPerform(def, { stats, clanId: clanId ?? CLANLESS });
}

export function canDoNow(
  person: PersonDef,
  state: GameState,
  ctx: GameContext,
  id: string,
): boolean {
  const def = ctx.content.techniques.require(id);
  return personPerforms(def, personStats(person, state), person.clanId);
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
