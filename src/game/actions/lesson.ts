import type { PersonDef } from '@/content';
import { addPoints, stageOf } from '@/systems/bonds';
import { diffStats } from '@/systems/stats';

import type { GameContext } from '../context';
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
import { weakFromHunger } from '../hunger';
import { laidUp } from '../injuries';
import { bondOf, findPerson, whereNow } from '../people/cast';
import { lessonGains, LESSON_TEACHER } from '../people/regimen';
import { growCharacter, logDiscoveries } from '../growth';
import { learnBlockerFor, studySession } from '../learning';
import { addReport } from '../reports';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/**
 * The weekly lesson with your sensei: a big step in their specialty, time together, and,
 * once you are friends, their signature techniques.
 */

export const LESSON_INTERVAL_DAYS = 7;
export const LESSON_ENERGY = 30;
const LESSON_SLOTS = 2;
const LESSON_BOND = 6;
/** Friendship stage at which a sensei starts teaching signature techniques. */
export const TEACHES_AT_STAGE = 2;

export function yourSensei(state: GameState, ctx: GameContext): PersonDef | undefined {
  const id = state.people.team?.senseiId;
  return id ? findPerson(state, ctx, id) : undefined;
}

export function daysUntilLesson(state: GameState): number {
  const last = state.people.team?.lastLessonDay ?? null;
  if (last === null) return 0;
  return Math.max(0, last + LESSON_INTERVAL_DAYS - state.time.day);
}

/**
 * The next signature technique your sensei will teach, if any are left that you could learn:
 * one two ranks above your grade, or one your body can't do, waits however willing they are.
 */
export function nextSignature(
  state: GameState,
  sensei: PersonDef,
  ctx: GameContext,
): string | null {
  return (
    sensei.sensei?.teaches.find((id) => {
      const def = ctx.content.techniques.require(id);
      return (
        learnBlockerFor(state, def, ctx) === null && state.character.aptitude[def.discipline] > 0
      );
    }) ?? null
  );
}

/** A sensei teaches as a teacher, not a scroll: faster study, by the same gate and formula. */
function teach(state: GameState, ctx: GameContext, sensei: PersonDef) {
  const id = nextSignature(state, sensei, ctx);
  if (!id || stageOf(bondOf(state, sensei.id).points) < TEACHES_AT_STAGE) return null;
  const def = ctx.content.techniques.require(id);
  const result = studySession(state, def, ctx, 'teacher');
  return { ...result, name: def.name };
}

/** Lessons happen where your sensei trains; say where they are instead when they aren't. */
function senseiElsewhere(state: GameState, ctx: GameContext, sensei: PersonDef): string | null {
  const placeId = whereNow(state, ctx, sensei);
  if (placeId === null) return `${sensei.name} is away right now.`;
  const place = currentLocation(state, ctx).places.find((p) => p.id === placeId);
  return place?.kind === 'training'
    ? null
    : `${sensei.name} is at ${place?.name ?? 'work'} right now.`;
}

export const lesson: ActionHandler<ActionOf<'lesson'>> = {
  check(state, _action, ctx) {
    const sensei = yourSensei(state, ctx);
    const wait = daysUntilLesson(state);
    return firstBlocker(
      busyReason(state),
      weakFromHunger(state),
      laidUp(state, ctx),
      !sensei && 'You don’t have a sensei yet.',
      !placeHere(state, ctx, 'training') && 'Lessons happen at a training ground.',
      wait > 0 && `Your next lesson is in ${wait === 1 ? 'a day' : `${wait} days`}.`,
      sensei !== undefined && senseiElsewhere(state, ctx, sensei),
      state.character.vitals.energy < LESSON_ENERGY &&
        `Needs ${LESSON_ENERGY} energy. Nap or eat first.`,
    );
  },
  perform(state, _action, ctx) {
    const sensei = yourSensei(state, ctx);
    const team = state.people.team;
    const profile = sensei?.sensei;
    if (!sensei || !team || !profile) return state;
    const gains = lessonGains(profile.specialty);
    const before = state.character.stats;
    const grown = growCharacter(state.character, gains, ctx, { teacher: LESSON_TEACHER });
    const { stats } = grown.character;
    const bond = addPoints(bondOf(state, sensei.id), LESSON_BOND);
    const trained: GameState = {
      ...state,
      character: grown.character,
      people: {
        ...state.people,
        team: { ...team, lastLessonDay: state.time.day },
        bonds: { ...state.people.bonds, [sensei.id]: bond },
      },
    };
    const taught = teach(trained, ctx, sensei);
    const next = adjust(
      spendTime(taught ? { ...trained, techniques: taught.book } : trained, LESSON_SLOTS, ctx),
      { energy: -LESSON_ENERGY },
    );
    const statLines = statChips(diffStats(before, stats));
    const techniqueChip =
      taught &&
      chip(
        taught.mastered ? `${taught.name} mastered` : `${taught.name} ${taught.percent}%`,
        'gain',
      );
    const unstableChip = taught?.unstable ? [chip(`${taught.name} unstable`, 'cost')] : [];
    const logged = log(next, {
      heading: `Lesson with ${sensei.name}`,
      text: profile.lesson,
      tone: 'success',
      chips: [
        ...statLines,
        chip(`+${LESSON_BOND} bond`, 'gain'),
        ...(techniqueChip ? [techniqueChip] : []),
        ...unstableChip,
        chip(`−${LESSON_ENERGY} energy`, 'cost'),
      ],
    });
    return addReport(logDiscoveries(logged, grown.discovered, ctx), {
      kind: 'lesson',
      sensei: sensei.name,
      text: profile.lesson,
      gains: statLines.map((c) => c.label),
      bond: LESSON_BOND,
      technique: taught && {
        name: taught.name,
        mastered: taught.mastered,
        percent: taught.percent,
      },
    });
  },
};
