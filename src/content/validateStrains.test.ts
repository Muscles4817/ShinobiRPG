import { ORIGINAL_PACK } from './packs/original';
import { validateStrains } from './validateStrains';

describe('strain validation', () => {
  it('passes the shipped pack', () => {
    expect(validateStrains(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports a clan hive of an unknown strain, and a strain with no gift', () => {
    const clans = ORIGINAL_PACK.clans.map((c) =>
      c.id === 'toga' ? { ...c, hive: { strainId: 'ghost-moth' } } : c,
    );
    const strains = ORIGINAL_PACK.strains.map((s) => ({
      ...s,
      gifts: {},
      fears: ['fire' as const, 'fire' as const],
    }));
    expect(validateStrains({ ...ORIGINAL_PACK, clans, strains })).toEqual([
      'strain "lantern-moth" has no gift',
      'strain "lantern-moth" fears something twice',
      'clan "toga" hive has unknown strain',
    ]);
  });
});
