import type { PersonDef } from '@/content';
import { addPoints } from '@/systems/bonds';
import { diffStats, STAT_INFO, type StatId } from '@/systems/stats';
import { DAYS_PER_WEEK } from '@/systems/time';

import type { GameContext } from '../context';
import { dueAtLesson, startedAtLesson } from '../exercises';
import { passAfterLesson } from '../leave';
import { permitAfterLesson } from '../permits';
import { coachAfterLesson } from '../sensei/coaching';
import { growCharacter, logDiscoveries, noTalentReason } from '../growth';
import { weakFromHunger } from '../hunger';
import { laidUp } from '../injuries';
import {
  adjust,
  busyReason,
  chip,
  currentLocation,
  firstBlocker,
  log,
  placeHere,
  spendTime,
  statChips,
} from '../ops';
import { bondOf, findPerson, requirePerson, whereNow } from '../people/cast';
import { warmed } from '../people/warmth';
import { readPrice, ryoPerSession } from '../people/price';
import { personStats, trainPerson } from '../people/progress';
import { sessionGains } from '../people/regimen';
import { teachSignature, type Taught } from '../people/signatures';
import {
  aheadIn,
  presentFor,
  sessionsUsed,
  steeredStat,
  taughtToday,
  teachingOf,
  TEACHABLE_STATS,
  withSession,
  type Teaching,
} from '../people/teachers';
import { QUIRK_BOND } from '../people/teachingFactor';
import { addReport } from '../reports';
import { hardWorkEnergy } from '../profile';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/**
 * Training with someone better than you, where they are: a session in one stat (an art also
 * works its support stat), grown by the teacher rule against their value in it, times their
 * rank and quirk. Bond grows a little; a genin practises alongside you. Your sensei's weekly
 * lesson is this same session, with no price and their signature techniques.
 */

export const TRAIN_WITH_ENERGY = 30;
export const TRAIN_WITH_SLOTS = 2;
const TRAIN_WITH_BOND = 3;
const SENSEI_BOND = 6;

type TrainWith = ActionOf<'trainWith'>;

function lower(stat: StatId): string {
  return STAT_INFO[stat].label.toLowerCase();
}

/** Where they are instead, when they can't train with you here. */
function elsewhere(state: GameState, ctx: GameContext, person: PersonDef): string {
  const placeId = whereNow(state, ctx, person);
  const place = currentLocation(state, ctx).places.find((p) => p.id === placeId);
  return place
    ? `${person.name} is at ${place.name} right now.`
    : `${person.name} is away right now.`;
}

function weekBlocker(state: GameState, teaching: Teaching): string | null {
  const { person } = teaching;
  if (taughtToday(state, person.id)) return `You’ve already trained with ${person.name} today.`;
  if (sessionsUsed(state, person.id) < teaching.sessionsPerWeek) return null;
  const days = DAYS_PER_WEEK - ((state.time.day - 1) % DAYS_PER_WEEK);
  const when = days === 1 ? 'a day' : `${days} days`;
  return teaching.isSensei
    ? `Your next lesson is in ${when}.`
    : `${person.name} has no more time for you until next week, in ${when}.`;
}

/** Why this stat can't be trained with them. */
function statBlocker(state: GameState, ctx: GameContext, teaching: Teaching, stat: StatId) {
  const { person } = teaching;
  const steered = steeredStat(state, teaching);
  return firstBlocker(
    noTalentReason(state.character, stat, ctx),
    !TEACHABLE_STATS.includes(stat) && `Nobody drills ${lower(stat)}. It grows with stamina.`,
    !aheadIn(state, person).includes(stat) &&
      `${person.name} isn’t ahead of you in ${lower(stat)}.`,
    steered !== null &&
      steered !== stat &&
      `${person.name} decides what you work on: ${lower(steered)} today.`,
  );
}

function teachingBlocker(state: GameState, ctx: GameContext, action: TrainWith): string | null {
  const person = findPerson(state, ctx, action.personId);
  if (!person) return 'You don’t know anyone by that name.';
  const teaching = teachingOf(state, person);
  if (!teaching) return `${person.name} doesn’t train shinobi.`;
  const place = placeHere(state, ctx, 'training');
  if (!place) return 'Training together happens at a training ground.';
  if (!presentFor(state, ctx, person, place.id)) return elsewhere(state, ctx, person);
  const unmet = teaching.price && readPrice(state, ctx, person, teaching.price).find((p) => !p.met);
  return firstBlocker(
    statBlocker(state, ctx, teaching, action.statId),
    unmet ? unmet.unmet : null,
    weekBlocker(state, teaching),
  );
}

function sessionLine(teaching: Teaching): string {
  const { person } = teaching;
  const lesson = teaching.isSensei ? person.sensei?.lesson : undefined;
  if (lesson) return lesson;
  switch (person.teacher?.quirk) {
    case 'patient':
      return `${person.name} goes over it again, slower, until it sticks.`;
    case 'harsh':
      return `${person.name} doesn’t let up until you can barely stand.`;
    case 'natural':
      return `${person.name} makes it look easy, and for a moment it is.`;
    case 'distracted':
      return `${person.name} drifts off halfway through, but what you got was good.`;
    case undefined:
      return `You work on it together with ${person.name}.`;
  }
}

interface Session {
  readonly teaching: Teaching;
  readonly bond: number;
  readonly taught: Taught | null;
  /** Energy the session took (none for a lesson given on the road). */
  readonly energy: number;
}

