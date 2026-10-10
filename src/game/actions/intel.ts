import { spend } from '@/systems/wallet';

import { availability } from '../board';
import { busyReason, chip, firstBlocker, log, placeHere } from '../ops';
import type { ActionHandler, ActionOf } from './types';

/**
 * Buying the client's report on a job: who you'll face and how they fight. Once known, the
 * notice lists every foe with their tricks and counters, so you can prepare before you go.
 */

export const INTEL_FEE = 20;

export const buyIntel: ActionHandler<ActionOf<'buyIntel'>> = {
  check(state, action, ctx) {
    const def = ctx.content.missions.get(action.missionId);
    const hall = placeHere(state, ctx, 'missions');
    if (!def || !hall?.missionIds.includes(def.id)) return 'That job isn’t posted here.';
    if (availability(state, ctx, def).kind === 'absent') return 'That job isn’t on the board.';
    return firstBlocker(
      busyReason(state),
      !def.stages.some((s) => s.kind === 'combat') && 'No fighting is expected on this job.',
      state.board.intel.includes(def.id) && 'You already know who you’ll face.',
      state.wallet.ryo < INTEL_FEE && `The report costs ${INTEL_FEE} ryo.`,
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.missions.require(action.missionId);
    const paid = spend(state.wallet, INTEL_FEE);
    if (!paid.ok) return state;
    const board = { ...state.board, intel: [...state.board.intel, def.id] };
    return log(
      { ...state, wallet: paid.value, board },
      {
        heading: `The report on ${def.title}`,
        text: 'The clerk slides the client’s report across the counter. Now you know who you’ll face.',
        tone: 'info',
        chips: [chip(`−${INTEL_FEE} ryo`, 'cost')],
      },
    );
  },
};
