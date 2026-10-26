import { ventureDays, type VenturePlan } from '@/systems/missions';

import { examClash } from '../awayNotes';
import type { GameContext } from '../context';
import { wildsHere } from '../gathering';
import { laidUp } from '../injuries';
import { spendVentureLeave, ventureLeaveBlocker } from '../leave';
import { busyReason, firstBlocker } from '../ops';
import type { GameState } from '../state';
import { deepWildsOf, goInto, ventureMission } from '../ventures';
import type { ActionHandler, ActionOf } from './types';

/**
 * Going off the paths into wild country from a wild place (`game/ventures.ts`). The edge is
 * anyone's; past it, leave is as for a trip (`ventureLeaveBlocker`), and your sensei won't sign
 * you out across an exam they'd put you in.
 */

/** What keeps you from going in at all, whatever the depth. */
export function ventureBlocker(state: GameState, ctx: GameContext): string | null {
  return firstBlocker(busyReason(state), laidUp(state, ctx));
}

function planHere(
  state: GameState,
  ctx: GameContext,
  { placeId, depth }: ActionOf<'venture'>,
): VenturePlan | null {
  const place = wildsHere(state, ctx, placeId);
  const country = place ? deepWildsOf(ctx, place.biome) : null;
  return country ? { placeId, country: country.biome, depth } : null;
}

export const venture: ActionHandler<ActionOf<'venture'>> = {
  check(state, action, ctx) {
    const plan = planHere(state, ctx, action);
    if (!plan) return 'There is no way further in from here.';
    const clash = examClash(state, ctx, ventureMission(plan, ctx));
    return firstBlocker(
      ventureBlocker(state, ctx),
      ventureLeaveBlocker(state, ventureDays(action.depth), action.depth === 'heart'),
      clash?.blocks === true && clash.text,
    );
  },
  perform(state, action, ctx) {
    const plan = planHere(state, ctx, action);
    if (!plan) return state;
    return goInto(spendVentureLeave(state, ventureDays(plan.depth)), ctx, plan);
  },
};