function report(state: GameState, before: GameState, session: Session): GameState {
  const { teaching, bond, taught, energy } = session;
  const { person } = teaching;
  const ryo = ryoPerSession(teaching.price);
  const statLines = statChips(diffStats(before.character.stats, state.character.stats));
  const text = sessionLine(teaching);
  const logged = log(state, {
    heading: teaching.isSensei ? `Lesson with ${person.name}` : `Training with ${person.name}`,
    text,
    tone: 'success',
    chips: [
      ...statLines,
      chip(`+${bond} bond`, 'gain'),
      ...(taught
        ? [
            chip(
              taught.mastered ? `${taught.name} mastered` : `${taught.name} ${taught.percent}%`,
              'gain',
            ),
          ]
        : []),
      ...(taught?.unstable ? [chip(`${taught.name} unstable`, 'cost')] : []),
      ...(energy > 0 ? [chip(`−${energy} energy`, 'cost')] : []),
      ...(ryo > 0 ? [chip(`−${ryo} ryo`, 'cost')] : []),
    ],
  });
  if (!teaching.isSensei) return logged;
  return addReport(logged, {
    kind: 'lesson',
    sensei: person.name,
    text,
    gains: statLines.map((c) => c.label),
    bond,
    technique: taught && { name: taught.name, mastered: taught.mastered, percent: taught.percent },
  });
}

interface Taken {
  readonly state: GameState;
  readonly teaching: Teaching;
  readonly bond: number;
  readonly taught: Taught | null;
  readonly discovered: ReturnType<typeof growCharacter>['discovered'];
}

/** One session with a teacher, without the time or energy it takes: growth, bond and pay. */
function teachSession(
  state: GameState,
  ctx: GameContext,
  teaching: Teaching,
  statId: StatId,
): Taken {
  const { person } = teaching;
  const gains = sessionGains(statId);
  const theirs = personStats(person, state);
  const teachers = Object.fromEntries(Object.keys(gains).map((id) => [id, theirs[id as StatId]]));
  const grown = growCharacter(state.character, gains, ctx, {
    teacher: teaching.factor,
    teachers,
  });
  const quirk = person.teacher?.quirk;
  const base = teaching.isSensei ? SENSEI_BOND : TRAIN_WITH_BOND;
  const lesson = Math.max(1, Math.round(base * (quirk ? QUIRK_BOND[quirk] : 1)));
  const bond = warmed(state, ctx, lesson, person);
  // A genin practises alongside you: the session is theirs too.
  const people = person.rank === 'genin' ? trainPerson(state, ctx, person, gains) : state.people;
  const trained: GameState = {
    ...state,
    character: grown.character,
    wallet: { ryo: state.wallet.ryo - ryoPerSession(teaching.price) },
    people: {
      ...people,
      taught: withSession(state, person.id),
      bonds: { ...people.bonds, [person.id]: addPoints(bondOf(state, person.id), bond) },
    },
  };
  const taught = teachSignature(trained, ctx, teaching);
  const after = taught ? { ...trained, techniques: taught.book } : trained;
  return { state: after, teaching, bond, taught, discovered: grown.discovered };
}

/**
 * Your sensei's weekly lesson, given wherever you are together (on the road, at camp): in the
 * stat they steer you to, or the first they are ahead of you in. Null when it isn't due.
 */
export function lessonAway(
  state: GameState,
  ctx: GameContext,
  sensei: PersonDef,
): GameState | null {
  const teaching = teachingOf(state, sensei);
  if (!teaching?.isSensei || weekBlocker(state, teaching)) return null;
  const statId = TEACHABLE_STATS.find((stat) => !statBlocker(state, ctx, teaching, stat));
  if (!statId) return null;
  const session = teachSession(state, ctx, teaching, statId);
  const logged = report(session.state, state, { ...session, energy: 0 });
  return slipsAfterLesson(logDiscoveries(logged, session.discovered, ctx), ctx, sensei);
}

/**
 * What comes after a lesson with your sensei: the library permit and the week's travel pass
 * they sign, an exercise they start with you once you're ready (tree-walking), and in your
 * genin years their word on last week's work and this week's.
 */
function slipsAfterLesson(state: GameState, ctx: GameContext, sensei: PersonDef): GameState {
  const signed = passAfterLesson(permitAfterLesson(state, ctx, sensei), sensei);
  return coachAfterLesson(exerciseAfterLesson(signed, ctx), ctx, sensei);
}

function exerciseAfterLesson(state: GameState, ctx: GameContext): GameState {
  const exercise = dueAtLesson(state, ctx);
  if (!exercise) return state;
  return log(startedAtLesson(state, exercise), {
    heading: exercise.name,
    text: exercise.lines.start ?? exercise.description,
    tone: 'success',
    chips: [chip(`${exercise.name} begun`, 'gain')],
  });
}

export const trainWith: ActionHandler<TrainWith> = {
  check(state, action, ctx) {
    const energy = hardWorkEnergy(state.character, ctx, TRAIN_WITH_ENERGY);
    return firstBlocker(
      busyReason(state),
      weakFromHunger(state),
      laidUp(state, ctx),
      teachingBlocker(state, ctx, action),
      state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
    );
  },
  perform(state, action, ctx) {
    const person = requirePerson(state, ctx, action.personId);
    const teaching = teachingOf(state, person);
    if (!teaching) return state;
    const energy = hardWorkEnergy(state.character, ctx, TRAIN_WITH_ENERGY);
    const session = teachSession(state, ctx, teaching, action.statId);
    const next = adjust(spendTime(session.state, TRAIN_WITH_SLOTS, ctx), { energy: -energy });
    const logged = report(next, state, { ...session, energy });
    const grown = logDiscoveries(logged, session.discovered, ctx);
    return teaching.isSensei ? slipsAfterLesson(grown, ctx, person) : grown;
  },
};
