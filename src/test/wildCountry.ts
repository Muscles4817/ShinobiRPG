import { CONTENT_PACKS, type LocationDef } from '@/content';
import type { RouteDef } from '@/systems/travel';
import { createGameContext } from '@/game/context';
import type { GameState } from '@/game/state';
import { stock } from '@/systems/inventory';

import { newGame } from './gameFixtures';

/**
 * The original pack with a test stretch of wild country added, laid out so the tests don't move
 * when the pack's own map does: the Old Wood, its woods and a camp, for tests of what wild places
 * offer; and a test road out of the village past a landmark (the Stone Lantern) and through the
 * wood to the Falls, so a trip passes both kinds of stop.
 */

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const home = original.locations.find((l) => l.id === original.startLocationId)!;
const woods = home.places.find((p) => p.kind === 'wilds')!;

export const CEDAR_DEEP: LocationDef = {
  id: 'test-old-wood',
  name: 'The Old Wood',
  kind: 'wild',
  epithet: 'Old forest',
  backdrop: home.backdrop,
  map: { x: 50, y: 30 },
  places: [
    woods,
    { id: 'hollow', kind: 'camp', name: 'The Hollow', icon: 'tree', blurb: 'Out of the wind.' },
  ],
};

const landmark = (id: string, name: string, x: number): LocationDef => ({
  id,
  name,
  kind: 'landmark',
  epithet: 'Worth the walk',
  backdrop: home.backdrop,
  map: { x, y: 20 },
  places: [
    { id: `${id}-camp`, kind: 'camp', name: 'A Ledge', icon: 'tree', blurb: 'Flat ground.' },
  ],
  sight: {
    text: 'The old stone lantern still burns, though no one tends it.',
    reward: { perception: 1 },
  },
});

export const STONE_LANTERN = landmark('test-stone-lantern', 'The Stone Lantern', 48);
export const THE_FALLS = landmark('test-falls', 'The Falls', 56);

const road = (id: string, from: string, to: string): RouteDef => ({
  id,
  from,
  to,
  legs: [{ region: 'forest-track', days: 1, text: 'The track runs on under the trees.' }],
  danger: 'petty',
});

export const wildCtx = createGameContext({
  ...original,
  locations: [...original.locations, CEDAR_DEEP, STONE_LANTERN, THE_FALLS],
  routes: [
    ...original.routes,
    road('to-lantern', original.startLocationId, STONE_LANTERN.id),
    road('to-deep', STONE_LANTERN.id, CEDAR_DEEP.id),
    road('to-falls', CEDAR_DEEP.id, THE_FALLS.id),
  ],
});

/** Food that keeps on the road, as the grocer sells it. */
export const RATION = original.ingredients.find((i) => (i.road ?? 0) > 0)!;

/** A new game standing in the Cedar Deep with two days' rations. */
export function inTheDeep(): GameState {
  const game = newGame({}, wildCtx);
  return { ...game, locationId: CEDAR_DEEP.id, inventory: stock(game.inventory, RATION.id, 2) };
}
