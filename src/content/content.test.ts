import { CONTENT_PACKS } from './packs';
import { ORIGINAL_PACK } from './packs/original';
import { validateContent } from './validate';

describe.each(CONTENT_PACKS.map((p) => [p.id, p] as const))('content pack "%s"', (_id, pack) => {
  it('is internally consistent', () => {
    expect(validateContent(pack)).toEqual([]);
  });

  it('has at least one mission available to a fresh genin', () => {
    expect(pack.missions.some((m) => m.minMissionsCompleted === 0)).toBe(true);
  });
});

describe('content validation', () => {
  it('ships both packs in development builds', () => {
    expect(CONTENT_PACKS.map((p) => p.id)).toEqual(['naruto', 'original']);
  });

  it('detects broken references and duplicates', () => {
    const broken = {
      ...ORIGINAL_PACK,
      foods: [...ORIGINAL_PACK.foods, ORIGINAL_PACK.foods[0]!],
      academyTechniques: ['does-not-exist'],
    };
    const problems = validateContent(broken);
    expect(problems).toContain('duplicate food id "rice-ball"');
    expect(problems).toContain('academyTechniques references unknown technique "does-not-exist"');
  });

  it('detects activities no place offers', () => {
    const [home, ...rest] = ORIGINAL_PACK.locations;
    const withoutMarket = {
      ...ORIGINAL_PACK,
      locations: [{ ...home!, places: home!.places.filter((p) => p.kind !== 'market') }, ...rest],
    };
    expect(validateContent(withoutMarket)).toContain(
      'food "rice-ball" is not offered at any place',
    );
  });
});
