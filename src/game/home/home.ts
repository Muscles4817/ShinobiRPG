import {
  FIRST_HOME_SPOTS,
  type FurnishingDef,
  type HomeDef,
  type HomeRoom,
  type Spot,
} from '@/content';

import type { GameContext } from '../context';
import { placeHere } from '../ops';
import type { GameState } from '../state';

/**
 * The home you live in, as the game reads it: which rung of the ladder it is, its spots and
 * rooms, whether you are in it, what its furniture adds at each hook (`FurnishingEffect`) and
 * how much like home it feels. Furniture counts only while you are at home.
 */

export interface CurrentHome {
  readonly def: HomeDef | null;
  readonly spots: readonly Spot[];
  readonly rooms: readonly HomeRoom[];
}

export function currentHome(state: GameState, ctx: GameContext): CurrentHome {
  const def = state.housing.homeId ? (ctx.content.homes.get(state.housing.homeId) ?? null) : null;
  return { def, spots: def?.spots ?? FIRST_HOME_SPOTS, rooms: def?.rooms ?? [] };
}

export function hasRoom(state: GameState, ctx: GameContext, room: HomeRoom): boolean {
  return currentHome(state, ctx).rooms.includes(room);
}

/** Whether you are at the home you live in now. */
export function atHome(state: GameState, ctx: GameContext): boolean {
  return placeHere(state, ctx, 'home')?.id === state.housing.placeId;
}

/** The pieces standing in the home's spots now. */
export function placedPieces(state: GameState, ctx: GameContext): FurnishingDef[] {
  const { spots } = currentHome(state, ctx);
  return spots.flatMap((spot) => {
    const id = state.housing.placed[spot];
    const piece = id === undefined ? undefined : ctx.content.furnishings.get(id);
    return piece ? [piece] : [];
  });
}

export interface Comforts {
  /** Multiplies a night's healing at home. */
  readonly sleep: number;
  /** Added to a nap's energy at home. */
  readonly nap: number;
  /** Multiplies scroll study at home. */
  readonly study: number;
  /** Added to the bond a dinner at home is worth. */
  readonly guests: number;
}

const NO_COMFORTS: Comforts = { sleep: 1, nap: 0, study: 1, guests: 0 };

/** What the furniture adds at each hook, if you are at home; nothing elsewhere. */
export function comforts(state: GameState, ctx: GameContext): Comforts {
  if (!atHome(state, ctx)) return NO_COMFORTS;
  return placedPieces(state, ctx).reduce<Comforts>((all, piece) => {
    const e = piece.effect;
    switch (e.kind) {
      case 'sleep':
        return { ...all, sleep: all.sleep * e.by };
      case 'nap':
        return { ...all, nap: all.nap + e.energy };
      case 'study':
        return { ...all, study: all.study * e.by };
      case 'guests':
        return { ...all, guests: all.guests + e.bond };
      case 'decor':
        return all;
    }
  }, NO_COMFORTS);
}

/** How like home it feels, by the comfort of what stands in it. */
export const COMFORT_STEPS = ['Bare', 'Lived-in', 'Comfortable', 'Homely', 'A real home'] as const;
const COMFORT_AT = [0, 2, 5, 8, 11] as const;

export function comfortStep(state: GameState, ctx: GameContext): number {
  const total = placedPieces(state, ctx).reduce((sum, p) => sum + p.comfort, 0);
  return COMFORT_AT.filter((at) => total >= at).length - 1;
}

/** What a dinner you host at home is worth on top: the table, and a place that feels like home. */
export function homeWelcome(state: GameState, ctx: GameContext): number {
  return atHome(state, ctx) ? comforts(state, ctx).guests + comfortStep(state, ctx) : 0;
}
