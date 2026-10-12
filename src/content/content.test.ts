import { CONTENT_PACKS } from './packs';
import { ORIGINAL_PACK } from './packs/original';
import { talent } from './statLine';
import { validateContent } from './validate';
import type { PersonDef } from './types';

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

  it('detects a combination technique whose partner does not exist', () => {
    const [first, ...rest] = ORIGINAL_PACK.techniques;
    const lonely = {
      ...ORIGINAL_PACK,
      techniques: [{ ...first!, combo: { partnerTechniqueId: 'nobody' } }, ...rest],
    };
    expect(validateContent(lonely)).toContain(
      `combination technique "${first!.id}" references unknown technique "nobody"`,
    );
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

  it('detects clans without arts, and a clanless family with some', () => {
    const clans = ORIGINAL_PACK.clans.map((c) => ({
      ...c,
      arts: c.id === 'none' ? (['taijutsu'] as const) : [],
    }));
    const problems = validateContent({ ...ORIGINAL_PACK, clans });
    expect(problems).toContain('the "none" clan can’t have arts');
    expect(problems).toContain('clan "hibana" declares no arts');
  });

  it('detects people whose rank does not fit their role or their stats', () => {
    const people = ORIGINAL_PACK.people.map((p) => {
      if (p.id === 'kaen') return { ...p, stats: { ...p.stats, ninjutsu: 20 } };
      if (p.id === 'goran') return { ...p, rank: 'chunin' as const };
      if (p.id === 'akari') return { ...p, stats: { ...p.stats, ninjutsu: 14 } };
      if (p.id === 'tsune') return { ...p, aptitude: talent(1, { intellect: 3 }) };
      return p;
    });
    const problems = validateContent({ ...ORIGINAL_PACK, people });
    expect(problems).toContain('person "kaen" (genin) has a best stat at B, outside E–D');
    expect(problems).toContain('person "goran" is a sensei but ranked chunin');
    expect(problems).toContain('sensei "akari" must be B or A in ninjutsu');
    expect(problems).toContain('person "tsune" has an aptitude outside 0–1.8 in intellect');
  });

  it('detects teachers with broken signatures, prices and favours', () => {
    const people = ORIGINAL_PACK.people.map((p): PersonDef => {
      if (p.id === 'goran' && p.teacher) {
        const parts = [
          { kind: 'mission', missionId: 'no-such-job' },
          { kind: 'ryo', perSession: 0 },
          { kind: 'ryo', perSession: 5 },
        ] as const;
        return {
          ...p,
          teacher: { ...p.teacher, teaches: ['nope'], price: { kind: 'all' as const, parts } },
        };
      }
      if (p.id === 'akari') {
        const { teacher: _t, ...rest } = p;
        return rest;
      }
      if (p.id === 'yomi' && p.teacher) {
        const price = { kind: 'favour', favourId: 'never-asked', ask: 'Something.' } as const;
        return {
          ...p,
          teacher: { ...p.teacher, price, steers: { focus: 'weakest', freeAtStage: 9 } },
        };
      }
      if (p.id === 'tsune') {
        return {
          ...p,
          teacher: {
            quirk: 'patient',
            teaches: ['forge-cut'],
            price: { kind: 'bond', minStage: 1 },
          },
        };
      }
      return p;
    });
    const problems = validateContent({ ...ORIGINAL_PACK, people });
    expect(problems).toContain('teacher "goran" teaches unknown technique "nope"');
    expect(problems).toContain('teacher "goran" asks for unknown mission "no-such-job"');
    expect(problems).toContain('teacher "goran" must charge more than nothing a session');
    expect(problems).toContain('teacher "goran" has a combined price that repeats a kind');
    expect(problems).toContain('sensei "akari" needs a teacher profile');
    expect(problems).toContain(
      'teacher "yomi" asks for favour "never-asked" that no conversation reply does',
    );
    expect(problems).toContain('teacher "yomi" lets you choose at a stage outside 1–4');
    expect(problems).toContain(
      'favour "yomi-grave-lantern" is done in conversation but no teacher asks for it',
    );
    expect(problems).toContain('teacher "tsune" is a civilian and can’t teach');
    expect(problems).toContain('teacher "tsune" never comes to a training place');
    expect(problems).toContain(
      'teacher "tsune" teaches "forge-cut" but isn’t of the kurogane clan',
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
