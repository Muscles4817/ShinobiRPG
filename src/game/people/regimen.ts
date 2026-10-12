import { hashUnit } from '@/core';
import type { PersonDef } from '@/content';
import type { StatDelta, StatId } from '@/systems/stats';
import type { Discipline } from '@/systems/techniques';
import { DAYS_PER_WEEK } from '@/systems/time';

/**
 * What a day's practice works, for anyone: a session with a teacher (yours, and your
 * teammates' weekly lesson) and a genin's own daily routine. Gains here are base weights; the
 * growth formula (solo or teacher efficiency × aptitude × teaching factor) turns them into points.
 */

const LESSON_GAIN = 1.5;
const LESSON_SUPPORT_GAIN = 0.6;

/** The body or mind stat each discipline's practice also works. */
const SUPPORT_STAT: Readonly<Record<Discipline, StatId>> = {
  taijutsu: 'strength',
  ninjutsu: 'chakraControl',
  genjutsu: 'perception',
  kenjutsu: 'speed',
  fuuinjutsu: 'intellect',
};

/** A lesson in the sensei's specialty and the stat that supports it. */
export function lessonGains(specialty: Discipline): StatDelta {
  return { [specialty]: LESSON_GAIN, [SUPPORT_STAT[specialty]]: LESSON_SUPPORT_GAIN };
}

function isDiscipline(stat: StatId): stat is Discipline {
  return stat in SUPPORT_STAT;
}

/** A session with a teacher in one stat: an art also works its support stat. */
export function sessionGains(stat: StatId): StatDelta {
  return isDiscipline(stat) ? lessonGains(stat) : { [stat]: LESSON_GAIN };
}

/** A genin takes about one day in this many off. */
const REST_DAY_CHANCE = 0.15;
/** Drills a genin does on a training day, about as many as a keen player fits in. */
const SESSIONS_PER_DAY = 4;
const SPECIALTY_SESSION = 1.2;
const SUPPORT_SESSION = 0.5;
const BODY_SESSION = 0.6;
/** One of these gets the body work on any given day. */
const BODY_STATS: readonly StatId[] = ['strength', 'speed', 'stamina'];

/**
 * What a genin drills on a given day: their specialty, its support stat and one body stat,
 * or nothing on a day off. A hash of the save's seed, the day and the person, so it never
 * touches the game's dice.
 */
export function dailyRegimen(person: PersonDef, seed: number, day: number): StatDelta {
  if (hashUnit(seed, day, person.id, 'rest') < REST_DAY_CHANCE) return {};
  const body = BODY_STATS[Math.floor(hashUnit(seed, day, person.id, 'body') * BODY_STATS.length)];
  const gains: Partial<Record<StatId, number>> = {};
  const add = (id: StatId | undefined, weight: number) => {
    if (id) gains[id] = (gains[id] ?? 0) + weight * SESSIONS_PER_DAY;
  };
  add(body, BODY_SESSION);
  if (person.specialty) {
    add(person.specialty, SPECIALTY_SESSION);
    add(SUPPORT_STAT[person.specialty], SUPPORT_SESSION);
  }
  return gains;
}

/** Whether `day` is this pupil's weekly lesson day (each pupil has their own weekday). */
export function isLessonDay(personId: string, seed: number, day: number): boolean {
  const weekday = Math.floor(hashUnit(seed, personId, 'lesson') * DAYS_PER_WEEK);
  return day % DAYS_PER_WEEK === weekday;
}
