import type { CompanionKindDef } from './companions';
import { ORIGINAL_PACK } from './packs/original';
import { validateCompanions } from './validateCompanions';

const hound = ORIGINAL_PACK.companionKinds[0]!;

function withKind(kind: CompanionKindDef) {
  const kept = ORIGINAL_PACK.companionKinds.filter((k) => k.id !== kind.id);
  return { ...ORIGINAL_PACK, companionKinds: [kind, ...kept] };
}

function kind(id: string): CompanionKindDef {
  const found = ORIGINAL_PACK.companionKinds.find((k) => k.id === id);
  if (!found) throw new Error(`no kind ${id}`);
  return found;
}

describe('companion validation', () => {
  it('passes the shipped pack', () => {
    expect(validateCompanions(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports a kind with no names, too strong a start, or a stray out of the village', () => {
    const bad: CompanionKindDef = {
      ...hound,
      names: [],
      baseStat: 12,
      stray: { ...hound.stray!, placeIds: ['nowhere'], chance: 2 },
    };
    expect(validateCompanions(withKind(bad))).toEqual([
      'companion kind "stray-hound" has no names to give',
      'companion kind "stray-hound" starts too strong',
      'companion kind "stray-hound" haunts "nowhere", not a place of the start village',
      'companion kind "stray-hound" has a stray chance outside 0–1',
    ]);
  });

  it('reports a wild one living nowhere, or a tame one living wild', () => {
    const wolf = kind('forest-wolf');
    const noMarsh = {
      ...withKind({ ...wolf, wild: { ...wolf.wild!, biome: 'marsh' } }),
      locations: ORIGINAL_PACK.locations.map((l) => ({
        ...l,
        places: l.places.filter((p) => p.kind !== 'wilds' || p.biome !== 'marsh'),
      })),
    };
    expect(validateCompanions(noMarsh)).toEqual([
      'companion kind "forest-wolf" lives in marsh, and no place is',
    ]);
    expect(validateCompanions(withKind({ ...wolf, temperament: 'bred' }))).toEqual([
      'companion kind "forest-wolf" lives wild but is not wild-tempered',
    ]);
  });

  it('reports a changed kind found after a foe that is no chakra beast', () => {
    const fox = kind('mist-fox-kit');
    const odd = { ...fox, wild: { ...fox.wild!, after: 'grey-wolf' } };
    expect(validateCompanions(withKind(odd))).toEqual([
      'companion kind "mist-fox-kit" is found after "grey-wolf", which is no chakra beast',
    ]);
  });

  it('reports a kennel breeding a kind that is not bred, and a job giving an unknown kind', () => {
    const pack = withKind({ ...kind('kennel-hound'), temperament: 'stray' });
    const missions = ORIGINAL_PACK.missions.map((m, i) =>
      i === 0 ? { ...m, reward: { ...m.reward, companionKindId: 'dragon' } } : m,
    );
    expect(validateCompanions({ ...pack, missions })).toEqual([
      'vet "animal-clinic" breeds "kennel-hound", not a bred kind',
      `mission "${ORIGINAL_PACK.missions[0]!.id}" gives unknown kind "dragon"`,
    ]);
  });

  it('reports a clan growing up with a kind the pack lacks', () => {
    const clans = ORIGINAL_PACK.clans.map((c, i) =>
      i === 0 ? { ...c, companion: { kindId: 'dragon', bond: 10 } } : c,
    );
    expect(validateCompanions({ ...ORIGINAL_PACK, clans })).toEqual([
      `clan "${ORIGINAL_PACK.clans[0]!.id}" grows up with unknown companion "dragon"`,
    ]);
  });
});
