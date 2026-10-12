import { addPoints } from '@/systems/bonds';
import { startExamRun } from '@/systems/exams';

import type { GameContext } from '../context';
import { examAnnounced, examToday, nextSitting } from '../exam/calendar';
import { examHere } from '../exam/current';
import {
  nominationBlocker,
  REPLACEMENT_BOND_HIT,
  sittingTeam,
  teamBlocker,
  type Replacement,
} from '../exam/entry';
import { enterForest } from '../exam/forest';
import { answerFinal, answerQuestion, mindPlans } from '../exam/mind';
import { acceptPromotion as promoteNow, leaveExam } from '../exam/promotion';
import { startBout } from '../exam/tournament';
import { laidUp } from '../injuries';
import { bondOf, requirePerson } from '../people/cast';
import { busyReason, chip, firstBlocker, log, placeHere } from '../ops';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/** Entering an exam, playing its stages, and stepping forward at a promotion ceremony. */

const NOT_SITTING = 'You are not sitting an exam.';

function whenNext(state: GameState, ctx: GameContext): string {
  const next = examAnnounced(state, ctx) ?? nextSitting(state, ctx);
  if (!next) return 'There is no exam for your rank.';
  return `${next.exam.name} is held in ${next.daysAway} days.`;
}

/** The left-out teammates lose bond with you; the record notes it. */
function withReplacements(state: GameState, replacements: readonly Replacement[]): GameState {
  if (replacements.length === 0) return state;
  const bonds = { ...state.people.bonds };
  for (const r of replacements)
    bonds[r.leaving] = addPoints(bondOf(state, r.leaving), -REPLACEMENT_BOND_HIT);
  return { ...state, people: { ...state.people, bonds } };
}

export const enterExam: ActionHandler<ActionOf<'enterExam'>> = {
  check(state, action, ctx) {
    if (!examToday(state, ctx)) return whenNext(state, ctx);
    return firstBlocker(
      busyReason(state),
      !placeHere(state, ctx, 'missions') && 'Exams are entered at the mission hall.',
      state.exams.lastSatDay === state.time.day && 'You have already sat this one.',
      laidUp(state, ctx),
      nominationBlocker(state, ctx),
      teamBlocker(state, ctx, action.replacements ?? []),
    );
  },
  perform(state, action, ctx) {
    const exam = examToday(state, ctx);
    if (!exam) return state;
    const replacements = action.replacements ?? [];
    const team = sittingTeam(state, replacements);
    const left = replacements.map((r) => requirePerson(state, ctx, r.leaving).name);
    const run = startExamRun(exam, state.time.day, team);
    const replaced = withReplacements(state, replacements);
    const entered: GameState = {
      ...replaced,
      exams: { ...replaced.exams, lastSatDay: state.time.day, run },
    };
    return log(entered, {
      heading: exam.name,
      text: `Your team signs the forms and goes in. ${team.map((id) => requirePerson(state, ctx, id).name).join(' and ')} at your side.`,
      tone: 'info',
      chips: left.map((name) => chip(`${name} −${REPLACEMENT_BOND_HIT} bond`, 'harm')),
    });
  },
};

export const examAnswer: ActionHandler<ActionOf<'examAnswer'>> = {
  check(state, action, ctx) {
    if (!state.exams.run) return NOT_SITTING;
    const plan = mindPlans(state, ctx).find((p) => p.id === action.approach);
    return plan ? plan.blocker : 'There is no question to answer.';
  },
  perform(state, action, ctx, rng) {
    return answerQuestion(state, ctx, action.approach, rng);
  },
};

export const examFinal: ActionHandler<ActionOf<'examFinal'>> = {
  check(state, _action, ctx) {
    const progress = examHere(state, ctx)?.run.progress;
    return progress?.kind === 'mind' && progress.final ? null : 'There is no last question yet.';
  },
  perform(state, action, ctx) {
    return answerFinal(state, ctx, action.stay);
  },
};

/** Why the exam can't move on right now, or null: hear the verdict, enter the forest, or fight. */
function continueBlocker(state: GameState, ctx: GameContext): string | null {
  const here = examHere(state, ctx);
  if (!here) return NOT_SITTING;
  if (state.combat || state.mission) return 'Finish what you are doing first.';
  if (here.run.verdict) return null;
  const progress = here.run.progress;
  if (progress?.kind === 'survival' && !progress.started) return null;
  if (progress?.kind === 'tournament' && !progress.fighting) return null;
  return 'Answer the question first.';
}

export const examContinue: ActionHandler<ActionOf<'examContinue'>> = {
  check(state, _action, ctx) {
    return continueBlocker(state, ctx);
  },
  perform(state, _action, ctx, rng) {
    const here = examHere(state, ctx);
    if (!here) return state;
    if (here.run.verdict) return leaveExam(state, ctx);
    if (here.run.progress?.kind === 'survival') return enterForest(state, ctx);
    return startBout(state, ctx, rng);
  },
};

export const acceptPromotion: ActionHandler<ActionOf<'acceptPromotion'>> = {
  check(state) {
    if (!state.exams.ceremony) return 'There is no ceremony waiting.';
    return state.combat || state.mission || state.exams.run
      ? 'Finish what you are doing first.'
      : null;
  },
  perform(state, _action, ctx) {
    return promoteNow(state, ctx);
  },
};
