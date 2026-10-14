import { CONTENT_PACKS, MAP_SIZE } from '@/content';
import { newGame } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { travelMap } from './views/travelMap';

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const ctx = createGameContext(original);

describe('the travel map', () => {
  it('puts every place on it, marks where you stand and what is still coming', () => {
    const map = travelMap(newGame({}, ctx), ctx);
    expect(map).toMatchObject(MAP_SIZE);
    expect(map.places).toHaveLength(original.locations.length);
    expect(map.places.find((p) => p.here)?.id).toBe('torogakure');
    expect(map.places.find((p) => p.id === 'kiri-ford')?.locked).toBe(true);
    expect(map.places.find((p) => p.id === 'port-shiomachi')?.locked).toBe(false);
  });

  it('draws a road for every route, closed while either end is locked', () => {
    const roads = travelMap(newGame({}, ctx), ctx).roads;
    expect(roads).toHaveLength(original.routes.length);
    expect(roads.find((r) => r.id === 'coast-road')).toMatchObject({ open: true, danger: 'petty' });
    expect(roads.find((r) => r.id === 'dune-crossing')?.open).toBe(false);
  });
});
