import type { PersonDef } from '@/content';
import { addPoints, talkedToday } from '@/systems/bonds';
import { spend } from '@/systems/wallet';

import { DRINK_BONUS, drinkStory, drinkWay, roundStory } from '../bar';
import type { GameContext } from '../context';
import { amountChip, busyReason, chip, firstBlocker, log, placeHere } from '../ops';
import { bondOf, findPerson, peopleAt, requirePerson } from '../people/cast';
import { outingWarmth, timeTogether, toneReaction } from '../people/together';
import { warmed } from '../people/warmth';
import type { GameState } from '../state';
import { closedReason } from '../village';
import type { ActionHandler, ActionOf } from './types';
import { placeInText } from '../placeName';
import { townPrice } from '../greetings';

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
      state.wallet.ryo < townPrice(tavern.roundCost, state, ctx) &&
        `You can’t afford a round (${townPrice(tavern.roundCost, state, ctx)} ryo).`,
    );
  },
  perform(state, _action, ctx) {
    const tavern = placeHere(state, ctx, 'tavern');
    if (!tavern) return state;
    const round = townPrice(tavern.roundCost, state, ctx);
    const paid = spend(state.wallet, round);
    if (!paid.ok) return state;
    const crowd = tavernCrowd(state, ctx);
    const warmth = new Map(crowd.map((p) => [p.id, warmed(state, ctx, ROUND_BOND, p)]));
    const bonds = Object.fromEntries(
      crowd.map((p) => [p.id, addPoints(bondOf(state, p.id), warmth.get(p.id) ?? 0)]),
    );
    const next = {
      ...state,
      wallet: paid.value,
      people: { ...state.people, bonds: { ...state.people.bonds, ...bonds } },
      village: { ...state.village, lastRoundDay: state.time.day },
    };
    return log(next, {
      heading: `A round at ${placeInText(tavern.name)}`,
      text: roundStory(crowd),
      tone: 'success',
      chips: [
        chip(`−${round} ryo`, 'cost'),
        ...crowd.flatMap((p) => amountChip(p.name, warmth.get(p.id) ?? 0, 'gain')),
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
      state.wallet.ryo < townPrice(tavern.cupCost, state, ctx) &&
        `A drink costs ${townPrice(tavern.cupCost, state, ctx)} ryo.`,
    );
  },
  perform(state, action, ctx) {
    const tavern = placeHere(state, ctx, 'tavern');
    const cup = tavern ? townPrice(tavern.cupCost, state, ctx) : 0;
    const paid = tavern ? spend(state.wallet, cup) : null;
    if (!tavern || !paid?.ok) return state;
    const person = requirePerson(state, ctx, action.personId);
    const way = drinkWay(action.way);
    const delta = outingWarmth(state, ctx, person, { tone: way.tone, bonus: DRINK_BONUS });
    const together = timeTogether({ ...state, wallet: paid.value }, person, delta);
    return log(together.state, {
      heading: `A drink with ${person.name}`,
      text: drinkStory(way, person, toneReaction(ctx, person, way.tone)),
      tone: delta > 0 ? 'success' : 'warning',
      chips: [chip(`−${cup} ryo`, 'cost'), ...together.chips],
    });
  },
};
