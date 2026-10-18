import type { FurnishingDef, FurnishingEffect, HomeDef, HomeRoom, Spot } from '@/content';
import { ownsFurniture } from '@/systems/housing';

import { homeNeeds } from '../actions/home';
import type { GameContext } from '../context';
import { placeHere } from '../ops';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/**
 * The lettings office: the ladder of homes (the one you live in stamped, the next ones open
 * with their rent or price, the rest sealed with what opens them) and the joiner's furniture,
 * each piece saying what it does at home.
 */

export interface HomeCard {
  readonly id: string;
  readonly name: string;
  readonly blurb: string;
  readonly spots: readonly Spot[];
  readonly rooms: readonly HomeRoom[];
  /** What its rooms and spots open, in words. */
  readonly opens: readonly string[];
  readonly current: boolean;
  /** Why it is sealed (not built yet, or what you still need), or null. */
  readonly sealed: string | null;
  readonly rent: { readonly label: string; readonly choice: Choice } | null;
  readonly buy: { readonly label: string; readonly choice: Choice } | null;
}

export interface FurnishingCard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly spot: string;
  readonly does: string;
  readonly comfort: number;
  readonly price: string;
  readonly owned: boolean;
  readonly buy: Choice;
}

export interface LettingsView {
  readonly name: string;
  readonly keeper: string;
  /** Where you live now, while it is the home you started in. */
  readonly startHome: string | null;
  readonly homes: readonly HomeCard[];
  readonly furniture: readonly FurnishingCard[];
}

export const SPOT_LABEL: Readonly<Record<Spot, string>> = {
  bed: 'The bed',
  desk: 'The desk',
  wall: 'The wall',
  corner: 'The corner',
  hearth: 'The hearth',
};

const ROOM_OPENS: Readonly<Record<HomeRoom, string>> = {
  garden: 'A garden: grow your own',
  yard: 'A yard: drill at home for less',
  guest: 'A guest room: a friend moves in',
};

/** What a piece does at home, in a few words for its chip. */
export function effectLine(effect: FurnishingEffect): string {
  switch (effect.kind) {
    case 'sleep':
      return `Sleep heals ${Math.round((effect.by - 1) * 100)}% more`;
    case 'nap':
      return `Naps give ${effect.energy} more energy`;
    case 'study':
      return `Scrolls studied ${Math.round((effect.by - 1) * 100)}% faster`;
    case 'guests':
      return `Dinners at home warm guests ${effect.bond} more`;
    case 'decor':
      return 'Comfort only';
  }
}

function homeCard(state: GameState, ctx: GameContext, home: HomeDef): HomeCard {
  const current = state.housing.homeId === home.id;
  const sealed = home.lockedReason ?? homeNeeds(state, home);
  const offer = (buy: boolean, label: string | null) =>
    label === null
      ? null
      : { label, choice: choice(state, ctx, { type: 'moveHome', homeId: home.id, buy }) };
  return {
    id: home.id,
    name: home.name,
    blurb: home.blurb,
    spots: home.spots,
    rooms: home.rooms,
    opens: [
      ...home.rooms.map((r) => ROOM_OPENS[r]),
      ...(home.spots.includes('hearth') ? ['A hearth to gather round'] : []),
    ],
    current,
    sealed: current ? null : sealed,
    rent: current
      ? null
      : offer(false, home.rentPerWeek ? `Rent, ${home.rentPerWeek} ryo a week` : null),
    buy: current ? null : offer(true, home.price ? `Buy, ${home.price} ryo` : null),
  };
}

function furnishingCard(state: GameState, ctx: GameContext, piece: FurnishingDef): FurnishingCard {
  return {
    id: piece.id,
    name: piece.name,
    description: piece.description,
    spot: SPOT_LABEL[piece.spot],
    does: effectLine(piece.effect),
    comfort: piece.comfort,
    price: piece.cost === undefined ? 'A gift' : `${piece.cost} ryo`,
    owned: ownsFurniture(state.housing, piece.id),
    buy: choice(state, ctx, { type: 'buyFurnishing', furnishingId: piece.id }),
  };
}

export function lettingsView(state: GameState, ctx: GameContext): LettingsView | null {
  const office = placeHere(state, ctx, 'lettings');
  if (!office) return null;
  return {
    name: office.name,
    keeper: office.keeper,
    startHome: state.housing.homeId
      ? null
      : (state.housing.lodging ?? placeHere(state, ctx, 'home')?.lodging ?? null),
    homes: office.homeIds.flatMap((id) => {
      const home = ctx.content.homes.get(id);
      return home ? [homeCard(state, ctx, home)] : [];
    }),
    furniture: office.furnishingIds.flatMap((id) => {
      const piece = ctx.content.furnishings.get(id);
      return piece ? [furnishingCard(state, ctx, piece)] : [];
    }),
  };
}
