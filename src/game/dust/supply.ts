import { batchAdded, BOUGHT_BATCH, MADE_BATCH } from '@/systems/dusts';
import { spend } from '@/systems/wallet';

import type { GameContext } from '../context';
import { atHome } from '../home/home';
import { chip, log, placesHere } from '../ops';
import type { GameState } from '../state';
import { drawable, yourDust } from './dust';

/**
 * Making and buying dust no ground gives back (iron sand, gold, glass): it never gathers itself,
 * so it takes your own time to make at home, materials and an afternoon's work, or ryo at a shop
 * that sells it by the batch. Sand and ash need neither.
 */

/** Why you can't make a batch of your dust now, or null. Energy and the slot are the action's. */
export function makeBlocker(state: GameState, ctx: GameContext): string | null {
  const yours = yourDust(state, ctx);
  if (!yours) return 'You command no dust.';
  if (drawable(yours.def))
    return `${yours.def.name} gathers itself back; there is nothing to make.`;
  if (!atHome(state, ctx)) return 'You make it at home.';
  if (yours.store.count >= yours.cap) return 'You carry as much as you can hold up.';
  const ryo = yours.def.making?.ryo ?? 0;
  return state.wallet.ryo < ryo ? `The materials cost ${ryo} ryo.` : null;
}

export function makeDust(state: GameState, ctx: GameContext): GameState {
  const yours = yourDust(state, ctx);
  const making = yours?.def.making;
  if (!yours || !making) return state;
  const paid = spend(state.wallet, making.ryo);
  if (!paid.ok) return state;
  const count = batchAdded(yours.store.count, yours.cap, MADE_BATCH);
  return log(
    { ...state, wallet: paid.value, dust: { ...yours.store, count } },
    {
      heading: `A batch of ${yours.def.name.toLowerCase()}`,
      text: making.how,
      tone: 'success',
      chips: [
        chip(`−${making.ryo} ryo`, 'cost'),
        chip(`+${count - yours.store.count} dust`, 'gain'),
      ],
    },
  );
}

/** Why you can't buy a batch of your dust here now, or null. */
export function buyDustBlocker(state: GameState, ctx: GameContext, placeId: string): string | null {
  const yours = yourDust(state, ctx);
  if (!yours) return 'You command no dust.';
  const sold = placesHere(state, ctx, 'gear').some(
    (p) => p.id === placeId && (p.dustIds ?? []).includes(yours.def.id),
  );
  if (!sold || yours.def.price === undefined)
    return `Nobody here sells ${yours.def.name.toLowerCase()}.`;
  if (yours.store.count >= yours.cap) return 'You carry as much as you can hold up.';
  return state.wallet.ryo < yours.def.price ? `A batch costs ${yours.def.price} ryo.` : null;
}

export function buyDust(state: GameState, ctx: GameContext): GameState {
  const yours = yourDust(state, ctx);
  const price = yours?.def.price;
  if (!yours || price === undefined) return state;
  const paid = spend(state.wallet, price);
  if (!paid.ok) return state;
  const count = batchAdded(yours.store.count, yours.cap, BOUGHT_BATCH);
  return log(
    { ...state, wallet: paid.value, dust: { ...yours.store, count } },
    {
      text: `You buy a sealed batch of ${yours.def.name.toLowerCase()} and pour it into your store.`,
      tone: 'success',
      chips: [chip(`−${price} ryo`, 'cost'), chip(`+${count - yours.store.count} dust`, 'gain')],
    },
  );
}
