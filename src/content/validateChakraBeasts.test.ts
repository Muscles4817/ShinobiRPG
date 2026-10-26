import { ORIGINAL_PACK } from './packs/original';
import type { ContentPack, EnemyDef } from './types';
import { validateChakraBeasts } from './validateChakraBeasts';

/** Chakra beasts keep chakra and a technique, and their arts stay theirs. */

function withEnemy(id: string, change: Partial<EnemyDef>): ContentPack {
  const enemies = ORIGINAL_PACK.enemies.map((e) => (e.id === id ? { ...e, ...change } : e));
  return { ...ORIGINAL_PACK, enemies };
}

describe('chakra beasts', () => {
  it('passes the shipped pack', () => {
    expect(validateChakraBeasts(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports a chakra beast with no chakra', () => {
    expect(validateChakraBeasts(withEnemy('mist-fox', { maxChakra: 0 }))).toEqual([
      'chakra beast "mist-fox" has no chakra or no technique, so it is a plain animal',
    ]);
  });

  it('reports a beast art held by a foe that is not a chakra beast', () => {
    expect(
      validateChakraBeasts(withEnemy('samurai', { techniqueIds: ['burning-charge'] })),
    ).toEqual(['enemy "samurai" fights with beast art "burning-charge"']);
  });

  it('reports a beast art someone can learn', () => {
    const pack = {
      ...ORIGINAL_PACK,
      academyTechniques: [...ORIGINAL_PACK.academyTechniques, 'shrike-cry'],
    };
    expect(validateChakraBeasts(pack)).toEqual(['beast art "shrike-cry" can be learned']);
  });

  it('reports a beast art no chakra beast holds', () => {
    expect(validateChakraBeasts(withEnemy('echo-shrike', { techniqueIds: ['fox-haze'] }))).toEqual([
      'no chakra beast holds "shrike-cry"',
    ]);
  });

  it('reports a companion kind holding a beast art its beast does not', () => {
    const companionKinds = ORIGINAL_PACK.companionKinds.map((k) =>
      k.id === 'mist-fox-kit'
        ? { ...k, techniques: [...(k.techniques ?? []), { techniqueId: 'moss-mend', stage: 4 }] }
        : k,
    );
    expect(validateChakraBeasts({ ...ORIGINAL_PACK, companionKinds })).toEqual([
      'companion kind "mist-fox-kit" holds beast art "moss-mend" its beast doesn’t',
    ]);
  });
});
