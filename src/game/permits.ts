import { stageOf } from '@/systems/bonds';
import { RANKS, type Rank } from '@/systems/standing';
import { DISCIPLINES, gradeIndex, gradeOf, type TechniqueDef } from '@/systems/techniques';
import type { StatGrade } from '@/systems/stats';

import type { GameContext } from './context';
import { log } from './ops';
import { bondOf } from './people/cast';
import type { PersonDef } from '@/content';
import type { GameState } from './state';
import { waysOf } from './sensei/generate';
import { placeInText } from './placeName';

/**
 * Slips your sensei signs. The library permit opens its open shelves (the standard techniques
 * up to rank C) to a genin: your sensei signs it at a lesson once they trust you (their `permitStage`) and one of
 * your arts has reached grade C. Chūnin need no slip; the restricted stacks stay theirs. The
 * sealed archive (rank A and up) is for jōnin.
 */

export const LIBRARY_PERMIT = 'library';
/** Bond stage before a sensei signs it (2: friends), unless their ways say otherwise. */
export const PERMIT_BOND_STAGE = 2;
/** The grade one of your arts must reach first. */
export const PERMIT_GRADE: StatGrade = 'C';
/** The highest rank of technique on the open shelves. */
export const OPEN_SHELF_RANK: StatGrade = 'C';
/** The lowest rank that walks into the whole library without a slip. */
export const LIBRARY_RANK: Rank = 'chunin';

export const PERMIT_NEEDED =
  'Genin need a permit from their sensei for the open shelves. Yours signs one once they trust you and one of your arts has reached C.';
export const LIBRARY_LOCKED = 'The restricted stacks are for chūnin and above.';
/** The lowest rank of technique kept in the sealed archive… */
export const SEALED_SHELF_RANK: StatGrade = 'A';
/** …and the lowest rank that may read it. */
export const SEALED_RANK: Rank = 'jonin';
export const SEALED_LOCKED = 'The sealed archive is for jōnin and above.';

export function isChuninOrAbove(state: GameState): boolean {
  return RANKS.indexOf(state.standing.rank) >= RANKS.indexOf(LIBRARY_RANK);
}

export function hasLibraryPermit(state: GameState): boolean {
  return state.people.permits.includes(LIBRARY_PERMIT);
}

/** A standard technique of rank C or below: what a permit lets a genin read. */
export function onOpenShelf(def: TechniqueDef): boolean {
  return def.clan === undefined && gradeIndex(def.rank) <= gradeIndex(OPEN_SHELF_RANK);
}

/** A technique the library keeps in its sealed archive. */
export function inSealedArchive(def: TechniqueDef): boolean {
  return gradeIndex(def.rank) >= gradeIndex(SEALED_SHELF_RANK);
}

/** Why you can't read this library scroll, or null. */
export function libraryScrollAccess(state: GameState, def: TechniqueDef): string | null {
  if (inSealedArchive(def)) {
    return RANKS.indexOf(state.standing.rank) >= RANKS.indexOf(SEALED_RANK) ? null : SEALED_LOCKED;
  }
  if (isChuninOrAbove(state)) return null;
  if (!onOpenShelf(def)) return LIBRARY_LOCKED;
  return hasLibraryPermit(state) ? null : PERMIT_NEEDED;
}

/** Why you can't use the library at all (its desk, its open shelves), or null. */
export function libraryEntry(state: GameState): string | null {
  return isChuninOrAbove(state) || hasLibraryPermit(state) ? null : PERMIT_NEEDED;
}

function artAtGrade(state: GameState): boolean {
  return DISCIPLINES.some(
    (art) => gradeIndex(gradeOf(state.character.stats[art])) >= gradeIndex(PERMIT_GRADE),
  );
}

/** Whether your sensei signs the library permit at this lesson. */
export function permitDue(state: GameState, sensei: PersonDef): boolean {
  return (
    !isChuninOrAbove(state) &&
    !hasLibraryPermit(state) &&
    stageOf(bondOf(state, sensei.id).points) >=
      (waysOf(sensei)?.gatekeeping.permitStage ?? PERMIT_BOND_STAGE) &&
    artAtGrade(state)
  );
}

/** After a lesson: the permit, signed, if it is due. */
export function permitAfterLesson(
  state: GameState,
  ctx: GameContext,
  sensei: PersonDef,
): GameState {
  if (!permitDue(state, sensei)) return state;
  const library = ctx.content.locations.all
    .flatMap((l) => l.places)
    .find((p) => p.kind === 'library');
  const signed = {
    ...state,
    people: { ...state.people, permits: [...state.people.permits, LIBRARY_PERMIT] },
  };
  return log(signed, {
    heading: 'A library permit',
    text: `${sensei.name} signs a slip and hands it over. “Show them this at ${placeInText(library?.name ?? 'the library')}. The open shelves are yours now. The rest waits until you’ve earned the vest.”`,
    tone: 'success',
    chips: [{ label: 'Open shelves', tone: 'gain' }],
  });
}
