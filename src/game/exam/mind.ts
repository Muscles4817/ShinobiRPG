import type { Rng } from '@/core';
import {
  conductMark,
  endRun,
  MAX_STRIKES,
  nextStage,
  withConduct,
  withNotes,
  type ExamRun,
  type MindQuestion,
  type MindStageDef,
} from '@/systems/exams';
import type { MissionNote } from '@/systems/missions';
import { checkChance, type StatId } from '@/systems/stats';
import type { Verb } from '@/systems/techniques';

import type { GameContext } from '../context';
import { senseMeans } from '../encounter/means';
import { spendTime } from '../ops';
import type { GameState } from '../state';
import { examHere, examNight, withRun, type ExamHere } from './current';

/**
 * The written test. Each question is answered by wit (intellect), by reading it closely
 * (perception), or by cheating: a genjutsu on your neighbour, feeling for answers in their
 * chakra, or a clone peering over a shoulder. Cheating answers more easily but the proctors may
 * catch you: a strike against your conduct, and two strikes put the team out.
 */

export const MIND_APPROACHES = ['reason', 'observe', 'genjutsu', 'sense', 'clone'] as const;
export type MindApproach = (typeof MIND_APPROACHES)[number];

/** Reading a question closely is harder than knowing the answer. */
const OBSERVE_EXTRA = 2;
/** Copying an answer is this much easier than working it out. */
const CHEAT_EASE = 4;
/** Of the proctors' chances to spot a cheat, this share are taken. */
const CAUGHT_SHARE = 0.6;
/** The written test takes a slot of the day. */
const TEST_SLOTS = 1;

export interface MindPlan {
  readonly id: MindApproach;
  readonly label: string;
  readonly stat: StatId;
  readonly chance: number;
  /** The chance a proctor catches it (0 for honest work). */
  readonly risk: number;
  readonly blocker: string | null;
}

interface ApproachRule {
  readonly label: string;
  readonly stat: StatId;
  readonly cheat: boolean;
  /** What you need to try it, or null when anyone can. */
  readonly needs: ((state: GameState, ctx: GameContext) => string | null) | null;
}

function knowsVerb(state: GameState, ctx: GameContext, verb: Verb): boolean {
  return state.techniques.known.some((id) =>
    ctx.content.techniques.require(id).effects.some((e) => e.verb === verb),
  );
}

function knowsArt(state: GameState, ctx: GameContext, discipline: string): boolean {
  return state.techniques.known.some(
    (id) => ctx.content.techniques.require(id).discipline === discipline,
  );
}

const RULES: Readonly<Record<MindApproach, ApproachRule>> = {
  reason: { label: 'Work it out', stat: 'intellect', cheat: false, needs: null },
  observe: { label: 'Read the question closely', stat: 'perception', cheat: false, needs: null },
  genjutsu: {
    label: 'Slip a genjutsu over your neighbour',
    stat: 'genjutsu',
    cheat: true,
    needs: (s, c) => (knowsArt(s, c, 'genjutsu') ? null : 'Needs a genjutsu technique.'),
  },
  sense: {
    label: 'Feel the answer in their chakra',
    stat: 'perception',
    cheat: true,
    needs: (s, c) =>
      senseMeans(s, c) ? null : 'Needs a way to sense chakra: a technique or D ninjutsu.',
  },
  clone: {
    label: 'Send a clone to read over a shoulder',
    stat: 'ninjutsu',
    cheat: true,
    needs: (s, c) => (knowsVerb(s, c, 'clone') ? null : 'Needs a clone technique.'),
  },
};

function planFor(state: GameState, ctx: GameContext, id: MindApproach, q: MindQuestion) {
  return (vigilance: number): MindPlan => {
    const rule = RULES[id];
    const value = state.character.stats[rule.stat];
    const difficulty =
      q.difficulty + (id === 'observe' ? OBSERVE_EXTRA : 0) - (rule.cheat ? CHEAT_EASE : 0);
    return {
      id,
      label: rule.label,
      stat: rule.stat,
      chance: checkChance(value, difficulty),
      risk: rule.cheat ? (1 - checkChance(value, vigilance)) * CAUGHT_SHARE : 0,
      blocker: rule.needs?.(state, ctx) ?? null,
    };
  };
}

/** The question in front of you, while the written test is under way. */
export function mindQuestion(
  here: ExamHere,
): { readonly stage: MindStageDef; readonly question: MindQuestion | null } | null {
  const { stage, run } = here;
  if (stage?.kind !== 'mind' || run.progress?.kind !== 'mind') return null;
  return {
    stage,
    question: run.progress.final ? null : (stage.questions[run.progress.question] ?? null),
  };
}

