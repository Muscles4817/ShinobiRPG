import { RANGE_BANDS } from '../../rules/range';
import { cardId, slotLimit, slotted } from './cards';
import type { Loadout, PlanFighter } from './state';

/**
 * Your cards carry over from fight to fight. The game keeps the loadout the engine handed
 * back and offers it again; since it comes from a save, it is checked here: cards you no longer
 * know or that don't fit a distance are dropped, and each distance is trimmed to your slots.
 */

function isCardList(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

function isLoadout(value: unknown): value is Loadout {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return RANGE_BANDS.every((band) => isCardList(record[band]));
}

/** The remembered loadout, cleaned up for this fighter, or null when there is none. */
export function rememberedLoadout(plan: unknown, fighter: PlanFighter): Loadout | null {
  if (!isLoadout(plan)) return null;
  const known = { ...fighter, loadout: plan };
  const [close, mid, far] = RANGE_BANDS.map((band) =>
    [...new Set(slotted(known, band).map(cardId))].slice(0, slotLimit(fighter)),
  );
  return { close: close ?? [], mid: mid ?? [], far: far ?? [] };
}
