import type { PersonDef, PersonRank, TeachingQuirk } from '@/content';

/**
 * How well someone teaches, apart from how far ahead of you they are (the grade gap rule in
 * `systems/stats/teaching.ts`): their shinobi rank (a jōnin with B taijutsu teaches better than
 * a chūnin with B taijutsu) times their personal quirk. Civilians don't teach.
 */

export type TeachingRank = Exclude<PersonRank, 'civilian'>;

/** Rank → multiplier on a session with them. */
export const RANK_TEACHING: Readonly<Record<TeachingRank, number>> = {
  genin: 0.6,
  chunin: 0.85,
  jonin: 1,
  kage: 1.2,
};

/** Quirk → multiplier on a session with them. */
export const QUIRK_TEACHING: Readonly<Record<TeachingQuirk, number>> = {
  patient: 1.1,
  harsh: 1.2,
  natural: 1.3,
  distracted: 0.8,
};

/** Quirk → share of the usual bond a session builds (a harsh teacher is hard to like). */
export const QUIRK_BOND: Readonly<Record<TeachingQuirk, number>> = {
  patient: 1,
  harsh: 0.5,
  natural: 1,
  distracted: 1,
};

/** Rank → sessions a week they'll give you, unless their profile says otherwise. */
export const SESSIONS_BY_RANK: Readonly<Record<TeachingRank, number>> = {
  genin: 7,
  chunin: 2,
  jonin: 1,
  kage: 1,
};

export function teachingRank(person: PersonDef): TeachingRank | null {
  return person.rank === 'civilian' ? null : person.rank;
}

/** Rank × quirk: the multiplier a session with this person carries. 0 for civilians. */
export function teachingFactor(person: PersonDef): number {
  const rank = teachingRank(person);
  if (!rank) return 0;
  const quirk = person.teacher?.quirk;
  return RANK_TEACHING[rank] * (quirk ? QUIRK_TEACHING[quirk] : 1);
}
