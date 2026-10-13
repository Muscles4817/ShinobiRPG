import {
  STAT_GRADES,
  STAT_IDS,
  STAT_INFO,
  statTier,
  type StatId,
  type Stats,
} from '@/systems/stats';
import { scrollIds } from '@/systems/inventory';
import { learnBlocker } from '@/systems/techniques';

import type { GameContext } from './context';
import { learnerOf, stabiliseTechniques } from './learning';
import { chip, log } from './ops';
import { addReport, type Report } from './reports';
import { libraryScrollAccess } from './permits';
import type { GameState } from './state';

/**
 * Crossing a grade boundary in a stat (D to C) is a moment of its own: a report card stamped
 * with the new grade and a list of what it opens, drawn from content (techniques the new grade
 * lets you study that the old one didn't, where they are taught). Every action's result passes
 * through `noteGradeUps` once (see `dispatch`), so it fires for every source of growth, once per
 * stat however many sources fed it; unstable techniques the grades have caught up with steady
 * there too.
 */

type GradeReport = Extract<Report, { kind: 'grade' }>;

const STORY = 'Months of work settle all at once into something new. You feel the difference.';

function gradeIndex(value: number): number {
  return STAT_GRADES.indexOf(statTier(value).grade);
}

/** Stats whose grade rose between two stat lines. */
export function gradeUpsBetween(before: Stats, after: Stats): StatId[] {
  return STAT_IDS.filter((id) => gradeIndex(after[id]) > gradeIndex(before[id]));
}

/** Name for your own scrolls in "What this opens". */
const YOUR_SCROLLS = 'Your scrolls';

/** Whether you may read this scroll where it is kept (a library's rules, or anyone's rack). */
function mayRead(state: GameState, ctx: GameContext, kind: string, id: string): boolean {
  const def = ctx.content.techniques.get(id);
  return kind !== 'library' || (def !== undefined && libraryScrollAccess(state, def) === null);
}

/**
 * Where each technique can be studied, by id: the first academy (or library shelf you may
 * read) that keeps its scroll, else your own scrolls.
 */
function teachingPlaces(state: GameState, ctx: GameContext): Map<string, string> {
  const where = new Map<string, string>();
  const shelves = ctx.content.locations.all.flatMap((l) =>
    l.places.flatMap((p) => (p.kind === 'academy' || p.kind === 'library' ? [p] : [])),
  );
  for (const place of shelves) {
    for (const id of place.techniqueIds) {
      if (!where.has(id) && mayRead(state, ctx, place.kind, id)) where.set(id, place.name);
    }
  }
  for (const id of scrollIds(state.inventory)) if (!where.has(id)) where.set(id, YOUR_SCROLLS);
  return where;
}

/**
 * Techniques the new stats put within reach that the old ones didn't, and where to learn them.
 * The weapon in hand is left out: a grade opens what the grade allows.
 */
function opened(state: GameState, before: Stats, ctx: GameContext): GradeReport['opens'] {
  const { character, techniques } = state;
  const { held: _held, ...learner } = learnerOf(state, ctx);
  const blocked = (stats: Stats, id: string) =>
    learnBlocker(techniques, ctx.content.techniques.require(id), { ...learner, stats });
  return [...teachingPlaces(state, ctx)].flatMap(([id, where]) =>
    blocked(before, id) !== null && blocked(character.stats, id) === null
      ? [{ name: ctx.content.techniques.require(id).name, where }]
      : [],
  );
}

function gradeReport(state: GameState, id: StatId, opens: GradeReport['opens']): GradeReport {
  const tier = statTier(state.character.stats[id]);
  return { kind: 'grade', stat: STAT_INFO[id].label, grade: tier.grade, rank: tier.rank, opens };
}

/**
 * Adds a grade card (and a journal line) for every stat whose grade `after` raised, then steadies
 * the unstable techniques the grades have caught up with.
 */
export function noteGradeUps(before: GameState, after: GameState, ctx: GameContext): GameState {
  return stabiliseTechniques(gradeCards(before, after, ctx), ctx);
}

function gradeCards(before: GameState, after: GameState, ctx: GameContext): GameState {
  const was = before.character.stats;
  const raised = gradeUpsBetween(was, after.character.stats);
  if (raised.length === 0) return after;
  // Everything opened is listed once, on the first card of the action.
  const opens = opened(after, was, ctx);
  return raised.reduce((state, id, i) => {
    const report = gradeReport(state, id, i === 0 ? opens : []);
    const logged = log(state, {
      heading: `${report.stat} reaches grade ${report.grade}`,
      text: STORY,
      tone: 'success',
      chips: [chip(`${report.stat} ${report.grade}`, 'gain')],
    });
    return addReport(logged, report);
  }, after);
}
