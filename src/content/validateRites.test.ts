import { ORIGINAL_PACK } from './packs/original';
import { validateRites } from './validateRites';

describe('hive rite validation', () => {
  it('passes the shipped pack', () => {
    expect(validateRites(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports a rite nobody can learn, and someone teaching another clan’s rite', () => {
    const missions = ORIGINAL_PACK.missions.map((m) => {
      const { hiveRite: _r, ...reward } = m.reward;
      return { ...m, reward };
    });
    const locations = ORIGINAL_PACK.locations.map((l) => ({
      ...l,
      places: l.places.map((p) => (p.kind === 'compound' ? { ...p, keepsRite: false } : p)),
    }));
    const people = ORIGINAL_PACK.people.map((p) =>
      p.id === 'tomoshi' ? { ...p, clanId: 'none' } : p,
    );
    expect(validateRites({ ...ORIGINAL_PACK, missions, locations, people })).toEqual([
      'person "tomoshi" teaches a hive rite of a clan not their own',
    ]);
    const unlearnable = people.map((p) => {
      const { hiveRite: _r, ...rest } = p;
      return rest;
    });
    expect(validateRites({ ...ORIGINAL_PACK, missions, locations, people: unlearnable })).toEqual([
      'clan "toga" has a hive rite nobody can learn',
    ]);
  });
});
