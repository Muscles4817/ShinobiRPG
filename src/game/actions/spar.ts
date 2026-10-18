import { talkedToday } from '@/systems/bonds';
import type { CombatOccasion } from '@/systems/combat';

import { playerCombatant } from '../combatants';
import { startFight } from '../fightStyle';
import { adjust, busyReason, firstBlocker, healthFraction, placeHere, spendTime } from '../ops';
import { weakFromHunger } from '../hunger';
import { laidUp } from '../injuries';
import { bondOf, findPerson, whereNow } from '../people/cast';
import { companionCombatant } from '../people/companions';
import { hardWorkEnergy } from '../profile';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/** A practice fight with a genin who is around. Ends in `resolveSpar`, never in hospital. */

export const SPAR_ENERGY = 20;
const SPAR_SLOTS = 1;
const MIN_HEALTH_TO_SPAR = 0.4;
const PARTNER_TAG = 'Sparring';

/** What the spar is to the story: with your rival, a teammate, or anyone else. */
function sparOccasion(state: GameState, partnerId: string): CombatOccasion {
  if (state.rival?.personId === partnerId) return 'rival';
  return state.people.team?.teammateIds.includes(partnerId) ? 'teammate' : 'spar';
}

export const spar: ActionHandler<ActionOf<'spar'>> = {
  check(state, action, ctx) {
    const partner = findPerson(state, ctx, action.personId);
    if (!partner) return 'You don’t know anyone by that name.';
    const energy = hardWorkEnergy(state.character, ctx, SPAR_ENERGY);
    return firstBlocker(
      busyReason(state),
      weakFromHunger(state),
      laidUp(state, ctx),
      partner.role !== 'genin' && `${partner.name} doesn’t spar with genin.`,
      !placeHere(state, ctx, 'training') && 'Find a training ground to spar.',
      whereNow(state, ctx, partner) === null && `${partner.name} isn’t around right now.`,
      talkedToday(bondOf(state, partner.id), state.time.day) &&
        `You’ve already spent time with ${partner.name} today.`,
      state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
      healthFraction(state) < MIN_HEALTH_TO_SPAR && 'You are too hurt to spar. Rest first.',
    );
  },
  perform(state, action, ctx, rng) {
    const partner = findPerson(state, ctx, action.personId);
    if (!partner) return state;
    const ready = adjust(spendTime(state, SPAR_SLOTS, ctx), {
      energy: -hardWorkEnergy(state.character, ctx, SPAR_ENERGY),
    });
    const combat = startFight(
      ready,
      ctx,
      {
        player: playerCombatant(ready, ctx),
        allies: [],
        enemies: [companionCombatant(partner, ready, ctx, PARTNER_TAG)],
        canFlee: true,
        intro: `${partner.name} squares up. “Don’t hold back.”`,
        occasion: sparOccasion(ready, partner.id),
      },
      rng,
    );
    return { ...ready, combat, people: { ...ready.people, sparringWith: partner.id } };
  },
};
