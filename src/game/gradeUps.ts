import {
  STAT_GRADES,
  STAT_IDS,
  STAT_INFO,
  statTier,
  type StatId,
  type Stats,
} from '@/systems/stats';
import { learnBlocker } from '@/systems/techniques';

import type { GameContext } from './context';
import { learnerOf, stabiliseTechniques } from './learning';
import { chip, log } from './ops';
import { addReport, type Report } from './reports';
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

/** Where each technique is taught, by id (the first place that keeps its scroll). */
function teachingPlaces(ctx: GameContext): Map<string, string> {
  const where = new Map<string, string>();
  const academies = ctx.content.locations.all.flatMap((l) =>
    l.places.flatMap((p) => (p.kind === 'academy' ? [p] : [])),
  );
  for (const place of academies) {
    for (const id of place.techniqueIds) if (!where.has(id)) where.set(id, place.name);
  }
  return where;
}

/** Techniques the new stats put within reach that the old ones didn't, and where to learn them. */
function opened(state: GameState, before: Stats, ctx: GameContext): GradeReport['opens'] {
  const { character, techniques } = state;
  const blocked = (stats: Stats, id: string) =>
    learnBlocker(techniques, ctx.content.techniques.require(id), {
      ...learnerOf(character),
      stats,
    });
  return [...teachingPlaces(ctx)].flatMap(([id, where]) =>
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
