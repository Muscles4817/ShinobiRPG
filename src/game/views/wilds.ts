import { listed } from '@/core';
import type { Biome } from '@/content';
import { gatheredToday, inSeason, recognised, type Find } from '@/systems/cooking';

import { daysToWin } from '@/systems/companions';

import { TRACK_ENERGY } from '../actions/finding';
import { trackingChance, wildHere } from '../companions/wild';
import type { GameContext } from '../context';
import { gatherMoment, wildsHere } from '../gathering';
import { hardWorkEnergy } from '../profile';
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

/** Signs of a wild one living here, for someone without a companion, and tracking it. */
export interface WildSign {
  readonly kind: string;
  readonly sign: string;
  /** Good days of tracking so far, and how many it takes. */
  readonly days: number;
  readonly needed: number;
  /** How a day's tracking is likely to go, by your eyes, in words. */
  readonly odds: string;
  /** What a day's tracking costs you in energy. */
  readonly energy: number;
  readonly track: Choice;
}

export interface WildsView {
  readonly name: string;
  readonly blurb: string;
  readonly biome: Biome;
  readonly forage: Choice & { readonly about: WhatsAbout };
  readonly spots: readonly FishingSpotView[];
  readonly wild: WildSign | null;
}

/** Below this a day's tracking more often goes cold than not; above the next, it mostly gets closer. */
const ODDS_POOR = 0.4;
const ODDS_GOOD = 0.65;

function oddsLine(chance: number): string {
  if (chance < ODDS_POOR) return 'Your eyes lose the trail more often than not.';
  if (chance < ODDS_GOOD) return 'Some days you’ll keep the trail, some days not.';
  return 'Your eyes keep the trail more often than not.';
}

function wildSign(state: GameState, ctx: GameContext, placeId: string): WildSign | null {
  const kind = wildHere(state, ctx, placeId);
  if (!kind) return null;
  const tracking = state.companions.tracking;
  return {
    kind: kind.name,
    sign: kind.wild.sign,
    days: tracking?.kindId === kind.id ? tracking.visits : 0,
    needed: daysToWin(kind.temperament),
    odds: oddsLine(trackingChance(state)),
    energy: hardWorkEnergy(state.character, ctx, TRACK_ENERGY),
    track: choice(state, ctx, { type: 'trackWild', placeId }),
  };
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
    wild: wildSign(state, ctx, placeId),
  };
}

/** The village screen's line for a wild place: searched today, or what's about. */
export function wildsLine(state: GameState, ctx: GameContext, placeId: string): string {
  const place = wildsHere(state, ctx, placeId);
  if (!place) return '';
  const wild = wildHere(state, ctx, placeId);
  if (wild) return `Signs of a ${wild.name.toLowerCase()}`;
  if (gatheredToday(state.cooking.gathered, place.id, state.time.day)) return 'Searched today';
  const { known } = whatsAbout(state, ctx, place.finds);
  return known.length > 0 ? `${listed(known.slice(0, 2))} about` : place.blurb;
}
