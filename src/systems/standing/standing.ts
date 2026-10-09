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
}

export const NEW_GENIN: Standing = {
  rank: 'genin',
  reputation: 0,
  missionsCompleted: 0,
  missionsFailed: 0,
};

export function recordMissionSuccess(standing: Standing, reputation: number): Standing {
  return {
    ...standing,
    reputation: standing.reputation + reputation,
    missionsCompleted: standing.missionsCompleted + 1,
  };
}

export function recordMissionFailure(standing: Standing, reputationLoss: number): Standing {
  return {
    ...standing,
    reputation: Math.max(0, standing.reputation - reputationLoss),
    missionsFailed: standing.missionsFailed + 1,
  };
}
