import { STAT_TIERS, type StatGrade } from '@/systems/stats';
import {
  gradeToAttempt,
  type LearnBlocker,
  type StudySource,
  type TechniqueDef,
} from '@/systems/techniques';

import { STUDY_ENERGY_COST } from '../actions/study';
import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { assumedAptitude } from '../growth';
import { learnBlockerFor, learnBlockerText, studyPointsFor, wouldBeUnstable } from '../learning';
import { placeHere } from '../ops';
import type { GameState } from '../state';
import { playerCombatant } from '../combatants';
import { choice, type Choice, type Discipline } from './common';
import { techniqueSheet, type Reader, type TechniqueSheet } from './techniqueSheet';

/**
 * The academy's scroll rack: what you're studying, what you could start, and what is folded
 * away until you grow (with what opens it).
 */

export interface Scroll extends Choice {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly discipline: Discipline;
  readonly rank: StatGrade;
  readonly progress: number;
  readonly difficulty: number;
  /** Sessions still to go at your pace; null when study in its art can't take. */
  readonly sessionsLeft: number | null;
  /** A technique only your clan teaches. */
  readonly fromClan: boolean;
  /** Why it can't be studied yet and what opens it ("Needs C ninjutsu; you're E."), or null. */
  readonly locked: string | null;
  /** A rank above your grade: studied at half pace and arrives unstable. */
  readonly unstable: boolean;
  /** How far you are from being able to start it; Coming up lists the closest first. */
  readonly shortfall: number;
  /** What it does, read before you study it. */
  readonly sheet: TechniqueSheet;
}

export interface AcademyView {
  readonly name: string;
  readonly energyCost: number;
  readonly studying: readonly Scroll[];
  readonly ready: readonly Scroll[];
  readonly comingUp: readonly Scroll[];
}

/** Sorts what no amount of training opens (a nature, a clan) after everything else. */
const OUT_OF_REACH = 1000;

function gradeLine(grade: StatGrade): number {
  return STAT_TIERS.find((t) => t.grade === grade)?.min ?? 0;
}

function shortfallOf(blocker: LearnBlocker | null, def: TechniqueDef, state: GameState): number {
  const { stats } = state.character;
  switch (blocker?.kind) {
    case undefined:
    case 'already-known':
    case 'weapon':
      return 0;
    case 'rank':
      return gradeLine(gradeToAttempt(def.rank)) - stats[def.discipline];
    case 'reserves':
      return blocker.min - blocker.have;
    case 'control':
      return gradeLine(blocker.grade) - stats.chakraControl;
    case 'clan':
    case 'nature':
      return OUT_OF_REACH;
  }
}

/** How a scroll is read: from a shelf here (`study`) or from your own (`studyScroll`). */
export interface Reading {
  readonly action: Extract<GameAction, { type: 'study' | 'studyScroll' }>['type'];
  readonly source: StudySource;
}

/** How and by whom a scroll is read: the reading, and you as a fighter (worked out once). */
export interface ScrollReading {
  readonly reading?: Reading;
  readonly you?: Reader;
}

const ACADEMY_READING: Reading = { action: 'study', source: 'scroll' };

export function scrollOf(
  state: GameState,
  ctx: GameContext,
  def: TechniqueDef,
  how: ScrollReading = {},
): Scroll {
  const reading = how.reading ?? ACADEMY_READING;
  const you = how.you ?? playerCombatant(state, ctx);
  const { character } = state;
  const progress = state.techniques.progress[def.id] ?? 0;
  const blocker = learnBlockerFor(state, def, ctx);
  const aptitude = assumedAptitude(character)[def.discipline];
  const points = studyPointsFor(character, def, ctx, { aptitude, source: reading.source });
  return {
    ...choice(state, ctx, { type: reading.action, techniqueId: def.id }),
    id: def.id,
    name: def.name,
    description: def.description,
    discipline: def.discipline,
    rank: def.rank,
    progress,
    difficulty: def.difficulty,
    sessionsLeft: points > 0 ? Math.ceil((def.difficulty - progress) / points) : null,
    fromClan: def.clan !== undefined,
    locked: blocker && learnBlockerText(blocker, def),
    unstable: wouldBeUnstable(character, def),
    shortfall: shortfallOf(blocker, def, state),
    sheet: techniqueSheet(state, ctx, def, you),
  };
}

export function academyView(state: GameState, ctx: GameContext): AcademyView | null {
  const place = placeHere(state, ctx, 'academy');
  if (!place) return null;
  const you = playerCombatant(state, ctx);
  const scrolls = place.techniqueIds
    .map((id) => ctx.content.techniques.require(id))
    .filter((t) => !state.techniques.known.includes(t.id))
    .map((t) => scrollOf(state, ctx, t, { you }));
  return { name: place.name, energyCost: STUDY_ENERGY_COST, ...sortScrolls(scrolls) };
}

/** Studying first, then ready to start, then what is folded away (closest first). */
export function sortScrolls(
  scrolls: readonly Scroll[],
): Pick<AcademyView, 'studying' | 'ready' | 'comingUp'> {
  const open = scrolls.filter((s) => s.locked === null);
  return {
    studying: open.filter((s) => s.progress > 0),
    ready: open.filter((s) => s.progress === 0),
    comingUp: scrolls.filter((s) => s.locked !== null).sort((a, b) => a.shortfall - b.shortfall),
  };
}
