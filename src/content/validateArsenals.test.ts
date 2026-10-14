import { NARUTO_PACK } from './packs/naruto';
import type { PersonArsenal } from './types';
import { validateContent } from './validate';

/** People's own arsenals: real techniques, within their grade, clan arts kept in the clan. */

function withKakashi(arsenal: PersonArsenal) {
  const people = NARUTO_PACK.people.map((p) => (p.id === 'kakashi' ? { ...p, arsenal } : p));
  return validateContent({ ...NARUTO_PACK, people });
}

describe('arsenals', () => {
  it('accepts the pack as written', () => {
    expect(validateContent(NARUTO_PACK)).toEqual([]);
  });

  it('needs every technique to exist', () => {
    expect(withKakashi({ techniqueIds: ['kamui'] })).toContain(
      'person "kakashi" fights with unknown technique "kamui"',
    );
  });

  it('keeps techniques within their owner’s grade in the art', () => {
    expect(withKakashi({ techniqueIds: ['daytime-tiger'] })).toEqual(
      expect.arrayContaining([expect.stringContaining('"daytime-tiger" of rank')]),
    );
  });

  it('gives every technique in an arsenal a source of its own', () => {
    const lost = { ...NARUTO_PACK.techniques.find((t) => t.id === 'lightning-blade')!, id: 'lost' };
    const people = NARUTO_PACK.people.map((p) =>
      p.id === 'kakashi' ? { ...p, arsenal: { techniqueIds: ['lost'] } } : p,
    );
    const pack = { ...NARUTO_PACK, techniques: [...NARUTO_PACK.techniques, lost], people };
    expect(validateContent(pack)).toContain(
      'technique "lost" can\'t be learned anywhere (no shelf, teacher or scroll)',
    );
  });

  it('keeps clan techniques in the clan', () => {
    expect(withKakashi({ techniqueIds: ['great-fireball'] })).toContain(
      'person "kakashi" fights with "great-fireball" of clan "uchiha"',
    );
  });
});
