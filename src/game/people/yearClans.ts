import { hashUnit } from '@/core';

import type { GameContext } from '../context';

/**
 * How many of a year's generated classmates are clan children, and of which clans. It varies
 * from year to year, read from the save's seed: a strong year sends several heirs of the old
 * clans to the academy, a thin one none at all, and clan children graduate stronger, so the
 * count is how talented the year is.
 */

const CLANLESS = 'none';
/** Chance of each number of clan children among the generated classmates (0, 1, 2…). */
export const CLAN_CHILDREN_ODDS = [0.15, 0.3, 0.3, 0.18, 0.07] as const;

function clanChildren(seed: number, count: number): number {
  const roll = hashUnit(seed, 'year-clans');
  let left = roll;
  for (const [n, odds] of CLAN_CHILDREN_ODDS.entries()) {
    left -= odds;
    if (left < 0) return Math.min(n, count);
  }
  return 0;
}

/** Each classmate's clan by position (null for a clanless child), from the seed alone. */
export function yearClans(ctx: GameContext, seed: number, count: number): (string | null)[] {
  const clans = ctx.content.clans.all.filter((c) => c.id !== CLANLESS).map((c) => c.id);
  const children = clans.length === 0 ? 0 : clanChildren(seed, count);
  // Which places in the year the clan children take, and which clans, both by hash.
  const places = Array.from({ length: count }, (_, i) => i)
    .sort((a, b) => hashUnit(seed, 'clan-place', a) - hashUnit(seed, 'clan-place', b))
    .slice(0, children);
  const order = [...clans].sort((a, b) => hashUnit(seed, 'clan', a) - hashUnit(seed, 'clan', b));
  return Array.from({ length: count }, (_, i) => {
    const nth = places.indexOf(i);
    return nth < 0 ? null : (order[nth % order.length] ?? null);
  });
}
