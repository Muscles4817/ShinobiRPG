import {
  GEAR_SLOTS,
  gearSlot,
  type GearDef,
  type GearSlot,
  type IconId,
  type ToolDef,
} from '@/content';
import type { GearRank } from '@/systems/combat';
import { owns, POUCH_LIMIT, toolCount } from '@/systems/inventory';
import type { JournalChip } from '@/systems/journal';

import type { GameContext } from '../context';
import { combatStats, equippedIn } from '../gear';
import { currentLocation } from '../ops';
import type { GameState } from '../state';
import { loreOnShelf, type LoreOnShelf } from './handling';
import { choice, type Choice } from './common';
import { gearChips, gearKindLabel } from './gearWords';

/** Gear shops (racks of gear, a tray of fight tools) and your own gear locker at home. */

export const SLOT_LABEL: Readonly<Record<GearSlot, string>> = {
  weapon: 'Blades and fists',
  thrown: 'Thrown',
  body: 'Armour',
  charm: 'Focus charms',
};

/** One piece of each slot, for the gear chest at home. */
const SLOT_SINGULAR: Readonly<Record<GearSlot, string>> = {
  weapon: 'In hand',
  thrown: 'Thrown',
  body: 'Armour',
  charm: 'Focus',
};

export interface GearItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: IconId;
  readonly cost: number;
  readonly rank: GearRank;
  /** What kind of piece: "Blade", "Flak jacket", "Focus". */
  readonly kind: string;
  /** Named, never sold: earned, found or inherited. */
  readonly unique: boolean;
  /** What it does in a fight, e.g. "Strike becomes a cut", "Cuts +10%". */
  readonly effects: readonly JournalChip[];
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
  /** Handling lore for companions; empty if the shop sells none. */
  readonly lore: readonly LoreOnShelf[];
  /** A batch of the dust you command, if the shop sells it; null otherwise. */
  readonly dust: DustOnShelf | null;
}

export interface DustOnShelf extends Choice {
  readonly name: string;
  readonly description: string;
  readonly cost: number;
}

/** The dust you command, by the batch, where this shop sells it. */
function dustOnShelf(
  state: GameState,
  ctx: GameContext,
  place: { readonly id: string; readonly dustIds?: readonly string[] },
): DustOnShelf | null {
  const def = state.dust ? ctx.content.dusts.get(state.dust.dustId) : undefined;
  if (def?.price === undefined || !(place.dustIds ?? []).includes(def.id)) return null;
  return {
    ...choice(state, ctx, { type: 'buyDust', placeId: place.id }),
    name: `A batch of ${def.name.toLowerCase()}`,
    description: def.description,
    cost: def.price,
  };
}

function gearItem(state: GameState, ctx: GameContext, def: GearDef): GearItem {
  const owned = owns(state.inventory, def.id);
  const equipped = state.inventory.equipped[gearSlot(def)] === def.id;
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    icon: def.icon,
    cost: def.cost,
    rank: def.rank,
    kind: gearKindLabel(def),
    unique: def.unique === true,
    effects: gearChips(def, combatStats(state, ctx).strength, state.character.weaponMastery),
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
      items: items.filter((g) => gearSlot(g) === slot).map((g) => gearItem(state, ctx, g)),
    })).filter((r) => r.items.length > 0),
    tools: (place.toolIds ?? []).map((id) => toolItem(state, ctx, ctx.content.tools.require(id))),
    lore: loreOnShelf(state, ctx, place.loreIds ?? []),
    dust: dustOnShelf(state, ctx, place),
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
        label: SLOT_SINGULAR[slot],
        worn: worn && gearItem(state, ctx, worn),
        takeOff: worn ? choice(state, ctx, { type: 'unequipGear', slot }) : null,
        spares: owned
          .filter((g) => gearSlot(g) === slot && g.id !== worn?.id)
          .map((g) => gearItem(state, ctx, g)),
      };
    }),
    pouch: Object.keys(state.inventory.tools).flatMap((id) => {
      const def = ctx.content.tools.get(id);
      return def ? [toolItem(state, ctx, def)] : [];
    }),
  };
}
