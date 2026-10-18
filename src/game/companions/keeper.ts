import type { PersonDef } from '@/content';

import type { GameContext } from '../context';
import { findPerson } from '../people/cast';
import { personSlots } from '../people/pronouns';
import type { GameState } from '../state';

/**
 * How lines speak of a clinic's keeper: `{vet}` and its pronoun slots, agreeing with the keeper
 * when they are known, and "the vet" (they) when they are not.
 */

const ANY_VET: Pick<PersonDef, 'id' | 'name' | 'pronouns'> = {
  id: 'vet',
  name: 'the vet',
  pronouns: 'they',
};

export function keeperSlots(
  state: GameState,
  ctx: GameContext,
  keeperId: string | undefined,
): Readonly<Record<string, string>> {
  const keeper = keeperId === undefined ? undefined : findPerson(state, ctx, keeperId);
  return personSlots('vet', keeper ?? ANY_VET);
}
