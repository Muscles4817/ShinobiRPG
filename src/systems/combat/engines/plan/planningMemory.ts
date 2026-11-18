import type { RangeBand } from '../../contract';
import { RANGE_BANDS } from '../../rules/range';
import { PLAYER_ORDERS, type PlayerPlanning } from './planningShape';

/**
 * Who plans your round carries over from fight to fight with your plan (`memory.ts`): the
 * level, the order, your pins and what you forbade. Read back from a save, every field is
 * checked; anything that can't be read is left out, which is your list.
 */

export type KeptPlanning = Omit<PlayerPlanning, 'draftedWhy'>;

/** What to keep of who plans, for the plan handed back. */
export function planningKept(player: PlayerPlanning): KeptPlanning {
  const { draftedWhy: _why, ...kept } = player;
  return {
    ...(kept.planning ? { planning: kept.planning } : {}),
    ...(kept.order ? { order: kept.order } : {}),
    ...(kept.owned ? { owned: kept.owned } : {}),
    ...(kept.forbidden?.length ? { forbidden: kept.forbidden } : {}),
  };
}

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

function ownedFrom(value: unknown): KeptPlanning['owned'] {
  if (typeof value !== 'object' || value === null) return undefined;
  // From a save: each distance's pins are checked to be card ids.
  const raw = value as Readonly<Record<string, unknown>>;
  return Object.fromEntries(RANGE_BANDS.map((b: RangeBand) => [b, strings(raw[b])]));
}

/** Who plans, read back from a remembered plan. */
export function planningFrom(record: Readonly<Record<string, unknown>>): KeptPlanning {
  const planning =
    record.planning === 'draft' || record.planning === 'orders' ? record.planning : undefined;
  const order = PLAYER_ORDERS.find((o) => o !== 'free' && o === record.order);
  const owned = ownedFrom(record.owned);
  const forbidden = strings(record.forbidden);
  return {
    ...(planning ? { planning } : {}),
    ...(order && order !== 'free' ? { order } : {}),
    ...(owned ? { owned } : {}),
    ...(forbidden.length > 0 ? { forbidden } : {}),
  };
}
