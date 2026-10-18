import { ORIGINAL_PACK } from './packs/original';
import type { RetinueEntry } from './companions';
import type { EnemyDef } from './types';
import { validateRetinues } from './validateRetinues';

/** The original pack with the poacher's retinue replaced. */
function withRetinue(retinue: readonly RetinueEntry[], extra: readonly EnemyDef[] = []) {
  return {
    ...ORIGINAL_PACK,
    enemies: [
      ...ORIGINAL_PACK.enemies.map((e) => (e.id === 'poacher' ? { ...e, retinue } : e)),
      ...extra,
    ],
  };
}

describe('retinue validation', () => {
  it('passes the shipped pack', () => {
    expect(validateRetinues(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports unknown bodies, the foe themselves and a body more dangerous than its master', () => {
    const pack = withRetinue([
      { enemyId: 'wolf', tell: 'open' },
      { enemyId: 'poacher', tell: 'open' },
      { enemyId: 'bandit-chief', tell: 'kept' },
    ]);
    expect(validateRetinues(pack)).toEqual([
      'enemy "poacher" retinue "wolf" is not an enemy',
      'enemy "poacher" retinue "poacher" is the enemy themselves',
    ]);
    const deadly = { ...ORIGINAL_PACK.enemies[0]!, id: 'dire-wolf', danger: 'deadly' as const };
    expect(
      validateRetinues(withRetinue([{ enemyId: 'dire-wolf', tell: 'open' }], [deadly])),
    ).toEqual(['enemy "poacher" retinue "dire-wolf" is more dangerous than its master']);
  });

  it('reports a body with a retinue of its own', () => {
    const pack = withRetinue([{ enemyId: 'poacher', tell: 'open' }]);
    const nested = {
      ...pack,
      enemies: [
        ...pack.enemies,
        {
          ...ORIGINAL_PACK.enemies[0]!,
          id: 'handler',
          retinue: [{ enemyId: 'poacher', tell: 'open' as const }],
        },
      ],
    };
    expect(validateRetinues(nested)).toContain(
      'enemy "handler" retinue "poacher" has a retinue of its own',
    );
  });
});
