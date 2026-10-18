import { clamp } from '@/core';
import type { AreaSize, Element } from '@/systems/techniques';

import type { CombatSwarm } from '../swarmContract';

/**
 * The rules of a hive in a fight (`swarmContract.ts`), the same for any engine: what a swarm
 * technique spends, what kills insects (an area that catches their host, and the elements their
 * strain fears, far faster), how hard settled insects draw a foe's chakra, and how well a hive
 * finds the hidden. A fighter without a hive pays a swarm technique's chakra alone, as such
 * techniques were paid before hives existed.
 */

/** Share of a hive an area catching its host kills, by the area's size. */
export const AREA_LOSS: Readonly<Record<AreaSize, number>> = { small: 0.1, wide: 0.25, vast: 0.45 };
/** An element the strain fears kills this many times as many. */
export const FEARED_SCALE = 2;
/** Share of the hive a feared hit kills per point of health it takes off the host. */
const FEARED_PER_DAMAGE = 0.01;
/** However hard the hit, a single feared hit kills at most this share. */
const MOST_FROM_A_HIT = 0.5;
/** Exchanges settled insects stay on a foe unless burnt off. */
export const SETTLE_EXCHANGES = 3;
/** Chakra settled insects draw each exchange, per point of the technique's power. */
const SETTLE_PER_POWER = 0.3;
/** The best a full hive of the keenest strain adds to finding someone hidden. */
const SENSE_SHARE = 0.4;
/** Below this share of its cap a hive reads as thin. */
const THIN_SHARE = 0.4;

/** Whether a fighter has the insects a technique spends (any fighter, without a hive). */
export function swarmAffords(swarm: CombatSwarm | undefined, cost: number | undefined): boolean {
  return !swarm || (cost ?? 0) <= swarm.count;
}

/** The hive after a technique spends from it. */
export function spentFrom(swarm: CombatSwarm, cost: number | undefined): CombatSwarm {
  return { ...swarm, count: Math.max(0, swarm.count - (cost ?? 0)) };
}

function fearScale(swarm: CombatSwarm, element: Element | undefined): number {
  return element && swarm.strain.fears.includes(element) ? FEARED_SCALE : 1;
}

/** Insects an area of this size (and element) kills when it catches their host. */
export function areaLoss(swarm: CombatSwarm, size: AreaSize, element?: Element): number {
  const share = AREA_LOSS[size] * fearScale(swarm, element) * (1 - swarm.strain.hardiness);
  return Math.round(swarm.count * clamp(share, 0, 1));
}

/** Insects a hit of a feared element kills as it takes `damage` health off their host. */
export function fearedLoss(swarm: CombatSwarm, damage: number, element?: Element): number {
  if (fearScale(swarm, element) === 1 || damage <= 0) return 0;
  const share = Math.min(MOST_FROM_A_HIT, damage * FEARED_PER_DAMAGE * FEARED_SCALE);
  return Math.round(swarm.count * share * (1 - swarm.strain.hardiness));
}

/** Whether an element burns settled insects of this strain off whoever they sit on. */
export function burnsOff(swarm: CombatSwarm, element: Element | undefined): boolean {
  return fearScale(swarm, element) > 1;
}

/** Chakra settled insects of this strain draw each exchange from a technique of this power. */
export function settleDrain(swarm: CombatSwarm, power: number): number {
  return Math.max(1, Math.round(power * SETTLE_PER_POWER * swarm.strain.drain));
}

/** How full the hive is, 0 to 1. */
export function hiveFill(swarm: CombatSwarm): number {
  return swarm.cap <= 0 ? 0 : clamp(swarm.count / swarm.cap, 0, 1);
}

/** What a hive adds to its host's chance of finding someone hidden. */
export function swarmSearch(swarm: CombatSwarm | undefined): number {
  return swarm ? swarm.strain.senses * hiveFill(swarm) * SENSE_SHARE : 0;
}

/** A hive in a word: thick, thin or spent. */
export function hiveWord(swarm: CombatSwarm): 'thick' | 'thin' | 'spent' {
  if (swarm.count <= 0) return 'spent';
  return hiveFill(swarm) < THIN_SHARE ? 'thin' : 'thick';
}
