import { ORIGINAL_PACK } from './packs/original';
import type { LocationDef, PlaceDef } from './types';
import { validateContent } from './validate';

/** What each kind of location must have: a city its offices, wild country a camp and no inn. */

const CAMP: PlaceDef = {
  id: 'camp',
  kind: 'camp',
  name: 'A Hollow',
  icon: 'tree',
  blurb: 'Out of the wind.',
};

function withLocation(changed: (l: LocationDef) => LocationDef, id = 'kiri-ford') {
  return validateContent({
    ...ORIGINAL_PACK,
    locations: ORIGINAL_PACK.locations.map((l) => (l.id === id ? changed(l) : l)),
  });
}

describe('kinds of location', () => {
  it('accepts the pack as written', () => {
    expect(validateContent(ORIGINAL_PACK)).toEqual([]);
  });

  it('asks a city for its inn, market and office, and more besides', () => {
    const problems = withLocation((l) => ({
      ...l,
      places: l.places.filter((p) => p.kind !== 'inn' && p.kind !== 'house'),
    }));
    expect(problems).toEqual(
      expect.arrayContaining([
        'location "kiri-ford" is a city with no inn place',
        'location "kiri-ford" is a city of fewer than 5 places',
      ]),
    );
  });

  it('keeps camps to wild country and landmarks, and inns out of them', () => {
    expect(withLocation((l) => ({ ...l, places: [...l.places, CAMP] }))).toContain(
      'location "kiri-ford" is a city with a camp',
    );
    expect(withLocation((l) => ({ ...l, kind: 'wild' }))).toEqual(
      expect.arrayContaining([
        'location "kiri-ford" is a wild with no wilds place',
        'location "kiri-ford" is a wild with no camp place',
        'location "kiri-ford" is a wild with an inn',
      ]),
    );
  });

  it('asks a landmark for a sight to stop for, a camp, and little else', () => {
    expect(withLocation((l) => ({ ...l, kind: 'landmark' }))).toEqual(
      expect.arrayContaining([
        'location "kiri-ford" is a landmark with no sight',
        'location "kiri-ford" is a landmark with no camp place',
        'location "kiri-ford" is a landmark with an inn',
        'location "kiri-ford" is a landmark of more than 3 places',
      ]),
    );
  });

  it('starts you in a village', () => {
    expect(withLocation((l) => ({ ...l, kind: 'town' }), ORIGINAL_PACK.startLocationId)).toContain(
      `the start location "${ORIGINAL_PACK.startLocationId}" isn't a village`,
    );
  });
});
