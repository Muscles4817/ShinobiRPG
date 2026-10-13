import { ORIGINAL_PACK } from './packs/original';
import { validateContent } from './validate';

describe('crew validation', () => {
  it('passes the shipped pack', () => {
    expect(validateContent(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports a foe whose danger doesn’t fit its strength', () => {
    const pack = {
      ...ORIGINAL_PACK,
      enemies: ORIGINAL_PACK.enemies.map((e) =>
        e.id === 'bandit-chief' ? { ...e, danger: 'petty' as const } : e,
      ),
    };
    expect(validateContent(pack)).toContain('enemy "bandit-chief" is too strong to be petty');
  });
});
