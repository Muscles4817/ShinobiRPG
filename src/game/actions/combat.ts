import { afterPouch } from '../combatants';
import { engineFor, rememberPlan } from '../fightStyle';
import { resolveCombat } from '../missionFlow';
import { resolveSpar } from '../sparFlow';
import type { ActionHandler, ActionOf } from './types';

export const combatAct: ActionHandler<ActionOf<'combatAct'>> = {
  check(state, action, ctx) {
    if (!state.combat) return 'You are not in a fight.';
    const option = engineFor(state, ctx)
      .view(state.combat)
      .options.find((o) => o.id === action.optionId);
    if (!option) return 'That is not an option right now.';
    return option.disabledReason ?? null;
  },
  perform(state, action, ctx, rng) {
    if (!state.combat) return state;
    const engine = engineFor(state, ctx);
    const choice = {
      optionId: action.optionId,
      ...(action.targetId === undefined ? {} : { targetId: action.targetId }),
    };
    const next = engine.act(state.combat, choice, rng);
    if (!next.ok) return state;
    const combat = next.value;
    const outcome = engine.outcome(combat);
    if (!outcome) return { ...state, combat };
    const ended = afterPouch(rememberPlan({ ...state, combat }, engine.id, outcome), outcome);
    return state.people.sparringWith
      ? resolveSpar(ended, outcome, ctx)
      : resolveCombat(ended, outcome, ctx);
  },
};
