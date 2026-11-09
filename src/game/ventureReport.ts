import type { FieldBook } from '@/systems/collections';
import { depthsTo, type MissionRun, type VentureTally, type WildDepth } from '@/systems/missions';

import { debriefLines } from './debrief';
import type { Report } from './reports';

/**
 * What a venture leaves on its card when you come out (`game/ventures.ts`): how far in you got,
 * the days it took, and what the wild gave, read as the field book's counts since you set out.
 */

/** "As far as the deep". */
const REACHED_WORDS: Readonly<Record<WildDepth, string>> = {
  edge: 'As far as the edge',
  deep: 'As far as the deep',
  heart: 'Into the heart',
};

/** The field book's totals: everything found, every foe fought and beaten. */
export function tallyOf(book: FieldBook): VentureTally {
  const foes = Object.values(book.foes);
  return {
    found: Object.values(book.finds).reduce((sum, n) => sum + n, 0),
    fought: foes.reduce((sum, f) => sum + f.fought, 0),
    beaten: foes.reduce((sum, f) => sum + f.beaten, 0),
  };
}

export interface VentureEnd {
  /** "the deep woods". */
  readonly country: string;
  readonly run: MissionRun;
  readonly days: number;
  readonly book: FieldBook;
}

/** The card for a venture just over. */
export function ventureReport({ country, run, days, book }: VentureEnd): Report | null {
  const plan = run.venture;
  if (!plan) return null;
  const reached = plan.out ?? plan.depth;
  const turnedBack = depthsTo(reached).length < depthsTo(plan.depth).length;
  const now = tallyOf(book);
  const then = plan.tally ?? now;
  return {
    kind: 'venture-over',
    country,
    reached: turnedBack ? `${REACHED_WORDS[reached]}, then back` : REACHED_WORDS[reached],
    days,
    fought: now.fought - then.fought,
    beaten: now.beaten - then.beaten,
    found: now.found - then.found,
    road: debriefLines(run.ledger),
    text: 'You are back where you left the path.',
  };
}
