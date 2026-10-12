/**
 * The character's place in the village: rank, track record and reputation.
 * Later milestones add promotion exams, infamy (rogue path) and the road to Kage.
 */
export const RANKS = ['academy', 'genin', 'chunin', 'jonin', 'kage'] as const;
export type Rank = (typeof RANKS)[number];

export const RANK_LABELS: Readonly<Record<Rank, string>> = {
  academy: 'Academy Student',
  genin: 'Genin',
  chunin: 'Chūnin',
  jonin: 'Jōnin',
  kage: 'Kage',
};

export interface Standing {
  readonly rank: Rank;
  readonly reputation: number;
  readonly missionsCompleted: number;
  readonly missionsFailed: number;
  /** B-rank and harder jobs completed: the record a jōnin nomination reads. */
  readonly seniorMissionsCompleted: number;
}

export const NEW_GENIN: Standing = {
  rank: 'genin',
  reputation: 0,
  missionsCompleted: 0,
  missionsFailed: 0,
  seniorMissionsCompleted: 0,
};

/** A job done; `senior` jobs (B-rank and harder) count towards a jōnin's record too. */
export function recordMissionSuccess(
  standing: Standing,
  reputation: number,
  senior = false,
): Standing {
  return {
    ...standing,
    reputation: standing.reputation + reputation,
    missionsCompleted: standing.missionsCompleted + 1,
    seniorMissionsCompleted: standing.seniorMissionsCompleted + (senior ? 1 : 0),
  };
}

/** Whether `rank` is `at` or above it. */
export function rankAtLeast(rank: Rank, at: Rank): boolean {
  return RANKS.indexOf(rank) >= RANKS.indexOf(at);
}

/** The rank above, or null at the top. */
export function nextRank(rank: Rank): Rank | null {
  return RANKS[RANKS.indexOf(rank) + 1] ?? null;
}

/** A promotion: the new rank, the record kept. */
export function promote(standing: Standing, rank: Rank): Standing {
  return { ...standing, rank };
}

export function recordMissionFailure(standing: Standing, reputationLoss: number): Standing {
  return {
    ...standing,
    reputation: Math.max(0, standing.reputation - reputationLoss),
    missionsFailed: standing.missionsFailed + 1,
  };
}
