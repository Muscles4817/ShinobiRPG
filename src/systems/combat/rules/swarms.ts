import { clamp } from '@/core';
import type { AreaSize, Element } from '@/systems/techniques';

import type { CombatSwarm, SwarmGift, SwarmQuality, SwarmStrain } from '../swarmContract';

/**
 * The rules of a hive in a fight (`swarmContract.ts`), the same for any engine: what a swarm
 * technique spends, what kills insects (an area that catches their host, and the elements their
 * strain fears, far faster; tough insects less), how hard its attacks land and hit (speed,
 * camouflage, bite, size), what settled insects do (draw chakra, poison, mark the foe so they
 * are easier to hit, blind them so they aim worse) and how well a hive finds the hidden. Each
 * quality and gift is read here and nowhere else. A fighter without a hive pays a swarm
 * technique's chakra alone, as such techniques were paid before hives existed.
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
/** The middle grade (C): a quality at it changes nothing. */
const MIDDLE_GRADE = 3;
/** The best grade (A). */
const TOP_GRADE = 5;
/** Share of losses shrugged off per grade of toughness above E. */
const TOUGHNESS_PER_GRADE = 0.12;
/** How much less often swarm attacks are slipped per grade of speed above C. */
const SPEED_PER_GRADE = 0.08;
/** How much harder swarm attacks hit per grade of bite above C. */
const BITE_PER_GRADE = 0.1;
/** How much lighter each sting is per grade of size above C (smaller insects). */
const SIZE_LIGHTENS = 0.05;
/** Settled insects' chakra drain by the gift's strength (none without it). */
const DRAIN_BY_GIFT = [0, 0.35, 0.7, 1] as const;
/** Per strength of a gift: slips taken off by camouflage and glow, added by blinding. */
const SLIP_PER_GIFT = 0.1;
/** Health venom takes each exchange, per strength. */
const VENOM_PER_GIFT = 2;

/** Whether a fighter has the insects a technique spends (any fighter, without a hive). */
export function swarmAffords(swarm: CombatSwarm | undefined, cost: number | undefined): boolean {
  return !swarm || (cost ?? 0) <= swarm.count;
}

/** The hive after a technique spends from it. */
export function spentFrom(swarm: CombatSwarm, cost: number | undefined): CombatSwarm {
  return { ...swarm, count: Math.max(0, swarm.count - (cost ?? 0)) };
}

/** A strain's grade in a quality, 1 (E) to 5 (A). */
function grade(strain: SwarmStrain, quality: SwarmQuality): number {
  return strain.qualities[quality];
}

/** A strain's strength in a gift, 0 (none) to 3 (great). */
export function giftOf(strain: SwarmStrain, gift: SwarmGift): number {
  return strain.gifts[gift] ?? 0;
}

/** Share of losses a strain's toughness shrugs off. */
function hardiness(strain: SwarmStrain): number {
  return (grade(strain, 'toughness') - 1) * TOUGHNESS_PER_GRADE;
}

function fearScale(swarm: CombatSwarm, element: Element | undefined): number {
  return element && swarm.strain.fears.includes(element) ? FEARED_SCALE : 1;
}

/** Insects an area of this size (and element) kills when it catches their host. */
export function areaLoss(swarm: CombatSwarm, size: AreaSize, element?: Element): number {
  const share = AREA_LOSS[size] * fearScale(swarm, element) * (1 - hardiness(swarm.strain));
  return Math.round(swarm.count * clamp(share, 0, 1));
}

/** Insects a hit of a feared element kills as it takes `damage` health off their host. */
export function fearedLoss(swarm: CombatSwarm, damage: number, element?: Element): number {
  if (fearScale(swarm, element) === 1 || damage <= 0) return 0;
  const share = Math.min(MOST_FROM_A_HIT, damage * FEARED_PER_DAMAGE * FEARED_SCALE);
  return Math.round(swarm.count * share * (1 - hardiness(swarm.strain)));
}

/** Whether an element burns settled insects of this strain off whoever they sit on. */
export function burnsOff(swarm: CombatSwarm, element: Element | undefined): boolean {
  return fearScale(swarm, element) > 1;
}

/** Chakra settled insects draw each exchange from a technique of this power: none without the gift. */
export function settleDrain(swarm: CombatSwarm, power: number): number {
  const share = DRAIN_BY_GIFT[giftOf(swarm.strain, 'drain')] ?? 0;
  return share > 0 ? Math.max(1, Math.round(power * SETTLE_PER_POWER * share)) : 0;
}

/** Health settled insects' venom takes each exchange: none without the gift. */
export function settleVenom(swarm: CombatSwarm): number {
  return giftOf(swarm.strain, 'venom') * VENOM_PER_GIFT;
}

/** How often a swarm attack is slipped, against a plain technique's: fast and hidden land more. */
export function swarmSlipScale(strain: SwarmStrain): number {
  const speed = 1 - (grade(strain, 'speed') - MIDDLE_GRADE) * SPEED_PER_GRADE;
  return Math.max(0, speed * (1 - giftOf(strain, 'camouflage') * SLIP_PER_GIFT));
}

/** How hard a swarm attack hits, against a plain technique: a hard bite, lighter for small insects. */
export function swarmPowerScale(strain: SwarmStrain): number {
  const bite = 1 + (grade(strain, 'bite') - MIDDLE_GRADE) * BITE_PER_GRADE;
  return bite * (1 - (grade(strain, 'size') - MIDDLE_GRADE) * SIZE_LIGHTENS);
}

/** How often attacks on a fighter marked by glowing insects are slipped, against unmarked. */
export function glowSlipScale(strain: SwarmStrain): number {
  return 1 - giftOf(strain, 'glow') * SLIP_PER_GIFT;
}

/** How often attacks by a fighter blinded by settled insects are slipped, against clear eyes. */
export function blindSlipScale(strain: SwarmStrain): number {
  return 1 + giftOf(strain, 'blinding') * SLIP_PER_GIFT;
}

/** How full the hive is, 0 to 1. */
export function hiveFill(swarm: CombatSwarm): number {
  return swarm.cap <= 0 ? 0 : clamp(swarm.count / swarm.cap, 0, 1);
}

/** What a hive adds to its host's chance of finding someone hidden. */
export function swarmSearch(swarm: CombatSwarm | undefined): number {
  return swarm ? (grade(swarm.strain, 'senses') / TOP_GRADE) * hiveFill(swarm) * SENSE_SHARE : 0;
}

/** A hive in a word: thick, thin or spent. */
export function hiveWord(swarm: CombatSwarm): 'thick' | 'thin' | 'spent' {
  if (swarm.count <= 0) return 'spent';
  return hiveFill(swarm) < THIN_SHARE ? 'thin' : 'thick';
}
