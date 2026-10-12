import { round1 } from '@/core';
import { gearSlot, type ContentDb, type GearDef, type GearSlot } from '@/content';
import type { CombatGear, CombatWeapon } from '@/systems/combat';
import { addGear, equip, type Inventory } from '@/systems/inventory';
import { RANKS, type Rank } from '@/systems/standing';
import { STAT_IDS, type StatId, type Stats } from '@/systems/stats';

import type { GameContext } from './context';
import { hungerEffect } from './hunger';
import { injuryFightEffect } from './injuries';
import type { GameState } from './state';

/**
 * Gear you wear: what is equipped, what it means in a fight, and who may buy what. Gear never
 * adds to your stats; it rides into the fight as `CombatGear` and changes the cards there.
 */

/** The standing from which a shop sells you B-rank gear. */
export const B_RANK_STANDING: Rank = 'chunin';

export function equippedIn(state: GameState, ctx: GameContext, slot: GearSlot): GearDef | null {
  const id = state.inventory.equipped[slot];
  const def = id === undefined ? undefined : ctx.content.gear.get(id);
  return def && gearSlot(def) === slot ? def : null;
}

function weaponOf(def: GearDef | null): CombatWeapon | undefined {
  if (def?.kind !== 'weapon') return undefined;
  const { name, shape, rank, effects } = def;
  return { name, shape, rank, ...(effects ? { effects } : {}) };
}

/** Your equipped gear as the fight sees it. */
export function combatGear(state: GameState, ctx: GameContext): CombatGear {
  const held = weaponOf(equippedIn(state, ctx, 'weapon'));
  const thrown = weaponOf(equippedIn(state, ctx, 'thrown'));
  const body = equippedIn(state, ctx, 'body');
  const charm = equippedIn(state, ctx, 'charm');
  return {
    ...(held ? { held } : {}),
    ...(thrown ? { thrown } : {}),
    ...(body?.kind === 'armour'
      ? { armour: { name: body.name, level: body.level, rank: body.rank } }
      : {}),
    ...(charm?.kind === 'focus'
      ? { focus: { name: charm.name, rank: charm.rank, boosts: charm.boosts } }
      : {}),
  };
}

/** Why a shop won't sell you this piece yet; null when it will. */
export function gearRankBlocker(state: GameState, def: GearDef): string | null {
  if (def.rank !== 'B') return null;
  const standing = RANKS.indexOf(state.standing.rank);
  return standing >= RANKS.indexOf(B_RANK_STANDING)
    ? null
    : 'B-rank gear is sold to chūnin and above.';
}

/** The blade the academy issues: the cheapest D-rank blade the start location sells. */
function issuedBlade(content: ContentDb): GearDef | null {
  const start = content.locations.get(content.startLocationId);
  const sold = (start?.places ?? []).flatMap((p) => (p.kind === 'gear' ? p.gearIds : []));
  const blades = sold
    .map((id) => content.gear.require(id))
    .filter((g) => g.kind === 'weapon' && g.shape === 'blade' && g.rank === 'D');
  return [...blades].sort((a, b) => a.cost - b.cost)[0] ?? null;
}

function isBlade(def: GearDef | undefined): boolean {
  return def?.kind === 'weapon' && def.shape === 'blade';
}

/**
 * A genin who knows a blade art but owns no blade is issued one to use it with (it goes in
 * hand when the hand is empty): at creation, and for saves from before kenjutsu needed one.
 */
export function withIssuedBlade(
  inventory: Inventory,
  techniqueIds: readonly string[],
  content: ContentDb,
): Inventory {
  const bladeArt = techniqueIds.some((id) => content.techniques.get(id)?.needs?.weapon === 'blade');
  const armed = inventory.gear.some((id) => isBlade(content.gear.get(id)));
  const blade = bladeArt && !armed ? issuedBlade(content) : null;
  if (!blade) return inventory;
  const issued = addGear(inventory, blade.id);
  return issued.equipped.weapon ? issued : equip(issued, 'weapon', blade.id);
}

/** Your stats as they count in a fight: training, weakened by hunger and injuries. */
export function combatStats(state: GameState, ctx: GameContext): Stats {
  const { stats, vitals } = state.character;
  const strength = hungerEffect(vitals).fightStrength;
  const hurt = injuryFightEffect(state.character, ctx);
  const value = (id: StatId): number =>
    Math.max(0, round1(stats[id] * strength * hurt.scale[id] - hurt.strain[id]));
  return Object.fromEntries(STAT_IDS.map((id) => [id, value(id)])) as Stats;
}
