import type { PersonDef } from '@/content';
import {
  fightingPower,
  STAT_GRADES,
  STAT_IDS,
  STAT_INFO,
  statTier,
  type StatGrade,
  type StatId,
  type Stats,
} from '@/systems/stats';
import { DISCIPLINES } from '@/systems/techniques';

import type { GameContext } from '../context';
import { personStats } from '../people/progress';
import { PURSE } from '../rival/contest';
import { trailsYou } from '../rival/drive';
import { rivalLine, SHAPE_NAME, WHO_THEY_ARE } from '../rival/lines';
import { courseEdge } from '../rival/race';
import {
  firstsScore,
  heatStage,
  HEAT_STAGES,
  type Contest,
  type Rival,
  type Score,
} from '../rival/state';
import type { GameState } from '../state';
import { choice, type Choice } from './common';
import { examNotice } from './examNotice';
import { rivalOf } from './rival';

/**
 * The Rivalry section on your rival's sheet: who they are to you, the tally, side by side, the
 * heat, settling it on your own terms (the ground, whose edge it is, the stakes) and the ways
 * to close the gap that apply to you now, each read from the rule that makes it work.
 */

export interface SideBySide {
  readonly name: string;
  readonly yours: { readonly grade: StatGrade; readonly share: number };
  readonly theirs: { readonly grade: StatGrade; readonly share: number };
}

export interface ContestOffer {
  readonly contest: Contest;
  readonly name: string;
  /** Whose ground it is, as a stamp. */
  readonly edge: string;
  readonly note: string;
  readonly pride: Choice;
  readonly purse: Choice;
}

export interface RivalryView {
  readonly shape: string;
  readonly who: string;
  readonly tally: readonly { readonly label: string; readonly score: Score }[];
  readonly side: readonly SideBySide[];
  readonly heat: { readonly stages: readonly string[]; readonly at: number };
  readonly rattled: boolean;
  /** They are behind you and training harder for it, in words; null when they lead. */
  readonly driven: string | null;
  readonly offers: readonly ContestOffer[];
  readonly purse: number;
  readonly ways: readonly string[];
  readonly next: string | null;
}

/** Side by side on one scale: a stat's share of the way to the top of S. */
const SCALE_TOP = 45;
const SIDE_ROWS = 4;
/** Within this share of each other, a spar is anyone's. */
const EVEN_POWER = 0.08;
/** Within this much ground over the course, a race is anyone's. */
const EVEN_COURSE = 1;

function sideStats(yours: Stats, theirs: Stats): StatId[] {
  const best = (stats: Stats) => DISCIPLINES.reduce((a, b) => (stats[b] > stats[a] ? b : a));
  return [...new Set<StatId>([best(theirs), best(yours), 'speed', 'stamina', 'strength'])].slice(
    0,
    SIDE_ROWS,
  );
}

function edgeWord(lead: number, even: number): string {
  if (lead > even) return 'Your ground';
  return lead < -even ? '{name.their} ground' : 'Even ground';
}

function offers(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
  theirs: Stats,
): ContestOffer[] {
  const fill = (text: string) => rivalLine(text, person);
  const yours = state.character.stats;
  const power = fightingPower(yours) / Math.max(1, fightingPower(theirs)) - 1;
  const offer = (contest: Contest, edge: string, note: string): ContestOffer => ({
    contest,
    name: contest === 'race' ? 'A race' : 'A spar',
    edge,
    note,
    pride: choice(state, ctx, { type: 'challengeRival', contest, stakes: 'pride' }),
    purse: choice(state, ctx, { type: 'challengeRival', contest, stakes: 'purse' }),
  });
  return [
    offer(
      'spar',
      fill(edgeWord(power, EVEN_POWER)),
      'A real fight, stopped before anyone is hurt.',
    ),
    offer(
      'race',
      fill(edgeWord(courseEdge(yours, theirs), EVEN_COURSE)),
      fill('Gate to the bell tower in three legs: read {name.them} as you run.'),
    ),
  ];
}

const gradeOf = (value: number) => STAT_GRADES.indexOf(statTier(value).grade);

function ways(rival: Rival, person: PersonDef, yours: Stats, theirs: Stats): string[] {
  const name = person.name;
  const ahead = STAT_IDS.filter((id) => gradeOf(theirs[id]) > gradeOf(yours[id])).sort(
    (a, b) => theirs[b] - yours[b] - (theirs[a] - yours[a]),
  )[0];
  return [
    ...(ahead
      ? [
          `Swallow your pride: ask ${name} to teach you ${STAT_INFO[ahead].label.toLowerCase()}. Anyone ahead of you can, at a training ground where they are.`,
        ]
      : []),
    ...(gradeOf(yours.perception) < gradeOf(theirs.perception)
      ? [`Sharpen your eyes: with perception the equal of ${name}’s, you read every leg of a race.`]
      : []),
    rivalLine(
      rival.rattled
        ? '{name} is rattled: {name.they}’ll run worse in your next race.'
        : 'Get under {name.their} skin: a barbed word after a contest, or when {name.they} needle{name.s} you, leaves {name.them} rattled for the next race.',
      person,
    ),
  ];
}

function nextBeat(state: GameState, ctx: GameContext, rival: Rival, name: string): string | null {
  if (rival.challenge)
    return `${name} has challenged you to ${rival.challenge.contest === 'race' ? 'a race' : 'a spar'}.`;
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
      { label: 'Races', score: rival.races },
      { label: 'First to a grade', score: firstsScore(rival) },
    ],
    side: sideStats(yours, theirs).map((id) => ({
      name: STAT_INFO[id].label,
      yours: read(yours[id]),
      theirs: read(theirs[id]),
    })),
    heat: { stages: HEAT_STAGES, at: heatStage(rival.heat) },
    rattled: rival.rattled,
    driven: trailsYou(state, person.id, theirs)
      ? rivalLine(
          '{name} has been at the grounds before dawn all week. Behind you, {name.they} train{name.s} harder.',
          person,
        )
      : null,
    offers: offers(state, ctx, person, theirs),
    purse: PURSE,
    ways: ways(rival, person, yours, theirs),
    next: nextBeat(state, ctx, rival, person.name),
  };
}
