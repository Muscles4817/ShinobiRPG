import { resolveCombat } from '../missionFlow';
import { resolveSpar } from '../sparFlow';
import type { ActionHandler, ActionOf } from './types';

export const combatAct: ActionHandler<ActionOf<'combatAct'>> = {
  check(state, action, ctx) {
    if (!state.combat) return 'You are not in a fight.';
    const option = ctx.combat.view(state.combat).options.find((o) => o.id === action.optionId);
    if (!option) return 'That is not an option right now.';
    return option.disabledReason ?? null;
  },
  perform(state, action, ctx, rng) {
    if (!state.combat) return state;
    const next = ctx.combat.act(state.combat, action.optionId, rng);
    if (!next.ok) return state;
    const combat = next.value;
    const outcome = ctx.combat.outcome(combat);
    if (!outcome) return { ...state, combat };
    const ended = { ...state, combat };
    return state.people.sparringWith
      ? resolveSpar(ended, outcome, ctx)
      : resolveCombat(ended, outcome, ctx);
  },
};
