import { fillSlots, hashUnit } from '@/core';

import type { GameContext } from '../context';
import { personSlots } from '../people/pronouns';
import type { GameState } from '../state';
import { tellFresh } from '../telling';
import { crewPeople } from './personal';

/**
 * How an evening by the fire is told: drilling, turning in, and the fire burning down, a few
 * ways each, alone or with someone along (`{mate}` and their pronouns), drawn without repeating
 * what the player read lately.
 */

export type CampMoment = 'drill' | 'rest' | 'embers';

const ALONE: Readonly<Record<CampMoment, readonly string[]>> = {
  drill: [
    'You drill at the edge of the fire’s reach until your arms ache.',
    'You run through your forms on the flattened grass, slower each time, until you can feel every one of them.',
    'You find a tree to hit and hit it, steadily, while the fire settles behind you.',
  ],
  rest: [
    'You turn in early and sleep like the dead.',
    'You roll yourself in your blanket with your feet to the coals, and you are asleep before you have settled.',
    'You lie listening to the night for a while, and then you don’t remember anything until morning.',
  ],
  embers: [
    'The fire burns down to embers.',
    'The last log falls in on itself, and the dark comes in close round the camp.',
    'By the time you look up, the fire is a red glimmer under ash.',
  ],
};

const TOGETHER: Readonly<Record<CampMoment, readonly string[]>> = {
  drill: [
    '{mate} gets up to drill beside you, and neither of you will be the first to stop.',
    'You drill at the edge of the fire’s reach while {mate} calls out what {mate.they} can see wrong with your footwork.',
    'You spar slowly with {mate} on the flattened grass, half speed, until both of you are laughing at how tired you are.',
  ],
  rest: [
    'You turn in early. The last thing you hear is {mate} poking at the fire and muttering to {mate.themself}.',
    'You sleep properly for once, and {mate} takes your share of the watch without waking you.',
    'You roll yourself in your blanket, and {mate} throws {mate.their} spare over you as well.',
  ],
  embers: [
    'The fire burns down to embers, and {mate} banks it for the morning.',
    'Somebody yawns, and then everybody does. The fire is left to burn down on its own.',
    'The last log falls in on itself, and {mate} is already asleep sitting up.',
  ],
};

/** A line for the moment, told about someone along when there is anyone, and remembered. */
export function campLine(
  state: GameState,
  ctx: GameContext,
  moment: CampMoment,
): { readonly text: string; readonly told: GameState['told'] } {
  const crew = crewPeople(state, ctx);
  const key = `${state.board.seed}|${state.time.day}|${state.mission?.missionId ?? ''}`;
  const mate = crew[Math.floor(hashUnit(key, moment, 'mate') * crew.length)];
  const lines = mate ? TOGETHER[moment] : ALONE[moment];
  const name = `camp-${moment}-${mate ? 'together' : 'alone'}`;
  const telling = tellFresh(state.told, { name, lines }, key);
  const text = mate ? fillSlots(telling.line, personSlots('mate', mate)) : telling.line;
  return { text, told: telling.told };
}
