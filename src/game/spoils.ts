import { stock } from '@/systems/inventory';

import type { GameContext } from './context';
import { chip, log } from './ops';
import type { GameState } from './state';

/**
 * What beaten foes leave behind for the pot: a beast's meat (`EnemyDef.drops`), one of each
 * per foe, straight into your pack.
 */
export function takeSpoils(
  state: GameState,
  ctx: GameContext,
  foeIds: readonly string[],
): GameState {
  const ids = foeIds.flatMap((id) => ctx.content.enemies.get(id)?.drops ?? []);
  if (ids.length === 0) return state;
  const inventory = ids.reduce((inv, id) => stock(inv, id), state.inventory);
  return log(
    { ...state, inventory },
    {
      text: 'You dress what you brought down and pack it for the pot.',
      tone: 'info',
      chips: ids.map((id) => chip(ctx.content.ingredients.require(id).name, 'gain')),
    },
  );
}
