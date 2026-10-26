import { ORIGINAL_PACK } from './packs/original';
import type { ContentPack } from './types';
import { validateChakraBeasts } from './validateChakraBeasts';

/** Chakra beasts keep chakra and a technique, and their arts stay theirs. */

function withEnemy(id: string, change: object): ContentPack {
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
});
