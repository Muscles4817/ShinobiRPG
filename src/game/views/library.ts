import { scrollIds } from '@/systems/inventory';
import { STAT_INFO } from '@/systems/stats';

import { STUDY_ENERGY_COST } from '../actions/study';
import type { GameContext } from '../context';
import { placeHere } from '../ops';
import { libraryEntry, libraryScrollAccess } from '../permits';
import { readingBlocker } from '../shelves';
import type { GameState } from '../state';
import { scrollOf, sortScrolls, type Scroll } from './academy';
import type { Discipline } from './common';
import { playerCombatant } from '../combatants';

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
  /** Why the library is shut to you (no permit yet), or null. */
  readonly locked: string | null;
  /** Scrolls kept in the restricted stacks, for chūnin, that you can't read yet. */
  readonly restricted: number;
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
    .map((def) =>
      scrollOf(state, ctx, def, { reading: { action: 'studyScroll', source: 'scroll' } }),
    );
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
  const you = playerCombatant(state, ctx);
  const reading = { action: 'study', source: 'library' } as const;
  const unread = place.techniqueIds
    .filter((id) => !state.techniques.known.includes(id))
    .map((id) => ctx.content.techniques.require(id));
  const open = unread.filter((def) => libraryScrollAccess(state, def) === null);
  const scrolls = open.map((def) => scrollOf(state, ctx, def, { reading, you }));
  const sorted = sortScrolls(scrolls);
  return {
    name: place.name,
    energyCost: STUDY_ENERGY_COST,
    locked: libraryEntry(state),
    restricted: unread.length - open.length,
    unread: unread.length,
    studying: sorted.studying,
    stacks: shelve([...sorted.ready, ...sorted.comingUp]),
    desk: scrollDesk(state, ctx),
  };
}
