import { talkedToday } from '@/systems/bonds';

import { playerCombatant } from '../combatants';
import { engineFor } from '../fightStyle';
import { adjust, busyReason, firstBlocker, healthFraction, placeHere, spendTime } from '../ops';
import { bondOf, findPerson, whereNow } from '../people/cast';
import { companionCombatant } from '../people/companions';
import type { ActionHandler, ActionOf } from './types';

/** A practice fight with a genin who is around. Ends in `resolveSpar`, never in hospital. */

export const SPAR_ENERGY = 20;
const SPAR_SLOTS = 1;
const MIN_HEALTH_TO_SPAR = 0.4;
const PARTNER_TAG = 'Sparring';

export const spar: ActionHandler<ActionOf<'spar'>> = {
  check(state, action, ctx) {
    const partner = findPerson(state, ctx, action.personId);
    if (!partner) return 'You don’t know anyone by that name.';
    return firstBlocker(
      busyReason(state),
      partner.role !== 'genin' && `${partner.name} doesn’t spar with genin.`,
      !placeHere(state, ctx, 'training') && 'Find a training ground to spar.',
      whereNow(state, ctx, partner) === null && `${partner.name} isn’t around right now.`,
      talkedToday(bondOf(state, partner.id), state.time.day) &&
        `You’ve already spent time with ${partner.name} today.`,
      state.character.vitals.energy < SPAR_ENERGY &&
        `Needs ${SPAR_ENERGY} energy. Nap or eat first.`,
      healthFraction(state) < MIN_HEALTH_TO_SPAR && 'You are too hurt to spar. Rest first.',
    );
  },
  perform(state, action, ctx, rng) {
    const partner = findPerson(state, ctx, action.personId);
    if (!partner) return state;
    const ready = adjust(spendTime(state, SPAR_SLOTS, ctx), { energy: -SPAR_ENERGY });
    const combat = engineFor(ready, ctx).start(
      {
        player: playerCombatant(ready, ctx),
        allies: [],
        enemies: [companionCombatant(partner, ready, ctx, PARTNER_TAG)],
        canFlee: true,
        intro: `${partner.name} squares up. "Don’t hold back."`,
      },
      rng,
    );
    return { ...ready, combat, people: { ...ready.people, sparringWith: partner.id } };
  },
};
