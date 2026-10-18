import { earn, spend } from '@/systems/wallet';

import {
  CALL_NAMES,
  callOf,
  DICE_ROUNDS_PER_NIGHT,
  diceTableHere,
  nextCup,
  roundsTonight,
  winnings,
} from '../dice';
import { busyReason, chip, firstBlocker, log, placeHere } from '../ops';
import { closedReason } from '../village';
import { tellDaily } from '../everyday/tell';
import { DICE_LOST, DICE_WON } from '../everyday/tableLines';
import type { ActionHandler, ActionOf } from './types';

/**
 * A round of chō-han at a bar's dice table: stake ryo on the cup coming up even or odd. A win
 * pays the stake back and as much again, less the house's cut; a loss keeps the stake. It
 * takes no time, but the house only deals you a few rounds a night.
 */
export const playDice: ActionHandler<ActionOf<'playDice'>> = {
  check(state, action, ctx) {
    const tavern = placeHere(state, ctx, 'tavern');
    const here = diceTableHere(state, ctx, action.pastimeId);
    if (!tavern || !here) return 'There’s no dice table here.';
    return firstBlocker(
      busyReason(state),
      closedReason(tavern.name, tavern.hours, state),
      !here.table.stakes.includes(action.stake) && 'The house doesn’t take that bet.',
      roundsTonight(state) >= DICE_ROUNDS_PER_NIGHT &&
        'The dealer waves you off: that’s enough for one night.',
      state.wallet.ryo < action.stake && `You don’t have ${action.stake} ryo to stake.`,
    );
  },
  perform(state, action, ctx) {
    const here = diceTableHere(state, ctx, action.pastimeId);
    if (!here) return state;
    const faces = nextCup(state, here.placeId, here.table);
    const came = callOf(faces);
    const won = came === action.call ? winnings(action.stake) : 0;
    const paid = spend(state.wallet, action.stake);
    if (!paid.ok) return state;
    const wallet = won > 0 ? earn(paid.value, action.stake + won) : paid.value;
    const said = tellDaily(state, ctx, won > 0 ? DICE_WON : DICE_LOST, {
      key: `${action.pastimeId}|${roundsTonight(state)}`,
    });
    const next = {
      ...state,
      told: said.told,
      wallet,
      village: {
        ...state.village,
        dice: {
          day: state.time.day,
          rounds: roundsTonight(state) + 1,
          last: { pastimeId: action.pastimeId, faces, call: action.call, stake: action.stake, won },
        },
      },
    };
    const lifted = `The cup lifts on ${CALL_NAMES[came].toLowerCase()}.`;
    return log(next, {
      heading: here.pastime.name,
      tone: won > 0 ? 'success' : 'warning',
      text: `${lifted} ${said.text}`,
      chips: [won > 0 ? chip(`+${won} ryo`, 'gain') : chip(`−${action.stake} ryo`, 'cost')],
    });
  },
};
