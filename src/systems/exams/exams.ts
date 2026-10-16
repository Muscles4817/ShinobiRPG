/**
 * Promotion exams: an exam is a list of modular stages (a written test of the mind, a survival
 * forest, a tournament), sat twice a year by teams of three. This module owns the shapes (the
 * exam as content writes it, the run in progress) and the pure rules on the run: moving through
 * the stages, the tournament bracket, and the verdict, which weighs conduct with results
 * (`conduct.ts`). Which stat a moment tests and how a fight goes belong to the game layer.
 */
import type { MissionNote } from '@/systems/missions';

import { conductScore, type ConductMark } from './conduct';

/** A day of the year the exam is held on. 0 = first season; day of the season, 1-based. */
export interface ExamDate {
  readonly season: number;
  readonly day: number;
}

export interface MindQuestion {
  readonly text: string;
  /** How hard it is to answer honestly, against intellect. */
  readonly difficulty: number;
}

/** The last question of a written test: a test of nerve, not knowledge. */
export interface MindFinal {
  readonly text: string;
  /** What staying and leaving say on their buttons. */
  readonly stay: string;
  readonly leave: string;
  /** What happens, as outcomes. */
  readonly stayed: string;
  readonly left: string;
}

/** A written test: questions answered by wit, sharp eyes or (at a risk) by cheating. */
export interface MindStageDef {
  readonly kind: 'mind';
  readonly name: string;
  readonly intro: string;
  readonly questions: readonly MindQuestion[];
  /** Answers needed to pass. */
  readonly passMark: number;
  /** How sharp the proctors' eyes are: cheating is caught against this. */
  readonly vigilance: number;
  /** A proctor catches you cheating. */
  readonly caught: string;
  readonly passed: string;
  readonly failed: string;
  readonly disqualified: string;
  readonly final?: MindFinal;
}

/** A forest of rival teams, played as an exam-only team mission of encounters. */
export interface SurvivalStageDef {
  readonly kind: 'survival';
  readonly name: string;
  readonly intro: string;
  /** The mission the forest is played as (a `MissionDef` with `examOnly`). */
  readonly missionId: string;
  readonly passed: string;
  readonly failed: string;
}

/** One-on-one bouts against rivals from other villages, in a bracket of a few rounds. */
export interface TournamentStageDef {
  readonly kind: 'tournament';
  readonly name: string;
  readonly intro: string;
  /** Each round's rival's best art, weakest first; one entry per round (the last is the final). */
  readonly rivals: readonly number[];
  /** A rival's other stats. */
  readonly rivalBase: number;
  /** Before a bout; `{them}` is the rival's name. */
  readonly bout: string;
  readonly won: string;
  readonly lost: string;
  readonly yielded: string;
  /** Winning the final. */
  readonly champion: string;
}

export type ExamStageDef = MindStageDef | SurvivalStageDef | TournamentStageDef;
export type ExamStageKind = ExamStageDef['kind'];

/** The rank an exam promotes to. Jōnin are nominated, not examined. */
export type ExamRank = 'chunin';

export interface ExamDef {
  readonly id: string;
  readonly name: string;
  readonly rank: ExamRank;
  /** The days of the year it is held (twice a year). */
  readonly dates: readonly ExamDate[];
  readonly stages: readonly ExamStageDef[];
  /** Gossip in the week before. */
  readonly rumour: string;
  /** Your sensei's word on it in the week before; `{you}` and `{them}` are names. */
  readonly announcement: string;
  /** The opening of the exam scene. */
  readonly intro: string;
  readonly verdict: { readonly promoted: string; readonly passedOver: string };
  readonly spectators: ExamSpectators;
}

/**
 * The exam for those not sitting it: who tells you it is coming, and the finals you may go and
 * watch on the day. Placeholders: `{them}` and `{you}` are names; `{a}` and `{b}` the two
 * finalists; `{winner}` and `{loser}` how it came out.
 */
export interface ExamSpectators {
  /** Your sensei's word in the week before, when they won't put you forward this time. */
  readonly invitation: string;
  /** The same news from a teammate, when your sensei keeps too loose a grip to say it. */
  readonly hearsay: string;
  /** The stands as the two finalists step out. */
  readonly finals: string;
  /** How the crowd takes the end of it. */
  readonly won: string;
}

/** Why a run ended before the last stage was done. */
export type ExamExit =
  'failed-mind' | 'disqualified' | 'walked-out' | 'no-token' | 'withdrew' | 'beaten';

/** Where the run stands inside its current stage. */
export type StageProgress =
  | {
      readonly kind: 'mind';
      readonly question: number;
      readonly correct: number;
      /** Times a proctor caught you cheating. */
      readonly strikes: number;
      /** True once the questions are done and the last question waits. */
      readonly final: boolean;
    }
  | { readonly kind: 'survival'; readonly started: boolean }
  | {
      readonly kind: 'tournament';
      /** 0-based round of the bout ahead (or under way). */
      readonly round: number;
      readonly roundsWon: number;
      readonly fighting: boolean;
    };

