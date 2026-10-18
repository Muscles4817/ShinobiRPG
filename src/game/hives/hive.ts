import type { ClanDef, StrainDef } from '@/content';
import type { CombatantSetup, CombatSwarm } from '@/systems/combat';
import { hiveCap, SHARE_OF_CHAKRA, type Hive, type HiveShare } from '@/systems/hives';
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

/** As many insects as this body can keep for this share. */
export function capFor(stats: Stats, share: HiveShare): number {
  return hiveCap(maxChakra(stats), share);
}

/** Your hive, its strain and how many insects your body can keep, or null without one. */
export function yourHive(
  state: Pick<GameState, 'character' | 'hive'>,
  ctx: GameContext,
): { readonly hive: Hive; readonly strain: StrainDef; readonly cap: number } | null {
  const hive = state.hive;
  const strain = hive ? ctx.content.strains.get(hive.strainId) : undefined;
  if (!hive || !strain) return null;
  return { hive, strain, cap: capFor(state.character.stats, hive.share) };
}

/** A strain as the fight reads it. */
export function swarmOf(strain: StrainDef, count: number, cap: number): CombatSwarm {
  const { name, drain, hardiness, fears, senses } = strain;
  return { strain: { name, drain, hardiness, fears, senses }, count, cap };
}

/** The hive a child of this clan is born with, full: none for a clan without one. */
export function bornHive(clan: ClanDef | undefined, share: HiveShare, stats: Stats): Hive | null {
  if (!clan?.hive) return null;
  return { strainId: clan.hive.strainId, share, count: capFor(stats, share) };
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
  const strain = clan?.hive ? ctx.content.strains.get(clan.hive.strainId) : undefined;
  if (!strain) return { chakra: maxChakra(stats) };
  const cap = capFor(stats, DEFAULT_SHARE);
  const chakra = maxChakra({ ...stats, chakraGiven: SHARE_OF_CHAKRA[DEFAULT_SHARE] });
  return { swarm: swarmOf(strain, cap, cap), chakra };
}
