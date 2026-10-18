import { NARUTO_PACK } from './packs/naruto';
import type { PersonDef } from './types';
import { validateContent } from './validate';

/** Versus-only duelists: held to the cast's rules, and kept out of the world until plumbed in. */

const tengen = NARUTO_PACK.duelists!.find((d) => d.id === 'tengen')!;

function withDuelist(duelist: PersonDef) {
  return validateContent({ ...NARUTO_PACK, duelists: [duelist] });
}

describe('duelists', () => {
  it('keeps them out of the world’s cast', () => {
    expect(NARUTO_PACK.people.some((p) => p.id === tengen.id)).toBe(false);
  });

  it('lets their own arsenal source their techniques, until they are plumbed in', () => {
    const asCast = { ...NARUTO_PACK, people: [...NARUTO_PACK.people, tengen], duelists: [] };
    expect(validateContent(asCast)).toContain(
      'technique "string-performance" can\'t be learned anywhere (no shelf, teacher or scroll)',
    );
  });

  it('refuses a schedule or teaching: they aren’t in the world yet', () => {
    const scheduled = { ...tengen, schedule: { ...tengen.schedule, morning: 'training-grounds' } };
    expect(withDuelist(scheduled)).toContain(
      'duelist "tengen" has a schedule, but isn’t in the world yet',
    );
    const teaching = { ...tengen, recipes: [] };
    expect(withDuelist(teaching)).toContain('duelist "tengen" teaches, but isn’t in the world yet');
  });

  it('holds them to the cast’s ranks and arsenals', () => {
    expect(withDuelist({ ...tengen, rank: 'genin' })).toContain(
      'person "tengen" is a shinobi but ranked genin',
    );
    const unarmed = { ...tengen, arsenal: { techniqueIds: ['kamui'] } };
    expect(withDuelist(unarmed)).toContain('person "tengen" fights with unknown technique "kamui"');
  });

  it('never shares an id with someone in the world', () => {
    expect(withDuelist({ ...tengen, id: 'kakashi' })).toContain('duplicate person id "kakashi"');
  });
});
