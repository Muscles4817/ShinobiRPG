import type { PersonDef } from '@/content';
import { talkedToday } from '@/systems/bonds';
import { spend } from '@/systems/wallet';

import type { GameContext } from '../context';
import { SOAK_ENERGY, SOAK_HEALTH, SOAK_SLOTS } from '../onsen';
import { adjust, busyReason, chip, firstBlocker, log, placeHere, spendTime } from '../ops';
import { bondOf, findPerson, peopleAt } from '../people/cast';
import { outingWarmth, timeTogether, type Outing } from '../people/together';
import type { GameState } from '../state';
import { closedReason } from '../village';
import type { ActionHandler, ActionOf } from './types';

/**
 * A soak at the hot spring or bathhouse: alone, or beside whoever is in the water, which
 * counts as your time with them today. Once a day; you come out warm through.
 */

/** Soaking with someone is a quiet hour together, worth a little more than a talk. */
export const SOAK_OUTING: Outing = { tone: 'quiet', bonus: 2 };

/** Who is in the water here right now. */
export function bathers(state: GameState, ctx: GameContext): PersonDef[] {
  const onsen = placeHere(state, ctx, 'onsen');
  return onsen ? peopleAt(state, ctx, onsen.id) : [];
}

/** Why you can't soak beside this person, or null. */
function companionBlocker(state: GameState, ctx: GameContext, withId: string): string | null {
  const person = findPerson(state, ctx, withId);
  if (!person) return 'You don’t know anyone by that name.';
  return firstBlocker(
    !bathers(state, ctx).some((p) => p.id === person.id) && `${person.name} isn’t in the water.`,
    talkedToday(bondOf(state, person.id), state.time.day) &&
      `You’ve already spent time with ${person.name} today.`,
  );
}

/** The quiet hour beside someone, if you soak with them: the bond, and its chips. */
function soakedWith(state: GameState, ctx: GameContext, person: PersonDef | null) {
  if (!person) return { state, chips: [] };
  return timeTogether(state, person, outingWarmth(state, ctx, person, SOAK_OUTING));
}

export const soak: ActionHandler<ActionOf<'soak'>> = {
  check(state, action, ctx) {
    const onsen = placeHere(state, ctx, 'onsen');
    if (!onsen) return 'There’s no hot water here.';
    return firstBlocker(
      busyReason(state),
      closedReason(onsen.name, onsen.hours, state),
      state.character.soaked === true && 'You’ve already had your soak today.',
      state.wallet.ryo < onsen.soakCost && `A soak costs ${onsen.soakCost} ryo.`,
      action.withId !== null && companionBlocker(state, ctx, action.withId),
    );
  },
  perform(state, action, ctx) {
    const onsen = placeHere(state, ctx, 'onsen');
    const paid = onsen ? spend(state.wallet, onsen.soakCost) : null;
    if (!onsen || !paid?.ok) return state;
    const companion =
      action.withId === null ? null : (findPerson(state, ctx, action.withId) ?? null);
    const together = soakedWith({ ...state, wallet: paid.value }, ctx, companion);
    const warm = adjust(spendTime(together.state, SOAK_SLOTS, ctx), {
      energy: SOAK_ENERGY,
      health: SOAK_HEALTH,
    });
    const soaked = { ...warm, character: { ...warm.character, soaked: true as const } };
    return log(soaked, {
      heading: companion ? `A soak with ${companion.name}` : `A soak at ${onsen.name}`,
      text: companion
        ? `You sink into the water beside ${companion.name}. Steam, the drip from the eaves, and the odd word between you.`
        : 'You sink into the water up to your chin and let the day go out of your shoulders.',
      tone: 'success',
      chips: [
        chip(`−${onsen.soakCost} ryo`, 'cost'),
        chip(`Energy +${SOAK_ENERGY}`, 'gain'),
        chip(`Health +${SOAK_HEALTH}`, 'gain'),
        ...together.chips,
      ],
    });
  },
};
