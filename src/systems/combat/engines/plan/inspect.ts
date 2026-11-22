import type { CombatInspection } from '../../inspectionContract';
import type { PlanState } from './state';

/**
 * Plan & Watch laid open for debugging (`CombatEngine.inspect`): every fighter as the engine
 * holds them (body, kit, plan, conditions, pools, what they have read), the decision log when
 * the fight is traced, and the rest of the fight's state, all as plain data. Reading it changes
 * nothing; it is for a fight record's download, never for play.
 */
export function inspectPlan(plan: PlanState): CombatInspection {
  const { fighters, decisions, story: _story, storyDropped: _dropped, ...field } = plan;
  return {
    round: plan.bout,
    fighters: fighters.map((f) => ({ id: f.id, name: f.name, side: f.side, detail: f })),
    decisions: decisions ?? [],
    field,
  };
}
