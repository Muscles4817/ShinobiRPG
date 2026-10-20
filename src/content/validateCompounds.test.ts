import { ORIGINAL_PACK } from './packs/original';
import type { PlaceDef } from './types';
import { validateCompounds } from './validateCompounds';

/** The original pack with its start village's places run through `change`. */
function withPlaces(change: (place: PlaceDef) => PlaceDef) {
  return {
    ...ORIGINAL_PACK,
    locations: ORIGINAL_PACK.locations.map((l) => ({ ...l, places: l.places.map(change) })),
  };
}

describe('compound validation', () => {
  it('passes the shipped pack', () => {
    expect(validateCompounds(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports an unknown clan, a head from another clan and a quarter listing a stranger', () => {
    const pack = withPlaces((p) => {
      if (p.id === 'hibana-compound' && p.kind === 'compound') return { ...p, headId: 'sayo' };
      if (p.id === 'tokaku-compound' && p.kind === 'compound') return { ...p, clanId: 'nobody' };
      if (p.kind === 'quarter') return { ...p, compoundIds: [...p.compoundIds, 'market-street'] };
      return p;
    });
    expect(validateCompounds(pack)).toEqual([
      'compound "hibana-compound" is headed by "sayo", not of the clan',
      'compound "tokaku-compound" belongs to unknown clan "nobody"',
      'quarter "clan-quarter" lists "market-street", not a compound of its location',
    ]);
  });

  it('reports a clan with a compound but no stance on outsiders', () => {
    const clans = ORIGINAL_PACK.clans.map(({ outsiders: _o, ...c }) => c);
    expect(validateCompounds({ ...ORIGINAL_PACK, clans })).toContain(
      'clan "hibana" has a compound but no stance on outsiders',
    );
  });

  it('keeps a compound in its clan’s village, and a clan’s village real', () => {
    const clans = ORIGINAL_PACK.clans.map((c) =>
      c.id === 'hibana' ? { ...c, village: 'nowhere' } : c,
    );
    expect(validateCompounds({ ...ORIGINAL_PACK, clans })).toEqual([
      'clan "hibana" belongs to unknown village "nowhere"',
      'compound "hibana-compound" stands outside the hibana clan\'s village',
    ]);
  });
});
