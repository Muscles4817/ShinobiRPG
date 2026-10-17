import { round1, type Rng } from '@/core';
import {
  quickFile,
  standingFromRoll,
  STANDING_INFO,
  withGifts,
  type ArchetypeId,
} from '@/systems/profile';
import { STAT_IDS, type Aptitude, type StatId, type Stats } from '@/systems/stats';
import type { Discipline } from '@/systems/techniques';

import { rollCharacterAptitude } from '../aptitude';
import type { GameContext } from '../context';
import { graduationStats, studentOf } from '../student';

/**
 * A generated classmate's start: made like the player's, from a standing (dealt as fate deals
 * them, so most are in the middle and one in ten is a genius), an upbringing, a frame and a
 * quick pick around their specialty. Their year is a real spread, not a row of identical fives.
 * A clan child is raised in the clan (a clan upbringing, whose training goes into the clan's
 * arts first) and gets the clan's bonuses and talent, as a clan-born player does.
 */

const CLANLESS = 'none';
/** Kinds of student a classmate may be; a genius may also be a prodigy. */
const CLASSMATE_KINDS: readonly ArchetypeId[] = [
  'steady',
  'steady',
  'athlete',
  'bookworm',
  'all-rounder',
  'early-bloomer',
  'late-bloomer',
];
/** Each stat is off the line by up to this much either way. */
const STAT_SPREAD = 1;

export interface Graduate {
  readonly stats: Stats;
  readonly aptitude: Aptitude;
}

function varied(stats: Stats, rng: Rng): Stats {
  const entries = STAT_IDS.map(
    (id) => [id, round1(Math.max(1, stats[id] + (rng.next() * 2 - 1) * STAT_SPREAD))] as const,
  );
  return Object.fromEntries(entries) as Record<StatId, number>;
}

/** A classmate specialising in `specialty`, drawn from `rng` (the save's seed and their id). */
export function graduate(
  ctx: GameContext,
  rng: Rng,
  specialty: Discipline,
  clanId: string = CLANLESS,
): Graduate {
  const { content } = ctx;
  const family = clanId === CLANLESS ? 'clanless' : 'clan';
  const standing = standingFromRoll(rng.next());
  const kinds = STANDING_INFO[standing].gifts.prodigy
    ? [...CLASSMATE_KINDS, 'prodigy' as const]
    : CLASSMATE_KINDS;
  const archetype = rng.pick(kinds);
  const buildId = rng.pick(content.builds.all).id;
  const upbringings = content.upbringings.all.filter((u) => u.family === family);
  const upbringingId = rng.pick(upbringings).id;
  const who = { clanId, standing, buildId, upbringingId };
  const file = quickFile({ archetype, specialty }, studentOf(who, ctx));
  const stats = graduationStats({ ...who, talentId: '', file }, ctx);
  const clan = content.clans.require(clanId);
  const band = STANDING_INFO[standing].talent;
  const rolled = rollCharacterAptitude(rng, clan, undefined, { band, specialties: [specialty] });
  return { stats: varied(stats, rng), aptitude: withGifts(rolled, file.gifts) };
}
