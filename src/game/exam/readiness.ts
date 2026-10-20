import type { ReadinessStandard } from '@/content';
import { STAT_IDS, STAT_READING, type StatId, type Stats } from '@/systems/stats';

import type { GameContext } from '../context';
import { findPerson } from '../people/cast';
import { waysOf } from '../sensei/generate';
import type { GameState } from '../state';
import { fighterTypeOf, gradeFloor, needValue, statForNeed, unmetNeeds } from './fighterTypes';

/**
 * When a sensei calls a genin ready for chūnin, by their standard. Readiness reads skills and
 * what a fighter needs, never a sharp mind or a fast body for its own sake. A rounded sensei
 * wants one skill at chūnin level and breadth across the rest; a specialist wants every need of
 * the kind of fighter the genin fits best (`fighterTypes.ts`) at chūnin level, judging them by
 * the kind their stats suit rather than one they picked, and steers their training towards what
 * it lacks once their art is there (`readinessFocus`).
 */

/** Chūnin level: the ordinary chūnin's grade in their art. */
const CHUNIN_FLOOR = gradeFloor('C');
/** A rounded genin's breadth: this many skills at D or better… */
export const ROUNDED_BREADTH = 4;
const BREADTH_FLOOR = gradeFloor('D');
/** Who has no sensei to judge them (or one with no ways) is judged as a specialist would. */
const DEFAULT_STANDARD: ReadinessStandard = 'specialist';

const SKILLS: readonly StatId[] = STAT_IDS.filter((id) => STAT_READING[id] === 'skill');

function roundedGap(stats: Stats): string | null {
  if (!SKILLS.some((id) => stats[id] >= CHUNIN_FLOOR)) return 'a skill at chūnin level (C)';
  const broad = SKILLS.filter((id) => stats[id] >= BREADTH_FLOOR).length;
  return broad >= ROUNDED_BREADTH ? null : `${ROUNDED_BREADTH} skills at D or better`;
}

function specialistGap(stats: Stats): string | null {
  const type = fighterTypeOf(stats);
  const [need] = unmetNeeds(stats, type, CHUNIN_FLOOR);
  return need ? `${need.what} at chūnin level (C), as ${type.name}` : null;
}

/** What a sensei of this standard would say is missing, or null when they'd call them ready. */
export function readinessGap(
  stats: Stats,
  standard: ReadinessStandard = DEFAULT_STANDARD,
): string | null {
  return standard === 'rounded' ? roundedGap(stats) : specialistGap(stats);
}

/** The standard your sensei holds you (and anyone sitting with you) to. */
export function readinessStandard(state: GameState, ctx: GameContext): ReadinessStandard {
  const id = state.people.team?.senseiId;
  const sensei = id ? findPerson(state, ctx, id) : undefined;
  const ways = sensei ? waysOf(sensei) : null;
  return ways?.gatekeeping.readiness ?? DEFAULT_STANDARD;
}

/**
 * Where a specialist steers a genin whose art is at chūnin level but who isn't ready: the stat
 * that would do most for the need they are furthest from. Null while the art itself is short
 * (the sensei works it their own way) and once they are ready.
 */
export function readinessFocus(stats: Stats): StatId | null {
  const type = fighterTypeOf(stats);
  const [art] = type.needs;
  if (!art || needValue(stats, art) < CHUNIN_FLOOR) return null;
  const [need] = unmetNeeds(stats, type, CHUNIN_FLOOR);
  return need ? statForNeed(stats, need) : null;
}
