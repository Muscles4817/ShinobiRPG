import { ORIGINAL_PACK } from './packs/original';
import { validateDusts } from './validateDusts';

describe('dust validation', () => {
  it('passes the shipped pack, which carries every shared dust', () => {
    expect(validateDusts(ORIGINAL_PACK)).toEqual([]);
    expect(ORIGINAL_PACK.dusts.map((d) => d.id)).toContain('ash');
  });

  it('reports a bane or a ground named twice', () => {
    const dusts = ORIGINAL_PACK.dusts.map((d) =>
      d.id === 'sand'
        ? {
            ...d,
            banes: ['water' as const, 'water' as const],
            drawnOn: ['arena' as const, 'arena' as const],
          }
        : d,
    );
    expect(validateDusts({ ...ORIGINAL_PACK, dusts })).toEqual([
      'dust "sand" names a bane twice',
      'dust "sand" names a ground twice',
    ]);
  });
});
