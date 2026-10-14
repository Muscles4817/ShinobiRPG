import { DEFAULT_BUILD_ID, DEFAULT_UPBRINGING } from '@/content';
import { round2 } from '@/core';
import { APTITUDE_MAX } from '@/systems/stats';

/** The frame-and-upbringing step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** How fast each academy grade used to make an art grow, before talent took that over. */
const OLD_GRADE_PACE: Readonly<Record<string, number>> = { A: 1.25, B: 1.1, C: 1, D: 0.85 };
const ARTS = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'] as const;

/** The grade's old pace moves into the aptitude for its art, so the art grows exactly as before. */
function withGradePace(aptitude: RawState, grades: RawState): RawState {
  const next: RawState = { ...aptitude };
  for (const art of ARTS) {
    const value = aptitude[art];
    const grade = grades[art];
    const pace = typeof grade === 'string' ? (OLD_GRADE_PACE[grade] ?? 1) : 1;
    if (typeof value === 'number') next[art] = round2(Math.min(APTITUDE_MAX, value * pace));
  }
  return next;
}

/**
 * v32 → v33: builds and upbringings, and grades that no longer set a pace. Characters made
 * before have a balanced frame and were raised by their clan's branch line or a civilian
 * family. Their grades' pace is folded into their talent for each art, so nothing about how
 * they grow changes (beyond the natural limits everyone now has).
 */
export function v32ToV33(state: RawState): RawState {
  const character = asRecord(state.character);
  const clanless = character.clanId === 'none' || character.clanId === undefined;
  return {
    ...state,
    character: {
      ...character,
      buildId: DEFAULT_BUILD_ID,
      upbringingId: clanless ? DEFAULT_UPBRINGING.clanless : DEFAULT_UPBRINGING.clan,
      aptitude: withGradePace(asRecord(character.aptitude), asRecord(character.grades)),
    },
  };
}
