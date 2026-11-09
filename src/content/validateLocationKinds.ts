import { CAMPING_KINDS, type LocationKind } from './locationKinds';
import type { ContentPack, LocationDef, PlaceKind } from './types';

/**
 * What each kind of location must have once it is open (`docs/design/journeys-plan.md` 3.2):
 * a city an inn, a market, a mission office and more besides; a town somewhere to sleep; wild
 * country and a landmark a camp and no inn, a landmark only a place or two beside it. Camps are
 * only for those, and the village you start in is a village.
 */

/** The fewest places a city has: an inn, a market, an office and at least two more. */
const CITY_LEAST_PLACES = 5;
/** The most places a landmark has: its camp and a place or two worth the walk. */
const LANDMARK_MOST_PLACES = 3;

/** The kinds of place each kind of location can't do without. */
const NEEDS: Readonly<Record<LocationKind, readonly PlaceKind[]>> = {
  village: [],
  city: ['inn', 'market', 'missions'],
  town: ['inn'],
  wild: ['wilds', 'camp'],
  landmark: ['camp'],
};

function sizeProblems(at: string, location: LocationDef): string[] {
  const count = location.places.length;
  if (location.kind === 'city' && count < CITY_LEAST_PLACES)
    return [`${at} is a city of fewer than ${CITY_LEAST_PLACES} places`];
  if (location.kind === 'landmark' && count > LANDMARK_MOST_PLACES)
    return [`${at} is a landmark of more than ${LANDMARK_MOST_PLACES} places`];
  return [];
}

function openProblems(at: string, location: LocationDef): string[] {
  const has = (kind: PlaceKind) => location.places.some((p) => p.kind === kind);
  const camping = CAMPING_KINDS.includes(location.kind);
  return [
    ...NEEDS[location.kind]
      .filter((kind) => !has(kind))
      .map((kind) => `${at} is a ${location.kind} with no ${kind} place`),
    ...(camping && has('inn') ? [`${at} is a ${location.kind} with an inn`] : []),
    ...(location.kind === 'landmark' && !location.sight
      ? [`${at} is a landmark with no sight`]
      : []),
    ...sizeProblems(at, location),
  ];
}

export function validateLocationKinds(pack: ContentPack): string[] {
  const start = pack.locations.find((l) => l.id === pack.startLocationId);
  return [
    ...(start && start.kind !== 'village'
      ? [`the start location "${start.id}" isn't a village`]
      : []),
    ...pack.locations.flatMap((location) => {
      const at = `location "${location.id}"`;
      const camp = location.places.some((p) => p.kind === 'camp');
      return [
        ...(camp && !CAMPING_KINDS.includes(location.kind)
          ? [`${at} is a ${location.kind} with a camp`]
          : []),
        ...(location.lockedReason === undefined ? openProblems(at, location) : []),
      ];
    }),
  ];
}
