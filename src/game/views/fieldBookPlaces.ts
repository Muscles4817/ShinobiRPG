import type { IconId, LocationDef, LocationKind } from '@/content';

import { hasBeenTo, knowsOf } from '../atlas';
import type { GameContext } from '../context';
import { placesOnTheBook } from '../fieldBook/places';
import type { GameState } from '../state';
import type { FieldEntry } from './fieldBookEntries';
import { regionCaption } from './journeyView';

/**
 * The places page of the field book: every place of the pack you can stand in. One you've been
 * to gives its epithet; one you've heard of is a name on your map you've yet to walk to; and one
 * you've never heard of gives only the road that reaches it, never its name.
 */

const KIND_WORDS: Readonly<Record<LocationKind, string>> = {
  village: 'A hidden village',
  city: 'A city',
  town: 'A town',
  wild: 'Wild country',
  landmark: 'A landmark',
};

const KIND_ICONS: Readonly<Record<LocationKind, IconId>> = {
  village: 'lantern',
  city: 'house',
  town: 'house',
  wild: 'tree',
  landmark: 'torii',
};

/** The country the roads to a place cross on their last stretch in: "the forest track". */
function roadsIn(ctx: GameContext, id: string): string[] {
  const regions = ctx.content.routes.all.flatMap((r) => {
    if (r.to === id) return r.legs.at(-1)?.region ?? [];
    return r.from === id ? (r.legs[0]?.region ?? []) : [];
  });
  return [...new Set(regions)].map((region) => regionCaption(region).toLowerCase());
}

/** Where to look for a place you've never heard of, from the roads that reach it. */
function hint(ctx: GameContext, place: LocationDef): string {
  const roads = roadsIn(ctx, place.id);
  const where = roads.length > 0 ? `, somewhere along ${roads.join(' or ')}` : '';
  return `${KIND_WORDS[place.kind]}${where}.`;
}

function entryOf(state: GameState, ctx: GameContext, place: LocationDef): FieldEntry {
  const icon = KIND_ICONS[place.kind];
  if (hasBeenTo(state, ctx, place.id)) {
    const lines = [`${place.epithet}.`];
    return { id: place.id, name: place.name, icon, found: true, lines, stamps: [], chips: [] };
  }
  if (knowsOf(state, ctx, place.id)) {
    const lines = [`${KIND_WORDS[place.kind]}. Heard of, never been.`];
    return { id: place.id, name: place.name, icon, found: false, lines, stamps: [], chips: [] };
  }
  const lines = [hint(ctx, place)];
  return { id: place.id, name: 'Not yet found', icon, found: false, lines, stamps: [], chips: [] };
}

export function placeEntries(state: GameState, ctx: GameContext): FieldEntry[] {
  return placesOnTheBook(ctx).map((place) => entryOf(state, ctx, place));
}
