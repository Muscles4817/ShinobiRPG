import { scrollIds } from '@/systems/inventory';
import { STAT_INFO } from '@/systems/stats';

import { STUDY_ENERGY_COST } from '../actions/study';
import type { GameContext } from '../context';
import { placeHere } from '../ops';
import { libraryAccess, readingBlocker } from '../shelves';
import type { GameState } from '../state';
import { scrollOf, sortScrolls, type Scroll } from './academy';
import type { Discipline } from './common';

/**
 * The library's stacks, shelved by art (with what you're reading pulled out), and the reading
 * desk for scrolls you own, which also sits in your room at home.
 */

export interface Stack {
  readonly discipline: Discipline;
  readonly label: string;
  readonly scrolls: readonly Scroll[];
}

export interface LibraryView {
  readonly name: string;
  readonly energyCost: number;
  /** Why the stacks are shut to you ("for chūnin and above"), or null. */
  readonly locked: string | null;
  /** How many scrolls the stacks keep that you don't know yet. */
  readonly unread: number;
  readonly studying: readonly Scroll[];
  /** The rest of the stacks, one shelf per art. */
  readonly stacks: readonly Stack[];
  readonly desk: ScrollDesk;
}

export interface ScrollDesk {
  /** Scrolls you own and haven't learned yet. */
  readonly scrolls: readonly Scroll[];
  /** Why you can't read them here, or null. */
  readonly blocker: string | null;
}

export function scrollDesk(state: GameState, ctx: GameContext): ScrollDesk {
  const scrolls = scrollIds(state.inventory)
    .filter((id) => !state.techniques.known.includes(id))
    .map((id) => ctx.content.techniques.require(id))
    .map((def) => scrollOf(state, ctx, def, { action: 'studyScroll', source: 'scroll' }));
  const sorted = sortScrolls(scrolls);
  return {
    scrolls: [...sorted.studying, ...sorted.ready, ...sorted.comingUp],
    blocker: readingBlocker(state, ctx),
  };
}

function shelve(scrolls: readonly Scroll[]): Stack[] {
  const arts = [...new Set(scrolls.map((s) => s.discipline))];
  return arts.map((discipline) => ({
    discipline,
    label: STAT_INFO[discipline].label,
    scrolls: scrolls.filter((s) => s.discipline === discipline),
  }));
}

export function libraryView(state: GameState, ctx: GameContext): LibraryView | null {
  const place = placeHere(state, ctx, 'library');
  if (!place) return null;
  const scrolls = place.techniqueIds
    .filter((id) => !state.techniques.known.includes(id))
    .map((id) =>
      scrollOf(state, ctx, ctx.content.techniques.require(id), {
        action: 'study',
        source: 'library',
      }),
    );
  const sorted = sortScrolls(scrolls);
  return {
    name: place.name,
    energyCost: STUDY_ENERGY_COST,
    locked: libraryAccess(state),
    unread: scrolls.length,
    studying: sorted.studying,
    stacks: shelve([...sorted.ready, ...sorted.comingUp]),
    desk: scrollDesk(state, ctx),
  };
}
