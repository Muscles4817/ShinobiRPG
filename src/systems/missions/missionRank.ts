/** Job ranks, D (chores) to S (the village's fate). */
export type MissionRank = 'D' | 'C' | 'B' | 'A' | 'S';

/** B-rank and harder jobs: the record a jōnin nomination reads. */
export function isSeniorMission(rank: MissionRank): boolean {
  return rank !== 'D' && rank !== 'C';
}
