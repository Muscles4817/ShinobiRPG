import { NARUTO_PACK } from './packs/naruto';
import type { PuppetDef } from './puppets';
import { validateContent } from './validate';

/** Puppets: unsealed by their own technique, built to fight, and only ever real in an arsenal. */

const KARASU = NARUTO_PACK.puppets!.find((p) => p.id === 'karasu')!;

function withPuppet(puppet: PuppetDef) {
  const puppets = NARUTO_PACK.puppets!.map((p) => (p.id === puppet.id ? puppet : p));
  return validateContent({ ...NARUTO_PACK, puppets });
}

describe('puppets', () => {
  it('accepts the pack as written', () => {
    expect(validateContent(NARUTO_PACK)).toEqual([]);
  });

  it('needs its technique to unseal it, and real techniques to fight with', () => {
    expect(withPuppet({ ...KARASU, techniqueId: 'unseal-kuroari' })).toContain(
      'puppet "karasu" isn\'t unsealed by its technique "unseal-kuroari"',
    );
    expect(withPuppet({ ...KARASU, techniqueIds: ['no-such-blade'] })).toContain(
      'puppet "karasu" fights with unknown "no-such-blade"',
    );
  });

  it('costs chakra to keep on its threads, and carries only a real dust', () => {
    expect(withPuppet({ ...KARASU, upkeep: 0 })).toContain(
      'puppet "karasu" has no body or costs nothing to keep',
    );
    expect(withPuppet({ ...KARASU, dust: 'moon-dust' })).toContain(
      'puppet "karasu" carries unknown dust "moon-dust"',
    );
  });

  it('is real when an arsenal names it', () => {
    const duelists = NARUTO_PACK.duelists!.map((d) =>
      d.id === 'kankuro' && d.arsenal
        ? { ...d, arsenal: { ...d.arsenal, puppets: ['scarecrow'] } }
        : d,
    );
    expect(validateContent({ ...NARUTO_PACK, duelists })).toContain(
      'person "kankuro" works unknown puppet "scarecrow"',
    );
  });
});
