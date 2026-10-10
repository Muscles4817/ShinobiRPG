import { GEAR_SLOTS, type GearDef, type GearSlot, type IconId, type ToolDef } from '@/content';
import { owns, POUCH_LIMIT, toolCount } from '@/systems/inventory';
import { STAT_INFO, type StatDelta, type StatId } from '@/systems/stats';

import type { GameContext } from '../context';
import { equippedIn, gearBonuses } from '../gear';
import { currentLocation } from '../ops';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/** Gear shops (racks of gear, a tray of fight tools) and your own gear locker at home. */

export const SLOT_LABEL: Readonly<Record<GearSlot, string>> = {
  weapon: 'Weapons',
  body: 'Armour',
  charm: 'Charms',
};

export interface GearItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: IconId;
  readonly cost: number;
  /** e.g. ["Kenjutsu +2", "Speed +1"]. */
  readonly bonuses: readonly string[];
  readonly owned: boolean;
  readonly equipped: boolean;
  readonly buy: Choice;
  /** Null unless you own it and aren't wearing it. */
  readonly equip: Choice | null;
}

/** A fight tool on the counter or in your pouch. */
export interface ToolItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: IconId;
  readonly cost: number;
  /** How many you carry, out of `limit`. */
  readonly count: number;
  readonly limit: number;
  readonly buy: Choice;
}

function toolItem(state: GameState, ctx: GameContext, def: ToolDef): ToolItem {
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    icon: def.icon,
    cost: def.cost,
    count: toolCount(state.inventory, def.id),
    limit: POUCH_LIMIT,
    buy: choice(state, ctx, { type: 'buyTool', toolId: def.id }),
  };
}

export interface GearShopView {
  readonly name: string;
  readonly keeper: string;
  readonly ryo: number;
  readonly racks: readonly {
    readonly slot: GearSlot;
    readonly label: string;
    readonly items: readonly GearItem[];
  }[];
  /** Fight tools sold by the piece; empty if the shop sells none. */
  readonly tools: readonly ToolItem[];
}

export function bonusLabels(delta: StatDelta): string[] {
  return (Object.entries(delta) as [StatId, number][]).map(
    ([id, value]) => `${STAT_INFO[id].label} ${value >= 0 ? '+' : ''}${value}`,
  );
}

function gearItem(state: GameState, ctx: GameContext, def: GearDef): GearItem {
  const owned = owns(state.inventory, def.id);
  const equipped = state.inventory.equipped[def.slot] === def.id;
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    icon: def.icon,
    cost: def.cost,
    bonuses: bonusLabels(def.statBonuses),
    owned,
    equipped,
    buy: choice(state, ctx, { type: 'buyGear', gearId: def.id }),
    equip: owned && !equipped ? choice(state, ctx, { type: 'equipGear', gearId: def.id }) : null,
  };
}

export function gearShopView(
  state: GameState,
  ctx: GameContext,
  placeId: string,
): GearShopView | null {
  const place = currentLocation(state, ctx).places.find((p) => p.id === placeId);
  if (place?.kind !== 'gear') return null;
  const items = place.gearIds.map((id) => ctx.content.gear.require(id));
  return {
    name: place.name,
    keeper: place.keeper,
    ryo: state.wallet.ryo,
    racks: GEAR_SLOTS.map((slot) => ({
      slot,
      label: SLOT_LABEL[slot],
      items: items.filter((g) => g.slot === slot).map((g) => gearItem(state, ctx, g)),
    })).filter((r) => r.items.length > 0),
    tools: (place.toolIds ?? []).map((id) => toolItem(state, ctx, ctx.content.tools.require(id))),
  };
}

export interface LoadoutSlot {
  readonly slot: GearSlot;
  readonly label: string;
  readonly worn: GearItem | null;
  readonly takeOff: Choice | null;
  /** Other pieces you own for this slot. */
  readonly spares: readonly GearItem[];
}

export interface LoadoutView {
  readonly slots: readonly LoadoutSlot[];
  /** Everything your gear adds in fights, e.g. ["Kenjutsu +2"]. */
  readonly total: readonly string[];
  /** The fight tools you carry. */
  readonly pouch: readonly ToolItem[];
}

export function loadoutView(state: GameState, ctx: GameContext): LoadoutView {
  const owned = state.inventory.gear.flatMap((id) => {
    const def = ctx.content.gear.get(id);
    return def ? [def] : [];
  });
  return {
    slots: GEAR_SLOTS.map((slot) => {
      const worn = equippedIn(state, ctx, slot);
      return {
        slot,
        label: SLOT_LABEL[slot].replace(/s$/, ''),
        worn: worn && gearItem(state, ctx, worn),
        takeOff: worn ? choice(state, ctx, { type: 'unequipGear', slot }) : null,
        spares: owned
          .filter((g) => g.slot === slot && g.id !== worn?.id)
          .map((g) => gearItem(state, ctx, g)),
      };
    }),
    total: bonusLabels(gearBonuses(state, ctx)),
    pouch: Object.keys(state.inventory.tools).flatMap((id) => {
      const def = ctx.content.tools.get(id);
      return def ? [toolItem(state, ctx, def)] : [];
    }),
  };
}
