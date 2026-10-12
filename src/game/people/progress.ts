import { createRng, hashString } from '@/core';
import type { PersonDef } from '@/content';
import { combine } from '@/systems/modifiers';
import {
  applyTraining,
  STAT_IDS,
  type Aptitude,
  type Growth,
  type StatDelta,
  type Stats,
} from '@/systems/stats';
import type { Discipline } from '@/systems/techniques';

import { rollCharacterAptitude } from '../aptitude';
import type { GameContext } from '../context';
import type { GameState } from '../state';
import { everyone, findPerson } from './cast';
import { dailyRegimen, isLessonDay, lessonGains, LESSON_TEACHER } from './regimen';
import type { People, PersonProgress } from './state';

/**
 * People's real stats, and how genin grow on their own. Everyone starts from the stats on
 * their `PersonDef`; genin then train every day (`dailyRegimen`) through the same formula as
 * the player (solo efficiency by grade × aptitude × their traits), and your teammates also get
 * your sensei's weekly lesson. Days are caught up lazily, like the jobs board, from a hash of
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

function growthOf(person: PersonDef, ctx: GameContext, teacher: number): Growth {
  const traits = person.traitIds.flatMap((id) => ctx.content.traits.get(id) ?? []);
  const mods = combine(traits.map((t) => t.modifiers));
  const aptitude = personAptitude(person, ctx);
  const scale = Object.fromEntries(
    STAT_IDS.map((id) => [id, aptitude[id] * mods.growth[id] * teacher]),
  );
  return { scale, floors: mods.soloFloors };
}

/** The specialty of the sensei who teaches this person every week, if anyone does. */
function lessonSpecialty(state: GameState, ctx: GameContext, person: PersonDef): Discipline | null {
  const team = state.people.team;
  if (!team?.senseiId || !team.teammateIds.includes(person.id)) return null;
  return findPerson(state, ctx, team.senseiId)?.sensei?.specialty ?? null;
}

function caughtUp(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
  from: PersonProgress,
): PersonProgress {
  const through = state.time.day - 1;
  const { seed } = state.board;
  const solo = growthOf(person, ctx, 1);
  const taught = growthOf(person, ctx, LESSON_TEACHER);
  const lesson = lessonSpecialty(state, ctx, person);
  let stats = from.stats;
  const first = Math.max(from.lastGrownDay + 1, through - MAX_CATCH_UP_DAYS + 1);
  for (let day = first; day <= through; day++) {
    stats = applyTraining(stats, dailyRegimen(person, seed, day), solo);
    if (lesson && isLessonDay(person.id, seed, day)) {
      stats = applyTraining(stats, lessonGains(lesson), taught);
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
  const stats = applyTraining(personStats(person, state), gains, growthOf(person, ctx, 1));
  const lastGrownDay = entry?.lastGrownDay ?? state.time.day - 1;
  return {
    ...state.people,
    progress: { ...state.people.progress, [person.id]: { stats, lastGrownDay } },
  };
}
