import { STAT_GRADES, type StatGrade } from '@/systems/stats';

import { VERSUS_GROUPS, type VersusFighter, type VersusGroup } from './roster';

/**
 * Narrowing the versus roster so a pick is never a list of a hundred and sixty names: by rank,
 * a shinobi's village and clan, a foe's kind, fighting power and a name typed in. Each facet
 * offers only the values that would still find someone given the others (with how many), so a
 * filter never leads to an empty list unless the search does.
 */

export type GroupChoice = VersusGroup | 'all';

export interface VersusFilter {
  readonly group: GroupChoice;
  readonly village: string | null;
  readonly clan: string | null;
  readonly kind: string | null;
  readonly grade: StatGrade | null;
  /** Typed text, matched against name, title, village, clan and kind, accents ignored. */
  readonly query: string;
}

export const OPEN_FILTER: VersusFilter = {
  group: 'all',
  village: null,
  clan: null,
  kind: null,
  grade: null,
  query: '',
};

export interface FacetOption<T extends string = string> {
  readonly value: T;
  readonly count: number;
}

/** What each facet may still be set to. A facet with nothing to choose between is empty. */
export interface VersusFacets {
  readonly groups: readonly FacetOption<GroupChoice>[];
  readonly villages: readonly FacetOption[];
  readonly clans: readonly FacetOption[];
  readonly kinds: readonly FacetOption[];
  /** Strongest first. */
  readonly grades: readonly FacetOption<StatGrade>[];
}

type Facet = 'group' | 'village' | 'clan' | 'kind' | 'grade';

/** Folded for matching: lower case, macrons and other marks dropped ("Jōnin" ~ "jonin"). */
function fold(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function matchesQuery(fighter: VersusFighter, query: string): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = fold(
    [fighter.name, fighter.title, fighter.village, fighter.clan, fighter.kind].join(' '),
  );
  return words.every((w) => haystack.includes(w));
}

function passes(fighter: VersusFighter, filter: VersusFilter, skip: Facet | null): boolean {
  const facets: Readonly<Record<Facet, boolean>> = {
    group: filter.group === 'all' || fighter.group === filter.group,
    village: filter.village === null || fighter.village === filter.village,
    clan: filter.clan === null || fighter.clan === filter.clan,
    kind: filter.kind === null || fighter.kind === filter.kind,
    grade: filter.grade === null || fighter.grade === filter.grade,
  };
  const facetsHold = (Object.keys(facets) as Facet[]).every((f) => f === skip || facets[f]);
  return facetsHold && matchesQuery(fighter, filter.query);
}

/** The roster as the filter leaves it, in roster order. */
export function filterRoster(
  roster: readonly VersusFighter[],
  filter: VersusFilter,
): VersusFighter[] {
  return roster.filter((f) => passes(f, filter, null));
}

/** Values in first-seen order with their counts; the current value stays even at nought. */
function optionsOf<T extends string>(
  values: readonly (T | null)[],
  current: T | null,
): FacetOption<T>[] {
  const counts = new Map<T, number>();
  if (current !== null) counts.set(current, 0);
  for (const v of values) if (v !== null) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts].map(([value, count]) => ({ value, count }));
}

/** A facet worth showing: two or more values, or one already chosen. */
function worthShowing<T extends string>(options: FacetOption<T>[], current: T | null) {
  return options.length > 1 || current !== null ? options : [];
}

function facetOf(
  roster: readonly VersusFighter[],
  filter: VersusFilter,
  facet: Exclude<Facet, 'group' | 'grade'>,
): FacetOption[] {
  const open = roster.filter((f) => passes(f, filter, facet));
  const values = open.map((f) => f[facet]);
  const sorted = optionsOf(values, filter[facet]).sort((a, b) => a.value.localeCompare(b.value));
  return worthShowing(sorted, filter[facet]);
}

/** What each facet may be set to, given the others. */
export function versusFacets(roster: readonly VersusFighter[], filter: VersusFilter): VersusFacets {
  const byGroup = roster.filter((f) => passes(f, filter, 'group'));
  const all: FacetOption<GroupChoice> = { value: 'all', count: byGroup.length };
  const ranks = VERSUS_GROUPS.map((g): FacetOption<GroupChoice> => ({
    value: g,
    count: byGroup.filter((f) => f.group === g).length,
  }));
  const groups = [all, ...ranks].filter((o) => o.count > 0 || o.value === filter.group);
  const byGrade = roster.filter((f) => passes(f, filter, 'grade'));
  const grades = [...STAT_GRADES]
    .reverse()
    .map((g) => ({ value: g, count: byGrade.filter((f) => f.grade === g).length }))
    .filter((o) => o.count > 0 || o.value === filter.grade);
  return {
    groups,
    villages: facetOf(roster, filter, 'village'),
    clans: facetOf(roster, filter, 'clan'),
    kinds: facetOf(roster, filter, 'kind'),
    grades: worthShowing(grades, filter.grade),
  };
}

/**
 * The filter on another rank: a foe has no village or clan and a shinobi no kind, so the
 * facets that no longer apply are let go.
 */
export function withGroup(filter: VersusFilter, group: GroupChoice): VersusFilter {
  if (group === 'Foes') return { ...filter, group, village: null, clan: null };
  if (group === 'all') return { ...filter, group };
  return { ...filter, group, kind: null };
}

/** Whether anything narrows the list. */
function isFiltered(filter: VersusFilter): boolean {
  return (
    filter.group !== 'all' ||
    filter.village !== null ||
    filter.clan !== null ||
    filter.kind !== null ||
    filter.grade !== null ||
    filter.query.trim() !== ''
  );
}

/** The roster as the picker shows it: who the filter finds, and what it may be set to next. */
export interface RosterBrowse extends VersusFacets {
  readonly found: readonly VersusFighter[];
  /** Whether anything narrows the list (so it can be cleared). */
  readonly filtered: boolean;
}

export function browseRoster(roster: readonly VersusFighter[], filter: VersusFilter): RosterBrowse {
  return {
    ...versusFacets(roster, filter),
    found: filterRoster(roster, filter),
    filtered: isFiltered(filter),
  };
}
