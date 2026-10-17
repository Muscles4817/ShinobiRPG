import { laidUp, treatedUntil } from '@/systems/companions';
import { deduct } from '@/systems/wallet';

import { withCompanion, yourCompanion } from '../companions/care';
import { maxHealthOf } from '../companions/make';
import type { GameContext } from '../context';
import { busyReason, chip, firstBlocker, log, placeHere } from '../ops';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/**
 * The animal clinic (`vet` places): the vet treats an injured companion once per injury (half
 * the days it has left, and its strength back), free to the clan whose kennels it is, and sells
 * medicine to give at home.
 */

/** What the vet here charges you for a treatment: nothing at your own clan's kennels. */
export function treatmentFee(state: GameState, ctx: GameContext): number | null {
  const vet = placeHere(state, ctx, 'vet');
  if (!vet) return null;
  return vet.freeForClanId === state.character.clanId ? 0 : vet.treatmentCost;
}

export const treatCompanion: ActionHandler<ActionOf<'treatCompanion'>> = {
  check(state, _action, ctx) {
    const yours = yourCompanion(state, ctx);
    const fee = treatmentFee(state, ctx);
    if (!yours) return 'You have no companion. Take a pup home, or win over a stray.';
    const { companion } = yours;
    return firstBlocker(
      busyReason(state),
      fee === null && 'Find an animal clinic.',
      !laidUp(companion, state.time.day) && `${companion.name} doesn’t need treating.`,
      companion.injury?.treated === true && 'The vet has done all they can. Now it needs rest.',
      fee !== null && state.wallet.ryo < fee && `Needs ${fee} ryo.`,
    );
  },
  perform(state, _action, ctx) {
    const yours = yourCompanion(state, ctx);
    const fee = treatmentFee(state, ctx) ?? 0;
    const injury = yours?.companion.injury;
    if (!yours || !injury) return state;
    const wallet = deduct(state.wallet, fee);
    const treated = {
      ...yours.companion,
      health: maxHealthOf(yours.kind),
      injury: { ...injury, treated: true, until: treatedUntil(injury.until, state.time.day) },
    };
    return log(withCompanion({ ...state, wallet }, treated), {
      text: `The vet cleans and binds ${treated.name}’s wounds. It will be on its feet sooner.`,
      tone: 'success',
      chips: fee > 0 ? [chip(`−${fee} ryo`, 'cost')] : [chip('Free at the clan’s kennels', 'gain')],
    });
  },
};

export const buyMedicine: ActionHandler<ActionOf<'buyMedicine'>> = {
  check(state, _action, ctx) {
    const vet = placeHere(state, ctx, 'vet');
    if (!vet) return 'Find an animal clinic.';
    return firstBlocker(
      busyReason(state),
      state.wallet.ryo < vet.medicineCost && `Needs ${vet.medicineCost} ryo.`,
    );
  },
  perform(state, _action, ctx) {
    const vet = placeHere(state, ctx, 'vet');
    if (!vet) return state;
    const wallet = deduct(state.wallet, vet.medicineCost);
    const companions = { ...state.companions, medicine: state.companions.medicine + 1 };
    return log(
      { ...state, wallet, companions },
      {
        text: 'A small bottle of bitter medicine, wrapped in paper.',
        tone: 'info',
        chips: [chip(`−${vet.medicineCost} ryo`, 'cost')],
      },
    );
  },
};
