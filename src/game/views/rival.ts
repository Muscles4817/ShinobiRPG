import { STAT_INFO, statTier, type StatGrade, type StatId } from '@/systems/stats';
import { DISCIPLINES } from '@/systems/techniques';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { findPerson } from '../people/cast';
import { personStats } from '../people/progress';
import { MEETING, repliesFor, SHAPE_NAME, WHO_THEY_ARE } from '../rival/lines';
import { firstsScore, heatStage, HEAT_STAGES, type Rival, type Score } from '../rival/state';
import type { GameState } from '../state';
import { choice, type Choice } from './common';
import { examNotice } from './examNotice';
import { personCard, personFace, toneLabel, type PersonCard, type PersonFace } from './people';

/**
 * What the screen shows of your rival: the moments that wait for your answer, a challenge
 * standing above the village, and the Rivalry tab on their sheet.
 */

export interface RivalSceneView {
  readonly person: PersonCard;
  readonly kicker: string;
  readonly title: string;
  readonly lines: readonly string[];
  readonly choices: readonly {
    readonly label: string;
    readonly tone: string;
    readonly action: GameAction;
  }[];
}

export interface RivalChallengeView {
  readonly face: PersonFace;
  readonly line: string;
  readonly spars: Score;
  readonly accept: Choice;
  readonly decline: Choice;
}

export interface SideBySide {
  readonly name: string;
  readonly yours: { readonly grade: StatGrade; readonly share: number };
  readonly theirs: { readonly grade: StatGrade; readonly share: number };
}

export interface RivalryView {
  readonly shape: string;
  readonly who: string;
  readonly tally: readonly { readonly label: string; readonly score: Score }[];
  readonly side: readonly SideBySide[];
  readonly heat: { readonly stages: readonly string[]; readonly at: number };
  readonly next: string | null;
}

/** Side by side on one scale: a stat's share of the way to the top of S. */
const SCALE_TOP = 45;
const SIDE_ROWS = 4;

function rivalOf(state: GameState, ctx: GameContext) {
  const rival = state.rival;
  const person = rival && findPerson(state, ctx, rival.personId);
  return rival && person ? { rival, person } : null;
}

const fill = (text: string, name: string) => text.replaceAll('{name}', name);

export function rivalScene(state: GameState, ctx: GameContext): RivalSceneView | null {
  const found = rivalOf(state, ctx);
  const beat = found?.rival.beat;
  if (!found || !beat) return null;
  const { rival, person } = found;
  const choices = repliesFor(beat).map((r, choiceIndex) => ({
    label: r.say,
    tone: toneLabel(r.tone),
    action: { type: 'answerRival', choiceIndex } as const,
  }));
  const card = personCard(state, ctx, person);
  if (beat.kind === 'meeting') {
    return {
      person: card,
      kicker: 'Word gets round which team you landed on',
      title: `${person.name} finds you`,
      lines: [
        `${person.name} has been watching you since the academy. Today they want you to know it.`,
        fill(MEETING[rival.shape][rival.temperament], person.name),
      ],
      choices,
    };
  }
  return {
    person: card,
    kicker: 'The training ground, after the spar',
    title: beat.won ? `You beat ${person.name}` : `${person.name} beat you`,
    lines: [
      beat.won
        ? `${person.name} gets up slowly, and looks at you as if seeing you for the first time today.`
        : `${person.name} stands over you a moment longer than they need to.`,
    ],
    choices,
  };
}

export function rivalChallengeView(state: GameState, ctx: GameContext): RivalChallengeView | null {
  const found = rivalOf(state, ctx);
  const challenge = found?.rival.challenge;
  if (!found || !challenge) return null;
  return {
    face: personFace(state, found.person),
    line: challenge.line,
    spars: found.rival.spars,
    accept: choice(state, ctx, { type: 'acceptChallenge' }),
    decline: choice(state, ctx, { type: 'declineChallenge' }),
  };
}

function sideStats(yours: Record<StatId, number>, theirs: Record<StatId, number>): StatId[] {
  const best = (stats: Record<StatId, number>) =>
    DISCIPLINES.reduce((a, b) => (stats[b] > stats[a] ? b : a));
  return [...new Set<StatId>([best(theirs), best(yours), 'speed', 'stamina', 'strength'])].slice(
    0,
    SIDE_ROWS,
  );
}

function nextBeat(state: GameState, ctx: GameContext, rival: Rival, name: string): string | null {
  if (rival.challenge) return `${name} has challenged you to a spar.`;
  const exam = examNotice(state, ctx);
  return exam
    ? `${exam.name}, ${exam.when.toLowerCase()}. If you both sit it, you may meet in the bouts.`
    : null;
}

export function rivalryView(
  state: GameState,
  ctx: GameContext,
  personId: string,
): RivalryView | null {
  const found = rivalOf(state, ctx);
  if (found?.person.id !== personId) return null;
  const { rival, person } = found;
  const yours = state.character.stats;
  const theirs = personStats(person, state);
  const read = (value: number) => ({
    grade: statTier(value).grade,
    share: Math.min(1, value / SCALE_TOP),
  });
  return {
    shape: SHAPE_NAME[rival.shape],
    who: WHO_THEY_ARE[rival.shape][rival.temperament],
    tally: [
      { label: 'Spars', score: rival.spars },
      { label: 'First to a grade', score: firstsScore(rival) },
    ],
    side: sideStats(yours, theirs).map((id) => ({
      name: STAT_INFO[id].label,
      yours: read(yours[id]),
      theirs: read(theirs[id]),
    })),
    heat: { stages: HEAT_STAGES, at: heatStage(rival.heat) },
    next: nextBeat(state, ctx, rival, person.name),
  };
}
