import { STAT_GRADES, STAT_INFO, type StatGrade } from '@/systems/stats';
import { DISCIPLINES, ELEMENTS, type Element } from '@/systems/techniques';

import type { Discipline } from '../views/common';
import { TECHNIQUE_KIND_LABEL, TECHNIQUE_KINDS, type TechniqueKind } from './kinds';

/**
 * Finding a technique among many: by art, rank, element and kind, by name, and only the ready
 * ones if asked, a page at a time. Each facet counts what the other filters leave, so no
 * choice leads to an empty list. Any list of techniques that says those things can be browsed:
 * the editor's choices for a fighter, your own Jutsu deck.
 */

/** What a technique must say about itself to be found. */
export interface FindableTechnique {
  readonly name: string;
  readonly discipline: Discipline;
  readonly rank: StatGrade;
  readonly element: Element | null;
  readonly kinds: readonly TechniqueKind[];
  /** Usable as it stands (their grades carry it; you know it): what "ready only" keeps. */
  readonly ready: boolean;
}

/** How many techniques a page shows, unless the screen asks for more. */
export const TECHNIQUE_PAGE_SIZE = 12;

export interface TechniqueFilter {
  readonly art: Discipline | 'all';
  readonly rank: StatGrade | 'all';
  /** An element, `none` for techniques of no element, or all. */
  readonly element: Element | 'none' | 'all';
  readonly kind: TechniqueKind | 'all';
  readonly query: string;
  /** Only the ready ones (`FindableTechnique.ready`). */
  readonly readyOnly: boolean;
}

export const OPEN_TECHNIQUE_FILTER: TechniqueFilter = {
  art: 'all',
  rank: 'all',
  element: 'all',
  kind: 'all',
  query: '',
  readyOnly: false,
};

export interface TechniqueFacetOption<V extends string> {
  readonly value: V;
  readonly label: string;
  /** How many the other filters leave with this value. */
  readonly count: number;
}

export interface TechniqueBrowse<T extends FindableTechnique = FindableTechnique> {
  readonly arts: readonly TechniqueFacetOption<Discipline>[];
  readonly ranks: readonly TechniqueFacetOption<StatGrade>[];
  readonly elements: readonly TechniqueFacetOption<Element | 'none'>[];
  readonly kinds: readonly TechniqueFacetOption<TechniqueKind>[];
  /** Everything the filter lets through. */
  readonly found: number;
  /** Whether anything is narrowed from the open filter. */
  readonly filtered: boolean;
  /** The page shown (clamped), from 0, and how many there are (at least one). */
  readonly page: number;
  readonly pages: number;
  readonly shown: readonly T[];
  readonly pageSize: number;
}

const FACETS = ['art', 'rank', 'element', 'kind'] as const;
type Facet = (typeof FACETS)[number];

/** Whether a technique fits each facet's choice (`all` fits everything). */
const FITS: Readonly<Record<Facet, (t: FindableTechnique, f: TechniqueFilter) => boolean>> = {
  art: (t, f) => f.art === 'all' || t.discipline === f.art,
  rank: (t, f) => f.rank === 'all' || t.rank === f.rank,
  element: (t, f) => f.element === 'all' || (t.element ?? 'none') === f.element,
  kind: (t, f) => f.kind === 'all' || t.kinds.includes(f.kind),
};

/** Whether it passes the filter, leaving one facet out to count that facet's choices. */
function passes(t: FindableTechnique, f: TechniqueFilter, except: Facet | null): boolean {
  if (f.readyOnly && !t.ready) return false;
  const needle = f.query.trim().toLowerCase();
  if (needle !== '' && !t.name.toLowerCase().includes(needle)) return false;
  return FACETS.every((facet) => facet === except || FITS[facet](t, f));
}

/** The values of a facet that something left by the other filters has, with their counts. */
function facet<V extends string>(
  left: readonly FindableTechnique[],
  values: readonly V[],
  has: (t: FindableTechnique, v: V) => boolean,
  label: (v: V) => string,
): TechniqueFacetOption<V>[] {
  return values
    .map((value) => ({
      value,
      label: label(value),
      count: left.filter((t) => has(t, value)).length,
    }))
    .filter((o) => o.count > 0);
}

function elementLabel(e: Element | 'none'): string {
  return e === 'none' ? 'No element' : `${e.charAt(0).toUpperCase()}${e.slice(1)}`;
}

/** The techniques the filter lets through, a page of them, and each facet's choices. */
export function browseTechniques<T extends FindableTechnique>(
  list: readonly T[],
  filter: TechniqueFilter,
  page: number,
  pageSize = TECHNIQUE_PAGE_SIZE,
): TechniqueBrowse<T> {
  const left = (except: Facet) => list.filter((t) => passes(t, filter, except));
  const found = list.filter((t) => passes(t, filter, null));
  const pages = Math.max(1, Math.ceil(found.length / pageSize));
  const at = Math.min(Math.max(0, page), pages - 1);
  return {
    arts: facet(
      left('art'),
      DISCIPLINES,
      (t, v) => t.discipline === v,
      (v) => STAT_INFO[v].label,
    ),
    ranks: facet(
      left('rank'),
      STAT_GRADES,
      (t, v) => t.rank === v,
      (v) => `Rank ${v}`,
    ),
    elements: facet(
      left('element'),
      [...ELEMENTS, 'none' as const],
      (t, v) => (t.element ?? 'none') === v,
      elementLabel,
    ),
    kinds: facet(
      left('kind'),
      TECHNIQUE_KINDS,
      (t, v) => t.kinds.includes(v),
      (v) => TECHNIQUE_KIND_LABEL[v],
    ),
    found: found.length,
    filtered:
      filter.readyOnly ||
      filter.query.trim() !== '' ||
      FACETS.some((facet) => filter[facet] !== 'all'),
    page: at,
    pages,
    shown: found.slice(at * pageSize, (at + 1) * pageSize),
    pageSize,
  };
}
