import { round1 } from '@/core';
import type { GearDef, GearSlot } from '@/content';
import { STAT_IDS, sumDeltas, type StatDelta, type StatId, type Stats } from '@/systems/stats';

import type { GameContext } from './context';
import { hungerEffect } from './hunger';
import { injuryFightEffect } from './injuries';
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

/** Your stats as they count in a fight: training plus gear, weakened by hunger and injuries. */
export function combatStats(state: GameState, ctx: GameContext): Stats {
  const bonus = gearBonuses(state, ctx);
  const { stats, vitals } = state.character;
  const strength = hungerEffect(vitals).fightStrength;
  const hurt = injuryFightEffect(state.character, ctx);
  const value = (id: StatId): number =>
    Math.max(
      0,
      round1((stats[id] + (bonus[id] ?? 0)) * strength * hurt.scale[id] - hurt.strain[id]),
    );
  return Object.fromEntries(STAT_IDS.map((id) => [id, value(id)])) as Stats;
}
