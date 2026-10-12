import type { ConductSignal, ExamStageKind } from '@/systems/exams';
import { STAT_INFO } from '@/systems/stats';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { examHere, type ExamHere } from '../exam/current';
import { mindPlans, mindQuestion } from '../exam/mind';
import { rivalNow } from '../exam/tournament';
import { combatStats } from '../gear';
import { scout, type Threat } from '../scouting';
import type { GameState } from '../state';
import { choice } from './common';
import { noteLine, type SceneLine } from './scene';

/** The exam scene: the stage strip, the story so far, and what you can do next. */

export interface ExamChoice {
  readonly label: string;
  readonly detail: string;
  /** How likely a proctor is to catch it, in words, for cheating. */
  readonly risk: string | null;
  readonly primary: boolean;
  readonly action: GameAction;
  readonly blocker: string | null;
}

export interface ExamStageMark {
  readonly name: string;
  readonly kind: ExamStageKind;
  readonly status: 'done' | 'now' | 'ahead';
}

export interface ConductLine {
  readonly text: string;
  readonly points: number;
}

export interface ExamVerdict {
  readonly promoted: boolean;
  readonly roundsWon: number;
  readonly conduct: number;
  readonly marks: readonly ConductLine[];
}

export interface ExamScene {
  readonly title: string;
  readonly stages: readonly ExamStageMark[];
  readonly lines: readonly SceneLine[];
  readonly prompt: string | null;
  /** The rival waiting in the ring, read against you. */
  readonly rival: { readonly name: string; readonly threat: Threat; readonly label: string } | null;
  readonly verdict: ExamVerdict | null;
  readonly choices: readonly ExamChoice[];
}

const CONDUCT_WORDS: Readonly<Record<ConductSignal, string>> = {
  'stayed-for-final': 'Stayed for the last question',
  'caught-cheating': 'Caught cheating',
  'sensible-withdrawal': 'Pulled the team out of a fight it would lose',
  'gave-up': 'Gave up a fight the team could win',
  'avoided-fight': 'Got past rivals without a fight',
  'team-standing': 'Won a fight with the whole team standing',
  'teammate-down': 'Won a fight, but a teammate went down',
  'clever-win': 'Won a bout with a plan',
  'sensible-yield': 'Yielded a bout that was lost',
  'early-yield': 'Yielded a bout that wasn’t over',
};

function stageMarks(here: ExamHere): ExamStageMark[] {
  const at = here.run.verdict ? here.def.stages.length : here.run.stageIndex;
  return here.def.stages.map((s, i) => ({
    name: s.name,
    kind: s.kind,
    status: i < at ? 'done' : i === at ? 'now' : 'ahead',
  }));
}

function percent(chance: number): string {
  return `${Math.round(chance * 100)}%`;
}

function plain(state: GameState, ctx: GameContext, label: string, action: GameAction): ExamChoice {
  return { label, detail: '', risk: null, primary: true, ...choice(state, ctx, action) };
}

function mindChoices(state: GameState, ctx: GameContext, here: ExamHere): ExamChoice[] {
  const at = mindQuestion(here);
  if (at && !at.question && at.stage.final) {
    return [
      plain(state, ctx, at.stage.final.stay, { type: 'examFinal', stay: true }),
      {
        ...plain(state, ctx, at.stage.final.leave, { type: 'examFinal', stay: false }),
        primary: false,
      },
    ];
  }
  return mindPlans(state, ctx).map((p) => ({
    label: p.label,
    detail: `${STAT_INFO[p.stat].label} ${percent(p.chance)}`,
    risk: p.risk > 0 ? `Caught ${percent(p.risk)}` : null,
    primary: false,
    action: { type: 'examAnswer', approach: p.id },
    blocker: p.blocker,
  }));
}

function promptOf(here: ExamHere): string | null {
  const at = mindQuestion(here);
  if (at?.question) return at.question.text;
  if (at?.stage.final) return at.stage.final.text;
  return null;
}

function choicesFor(state: GameState, ctx: GameContext, here: ExamHere): ExamChoice[] {
  const go: GameAction = { type: 'examContinue' };
  if (here.run.verdict) {
    return [plain(state, ctx, here.run.verdict.promoted ? 'Step forward' : 'Leave', go)];
  }
  switch (here.run.progress?.kind) {
    case 'mind':
      return mindChoices(state, ctx, here);
    case 'survival':
      return [plain(state, ctx, 'Through the gate', go)];
    case 'tournament':
      return [plain(state, ctx, 'Step into the ring', go)];
    case undefined:
      return [];
  }
}

function verdictOf(here: ExamHere): ExamVerdict | null {
  const verdict = here.run.verdict;
  if (!verdict) return null;
  return {
    promoted: verdict.promoted,
    roundsWon: verdict.roundsWon,
    conduct: verdict.conduct,
    marks: here.run.conduct.map((m) => ({ text: CONDUCT_WORDS[m.signal], points: m.points })),
  };
}

function rivalOf(state: GameState, ctx: GameContext): ExamScene['rival'] {
  const rival = rivalNow(state, ctx);
  if (!rival) return null;
  const read = scout(rival.stats, combatStats(state, ctx), false);
  return {
    name: `${rival.name} ${rival.familyName}`,
    threat: read.threat,
    label: read.threatLabel,
  };
}

export function examScene(state: GameState, ctx: GameContext): ExamScene | null {
  const here = examHere(state, ctx);
  if (!here || state.combat || state.mission) return null;
  return {
    title: here.def.name,
    stages: stageMarks(here),
    lines: here.run.notes.map(noteLine),
    prompt: promptOf(here),
    rival: rivalOf(state, ctx),
    verdict: verdictOf(here),
    choices: choicesFor(state, ctx, here),
  };
}
