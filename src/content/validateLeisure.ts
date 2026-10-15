import { duplicateIds } from './catalog';
import type { ContentPack, PlaceDef } from './types';

/**
 * Checks bars and hot water: a drink and a soak cost something, a bar's pastimes are told
 * apart, and the baths drain at night (a soak takes a stretch of the day, and night is
 * for sleeping).
 */
export function validateLeisure(pack: ContentPack): string[] {
  return pack.locations.flatMap((l) => l.places).flatMap(placeProblems);
}

function placeProblems(place: PlaceDef): string[] {
  if (place.kind === 'tavern') {
    return [
      ...(place.cupCost > 0 ? [] : [`bar "${place.id}" gives drinks away`]),
      ...duplicateIds(place.pastimes ?? []).map(
        (id) => `bar "${place.id}" lists pastime "${id}" twice`,
      ),
    ];
  }
  if (place.kind !== 'onsen') return [];
  return [
    ...(place.soakCost > 0 ? [] : [`onsen "${place.id}" lets you soak for nothing`]),
    ...(place.hours && !place.hours.includes('night')
      ? []
      : [`onsen "${place.id}" must close at night`]),
  ];
}
