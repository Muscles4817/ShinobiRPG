import { withKit } from '../../rules/body';
import { defaultLoadout } from './cards';
import { EMPTY_LOADOUT, type PlanFighter, type PlanState } from './state';

/**
 * Saves made mid-fight before cards per distance existed hold a single tactic. They resume at
 * the card table with every fighter's default cards, so the fight carries on.
 */

interface LegacyFighter extends Omit<PlanFighter, 'loadout' | 'traits' | 'hidden' | 'confused'> {
  readonly loadout?: PlanFighter['loadout'];
  readonly traits?: PlanFighter['traits'];
  readonly hidden?: boolean;
  readonly confused?: number;
}

interface LegacyState extends Omit<PlanState, 'phase' | 'bout' | 'exchange' | 'seen' | 'fighters'> {
  readonly phase: string;
  readonly bout?: number;
  readonly fighters: readonly LegacyFighter[];
}

/**
 * Fighters saved before combat kits have no traits, hidden or confused; they fight as before.
 * Runs before `upgradeLegacy`, whose default cards read traits.
 */
export function withKits(state: PlanState): PlanState {
  // Saved state may predate kits; every field withKit fills is checked before use.
  const raw = state as unknown as { readonly fighters: readonly LegacyFighter[] };
  return { ...state, fighters: raw.fighters.map((f) => withKit(f)) as PlanFighter[] };
}

export function upgradeLegacy(state: PlanState): PlanState {
  // Saved state may predate the current shape; check the field that marks the new one.
  const raw = state as unknown as LegacyState;
  if (raw.bout !== undefined) return state;
  const fighters = raw.fighters.map((f) => {
    const { stunned, sealed } = f;
    const body: PlanFighter = { ...withKit(f), stunned, sealed, loadout: EMPTY_LOADOUT };
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
