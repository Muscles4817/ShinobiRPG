/** Job ranks, D (chores) to S (the village's fate). */
export type MissionRank = 'D' | 'C' | 'B' | 'A' | 'S';

/** B-rank and harder jobs: the record a jōnin nomination reads. */
export function isSeniorMission(rank: MissionRank): boolean {
  return rank !== 'D' && rank !== 'C';
}

/**
 * Jobs on a team mission that fall to whoever on the team is best at them: the tracker follows
 * a trail, the sensor feels for chakra, the medic patches people up.
 */
export const MISSION_ROLES = ['tracker', 'sensor', 'medic'] as const;
export type MissionRole = (typeof MISSION_ROLES)[number];
