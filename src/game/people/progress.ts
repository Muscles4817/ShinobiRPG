import { createRng, hashString } from '@/core';
import type { PersonDef } from '@/content';
import { combine } from '@/systems/modifiers';
import {
  applyTraining,
  limitsFor,
  STAT_IDS,
  type Aptitude,
  type Growth,
  type StatDelta,
  type StatId,
  type Stats,
} from '@/systems/stats';

import { rollCharacterAptitude } from '../aptitude';
import type { GameContext } from '../context';
import type { GameState } from '../state';
import { everyone, findPerson } from './cast';
import { dailyRegimen, isLessonDay, lessonGains } from './regimen';
import { teachingFactor } from './teachingFactor';
import type { People, PersonProgress } from './state';

/**
 * People's real stats, and how genin grow on their own. Everyone starts from the stats on
 * their `PersonDef`; genin then train every day (`dailyRegimen`) through the same formula as
 * the player (solo efficiency by grade × aptitude × their traits, up to their natural limits), and your teammates also get
 * your sensei's weekly lesson (the teacher rule, as yours). Days are caught up lazily, like the jobs board, from a hash of
 * the save's seed: growing never touches the game's dice.
 */

/** After a long gap, only this many days of training are caught up. */
const MAX_CATCH_UP_DAYS = 60;
const CLANLESS = 'none';

/** Only genin are still growing; adults stay as they are written. */
export function growsOnTheirOwn(person: PersonDef): boolean {
  return person.rank === 'genin';
}

/** A person's stats right now. */
export function personStats(person: PersonDef, state: GameState): Stats {
  return state.people.progress[person.id]?.stats ?? person.stats;
}

/**
 * A person's talent: authored or stored at generation; otherwise rolled from their id with the
 * same odds as a character's (by clan), so it is the same in every save.
 */
export function personAptitude(person: PersonDef, ctx: GameContext): Aptitude {
  if (person.aptitude) return person.aptitude;
  const clan = ctx.content.clans.require(person.clanId ?? CLANLESS);
  return rollCharacterAptitude(createRng(hashString(person.id)), clan);
}

function growthOf(person: PersonDef, ctx: GameContext, teacher = 1): Growth {
  const traits = person.traitIds.flatMap((id) => ctx.content.traits.get(id) ?? []);
  const mods = combine(traits.map((t) => t.modifiers));
  const aptitude = personAptitude(person, ctx);
  const scale = Object.fromEntries(
    STAT_IDS.map((id) => [id, aptitude[id] * mods.growth[id] * teacher]),
  );
  return { scale, floors: mods.soloFloors, limits: limitsFor(aptitude, mods.limitBonus) };
}

/** The weekly lesson this person gets from your sensei, if they are your teammate. */
interface WeeklyLesson {
  readonly gains: StatDelta;
  readonly growth: Growth;
}

/**
 * Your teammates' lesson: the sensei's specialty, grown by the teacher rule against the
 * sensei's own stats and teaching factor, as yours is.
 */
function weeklyLesson(state: GameState, ctx: GameContext, person: PersonDef): WeeklyLesson | null {
  const team = state.people.team;
  if (!team?.senseiId || !team.teammateIds.includes(person.id)) return null;
  const sensei = findPerson(state, ctx, team.senseiId);
  const specialty = sensei?.sensei?.specialty;
  if (!sensei || !specialty) return null;
  const gains = lessonGains(specialty);
  const theirs = personStats(sensei, state);
  const teachers = Object.fromEntries(Object.keys(gains).map((id) => [id, theirs[id as StatId]]));
  return { gains, growth: { ...growthOf(person, ctx, teachingFactor(sensei)), teachers } };
}

function caughtUp(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
  from: PersonProgress,
): PersonProgress {
  const through = state.time.day - 1;
  const { seed } = state.board;
  const solo = growthOf(person, ctx);
  const lesson = weeklyLesson(state, ctx, person);
  let stats = from.stats;
  const first = Math.max(from.lastGrownDay + 1, through - MAX_CATCH_UP_DAYS + 1);
  for (let day = first; day <= through; day++) {
    stats = applyTraining(stats, dailyRegimen(person, seed, day), solo);
    if (lesson && isLessonDay(person.id, seed, day)) {
      stats = applyTraining(stats, lesson.gains, lesson.growth);
    }
  }
  return { stats, lastGrownDay: through };
}

/**
 * Genin as of today: every day that has ended since they last grew is trained. Someone new
 * starts growing from today. Returns the same object when nothing changed.
 */
export function peopleGrown(state: GameState, ctx: GameContext): People {
  const through = state.time.day - 1;
  const progress: Record<string, PersonProgress> = { ...state.people.progress };
  let changed = false;
  for (const person of everyone(state, ctx)) {
    if (!growsOnTheirOwn(person)) continue;
    const entry = progress[person.id];
    if (entry && entry.lastGrownDay >= through) continue;
    progress[person.id] = entry
      ? caughtUp(state, ctx, person, entry)
      : { stats: person.stats, lastGrownDay: through };
    changed = true;
  }
  return changed ? { ...state.people, progress } : state.people;
}

/** A person grows from a session with you (a spar, later training together). */
export function trainPerson(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
  gains: StatDelta,
): People {
  const entry = state.people.progress[person.id];
  const stats = applyTraining(personStats(person, state), gains, growthOf(person, ctx));
  const lastGrownDay = entry?.lastGrownDay ?? state.time.day - 1;
  return {
    ...state.people,
    progress: { ...state.people.progress, [person.id]: { stats, lastGrownDay } },
  };
}
