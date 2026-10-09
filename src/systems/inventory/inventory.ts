import { err, ok, type Result } from '@/core';

/**
 * What the character owns: gear (and which piece fills each slot) and the pantry of
 * ingredients. Ids are opaque here; content decides what they mean.
 */

export interface Inventory {
  readonly gear: readonly string[];
  /** Slot → equipped gear id. */
  readonly equipped: Readonly<Record<string, string>>;
  /** Ingredient id → how many. */
  readonly pantry: Readonly<Record<string, number>>;
}

export interface Needed {
  readonly id: string;
  readonly count: number;
}

export const EMPTY_INVENTORY: Inventory = { gear: [], equipped: {}, pantry: {} };

export function owns(inventory: Inventory, gearId: string): boolean {
  return inventory.gear.includes(gearId);
}

export function addGear(inventory: Inventory, gearId: string): Inventory {
  return owns(inventory, gearId) ? inventory : { ...inventory, gear: [...inventory.gear, gearId] };
}

export function equip(inventory: Inventory, slot: string, gearId: string): Inventory {
  return { ...inventory, equipped: { ...inventory.equipped, [slot]: gearId } };
}

export function unequip(inventory: Inventory, slot: string): Inventory {
  const { [slot]: _removed, ...rest } = inventory.equipped;
  return { ...inventory, equipped: rest };
}

export function pantryCount(inventory: Inventory, id: string): number {
  return inventory.pantry[id] ?? 0;
}

export function stock(inventory: Inventory, id: string, count = 1): Inventory {
  return {
    ...inventory,
    pantry: { ...inventory.pantry, [id]: pantryCount(inventory, id) + count },
  };
}

export function hasAll(inventory: Inventory, needs: readonly Needed[]): boolean {
  return needs.every((n) => pantryCount(inventory, n.id) >= n.count);
}

/** Takes ingredients out of the pantry, or fails if any are short. */
export function useUp(inventory: Inventory, needs: readonly Needed[]): Result<Inventory> {
  if (!hasAll(inventory, needs)) return err('Not enough ingredients.');
  const used = new Map(needs.map((n) => [n.id, n.count]));
  const pantry = Object.fromEntries(
    Object.entries(inventory.pantry)
      .map(([id, count]): [string, number] => [id, count - (used.get(id) ?? 0)])
      .filter(([, count]) => count > 0),
  );
  return ok({ ...inventory, pantry });
}
