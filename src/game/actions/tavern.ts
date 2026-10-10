import type { PersonDef } from '@/content';
import { addPoints } from '@/systems/bonds';
import { spend } from '@/systems/wallet';

import type { GameContext } from '../context';
import { busyReason, chip, firstBlocker, log, placeHere } from '../ops';
import { bondOf, peopleHere } from '../people/cast';
import type { GameState } from '../state';
import { closedReason } from '../village';
import type { ActionHandler, ActionOf } from './types';

/**
 * The izakaya at night: stand everyone inside a round and they all warm to you a little. It
 * doesn't count as talking to anyone, so you can still sit down with one of them after.
 */

export const ROUND_BOND = 3;

/** Who is at the izakaya here right now. */
export function tavernCrowd(state: GameState, ctx: GameContext): PersonDef[] {
  const tavern = placeHere(state, ctx, 'tavern');
  if (!tavern) return [];
  return peopleHere(state, ctx)
    .filter((p) => p.placeId === tavern.id)
    .map((p) => p.person);
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
    const bonds = Object.fromEntries(
      crowd.map((p) => [p.id, addPoints(bondOf(state, p.id), ROUND_BOND)]),
    );
    const next = {
      ...state,
      wallet: paid.value,
      people: { ...state.people, bonds: { ...state.people.bonds, ...bonds } },
      village: { ...state.village, lastRoundDay: state.time.day },
    };
    const names = crowd.map((p) => p.name);
    return log(next, {
      heading: `A round at ${tavern.name}`,
      text: `You stand everyone a round. ${names.join(', ')} raise their cups to you.`,
      tone: 'success',
      chips: [
        chip(`−${tavern.roundCost} ryo`, 'cost'),
        ...names.map((name) => chip(`${name} +${ROUND_BOND}`, 'gain')),
      ],
    });
  },
};
