import type { PlaceDef } from '@/content';
import { KEEP_LIMIT } from '@/systems/puppets';

import { compoundAccess } from '../compounds';
import type { GameContext } from '../context';
import { atHome, currentHome } from '../home/home';
import { currentLocation } from '../ops';
import type { GameState } from '../state';

/**
 * Where puppet work is done: your own bench at home, or a puppet-maker's bench you are let in
 * to (a place with `puppetBench`; a clan's workshop only as its gate allows). A workshop's bench
 * mends twice as much a session and lets you build a frame a grade past your craft, with a
 * master's tools and a master looking on. How many puppets you keep is your home's room.
 */

/** How much more a session at a workshop's bench mends than one at home. */
export const WORKSHOP_MENDS = 2;
/** Grades of frame past your craft a workshop's bench lets you build. */
export const WORKSHOP_REACH = 1;

/** The workshop here whose bench you are let in to, or null. */
export function workshopHere(state: GameState, ctx: GameContext): PlaceDef | null {
  return (
    currentLocation(state, ctx).places.find(
      (p) =>
        p.puppetBench === true && (p.kind !== 'compound' || compoundAccess(state, ctx, p) === null),
    ) ?? null
  );
}

/** Whether you stand at a workshop's bench you are let in to. */
export function atWorkshop(state: GameState, ctx: GameContext): boolean {
  return workshopHere(state, ctx) !== null;
}

/** Whether you are at a bench at all: your own at home, or a workshop's. */
export function atABench(state: GameState, ctx: GameContext): boolean {
  return atHome(state, ctx) || atWorkshop(state, ctx);
}

/** How many puppets your home has room to keep. */
export function puppetRoom(state: GameState, ctx: GameContext): number {
  return Math.max(KEEP_LIMIT, currentHome(state, ctx).def?.puppets ?? KEEP_LIMIT);
}
