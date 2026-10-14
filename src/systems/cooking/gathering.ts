import { STAT_GRADES, type StatGrade } from '@/systems/stats';
import type { Season, TimeSlot } from '@/systems/time';

/**
 * Gathering in the wild: foraging a place's finds and fishing its spots. What can turn up
 * depends on the season, the time of day and whether you'd know it for food (your cooking
 * grade); a draw picks among them by weight. Each place (and each fishing spot) gives once a
 * day. Pure functions; the game supplies the random numbers.
 */

/** Something that can be gathered here, how common it is, and when. */
export interface Find {
  readonly ingredientId: string;
  /** Relative chance against the other finds here. */
  readonly weight: number;
  /** Only in these seasons; absent means all year. */
  readonly seasons?: readonly Season[];
  /** Only at these times of day; absent means any. */
  readonly slots?: readonly TimeSlot[];
  /** You'd only know it for food as a cook of this grade or better. */
  readonly minGrade?: StatGrade;
}

/** Where a gathered place stands now. */
export interface GatherMoment {
  readonly season: Season;
  readonly slot: TimeSlot;
  readonly grade: StatGrade;
}

export function inSeason(find: Find, moment: Pick<GatherMoment, 'season' | 'slot'>): boolean {
  return (
    (find.seasons === undefined || find.seasons.includes(moment.season)) &&
    (find.slots === undefined || find.slots.includes(moment.slot))
  );
}

export function recognised(find: Find, grade: StatGrade): boolean {
  return (
    find.minGrade === undefined || STAT_GRADES.indexOf(grade) >= STAT_GRADES.indexOf(find.minGrade)
  );
}

/** What could turn up now: in season, at this hour, and known to you as food. */
export function findsNow(finds: readonly Find[], moment: GatherMoment): Find[] {
  return finds.filter((f) => inSeason(f, moment) && recognised(f, moment.grade));
}

/** Picks a find by weight from a roll in [0, 1); null when there's nothing to find. */
export function drawFind(finds: readonly Find[], roll: number): Find | null {
  const total = finds.reduce((sum, f) => sum + f.weight, 0);
  let left = roll * total;
  for (const find of finds) {
    left -= find.weight;
    if (left < 0) return find;
  }
  return finds.at(-1) ?? null;
}

/** Whether a place (or spot) has already given today. */
export function gatheredToday(
  gathered: Readonly<Record<string, number>>,
  key: string,
  day: number,
): boolean {
  return gathered[key] === day;
}
