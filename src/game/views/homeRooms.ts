import { stageOf } from '@/systems/bonds';
import { isRipe } from '@/systems/housing';
import { seasonOf } from '@/systems/time';

import { GUEST_STAGE } from '../actions/homeRooms';
import type { GameContext } from '../context';
import { currentHome, hasRoom } from '../home/home';
import { bondOf, everyone, findPerson } from '../people/cast';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/**
 * The rooms a bigger home opens, as the home page shows them: the garden's beds (growing, ripe
 * or empty, and what will grow this season), the yard's drills, and the guest room (who is
 * staying, or the friends who could).
 */

export interface BedView {
  readonly crop: string | null;
  /** "Ready to pick", "Two days", or null when empty. */
  readonly state: string | null;
  readonly ripe: boolean;
  readonly pick: Choice | null;
}

export interface SeedOption {
  readonly name: string;
  readonly cost: number;
  /** Plant it in the first empty bed. */
  readonly plant: Choice | null;
}

export interface HomeRoomsView {
  readonly garden: {
    readonly beds: readonly BedView[];
    readonly seeds: readonly SeedOption[];
  } | null;
  readonly yard: readonly { readonly name: string; readonly train: Choice }[] | null;
  readonly guest: {
    readonly staying: string | null;
    readonly sendHome: Choice;
    readonly invite: readonly { readonly name: string; readonly choice: Choice }[];
  } | null;
}

const WORD = ['', 'One day', 'Two days', 'Three days', 'Four days', 'Five days', 'Six days'];

function gardenView(state: GameState, ctx: GameContext): HomeRoomsView['garden'] {
  if (!hasRoom(state, ctx, 'garden')) return null;
  const name = (id: string) => ctx.content.ingredients.get(id)?.name ?? id;
  const beds = state.housing.beds.map((bed, i): BedView => {
    const crop = bed && ctx.content.gardenCrops.find((c) => c.ingredientId === bed.ingredientId);
    if (!bed || !crop) return { crop: null, state: null, ripe: false, pick: null };
    const ripe = isRipe(bed, crop.days, state.time.day);
    const left = crop.days - (state.time.day - bed.plantedDay);
    return {
      crop: name(bed.ingredientId),
      state: ripe ? 'Ready to pick' : (WORD[left] ?? 'A while yet'),
      ripe,
      pick: ripe ? choice(state, ctx, { type: 'pickBed', bed: i }) : null,
    };
  });
  const empty = state.housing.beds.findIndex((b) => b === null);
  const season = seasonOf(state.time.day);
  const seeds = ctx.content.gardenCrops
    .filter((c) => c.seasons.includes(season))
    .map((c) => ({
      name: name(c.ingredientId),
      cost: c.seedCost,
      plant:
        empty < 0
          ? null
          : choice(state, ctx, { type: 'plantBed', bed: empty, ingredientId: c.ingredientId }),
    }));
  return { beds, seeds };
}

function yardView(state: GameState, ctx: GameContext): HomeRoomsView['yard'] {
  if (!hasRoom(state, ctx, 'yard')) return null;
  return (currentHome(state, ctx).def?.yardTrainingIds ?? []).flatMap((id) => {
    const def = ctx.content.training.get(id);
    return def
      ? [
          {
            name: def.name,
            train: choice(state, ctx, { type: 'train', trainingId: id, yard: true }),
          },
        ]
      : [];
  });
}

function guestView(state: GameState, ctx: GameContext): HomeRoomsView['guest'] {
  if (!hasRoom(state, ctx, 'guest')) return null;
  const staying = state.housing.guestId && findPerson(state, ctx, state.housing.guestId);
  const friends = staying
    ? []
    : everyone(state, ctx).filter((p) => stageOf(bondOf(state, p.id).points) >= GUEST_STAGE);
  return {
    staying: staying ? staying.name : null,
    sendHome: choice(state, ctx, { type: 'sendGuestHome' }),
    invite: friends.map((p) => ({
      name: p.name,
      choice: choice(state, ctx, { type: 'inviteGuest', personId: p.id }),
    })),
  };
}

export function homeRoomsView(state: GameState, ctx: GameContext): HomeRoomsView {
  return {
    garden: gardenView(state, ctx),
    yard: yardView(state, ctx),
    guest: guestView(state, ctx),
  };
}
