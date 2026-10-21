import { isHungry } from '@/systems/vitals';
import { spend } from '@/systems/wallet';

import { busyReason, chip, firstBlocker, placeHere } from '../ops';
import { INN_NIGHTS } from '../everyday/awayLines';
import { tellDaily } from '../everyday/tell';
import { placeInText } from '../placeName';
import { sleepTillDawn } from './daily';
import type { ActionHandler, ActionOf } from './types';
import { townPrice } from '../greetings';

/**
 * A room for the night away from home. A strange bed rests you nearly as well as your own,
 * and the room is paid for at the desk before you go up.
 */

/** A night at an inn heals this share of what a night in your own bed would. */
export const INN_HEALTH_SHARE = 0.9;

export const takeRoom: ActionHandler<ActionOf<'takeRoom'>> = {
  check(state, _action, ctx) {
    const inn = placeHere(state, ctx, 'inn');
    if (!inn) return 'There is no inn here.';
    const room = townPrice(inn.roomCost, state, ctx);
    return firstBlocker(busyReason(state), state.wallet.ryo < room && `A room costs ${room} ryo.`);
  },
  perform(state, _action, ctx) {
    const inn = placeHere(state, ctx, 'inn');
    const room = inn ? townPrice(inn.roomCost, state, ctx) : 0;
    const paid = inn ? spend(state.wallet, room) : null;
    if (!inn || !paid?.ok) return state;
    const said = tellDaily(state, ctx, INN_NIGHTS, { key: inn.id });
    const hungry = isHungry(state.character.vitals);
    // One entry for the night: the key at the desk, the night, and what the room cost.
    return sleepTillDawn({ ...state, wallet: paid.value, told: said.told }, ctx, {
      healthShare: INN_HEALTH_SHARE,
      text: `${inn.keeper} hands you a key. ${said.text}`,
      uneasy: hungry,
      heading: `A room at ${placeInText(inn.name)}`,
      chips: [chip(`−${room} ryo`, 'cost')],
    });
  },
};
