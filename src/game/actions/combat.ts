import type { CombatOutcome, CombatView } from '@/systems/combat';

import { finaleOf } from '../combatFinale';
import { afterPouch, PLAYER_COMBATANT_ID } from '../combatants';
import type { GameContext } from '../context';
import { noteForestFight } from '../exam/forest';
import { inBout, resolveBout } from '../exam/tournament';
import { fightLessons, growFromFight } from '../fightGrowth';
import { applyFightToll } from '../fightToll';
import { engineFor, rememberPlan } from '../fightStyle';
import { resolveCombat } from '../missionFlow';
import { resolveSpar } from '../sparFlow';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/**
 * Where a finished fight's result goes: a spar, an exam bout, or a mission (an exam's forest is
 * a mission too, whose won fights the examiners also judge).
 */
function resolveFight(
  state: GameState,
  outcome: CombatOutcome,
  view: CombatView,
  ctx: GameContext,
): GameState {
  if (state.people.sparringWith !== null) return resolveSpar(state, outcome, ctx);
  if (inBout(state)) return resolveBout(state, outcome, ctx);
  if (outcome.result !== 'victory') return resolveCombat(state, outcome, ctx);
  const allies = view.combatants
    .filter((c) => c.side === 'player' && c.id !== PLAYER_COMBATANT_ID)
    .map((c) => c.health);
  return resolveCombat(noteForestFight(state, ctx, allies), outcome, ctx);
}

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
    const lessons = fightLessons(state, outcome, ctx);
    const ended = afterPouch(rememberPlan({ ...state, combat }, engine.id, outcome), outcome);
    const view = engine.view(combat);
    // Spars and exam bouts stop before anyone is really hurt.
    const sparring = state.people.sparringWith !== null || inBout(state);
    const resolved = resolveFight(ended, outcome, view, ctx);
    const end = { outcome, view, sparring };
    const settled = growFromFight(applyFightToll(resolved, end, ctx, rng), lessons, ctx);
    // The watch screen stages the last exchange before the result card.
    return { ...settled, combatFinale: finaleOf(view) };
  },
};
