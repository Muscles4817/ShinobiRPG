import type { Rank } from '@/systems/standing';

import type { MissionRank } from './missionRank';

/**
 * Who goes on a job. The village sends a crew, chosen for each posting: alone, with your old
 * team, leading genin, in a squad of chūnin, or under a jōnin. Which crews a job may get
 * follows from its rank, how dangerous its foes are, and your rank and record. Every rule about
 * that lives here; picking the people is the game layer's.
 */

/**
 * How dangerous a foe is, by who can be trusted with it: a petty nuisance (a thief, a goose)
 * that a genin may face alone; an armed threat (bandits, beasts) for a genin team; a deadly
 * one, a match for chūnin; and elite foes only jōnin are sent against alone.
 */
export const DANGERS = ['petty', 'armed', 'deadly', 'elite'] as const;
export type Danger = (typeof DANGERS)[number];

export const CREW_KINDS = [
  'solo',
  'old-team',
  'genin-squad',
  'chunin-squad',
  'jonin-led',
  'exam-team',
  'companion',
] as const;
/**
 * `old-team` is your genin team (the sensei leads it from C-rank, and out of the village);
 * `genin-squad` is genin you lead; `chunin-squad` is you and other chūnin; `jonin-led` is a
 * jōnin leading you and two chūnin; `exam-team` is the team sitting an exam with you;
 * `companion` is a friend on a trip of your own (never a job's).
 */
export type CrewKind = (typeof CREW_KINDS)[number];

/** The people on a job besides you. A null leader means you lead (or nobody does). */
export interface Crew {
  readonly kind: CrewKind;
  readonly leaderId: string | null;
  readonly memberIds: readonly string[];
}

export const SOLO: Crew = { kind: 'solo', leaderId: null, memberIds: [] };

/** Whether `danger` is `at` or worse. */
export function dangerAtLeast(danger: Danger, at: Danger): boolean {
  return DANGERS.indexOf(danger) >= DANGERS.indexOf(at);
}

/** The worst of a job's foes (by enemy id), or null when nobody stands in the way. */
export function worstDanger(
  enemyIds: readonly string[],
  dangerOf: (enemyId: string) => Danger,
): Danger | null {
  return enemyIds
    .map(dangerOf)
    .reduce<Danger | null>((worst, d) => (worst && dangerAtLeast(worst, d) ? worst : d), null);
}

/** What the rules need to know about a job. */
export interface JobProfile {
  readonly rank: MissionRank;
  readonly danger: Danger | null;
  /** Whether it takes you out of the village (a road, or a post in another town). */
  readonly away?: boolean;
}

/** What the rules need to know about the shinobi being sent. */
export interface Assignee {
  readonly rank: Rank;
  /** B-rank and harder jobs completed: a jōnin's experience. */
  readonly seniorMissions: number;
}

/** A crew a job may get, and how often it gets that one. */
export interface CrewOption {
  readonly kind: CrewKind;
  readonly weight: number;
}

/** How often a chūnin's C-rank job goes to each crew; going alone is the rare one. */
export const CHUNIN_C_CREWS: readonly CrewOption[] = [
  { kind: 'genin-squad', weight: 0.35 },
  { kind: 'old-team', weight: 0.25 },
  { kind: 'chunin-squad', weight: 0.25 },
  { kind: 'solo', weight: 0.15 },
];
/** Senior jobs a jōnin needs behind them before A-rank work goes to them alone at its most. */
export const JONIN_EXPERIENCED_RECORD = 12;
/** The share of a fully experienced jōnin's A-rank jobs that go to them alone. */
export const MAX_SOLO_A_SHARE = 0.75;
/** A jōnin is rarely bothered with D-rank work: the chance a D job is posted for them at all. */
export const JONIN_D_POST_SHARE = 0.2;

const only = (kind: CrewKind): CrewOption[] => [{ kind, weight: 1 }];