/** Every way of answering the current question, with its odds and what it needs. */
export function mindPlans(state: GameState, ctx: GameContext): MindPlan[] {
  const here = examHere(state, ctx);
  const at = here && mindQuestion(here);
  if (!at?.question) return [];
  const { question, stage } = at;
  return MIND_APPROACHES.map((id) => planFor(state, ctx, id, question)(stage.vigilance));
}

/** The questions are done: the last question waits, or the paper is marked. */
function afterLastQuestion(state: GameState, ctx: GameContext, run: ExamRun, stage: MindStageDef) {
  const progress = run.progress;
  if (progress?.kind !== 'mind') return withRun(state, run);
  if (stage.final) {
    const asked = withNotes(run, { kind: 'story', text: stage.final.text });
    return withRun(state, { ...asked, progress: { ...progress, final: true } });
  }
  return markPaper(state, ctx, run, stage);
}

/** The paper is marked: through to the next stage (after a night's rest), or out. */
export function markPaper(
  state: GameState,
  ctx: GameContext,
  run: ExamRun,
  stage: MindStageDef,
): GameState {
  const correct = run.progress?.kind === 'mind' ? run.progress.correct : 0;
  const after = spendTime(state, TEST_SLOTS, ctx);
  if (correct < stage.passMark) {
    return withRun(after, endRun(withNotes(run, outcome(stage.failed)), 'failed-mind'));
  }
  const here = ctx.content.exams.require(run.examId);
  return examNight(withRun(after, nextStage(here, withNotes(run, outcome(stage.passed)))), ctx);
}

function outcome(text: string): MissionNote {
  return { kind: 'outcome', text };
}

interface Answer {
  readonly plan: MindPlan;
  readonly stage: MindStageDef;
  readonly right: boolean;
  readonly caught: boolean;
}

/** The run with a question answered: its notes, the tally, and a strike if a proctor saw. */
function afterAnswer(run: ExamRun, { plan, stage, right, caught }: Answer): ExamRun {
  const progress = run.progress;
  if (progress?.kind !== 'mind') return run;
  const notes: MissionNote[] = [
    { kind: 'choice', text: plan.label },
    { kind: 'roll', stat: plan.stat, chance: plan.chance, success: right },
    ...(caught ? [{ kind: 'story' as const, text: stage.caught }] : []),
  ];
  const marked = caught ? withConduct(run, conductMark('caught-cheating')) : run;
  return {
    ...withNotes(marked, ...notes),
    progress: {
      ...progress,
      question: progress.question + 1,
      correct: progress.correct + (right ? 1 : 0),
      strikes: progress.strikes + (caught ? 1 : 0),
    },
  };
}

/** Answers the current question the chosen way (already checked open). */
export function answerQuestion(
  state: GameState,
  ctx: GameContext,
  approach: MindApproach,
  rng: Rng,
): GameState {
  const here = examHere(state, ctx);
  const at = here && mindQuestion(here);
  const plan = mindPlans(state, ctx).find((p) => p.id === approach);
  if (!here || !at?.question || !plan) return state;
  const answered = rng.chance(plan.chance);
  const caught = plan.risk > 0 && rng.chance(plan.risk);
  const run = afterAnswer(here.run, { plan, stage: at.stage, right: answered && !caught, caught });
  const progress = run.progress;
  const strikes = progress?.kind === 'mind' ? progress.strikes : 0;
  const asked = progress?.kind === 'mind' ? progress.question : 0;
  if (strikes >= MAX_STRIKES) {
    return withRun(state, endRun(withNotes(run, outcome(at.stage.disqualified)), 'disqualified'));
  }
  if (asked >= at.stage.questions.length) {
    return afterLastQuestion(state, ctx, run, at.stage);
  }
  return withRun(state, run);
}

/** The last question: stay (nerve the examiners note) or walk out with your team. */
export function answerFinal(state: GameState, ctx: GameContext, stay: boolean): GameState {
  const here = examHere(state, ctx);
  const at = here && mindQuestion(here);
  const final = at?.stage.final;
  if (!here || !at || !final) return state;
  const said = withNotes(here.run, { kind: 'choice', text: stay ? final.stay : final.leave });
  if (!stay) return withRun(state, endRun(withNotes(said, outcome(final.left)), 'walked-out'));
  const stayed = withNotes(
    withConduct(said, conductMark('stayed-for-final')),
    outcome(final.stayed),
  );
  return markPaper(state, ctx, stayed, at.stage);
}
