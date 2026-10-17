import { STAT_INFO } from '@/systems/stats';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { PURSE } from '../rival/contest';
import { RACE_LEGS } from '../rival/race';
import { MOVE_LABEL, NO_READ, STRAINED, TELL } from '../rival/raceLines';
import { RACE_MOVES } from '../rival/state';
import type { GameState } from '../state';
import { personCard, type PersonCard } from './people';
import { fill, rivalOf } from './rival';

/**
 * A race with your rival, as it is run: the leg ahead and what it asks, how the legs so far
 * went (each ending where it left you), what you read in them (or can't), and your three moves.
 */

export interface RaceView {
  readonly person: PersonCard;
  /** "Leg 2 of 3". */
  readonly leg: string;
  readonly name: string;
  readonly course: string;
  readonly asks: string;
  readonly told: readonly string[];
  readonly read: readonly string[];
  /** A purse on it, as a chip label; null for pride alone. */
  readonly purse: string | null;
  readonly moves: readonly {
    readonly label: string;
    readonly note: string;
    readonly action: GameAction;
  }[];
}

export function raceView(state: GameState, ctx: GameContext): RaceView | null {
  const found = rivalOf(state, ctx);
  const race = found?.rival.race;
  const leg = race && RACE_LEGS[race.leg];
  if (!found || !race || !leg) return null;
  const name = found.person.name;
  const read = [
    fill(race.read ? TELL[race.theirMove] : NO_READ, name),
    ...(race.theirStrain > 0 ? [fill(STRAINED, name)] : []),
  ];
  return {
    person: personCard(state, ctx, found.person),
    leg: `Leg ${race.leg + 1} of ${RACE_LEGS.length}`,
    name: leg.name,
    course: leg.course,
    asks: `This leg asks for ${leg.stats.map((id) => STAT_INFO[id].label.toLowerCase()).join(' and ')}.`,
    told: race.told.map((line) => fill(line, name)),
    read,
    purse: race.stakes === 'purse' ? `${PURSE} ryo on it` : null,
    moves: RACE_MOVES.map((move) => ({
      ...MOVE_LABEL[move],
      action: { type: 'runRaceLeg', move } as const,
    })),
  };
}
