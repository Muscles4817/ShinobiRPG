import type { Pastime } from '@/content';

import type { GameContext } from '../context';
import {
  CALL_NAMES,
  callOf,
  DICE_ROUNDS_PER_NIGHT,
  heardCall,
  lastThrowTonight,
  roundsTonight,
  winnings,
} from '../dice';
import type { DiceCall, GameState } from '../state';
import { choice, type Choice } from './common';

/**
 * A dice table at the back of the bar: the stakes the house takes, a bet on each call, what
 * you heard as the cup settled, how the last cup came up, and how many rounds the dealer has
 * left for you tonight.
 */
export interface DiceTableView {
  readonly dice: number;
  readonly stakes: readonly DiceStake[];
  /** "You think you heard them settle even." when your ears caught it. */
  readonly heard: string | null;
  readonly last: LastCup | null;
  readonly roundsLeft: number;
  readonly roundsPerNight: number;
}

export interface DiceStake {
  readonly stake: number;
  /** What a win brings on top of the stake. */
  readonly win: number;
  readonly bets: readonly DiceBet[];
}

export interface DiceBet extends Choice {
  readonly call: DiceCall;
  /** "Chō", "Han". */
  readonly name: string;
  readonly meaning: string;
}

export interface LastCup {
  readonly faces: readonly number[];
  readonly came: string;
  readonly won: number;
  readonly stake: number;
}

const MEANING: Readonly<Record<DiceCall, string>> = { even: 'even', odd: 'odd' };

export function diceTableView(
  state: GameState,
  ctx: GameContext,
  placeId: string,
  pastime: Pastime,
): DiceTableView | null {
  const table = pastime.game;
  if (table?.kind !== 'dice') return null;
  const heard = heardCall(state, placeId, table);
  const last = lastThrowTonight(state);
  return {
    dice: table.dice,
    stakes: table.stakes.map((stake) => ({
      stake,
      win: winnings(stake),
      bets: (['even', 'odd'] as const).map((call) => ({
        ...choice(state, ctx, { type: 'playDice', pastimeId: pastime.id, call, stake }),
        call,
        name: CALL_NAMES[call],
        meaning: MEANING[call],
      })),
    })),
    heard: heard && `You think you heard them settle ${MEANING[heard]}.`,
    last:
      last?.pastimeId === pastime.id
        ? {
            faces: last.faces,
            came: CALL_NAMES[callOf(last.faces)],
            won: last.won,
            stake: last.stake,
          }
        : null,
    roundsLeft: Math.max(0, DICE_ROUNDS_PER_NIGHT - roundsTonight(state)),
    roundsPerNight: DICE_ROUNDS_PER_NIGHT,
  };
}
