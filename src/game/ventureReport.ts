import type { FieldBook } from '@/systems/collections';
import type { MissionRun, VenturePlan, VentureTally, WildDepth } from '@/systems/missions';

import { debriefLines } from './debrief';
import type { DebriefLine, Report } from './reports';

/**
 * What a venture leaves on its card when you come out (`game/ventures.ts`): how far in you got,
 * the days it took, and what the wild gave, read as the field book's counts since you set out.
 */

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
  readonly plan: VenturePlan;
  readonly ledger: MissionRun['ledger'];
  readonly days: number;
  readonly book: FieldBook;
}

/** The card for a venture just over. A plan with `out` was turned back short of its depth. */
export function ventureReport({ country, plan, ledger, days, book }: VentureEnd): Report {
  const reached = plan.out ?? plan.depth;
  const road: readonly DebriefLine[] = debriefLines(ledger);
  const card = {
    kind: 'venture-over' as const,
    country,
    reached: plan.out ? `${REACHED_WORDS[reached]}, then back` : REACHED_WORDS[reached],
    days,
    road,
  };
  return plan.tally ? { ...card, gave: since(plan.tally, tallyOf(book)) } : card;
}

function since(then: VentureTally, now: VentureTally): VentureTally {
  return {
    found: now.found - then.found,
    fought: now.fought - then.fought,
    beaten: now.beaten - then.beaten,
  };
}
