import { ORIGINAL_PACK } from './packs/original';
import type { PlaceDef } from './types';
import { validateLeisure } from './validateLeisure';

/** The original pack with its start village's places run through `change`. */
function withPlaces(change: (place: PlaceDef) => PlaceDef) {
  return {
    ...ORIGINAL_PACK,
    locations: ORIGINAL_PACK.locations.map((l) => ({ ...l, places: l.places.map(change) })),
  };
}

describe('bar and bath validation', () => {
  it('passes the shipped pack', () => {
    expect(validateLeisure(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports free drinks and a pastime listed twice', () => {
    const pack = withPlaces((p) =>
      p.id === 'izakaya' && p.kind === 'tavern'
        ? { ...p, cupCost: 0, pastimes: [...(p.pastimes ?? []), ...(p.pastimes ?? [])] }
        : p,
    );
    expect(validateLeisure(pack)).toEqual([
      'bar "izakaya" gives drinks away',
      'bar "izakaya" lists pastime "lantern-dice" twice',
      'bar "izakaya" lists pastime "shogi" twice',
    ]);
  });

  it('reports a free soak and baths open at night', () => {
    const pack = withPlaces((p) =>
      p.kind === 'onsen' ? { ...p, soakCost: 0, hours: ['evening', 'night'] } : p,
    );
    expect(validateLeisure(pack)).toEqual([
      'onsen "ember-springs" lets you soak for nothing',
      'onsen "ember-springs" must close at night',
    ]);
  });
});
