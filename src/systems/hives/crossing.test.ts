import { crossed, kinshipOf, stabilityOf, type CrossResult, type StrainSheet } from './crossing';
import { crossBegun, studiedJar, understood, withJar } from './jars';

const beetle: StrainSheet = {
  id: 'kikaichu',
  name: 'Kikaichū',
  species: 'kikaichū beetle',
  family: 'beetle',
  qualities: { speed: 3, bite: 2, toughness: 3, brood: 3, size: 4, senses: 3 },
  gifts: { drain: 3 },
  fears: ['fire'],
  depth: 0,
};
const sameKind: StrainSheet = {
  ...beetle,
  id: 'kikaichu-2',
  qualities: { ...beetle.qualities, speed: 5 },
};
const waterBeetle: StrainSheet = {
  ...beetle,
  id: 'water-beetle',
  species: 'water beetle',
  gifts: { camouflage: 1 },
};
const wasp: StrainSheet = {
  ...beetle,
  id: 'paper-wasp',
  species: 'paper wasp',
  family: 'wasp',
  qualities: { speed: 4, bite: 4, toughness: 2, brood: 2, size: 2, senses: 3 },
  gifts: { venom: 1 },
};

/** A fixed run of draws, for a cross of these two. */
function seeded(seed: number) {
  let x = seed;
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
}

function many(a: StrainSheet, b: StrainSheet): CrossResult[] {
  return Array.from({ length: 200 }, (_, i) =>
    crossed(a, b, { id: `brood-${i}`, name: 'Brood' }, seeded(i + 1)),
  );
}

describe('crossbreeding', () => {
  it('knows how near two strains are, and a near first cross is the most stable', () => {
    expect(kinshipOf(beetle, sameKind)).toBe('species');
    expect(kinshipOf(beetle, waterBeetle)).toBe('family');
    expect(kinshipOf(beetle, wasp)).toBe('strangers');
    expect(stabilityOf(beetle, sameKind)).toBeGreaterThan(stabilityOf(beetle, waterBeetle));
    expect(stabilityOf(beetle, waterBeetle)).toBeGreaterThan(stabilityOf(beetle, wasp));
    expect(stabilityOf({ ...beetle, depth: 3 }, wasp)).toBeLessThan(stabilityOf(beetle, wasp));
  });

  it('a simple cross is forgiving; a cross of strangers fails and throws back more often', () => {
    const misses = (rs: CrossResult[]) => rs.filter((r) => r.kind !== 'bred').length;
    expect(misses(many(beetle, sameKind))).toBeLessThan(misses(many(beetle, wasp)));
    expect(many(beetle, wasp).some((r) => r.kind === 'failed')).toBe(true);
  });

  it('a brood’s qualities land near its parents’, and it is a cross deeper', () => {
    const bred = many(beetle, sameKind).flatMap((r) => (r.kind === 'bred' ? [r.strain] : []));
    expect(bred.every((s) => s.qualities.speed >= 2 && s.qualities.speed <= 5)).toBe(true);
    expect(bred.every((s) => s.depth === 1)).toBe(true);
    expect(bred.filter((s) => (s.gifts.drain ?? 0) === 3).length).toBeGreaterThan(bred.length / 2);
  });

  it('a gift from the jar can come through into the hive', () => {
    const bred = many(beetle, wasp).flatMap((r) => (r.kind === 'bred' ? [r.strain] : []));
    expect(bred.some((s) => (s.gifts.venom ?? 0) > 0 && (s.gifts.drain ?? 0) > 0)).toBe(true);
  });
});

describe('jars', () => {
  const hive = { strainId: 'kikaichu', share: 'half' as const, count: 80 };
  it('studies a jar until it is understood, then a cross uses it and half the hive', () => {
    const jarred = withJar(hive, 'paper-wasp');
    expect(understood(jarred.jars![0]!)).toBe(false);
    const known = studiedJar(studiedJar(jarred, 'paper-wasp'), 'paper-wasp');
    expect(understood(known.jars![0]!)).toBe(true);
    const begun = crossBegun(known, 'paper-wasp', 5);
    expect(begun.count).toBe(40);
    expect(begun.jars).toEqual([]);
    expect(begun.breeding).toEqual({ jarStrainId: 'paper-wasp', readyDay: 8 });
  });
});
