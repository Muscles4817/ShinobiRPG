import { VERSUS_GROUPS, type VersusFighter } from './roster';

/**
 * The order the versus roster is listed in: by rank (kage down to foes, strongest first within
 * each, as the roster is built), by fighting power across everyone either way, or by name.
 */

export const VERSUS_SORTS = ['rank', 'strongest', 'weakest', 'name'] as const;
export type VersusSort = (typeof VERSUS_SORTS)[number];

export interface SortOption {
  readonly value: VersusSort;
  readonly label: string;
}

const SORT_LABELS: Readonly<Record<VersusSort, string>> = {
  rank: 'By rank',
  strongest: 'Strongest first',
  weakest: 'Weakest first',
  name: 'By name',
};

export const SORT_OPTIONS: readonly SortOption[] = VERSUS_SORTS.map((value) => ({
  value,
  label: SORT_LABELS[value],
}));

const byName = (a: VersusFighter, b: VersusFighter) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

const ORDER: Readonly<Record<VersusSort, (a: VersusFighter, b: VersusFighter) => number>> = {
  rank: (a, b) =>
    VERSUS_GROUPS.indexOf(a.group) - VERSUS_GROUPS.indexOf(b.group) || b.power - a.power,
  strongest: (a, b) => b.power - a.power || byName(a, b),
  weakest: (a, b) => a.power - b.power || byName(a, b),
  name: byName,
};

/** The fighters in the chosen order, as a new list. */
export function sortRoster(fighters: readonly VersusFighter[], sort: VersusSort): VersusFighter[] {
  return [...fighters].sort(ORDER[sort]);
}
