import { CONTENT_PACKS, validateContent } from '@/content';

import { composePool, withSenseiPool } from './sensei/pool/pool';

/** Generated senseis: every one is whole, valid content, and they differ from each other. */

describe.each(CONTENT_PACKS.map((p) => [p.id, p] as const))('the %s sensei pool', (_id, pack) => {
  const pool = composePool(pack);

  it('makes a sensei for every past and every temperament that can carry it', () => {
    const pairs = pack.senseiParts.pasts.reduce((n, p) => n + p.temperaments.length, 0);
    expect(pool.length).toBe(pairs);
    expect(new Set(pool.map((s) => s.person.id)).size).toBe(pool.length);
  });

  it('passes every check authored content passes', () => {
    expect(validateContent(withSenseiPool(pack))).toEqual([]);
  });

  it('is the same pool every time it is made', () => {
    expect(composePool(pack)).toEqual(pool);
  });

  it('gives each a story of four, an arc and a voice of their own', () => {
    for (const { person, conversations, arc } of pool) {
      expect(conversations).toHaveLength(4);
      expect(person.sensei?.ways?.story.arcId).toBe(arc.id);
      expect(person.sensei?.voice?.fireside.length).toBeGreaterThan(1);
      // Every slot is filled.
      const lines = [...conversations.flatMap((c) => [c.opener, ...c.choices.map((x) => x.reply)])];
      for (const line of lines) expect(line).not.toMatch(/\{(name|art|lost|foe|keepsake|place)\}/);
    }
  });

  it('spreads names, arts and natures across the pool', () => {
    const names = new Set(pool.map((s) => s.person.name));
    const arts = new Set(pool.map((s) => s.person.specialty));
    expect(names.size).toBeGreaterThan(pool.length / 2);
    expect(arts.size).toBe(5);
  });
});
