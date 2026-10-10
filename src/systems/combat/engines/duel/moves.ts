import type { Rng } from '@/core';

import { DISPEL_CHAKRA, dispelChance, searchChance } from '../../rules/conditions';
import { patchFighter, type ActionResult } from './actions';
import { footworkChance } from './formulas';
import { livingOn, type Fighter } from './state';

/**
 * Turns spent on something other than hurting someone: closing the gap, backing away, and
 * seeing through illusions. They never misfire.
 */

/** The mover and the target end up engaged, if the mover is quick enough. */
export function closeIn(
  fighters: readonly Fighter[],
  mover: Fighter,
  target: Fighter,
  rng: Rng,
): ActionResult {
  if (!rng.chance(footworkChance(mover, target))) {
    return { fighters, lines: [`${mover.name} tries to close in, but ${target.name} keeps away.`] };
  }
  const engaged = patchFighter(patchFighter(fighters, mover.id, { distant: false }), target.id, {
    distant: false,
  });
  return { fighters: engaged, lines: [`${mover.name} closes in on ${target.name}.`] };
}

/** Steps back out of reach of blows, outpacing the fastest foe. */
export function backOff(
  fighters: readonly Fighter[],
  mover: Fighter,
  foes: readonly Fighter[],
  rng: Rng,
): ActionResult {
  const fastest = foes.reduce((a, b) => (b.attributes.speed > a.attributes.speed ? b : a));
  if (!rng.chance(footworkChance(mover, fastest))) {
    return { fighters, lines: [`${mover.name} tries to back off but can't get clear.`] };
  }
  return {
    fighters: patchFighter(fighters, mover.id, { distant: true }),
    lines: [`${mover.name} darts back out of reach.`],
  };
}

function hiddenFoes(fighters: readonly Fighter[]): Fighter[] {
  return livingOn(fighters, 'enemy').filter((f) => f.hidden);
}

/** The player looks for each hidden foe in turn. */
export function search(fighters: readonly Fighter[], player: Fighter, rng: Rng): ActionResult {
  let next: readonly Fighter[] = fighters;
  const lines: string[] = ['You search the shadows.'];
  for (const hider of hiddenFoes(fighters)) {
    if (!rng.chance(searchChance(player, hider))) continue;
    next = patchFighter(next, hider.id, { hidden: false });
    lines.push(`You spot ${hider.name}!`);
  }
  if (lines.length === 1) lines.push('Nothing but shadows.');
  return { fighters: next, lines };
}

/** Spends chakra to clear your own head and maybe break every illusion at once. */
export function dispel(fighters: readonly Fighter[], player: Fighter, rng: Rng): ActionResult {
  const cleared = patchFighter(fighters, player.id, {
    chakra: player.chakra - DISPEL_CHAKRA,
    confused: 0,
  });
  const hiders = hiddenFoes(fighters);
  const strongest = hiders.reduce<Fighter | undefined>(
    (a, b) => (a && a.attributes.genjutsu >= b.attributes.genjutsu ? a : b),
    undefined,
  );
  const lines = ['You form the release seal.'];
  if (!strongest) return { fighters: cleared, lines: [...lines, 'Your head clears.'] };
  if (!rng.chance(dispelChance(player, strongest))) {
    return { fighters: cleared, lines: [...lines, 'The illusion holds.'] };
  }
  const revealed = cleared.map((f) =>
    f.hidden && f.side === 'enemy' ? { ...f, hidden: false } : f,
  );
  return { fighters: revealed, lines: [...lines, 'The illusion shatters!'] };
}
