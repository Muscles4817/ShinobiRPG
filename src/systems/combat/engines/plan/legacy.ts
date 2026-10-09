import { defaultLoadout } from './cards';
import type { PlanFighter, PlanState } from './state';

/**
 * Saves made mid-fight before cards per distance existed hold a single tactic. They resume at
 * the card table with every fighter's default cards, so the fight carries on.
 */

interface LegacyFighter extends Omit<PlanFighter, 'loadout'> {
  readonly loadout?: PlanFighter['loadout'];
}

interface LegacyState extends Omit<PlanState, 'phase' | 'bout' | 'exchange' | 'seen' | 'fighters'> {
  readonly phase: string;
  readonly bout?: number;
  readonly fighters: readonly LegacyFighter[];
}

export function upgradeLegacy(state: PlanState): PlanState {
  // Saved state may predate the current shape; check the field that marks the new one.
  const raw = state as unknown as LegacyState;
  if (raw.bout !== undefined) return state;
  const fighters = raw.fighters.map((f) => {
    const { stunned, sealed } = f;
    const body: PlanFighter = { ...f, stunned, sealed, loadout: { close: [], mid: [], far: [] } };
    return { ...body, loadout: defaultLoadout(body) };
  });
  return {
    phase: 'loadout',
    round: raw.round,
    bout: 1,
    exchange: 0,
    fighters,
    range: raw.range,
    seen: {},
    log: [...raw.log, 'You rethink your plan.'],
    result: raw.result,
    canFlee: raw.canFlee,
  };
}
