import { ORIGINAL_PACK } from './packs/original';
import { validateWorld } from './validateWorld';

describe('world validation', () => {
  it('passes the shipped pack', () => {
    expect(validateWorld(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports a mid-sentence name written as a title', () => {
    const pack = {
      ...ORIGINAL_PACK,
      locations: ORIGINAL_PACK.locations.map((l) => ({
        ...l,
        places: l.places.map((p) =>
          p.id === 'training-grounds' ? { ...p, inText: 'The Training Ground' } : p,
        ),
      })),
    };
    expect(validateWorld(pack)).toContain(
      'place "training-grounds" has a mid-sentence name that doesn’t start lower case',
    );
  });
});