/** How the run turned out, once it is over. */
export interface Verdict {
  readonly promoted: boolean;
  readonly roundsWon: number;
  readonly conduct: number;
  readonly score: number;
  readonly exit: ExamExit | null;
}

export interface ExamRun {
  readonly examId: string;
  readonly startedDay: number;
  /** The two genin sitting it with you. */
  readonly teamIds: readonly string[];
  readonly stageIndex: number;
  readonly progress: StageProgress | null;
  readonly notes: readonly MissionNote[];
  readonly conduct: readonly ConductMark[];
  /** Rounds won in the tournament, kept once the bracket is over. */
  readonly roundsWon: number;
  /** Set when the run ends early. */
  readonly exit: ExamExit | null;
  /** Set when the run is over, whichever way. */
  readonly verdict: Verdict | null;
}

/** Results are worth this much a tournament round won. */
export const ROUND_POINTS = 2;
/** Results plus conduct must reach this for a promotion. */
export const PROMOTION_SCORE = 4;
/** Caught cheating this many times, and the team is out. */
export const MAX_STRIKES = 2;

function progressFor(stage: ExamStageDef | undefined): StageProgress | null {
  switch (stage?.kind) {
    case undefined:
      return null;
    case 'mind':
      return { kind: 'mind', question: 0, correct: 0, strikes: 0, final: false };
    case 'survival':
      return { kind: 'survival', started: false };
    case 'tournament':
      return { kind: 'tournament', round: 0, roundsWon: 0, fighting: false };
  }
}

export function startExamRun(def: ExamDef, day: number, teamIds: readonly string[]): ExamRun {
  return {
    examId: def.id,
    startedDay: day,
    teamIds: [...teamIds],
    stageIndex: 0,
    progress: progressFor(def.stages[0]),
    notes: [
      { kind: 'story', text: def.intro },
      ...(def.stages[0] ? [{ kind: 'story' as const, text: def.stages[0].intro }] : []),
    ],
    conduct: [],
    roundsWon: 0,
    exit: null,
    verdict: null,
  };
}

export function currentExamStage(def: ExamDef, run: ExamRun): ExamStageDef | null {
  return run.verdict ? null : (def.stages[run.stageIndex] ?? null);
}

export function withNotes(run: ExamRun, ...notes: readonly MissionNote[]): ExamRun {
  return { ...run, notes: [...run.notes, ...notes] };
}

export function withConduct(run: ExamRun, ...marks: readonly ConductMark[]): ExamRun {
  return { ...run, conduct: [...run.conduct, ...marks] };
}

/** Judges a finished run: conduct and results together, never winning alone. */
export function judge(run: Pick<ExamRun, 'conduct' | 'roundsWon' | 'exit'>): Verdict {
  const conduct = conductScore(run.conduct);
  const score = run.roundsWon * ROUND_POINTS + conduct;
  return {
    promoted: run.exit === null && score >= PROMOTION_SCORE,
    roundsWon: run.roundsWon,
    conduct,
    score,
    exit: run.exit,
  };
}

/** The stage is done: on to the next, or the verdict after the last. */
export function nextStage(def: ExamDef, run: ExamRun): ExamRun {
  const stageIndex = run.stageIndex + 1;
  const stage = def.stages[stageIndex];
  if (!stage) return { ...run, stageIndex, progress: null, verdict: judge(run) };
  return {
    ...withNotes(run, { kind: 'story', text: stage.intro }),
    stageIndex,
    progress: progressFor(stage),
  };
}

/** The run ends here, early: the verdict is read at once. */
export function endRun(run: ExamRun, exit: ExamExit): ExamRun {
  const ended = { ...run, exit, progress: null };
  return { ...ended, verdict: judge(ended) };
}

/** A tournament bout won: on to the next round, or the bracket is won. */
export function boutWon(
  run: ExamRun,
  stage: TournamentStageDef,
): { readonly run: ExamRun; readonly champion: boolean } {
  const progress = run.progress;
  if (progress?.kind !== 'tournament') return { run, champion: false };
  const roundsWon = progress.roundsWon + 1;
  const champion = progress.round + 1 >= stage.rivals.length;
  const next: StageProgress = {
    ...progress,
    round: progress.round + 1,
    roundsWon,
    fighting: false,
  };
  return { run: { ...run, roundsWon, progress: next }, champion };
}

/** A bout lost or yielded: the bracket is over for you, with the rounds you won. */
export function boutLost(run: ExamRun): ExamRun {
  const progress = run.progress;
  if (progress?.kind !== 'tournament') return run;
  return { ...run, roundsWon: progress.roundsWon, progress: { ...progress, fighting: false } };
}
