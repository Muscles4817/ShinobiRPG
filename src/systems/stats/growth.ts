import { round3 } from '@/core';

import { effectiveLimits, limitFactor, type Limits } from './limits';
import { withReserves } from './reserves';
import { soloEfficiency, type SoloFloor, type SoloFloors } from './solo';
import { STAT_IDS, type StatDelta, type StatId, type Stats, type StatScale } from './stats';
import { teacherEfficiency } from './teaching';
import { withinScale } from './tiers';

/**
 * How a session of practice turns into stat growth. A session's base gain (content weights)
 * is scaled by the pace, by how much the session still does at the stat's grade (practice alone,
 * `solo.ts`, or with someone better, `teaching.ts`), and by the character's own multipliers
 * (aptitude, identity, condition). Solo practice is effective at E, mild at D and far too slow
 * to fill C: the wall comes about naturally, and better people are the way over it. Above all of
 * that sits the stat's natural limit (`limits.ts`): nobody, taught or not, outruns their talent.
 */

/** Turns content's base gains (relative weights) into stat points per session. */
export const SESSION_PACE = 0.09;

/** Everything about the trainee that shapes a session's growth. */
export interface Growth {
  /** Per-stat multipliers: aptitude, identity, condition and any teacher. */
  readonly scale?: StatScale;
  /** Hard-work floors on solo efficiency. */
  readonly floors?: SoloFloors;
  /**
   * Whom the session is with: their value in each stat they teach. A stat named here grows by
   * `teacherEfficiency` against it rather than by solo practice.
   */
  readonly teachers?: StatDelta;
  /** How far each stat can go (`limits.ts`); missing, nothing holds it back. */
  readonly limits?: Limits;
  /** The strength the frame is built for: more than this pulls the speed limit down. */
  readonly comfortStrength?: number;
}

/** One session's gain in a stat now at `current`, from a base gain and the trainee's multiplier. */
export function trainingGain(
  current: number,
  baseGain: number,
  efficiency = 1,
  floors: readonly SoloFloor[] = [],
): number {
  return round3(baseGain * SESSION_PACE * efficiency * soloEfficiency(current, floors));
}

/** One session's gain in a stat now at `current` with someone at `teacher` in it. */
function taughtGain(
  current: number,
  baseGain: number,
  efficiency: number,
  teacher: Teacher,
): number {
  return round3(
    baseGain *
      SESSION_PACE *
      efficiency *
      teacherEfficiency(current, teacher.value, teacher.floors),
  );
}

interface Teacher {
  readonly value: number;
  readonly floors: readonly SoloFloor[] | undefined;
}

/** Applies a session's gains; reserves grow alongside stamina (`withReserves`). */
export function applyTraining(stats: Stats, gains: StatDelta, growth: Growth = {}): Stats {
  const next: Record<StatId, number> = { ...stats };
  const grown = withReserves(gains);
  const limits = growth.limits && effectiveLimits(growth.limits, stats, growth.comfortStrength);
  for (const id of STAT_IDS) {
    const base = grown[id];
    if (base === undefined) continue;
    const scale = growth.scale?.[id] ?? 1;
    const floors = growth.floors?.[id];
    const teacher = growth.teachers?.[id];
    const gain =
      teacher === undefined
        ? trainingGain(stats[id], base, scale, floors)
        : taughtGain(stats[id], base, scale, { value: teacher, floors });
    const held = limits ? limitFactor(stats[id], limits[id]) : 1;
    next[id] = round3(withinScale(stats[id] + gain * held));
  }
  return next;
}
