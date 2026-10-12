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

  it('detects creatures with no health', () => {
    const [first, ...rest] = ORIGINAL_PACK.enemies;
    const ghostly = { ...ORIGINAL_PACK, enemies: [{ ...first!, healthScale: 0 }, ...rest] };
    expect(validateContent(ghostly)).toContain(
      `enemy "${first!.id}" needs a positive health scale`,
    );
  });

  it('detects a technique that does nothing', () => {
    const [first, ...rest] = ORIGINAL_PACK.techniques;
    const inert = { ...ORIGINAL_PACK, techniques: [{ ...first!, effects: [] }, ...rest] };
    expect(validateContent(inert)).toContain(`technique "${first!.id}" has no effects`);
  });

  it('detects an after-cost on a technique that is not a trump card', () => {
    const [first, ...rest] = ORIGINAL_PACK.techniques;
    const afterCost = { kind: 'hospital', days: 2 } as const;
    const priced = { ...ORIGINAL_PACK, techniques: [{ ...first!, afterCost }, ...rest] };
    expect(validateContent(priced)).toContain(
      `technique "${first!.id}" has an after-cost but is not once per fight, or its cost is not positive`,
    );
  });

  it('detects a drill for reserves, which only grow with stamina and jutsu use', () => {
    const [first, ...rest] = ORIGINAL_PACK.training;
    const drill = { ...first!, gains: { ...first!.gains, reserves: 1 } };
    expect(validateContent({ ...ORIGINAL_PACK, training: [drill, ...rest] })).toContain(
      `training "${first!.id}" drills reserves, which only grow with stamina and jutsu use`,
    );
  });

  it('detects an empower that costs nothing', () => {
    const [first, ...rest] = ORIGINAL_PACK.techniques;
    const effects = [{ verb: 'empower', power: 10, boosts: ['strength'] }] as const;
    const free = { ...ORIGINAL_PACK, techniques: [{ ...first!, effects }, ...rest] };
    expect(validateContent(free)).toContain(
      `technique "${first!.id}" has an empower with no price (it needs a health price or an after-cost)`,
    );
  });

  it('detects injuries that make no sense, and a cause with none to give', () => {
    const [first, ...rest] = ORIGINAL_PACK.injuries;
    const odd = { ...first!, days: 0, fight: { speed: 1.2 } };
    const problems = validateContent({
      ...ORIGINAL_PACK,
      injuries: [odd, ...rest.filter((i) => !i.causes.includes('collapse'))],
    });
    expect(problems).toContain(`injury "${first!.id}" must last at least a day`);
    expect(problems).toContain(`injury "${first!.id}" needs fight multipliers between 0 and 1`);
    expect(problems).toContain('pack needs an injury caused by collapse');
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
