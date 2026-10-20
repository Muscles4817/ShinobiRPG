import { QUALITY_GRADES, type ClanDef, type StrainDef } from '@/content';
import { type CombatantSetup, type CombatSwarm, type SwarmQuality } from '@/systems/combat';
import {
  hiveCap,
  SHARE_OF_CHAKRA,
  type Hive,
  type HiveShare,
  type StrainSheet,
} from '@/systems/hives';
import type { Stats } from '@/systems/stats';
import { maxChakra, type ChakraBody } from '@/systems/vitals';

import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * The hive in your body (`systems/hives`, `docs/design/retinue-plan.md` step 4): the chakra it
 * took for good, as many insects as the body can keep, and the hive as it goes into a fight.
 * Everything that reckons your chakra reads it through `chakraBody`, so the share is taken off
 * wherever chakra is worked out.
 */

/** The share a child of a hive clan gives when the file says nothing (and old saves). */
export const DEFAULT_SHARE: HiveShare = 'half';

/** Your stats as chakra is reckoned from them: with the share your hive took, if you have one. */
export function chakraBody(state: {
  readonly character: Pick<GameState['character'], 'stats'>;
  readonly hive: Hive | null;
}): Stats & ChakraBody {
  const stats = state.character.stats;
  if (!state.hive) return stats;
  const body: Stats & ChakraBody = { ...stats, chakraGiven: SHARE_OF_CHAKRA[state.hive.share] };
  return body;
}

/** A grade of the strain in the body: what the clan's install adds to toughness and size. */
const INSTALL_BONUS: Partial<Record<SwarmQuality, number>> = { toughness: 1, size: 1 };
const TOP_GRADE = QUALITY_GRADES.length;

/** A pack's strain as a breeder knows it: grades as 1 (E) to 5 (A), found or born, never bred. */
export function sheetOf(def: StrainDef): StrainSheet {
  const graded = (q: SwarmQuality) => QUALITY_GRADES.indexOf(def.qualities[q]) + 1;
  const { id, name, species, family, gifts, fears } = def;
  return {
    id,
    name,
    species,
    family,
    gifts,
    fears,
    depth: 0,
    qualities: {
      speed: graded('speed'),
      bite: graded('bite'),
      toughness: graded('toughness'),
      brood: graded('brood'),
      size: graded('size'),
      senses: graded('senses'),
    },
  };
}

/** A strain by id: one you bred yourself, or the pack's. */
export function strainSheet(
  hive: Pick<Hive, 'bred'> | null,
  id: string,
  ctx: GameContext,
): StrainSheet | null {
  const bred = hive?.bred?.find((s) => s.id === id);
  if (bred) return bred;
  const def = ctx.content.strains.get(id);
  return def ? sheetOf(def) : null;
}

/** A strain's qualities as the fight reads them (1 to 5), in a body the install has readied. */
export function qualitiesInBody(strain: StrainSheet): Record<SwarmQuality, number> {
  const inBody = (q: SwarmQuality) =>
    Math.min(TOP_GRADE, strain.qualities[q] + (INSTALL_BONUS[q] ?? 0));
  return {
    speed: inBody('speed'),
    bite: inBody('bite'),
    toughness: inBody('toughness'),
    brood: inBody('brood'),
    size: inBody('size'),
    senses: inBody('senses'),
  };
}

/** As many insects as this body can keep of this strain, for this share. */
export function capFor(stats: Stats, share: HiveShare, strain: StrainSheet): number {
  return hiveCap(maxChakra(stats), share, qualitiesInBody(strain).size);
}

/** Your hive, its strain and how many insects your body can keep, or null without one. */
export function yourHive(
  state: Pick<GameState, 'character' | 'hive'>,
  ctx: GameContext,
): { readonly hive: Hive; readonly strain: StrainSheet; readonly cap: number } | null {
  const hive = state.hive;
  const strain = hive ? strainSheet(hive, hive.strainId, ctx) : null;
  if (!hive || !strain) return null;
  return { hive, strain, cap: capFor(state.character.stats, hive.share, strain) };
}

/** A strain as the fight reads it, in a body the install has readied. */
export function swarmOf(strain: StrainSheet, count: number, cap: number): CombatSwarm {
  const { name, gifts, fears } = strain;
  return { strain: { name, qualities: qualitiesInBody(strain), gifts, fears }, count, cap };
}

/** The hive a child of this clan is born with, full: none for a clan without one. */
export function bornHive(
  clan: ClanDef | undefined,
  share: HiveShare,
  stats: Stats,
  ctx: GameContext,
): Hive | null {
  const strain = clan?.hive ? strainSheet(null, clan.hive.strainId, ctx) : null;
  if (!strain) return null;
  return { strainId: strain.id, share, count: capFor(stats, share, strain) };
}

/** Your hive as it goes into a fight, if you have one. */
export function hiveSwarm(
  state: Pick<GameState, 'character' | 'hive'>,
  ctx: GameContext,
): Pick<CombatantSetup, 'swarm'> {
  const yours = yourHive(state, ctx);
  return yours ? { swarm: swarmOf(yours.strain, yours.hive.count, yours.cap) } : {};
}

/**
 * A person of a hive clan in a fight: a full hive of the clan's strain, at the default share,
 * whose chakra is taken off theirs as it is off yours.
 */
export function personHive(
  stats: Stats,
  clan: ClanDef | undefined,
  ctx: GameContext,
): { readonly swarm?: CombatSwarm; readonly chakra: number } {
  const strain = clan?.hive ? strainSheet(null, clan.hive.strainId, ctx) : null;
  if (!strain) return { chakra: maxChakra(stats) };
  const cap = capFor(stats, DEFAULT_SHARE, strain);
  const chakra = maxChakra({ ...stats, chakraGiven: SHARE_OF_CHAKRA[DEFAULT_SHARE] });
  return { swarm: swarmOf(strain, cap, cap), chakra };
}
