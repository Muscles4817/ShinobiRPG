import { buildContentDb, CONTENT_PACKS, gearSlot, type ContentDb } from '@/content';
import { EMPTY_INVENTORY, equip, unequip, type Inventory } from '@/systems/inventory';

import { withIssuedBlade } from '../gear';

/** The gear step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

function stringsOf(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

/** A piece worn in a slot it no longer belongs in moves to its own slot, if that is free. */
function reslotted(inventory: Inventory, content: ContentDb): Inventory {
  return Object.entries(inventory.equipped).reduce((inv, [slot, id]) => {
    const def = content.gear.get(id);
    const own = def ? gearSlot(def) : null;
    if (own === slot) return inv;
    const off = unequip(inv, slot);
    return own && !off.equipped[own] ? equip(off, own, id) : off;
  }, inventory);
}

/**
 * v21 → v22: gear no longer adds to stats; it shapes how you fight. Piece ids are kept, but
 * some changed slot (sealing brushes and bells are focus charms now, not weapons), so a worn
 * piece moves to its new slot. Kenjutsu now needs a blade: a character who knows a blade art
 * and owns no blade is issued one, as a new genin would be.
 */
export function v21ToV22(state: RawState): RawState {
  const pack = CONTENT_PACKS.find((p) => p.id === state.packId);
  if (!pack) return state;
  const content = buildContentDb(pack);
  const raw = asRecord(state.inventory);
  const inventory: Inventory = { ...EMPTY_INVENTORY, ...raw };
  const known = stringsOf(asRecord(state.techniques).known);
  return {
    ...state,
    inventory: withIssuedBlade(reslotted(inventory, content), known, content),
  };
}
