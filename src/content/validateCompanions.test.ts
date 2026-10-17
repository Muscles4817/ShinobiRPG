import type { CompanionKindDef } from './companions';
import { ORIGINAL_PACK } from './packs/original';
import { validateCompanions } from './validateCompanions';

const hound = ORIGINAL_PACK.companionKinds[0]!;

function withKind(kind: CompanionKindDef) {
  return { ...ORIGINAL_PACK, companionKinds: [kind] };
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

  it('reports a clan growing up with a kind the pack lacks', () => {
    const clans = ORIGINAL_PACK.clans.map((c, i) =>
      i === 0 ? { ...c, companion: { kindId: 'dragon', bond: 10 } } : c,
    );
    expect(validateCompanions({ ...ORIGINAL_PACK, clans })).toEqual([
      `clan "${ORIGINAL_PACK.clans[0]!.id}" grows up with unknown companion "dragon"`,
    ]);
  });
});
