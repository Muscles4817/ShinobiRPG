import { round1, type Rng } from '@/core';
import type { CombatCost, CombatOutcome } from '@/systems/combat';
import { EXHAUSTED_REFILL } from '@/systems/injuries';
import { STAT_INFO } from '@/systems/stats';
import type { CostTemplate } from '@/systems/techniques';

import type { GameContext } from './context';
import { chip, log } from './ops';
import type { GameState } from './state';
import { exhaust, inflict, rollInjury, strainInjuryFor } from './wounds';

/**
 * The price of the trump cards you played in a fight (`CombatOutcome.costs`), paid once it is
 * over: hospital days put you to bed with a collapse injury, exhaustion days leave your chakra
 * slow to come back, a stat injury becomes the matching named injury, and (rarely) a stat is
 * lost for good.
 */

const TOLL = 'A trump card is never free. Your body makes you pay for it.';
const LOST_FOR_GOOD = 'Something in you burned out for good. It will not grow back.';
/** A trump's collapse is a deeper pick than the average: the longer injuries come first. */
const COLLAPSE_BEATING = 1;

function payPermanent(
  state: GameState,
  { techniqueName, cost }: CombatCost & { readonly cost: { readonly kind: 'permanent' } },
): GameState {
  const { character } = state;
  const value = round1(Math.max(0, character.stats[cost.stat] - cost.amount));
  const stats = { ...character.stats, [cost.stat]: value };
  return log(
    { ...state, character: { ...character, stats } },
    {
      heading: `${techniqueName} takes its toll`,
      text: LOST_FOR_GOOD,
      tone: 'danger',
      chips: [chip(`${STAT_INFO[cost.stat].label} −${cost.amount} for good`, 'harm')],
    },
  );
}

function pay(state: GameState, owed: CombatCost, ctx: GameContext, rng: Rng): GameState {
  const cost: CostTemplate = owed.cost;
  const note = { heading: `${owed.techniqueName} takes its toll`, text: TOLL };
  switch (cost.kind) {
    case 'hospital': {
      const def = rollInjury(ctx, 'collapse', COLLAPSE_BEATING, rng);
      return def ? inflict(state, { def, days: cost.days }, note) : state;
    }
    case 'exhaustion':
      return exhaust(state, { nights: cost.days, refill: EXHAUSTED_REFILL }, note);
    case 'injury': {
      const def = strainInjuryFor(ctx, cost.stat);
      const strain = { stat: cost.stat, amount: cost.amount };
      return def ? inflict(state, { def, days: cost.days, strain }, note) : state;
    }
    case 'permanent':
      return payPermanent(state, { ...owed, cost });
  }
}

/** Pays what the trumps you used in a finished fight cost you. */
export function applyFightCosts(
  state: GameState,
  outcome: CombatOutcome,
  ctx: GameContext,
  rng: Rng,
): GameState {
  return (outcome.costs ?? []).reduce((s, owed) => pay(s, owed, ctx, rng), state);
}
