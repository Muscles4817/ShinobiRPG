import { addGear, addScroll, owns, ownsScroll, type Inventory } from '@/systems/inventory';
import type { JournalChip } from '@/systems/journal';
import type { MissionDef } from '@/systems/missions';

import type { GameContext } from './context';
import { chip } from './ops';
import type { GameState } from './state';

/**
 * What a client hands over besides ryo on success: a technique scroll (studied at home or in a
 * library) or a piece of gear such as a named weapon. Nothing you already own is given twice.
 */

export interface HandedOver {
  readonly inventory: Inventory;
  readonly chips: readonly JournalChip[];
  /** For the debrief card, by name. */
  readonly report: { readonly scroll?: string; readonly gear?: string };
}

export function handedOver(state: GameState, ctx: GameContext, def: MissionDef): HandedOver {
  const { scrollId, gearId } = def.reward;
  const scroll =
    scrollId !== undefined && !ownsScroll(state.inventory, scrollId)
      ? ctx.content.techniques.require(scrollId)
      : null;
  const gear =
    gearId !== undefined && !owns(state.inventory, gearId)
      ? ctx.content.gear.require(gearId)
      : null;
  const withScroll = scroll ? addScroll(state.inventory, scroll.id) : state.inventory;
  return {
    inventory: gear ? addGear(withScroll, gear.id) : withScroll,
    chips: [
      ...(scroll ? [chip(`${scroll.name} scroll`, 'gain')] : []),
      ...(gear ? [chip(gear.name, 'gain')] : []),
    ],
    report: {
      ...(scroll ? { scroll: scroll.name } : {}),
      ...(gear ? { gear: gear.name } : {}),
    },
  };
}
