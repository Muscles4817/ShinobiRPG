import type { PersonDef } from '@/content';
import { addPoints, talkedToday } from '@/systems/bonds';
import { spend } from '@/systems/wallet';

import { DRINK_BONUS, drinkStory, drinkWay, roundStory } from '../bar';
import type { GameContext } from '../context';
import { busyReason, chip, firstBlocker, log, placeHere } from '../ops';
import { bondOf, findPerson, peopleAt, requirePerson } from '../people/cast';
import { outingWarmth, timeTogether, toneReaction } from '../people/together';
import { warmed } from '../people/warmth';
import type { GameState } from '../state';
import { closedReason } from '../village';
import type { ActionHandler, ActionOf } from './types';
import { placeInText } from '../placeName';

/**
 * The bar at night: stand everyone inside a round and they all warm to you a little. That
 * doesn't count as time with anyone, so you can still sit down with one of them after: a
 * drink together is the day's time with them, and how you spend it decides how it lands.
 */

export const ROUND_BOND = 3;

/** Who is at the bar here right now. */
export function tavernCrowd(state: GameState, ctx: GameContext): PersonDef[] {
  const tavern = placeHere(state, ctx, 'tavern');
  return tavern ? peopleAt(state, ctx, tavern.id) : [];
}

export const buyRound: ActionHandler<ActionOf<'buyRound'>> = {
  check(state, _action, ctx) {
    const tavern = placeHere(state, ctx, 'tavern');
    if (!tavern) return 'There’s no izakaya here.';
    return firstBlocker(
      busyReason(state),
      closedReason(tavern.name, tavern.hours, state),
      state.village.lastRoundDay === state.time.day && 'You’ve already stood a round tonight.',
      tavernCrowd(state, ctx).length === 0 && 'Nobody’s in yet to buy for.',
      state.wallet.ryo < tavern.roundCost && `You can’t afford a round (${tavern.roundCost} ryo).`,
    );
  },
  perform(state, _action, ctx) {
    const tavern = placeHere(state, ctx, 'tavern');
    if (!tavern) return state;
    const paid = spend(state.wallet, tavern.roundCost);
    if (!paid.ok) return state;
    const crowd = tavernCrowd(state, ctx);
    const warmth = warmed(state, ctx, ROUND_BOND);
    const bonds = Object.fromEntries(
      crowd.map((p) => [p.id, addPoints(bondOf(state, p.id), warmth)]),
    );
    const next = {
      ...state,
      wallet: paid.value,
      people: { ...state.people, bonds: { ...state.people.bonds, ...bonds } },
      village: { ...state.village, lastRoundDay: state.time.day },
    };
    const names = crowd.map((p) => p.name);
    return log(next, {
      heading: `A round at ${placeInText(tavern.name)}`,
      text: roundStory(crowd),
      tone: 'success',
      chips: [
        chip(`−${tavern.roundCost} ryo`, 'cost'),
        ...names.map((name) => chip(`${name} +${warmth}`, 'gain')),
      ],
    });
  },
};

export const drinkWith: ActionHandler<ActionOf<'drinkWith'>> = {
  check(state, action, ctx) {
    const tavern = placeHere(state, ctx, 'tavern');
    if (!tavern) return 'There’s no bar here.';
    const person = findPerson(state, ctx, action.personId);
    if (!person) return 'You don’t know anyone by that name.';
    return firstBlocker(
      busyReason(state),
      closedReason(tavern.name, tavern.hours, state),
      !tavernCrowd(state, ctx).some((p) => p.id === person.id) &&
        `${person.name} isn’t in tonight.`,
      talkedToday(bondOf(state, person.id), state.time.day) &&
        `You’ve already spent time with ${person.name} today.`,
      state.wallet.ryo < tavern.cupCost && `A drink costs ${tavern.cupCost} ryo.`,
    );
  },
  perform(state, action, ctx) {
    const tavern = placeHere(state, ctx, 'tavern');
    const paid = tavern ? spend(state.wallet, tavern.cupCost) : null;
    if (!tavern || !paid?.ok) return state;
    const person = requirePerson(state, ctx, action.personId);
    const way = drinkWay(action.way);
    const delta = outingWarmth(state, ctx, person, { tone: way.tone, bonus: DRINK_BONUS });
    const together = timeTogether({ ...state, wallet: paid.value }, person, delta);
    return log(together.state, {
      heading: `A drink with ${person.name}`,
      text: drinkStory(way, person, toneReaction(ctx, person, way.tone)),
      tone: delta > 0 ? 'success' : 'warning',
      chips: [chip(`−${tavern.cupCost} ryo`, 'cost'), ...together.chips],
    });
  },
};