function geninOptions(job: JobProfile): CrewOption[] {
  if (job.rank === 'D') {
    // A genin does the village's chores alone; out of the village, the sensei comes too.
    if (job.danger === null || job.danger === 'petty') return only(job.away ? 'old-team' : 'solo');
    return job.danger === 'armed' ? only('old-team') : [];
  }
  // A C-rank job goes out under the sensei, who stands between the genin and the worst of it.
  if (job.rank === 'C') return job.danger === 'elite' ? [] : only('old-team');
  return [];
}

function chuninOptions(job: JobProfile): CrewOption[] {
  // Elite foes are jōnin work, whatever the job's rank.
  if (job.danger === 'elite') return [];
  switch (job.rank) {
    case 'D':
      return only('solo');
    case 'C':
      return [...CHUNIN_C_CREWS];
    case 'B':
      // Only safe B-rank work: nobody beyond a chūnin's match (elite foes are ruled out above).
      return [
        { kind: 'genin-squad', weight: 1 },
        { kind: 'chunin-squad', weight: 1 },
      ];
    case 'A':
      return only('jonin-led');
    case 'S':
      return [];
  }
}

/** The share of A-rank jobs a jōnin is trusted to take alone, growing with their record. */
export function soloAShare(seniorMissions: number): number {
  return Math.min(1, seniorMissions / JONIN_EXPERIENCED_RECORD) * MAX_SOLO_A_SHARE;
}

function joninOptions(job: JobProfile, seniorMissions: number): CrewOption[] {
  switch (job.rank) {
    case 'D':
      return only('solo');
    case 'C':
      return only('genin-squad');
    case 'B':
      return [
        { kind: 'solo', weight: 1 },
        { kind: 'chunin-squad', weight: 1 },
      ];
    case 'A': {
      const solo = soloAShare(seniorMissions);
      const options: CrewOption[] = [
        { kind: 'solo', weight: solo },
        { kind: 'chunin-squad', weight: 1 - solo },
      ];
      return options.filter((o) => o.weight > 0);
    }
    case 'S':
      return only('chunin-squad');
  }
}

/** The crews a job may go out with for this shinobi; empty when it is never theirs. */
export function crewOptions(job: JobProfile, who: Assignee): CrewOption[] {
  switch (who.rank) {
    case 'academy':
      return [];
    case 'genin':
      return geninOptions(job);
    case 'chunin':
      return chuninOptions(job);
    case 'jonin':
    case 'kage':
      return joninOptions(job, who.seniorMissions);
  }
}

/** The crew a `roll` in [0, 1) lands on, weighing the options; null when there are none. */
export function pickCrewKind(options: readonly CrewOption[], roll: number): CrewKind | null {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let left = roll * total;
  for (const option of options) {
    left -= option.weight;
    if (left < 0) return option.kind;
  }
  return options.at(-1)?.kind ?? null;
}

/** How likely the board is to bother this shinobi with a job at all, against the usual. */
export function postingShare(job: JobProfile, who: Assignee): number {
  const senior = who.rank === 'jonin' || who.rank === 'kage';
  return senior && job.rank === 'D' ? JONIN_D_POST_SHARE : 1;
}

const ASSIGNABLE_RANKS: readonly Rank[] = ['genin', 'chunin', 'jonin'];

/** The lowest rank the village sends on a job (a jōnin's full record assumed), or null if none. */
export function lowestRankFor(job: JobProfile): Rank | null {
  const who = (rank: Rank): Assignee => ({ rank, seniorMissions: JONIN_EXPERIENCED_RECORD });
  return ASSIGNABLE_RANKS.find((rank) => crewOptions(job, who(rank)).length > 0) ?? null;
}

/** Whether anyone ever goes on this job with a crew (so its checks may fall to a teammate). */
export function canGoWithCrew(job: JobProfile): boolean {
  return ASSIGNABLE_RANKS.some((rank) =>
    crewOptions(job, { rank, seniorMissions: 0 }).some((o) => o.kind !== 'solo'),
  );
}
