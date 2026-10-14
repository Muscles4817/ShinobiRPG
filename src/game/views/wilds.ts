import type { Biome } from '@/content';
import { gatheredToday, inSeason, recognised, type Find } from '@/systems/cooking';

import type { GameContext } from '../context';
import { gatherMoment, wildsHere } from '../gathering';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/**
 * A wild place: foraging, with what's in season, and each fishing spot with what bites at this
 * hour. Finds you wouldn't know for food yet show only as a count.
 */

export interface WhatsAbout {
  /** Names of what could turn up now that you'd know. */
  readonly known: readonly string[];
  /** How many more things are about that you wouldn't know for food yet. */
  readonly strange: number;
}

export interface FishingSpotView extends Choice {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly bites: WhatsAbout;
}

export interface WildsView {
  readonly name: string;
  readonly blurb: string;
  readonly biome: Biome;
  readonly forage: Choice & { readonly about: WhatsAbout };
  readonly spots: readonly FishingSpotView[];
}

function whatsAbout(state: GameState, ctx: GameContext, finds: readonly Find[]): WhatsAbout {
  const moment = gatherMoment(state);
  const now = finds.filter((f) => inSeason(f, moment));
  const names = (fs: readonly Find[]) => [
    ...new Set(fs.map((f) => ctx.content.ingredients.require(f.ingredientId).name)),
  ];
  return {
    known: names(now.filter((f) => recognised(f, moment.grade))),
    strange: now.filter((f) => !recognised(f, moment.grade)).length,
  };
}

export function wildsView(state: GameState, ctx: GameContext, placeId: string): WildsView | null {
  const place = wildsHere(state, ctx, placeId);
  if (!place) return null;
  return {
    name: place.name,
    blurb: place.blurb,
    biome: place.biome,
    forage: {
      ...choice(state, ctx, { type: 'forage', placeId }),
      about: whatsAbout(state, ctx, place.finds),
    },
    spots: (place.spots ?? []).map((spot) => ({
      ...choice(state, ctx, { type: 'fish', placeId, spotId: spot.id }),
      id: spot.id,
      name: spot.name,
      description: spot.description,
      bites: whatsAbout(state, ctx, spot.catches),
    })),
  };
}

/** The village screen's line for a wild place: searched today, or what's about. */
export function wildsLine(state: GameState, ctx: GameContext, placeId: string): string {
  const place = wildsHere(state, ctx, placeId);
  if (!place) return '';
  if (gatheredToday(state.cooking.gathered, place.id, state.time.day)) return 'Searched today';
  const { known } = whatsAbout(state, ctx, place.finds);
  return known.length > 0 ? `${known.slice(0, 2).join(' and ')} about` : place.blurb;
}
