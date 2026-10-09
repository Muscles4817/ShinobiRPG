import type { GearDef, GearSlot } from '@/content';
import { STAT_IDS, sumDeltas, type StatDelta, type Stats } from '@/systems/stats';

import type { GameContext } from './context';
import type { GameState } from './state';

/** Gear you wear: what is equipped, and the bonuses it adds to your stats in fights. */

export function equippedGear(state: GameState, ctx: GameContext): GearDef[] {
  return Object.values(state.inventory.equipped).flatMap((id) => {
    const def = ctx.content.gear.get(id);
    return def ? [def] : [];
  });
}

export function equippedIn(state: GameState, ctx: GameContext, slot: GearSlot): GearDef | null {
  const id = state.inventory.equipped[slot];
  return id === undefined ? null : (ctx.content.gear.get(id) ?? null);
}

export function gearBonuses(state: GameState, ctx: GameContext): StatDelta {
  return sumDeltas(...equippedGear(state, ctx).map((g) => g.statBonuses));
}

/** Your stats as they count in a fight: training plus gear. */
export function combatStats(state: GameState, ctx: GameContext): Stats {
  const bonus = gearBonuses(state, ctx);
  const stats = state.character.stats;
  return Object.fromEntries(STAT_IDS.map((id) => [id, stats[id] + (bonus[id] ?? 0)])) as Stats;
}
