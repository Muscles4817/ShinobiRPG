import { approachPlans } from '../encounter/approaches';
import { encounterHere } from '../encounter/current';
import { performRecon, reconPlans } from '../encounter/recon';
import { performApproach } from '../encounter/resolve';
import type { ActionHandler, ActionOf } from './types';

/** Recon and approaches at an encounter (see `game/encounter/`). */

const NO_ENCOUNTER = 'There is no one to size up right now.';

export const encounterRecon: ActionHandler<ActionOf<'encounterRecon'>> = {
  check(state, action, ctx) {
    const here = encounterHere(state, ctx);
    if (!here) return NO_ENCOUNTER;
    const plan = reconPlans(state, ctx, here).find((p) => p.id === action.recon);
    return plan ? plan.blocker : 'That isn’t a way to scout here.';
  },
  perform(state, action, ctx, rng) {
    return performRecon(state, ctx, action.recon, rng);
  },
};

export const encounterApproach: ActionHandler<ActionOf<'encounterApproach'>> = {
  check(state, action, ctx) {
    const here = encounterHere(state, ctx);
    if (!here) return NO_ENCOUNTER;
    const plan = approachPlans(state, ctx, here).find((p) => p.id === action.approach);
    return plan ? plan.blocker : 'That isn’t a way in here.';
  },
  perform(state, action, ctx, rng) {
    return performApproach(state, ctx, action, rng);
  },
};
