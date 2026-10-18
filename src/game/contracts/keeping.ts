import { offeredToday, standingStage, withOffering } from '@/systems/contracts';
import { pantryCount, useUp } from '@/systems/inventory';

import type { GameContext } from '../context';
import { atHome } from '../home/home';
import { chip, log } from '../ops';
import type { GameState } from '../state';
import { heldContract } from './summons';

/**
 * Keeping a contract between fights (`docs/design/retinue-plan.md`, step 3): once a day you may
 * leave its clan an offering it likes at home, which raises your standing; and you may tear up
 * your name on its scroll, which frees you to sign another, but its clan won't take you back.
 */

/** Why you can't leave the clan this offering now, or null when you can. */
export function offeringBlocker(
  state: GameState,
  ctx: GameContext,
  ingredientId: string,
): string | null {
  const held = heldContract(state, ctx);
  if (!held) return 'You hold no contract.';
  if (!atHome(state, ctx)) return 'Offerings are left out at home.';
  if (offeredToday(held.contract, state.time.day)) return 'You left the clan an offering today.';
  if (!(held.def.tastes ?? []).includes(ingredientId)) return 'The clan doesn’t care for that.';
  const name = ctx.content.ingredients.require(ingredientId).name.toLowerCase();
  return pantryCount(state.inventory, ingredientId) < 1 ? `You have no ${name} at home.` : null;
}

/** You leave an offering out on the scroll; by morning it is gone. */
export function makeOffering(state: GameState, ctx: GameContext, ingredientId: string): GameState {
  const held = heldContract(state, ctx);
  const used = useUp(state.inventory, [{ id: ingredientId, count: 1 }]);
  if (!held || !used.ok) return state;
  const contract = withOffering(held.contract, state.time.day);
  const rose = standingStage(contract) > standingStage(held.contract);
  const name = ctx.content.ingredients.require(ingredientId).name.toLowerCase();
  return log(
    { ...state, inventory: used.value, contract },
    {
      heading: held.def.name,
      text: rose
        ? `You leave ${name} out on the open scroll. By morning it is gone, and the clan thinks better of you: bigger summons may answer now.`
        : `You leave ${name} out on the open scroll. By morning it is gone.`,
      tone: 'success',
      chips: [chip(rose ? 'Standing up' : 'Offering taken', 'gain')],
    },
  );
}

/** You tear up your name on the clan's scroll: it is yours no longer, and never again. */
export function breakContract(state: GameState, ctx: GameContext): GameState {
  const held = heldContract(state, ctx);
  if (!held) return state;
  return log(
    {
      ...state,
      contract: null,
      brokenContracts: [...state.brokenContracts, held.def.id],
    },
    {
      heading: `You break ${held.def.name}`,
      text: held.def.parting ?? 'The scroll goes cold in your hands.',
      tone: 'warning',
      chips: [chip('Contract broken', 'cost')],
    },
  );
}
