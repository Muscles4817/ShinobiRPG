/**
 * Friendship between the player and one person: points that climb through named stages,
 * at most one talk a day, and what has already been said (so people don't repeat themselves).
 */

export interface Bond {
  readonly points: number;
  /** The day you last talked, or null if you never have. */
  readonly lastTalkDay: number | null;
  /** Conversation ids already heard from this person. */
  readonly heard: readonly string[];
}

export const MAX_BOND = 100;

/** Stage thresholds, lowest first. A stage's index is its number (0 = stranger). */
export const BOND_STAGES = [
  { name: 'Stranger', min: 0 },
  { name: 'Acquaintance', min: 10 },
  { name: 'Friend', min: 30 },
  { name: 'Close friend', min: 55 },
  { name: 'Bonded', min: 80 },
] as const;

/** Every talk is worth something; tones the listener likes or dislikes move it further. */
export const TALK_BASE = 3;
export const LIKED_TONE = 5;
export const DISLIKED_TONE = -6;

export const NEW_BOND: Bond = { points: 0, lastTalkDay: null, heard: [] };

export function bondWith(points: number): Bond {
  return { ...NEW_BOND, points };
}

export function stageOf(points: number): number {
  let stage = 0;
  BOND_STAGES.forEach((s, index) => {
    if (points >= s.min) stage = index;
  });
  return stage;
}

export function stageName(stage: number): string {
  return BOND_STAGES[stage]?.name ?? 'Stranger';
}

/** How far through the current stage, 0–1 (1 at the top stage). */
export function stageProgress(points: number): number {
  const stage = stageOf(points);
  const floor = BOND_STAGES[stage]?.min ?? 0;
  const ceiling = BOND_STAGES[stage + 1]?.min;
  return ceiling === undefined ? 1 : (points - floor) / (ceiling - floor);
}

export function addPoints(bond: Bond, delta: number): Bond {
  return { ...bond, points: Math.min(MAX_BOND, Math.max(0, bond.points + delta)) };
}

export function talkedToday(bond: Bond, day: number): boolean {
  return bond.lastTalkDay === day;
}

/** What one listener's personality makes of a tone. */
export interface Taste {
  readonly likes: readonly string[];
  readonly dislikes: readonly string[];
}

/** Points a reply earns, given each of the listener's traits' tastes. */
export function reactionTo(tastes: readonly Taste[], tone: string): number {
  return tastes.reduce(
    (total, taste) =>
      total +
      (taste.likes.includes(tone) ? LIKED_TONE : 0) +
      (taste.dislikes.includes(tone) ? DISLIKED_TONE : 0),
    TALK_BASE,
  );
}

/** Records a finished talk: points, the day, and what was said. */
export function recordTalk(bond: Bond, talk: { day: number; delta: number; heard: string }): Bond {
  return {
    ...addPoints(bond, talk.delta),
    lastTalkDay: talk.day,
    heard: bond.heard.includes(talk.heard) ? bond.heard : [...bond.heard, talk.heard],
  };
}
