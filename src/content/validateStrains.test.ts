import { ORIGINAL_PACK } from './packs/original';
import { validateStrains } from './validateStrains';

describe('strain validation', () => {
  it('passes the shipped pack', () => {
    expect(validateStrains(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports a clan hive of an unknown strain, and strains with numbers out of range', () => {
    const clans = ORIGINAL_PACK.clans.map((c) =>
      c.id === 'toga' ? { ...c, hive: { strainId: 'ghost-moth' } } : c,
    );
    const strains = ORIGINAL_PACK.strains.map((s) => ({ ...s, drain: 0, senses: 2 }));
    expect(validateStrains({ ...ORIGINAL_PACK, clans, strains })).toEqual([
      'strain "lantern-moth" has no sane drain',
      'strain "lantern-moth" senses beyond 0–1',
      'clan "toga" hive has unknown strain',
    ]);
  });
});
