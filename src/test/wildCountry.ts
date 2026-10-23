import { CONTENT_PACKS, type LocationDef } from '@/content';
import { createGameContext } from '@/game/context';
import type { GameState } from '@/game/state';
import { stock } from '@/systems/inventory';

import { newGame } from './gameFixtures';

/**
 * The original pack with a stretch of wild country added (none is open in the pack yet): the
 * Cedar Deep, its woods and a camp, for tests of what wild places offer.
 */

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const home = original.locations.find((l) => l.id === original.startLocationId)!;
const woods = home.places.find((p) => p.kind === 'wilds')!;

export const CEDAR_DEEP: LocationDef = {
  id: 'cedar-deep',
  name: 'The Cedar Deep',
  kind: 'wild',
  epithet: 'Old forest',
  backdrop: home.backdrop,
  map: { x: 50, y: 30 },
  places: [
    woods,
    { id: 'hollow', kind: 'camp', name: 'The Hollow', icon: 'tree', blurb: 'Out of the wind.' },
  ],
};

export const wildCtx = createGameContext({
  ...original,
  locations: [...original.locations, CEDAR_DEEP],
});

/** Food that keeps on the road, as the grocer sells it. */
export const RATION = original.ingredients.find((i) => (i.road ?? 0) > 0)!;

/** A new game standing in the Cedar Deep with two days' rations. */
export function inTheDeep(): GameState {
  const game = newGame({}, wildCtx);
  return { ...game, locationId: CEDAR_DEEP.id, inventory: stock(game.inventory, RATION.id, 2) };
}
