import { FIELD_BOOK_PAGES } from '@/content';
import { RANKS } from '@/systems/standing';
import { formatDate } from '@/systems/time';

import type { GameContext } from '../context';
import { findPerson } from '../people/cast';
import type { GameState } from '../state';

/**
 * The keepsake shelf: things you didn't buy, read from what already happened. A memory shared
 * with someone (`village.memories`), a race won against your rival, the vest of each rank you
 * have reached, each full page of the field book; and an empty space for what comes next. Nothing here does anything in a fight.
 */

export interface Keepsake {
  readonly name: string;
  readonly line: string;
}

export interface KeepsakeShelf {
  readonly keepsakes: readonly Keepsake[];
  /** What will leave the next one, or null. */
  readonly next: string | null;
}

const VEST: Readonly<Partial<Record<(typeof RANKS)[number], Keepsake>>> = {
  chunin: {
    name: 'A chūnin vest, folded',
    line: 'The first one. You keep it for the day it fitted.',
  },
  jonin: { name: 'A jōnin’s flak jacket', line: 'Heavier than it looks. So is everything now.' },
};

function memories(state: GameState, ctx: GameContext): Keepsake[] {
  return state.village.memories.map((m) => {
    const person = findPerson(state, ctx, m.personId);
    const text = m.text.charAt(0).toUpperCase() + m.text.slice(1);
    const date = formatDate({ day: m.day, slot: 0 }).replace(/^Year \d+, /, '');
    return { name: text, line: person ? `With ${person.name}, ${date}.` : `${date}.` };
  });
}

function rivalry(state: GameState, ctx: GameContext): Keepsake[] {
  const rival = state.rival;
  const person = rival && findPerson(state, ctx, rival.personId);
  if (!rival || !person || rival.races.you === 0) return [];
  return [
    {
      name: 'A frayed bell rope',
      line: `From the bell tower. You touched it before ${person.name} did.`,
    },
  ];
}

/** A keepsake for each full page of the field book, in the order the pages filled. */
function fullPages(state: GameState, ctx: GameContext): Keepsake[] {
  return state.fieldBook.rewarded.flatMap((id) => {
    const page = FIELD_BOOK_PAGES.find((p) => p === id);
    return page ? [ctx.content.fieldBook[page].keepsake] : [];
  });
}

export function keepsakeShelf(state: GameState, ctx: GameContext): KeepsakeShelf {
  const reached = RANKS.slice(0, RANKS.indexOf(state.standing.rank) + 1);
  const vests = reached.flatMap((r) => VEST[r] ?? []);
  const keepsakes = [
    ...vests,
    ...rivalry(state, ctx),
    ...fullPages(state, ctx),
    ...memories(state, ctx),
  ];
  const next = VEST[RANKS[RANKS.indexOf(state.standing.rank) + 1] ?? 'kage'];
  return {
    keepsakes,
    next: next ? 'Your next promotion will leave something here.' : null,
  };
}
