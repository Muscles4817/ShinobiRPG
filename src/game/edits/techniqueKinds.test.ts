import { contextForPack } from '../context';
import { techniqueKinds, type TechniqueKind } from './techniqueKinds';
import { NO_EDITS } from './state';

/** The kinds of techniques read from what they do, in both packs. */

function kindsOf(packId: string, name: string): readonly TechniqueKind[] {
  const ctx = contextForPack(packId, NO_EDITS)!;
  const def = ctx.content.techniques.all.find((t) => t.name === name);
  if (!def) throw new Error(`No technique called ${name} in ${packId}`);
  return techniqueKinds(def);
}

describe('what kind of technique something is', () => {
  it.each([
    ['original', 'Moonfall Slash', 'blade'],
    ['original', 'Palm Strike', 'body'],
    ['original', 'Gale Heel', 'nin-tai'],
    ['original', 'Ember Breath', 'projectile'],
    ['original', 'Lantern Shades', 'clone'],
    ['original', 'Kindled Pulse', 'power-up'],
    ['original', 'Mending Glow', 'healing'],
    ['naruto', 'Eight Gates: Gate of Opening', 'power-up'],
    ['naruto', 'Rasengan', 'nin-tai'],
    ['naruto', 'Shuriken Jutsu', 'projectile'],
    ['naruto', 'Shadow Possession Jutsu', 'hold'],
    ['naruto', 'Substitution Jutsu', 'defence'],
  ] as const)('reads %s’s %s as %s', (pack, name, kind) => {
    expect(kindsOf(pack, name)).toContain(kind);
  });

  it('keeps a daze that rides on a blow, and a thrown weapon, out of the wrong kinds', () => {
    expect(kindsOf('naruto', 'Rasengan')).not.toContain('hold');
    expect(kindsOf('naruto', 'Shuriken Jutsu')).not.toContain('body');
    expect(kindsOf('naruto', 'Demonic Illusion: Hell Viewing')).not.toContain('projectile');
  });

  it('gives nearly every technique a kind', () => {
    for (const packId of ['original', 'naruto']) {
      const all = contextForPack(packId, NO_EDITS)!.content.techniques.all;
      const kindless = all.filter((t) => techniqueKinds(t).length === 0);
      expect(kindless.length / all.length).toBeLessThan(0.02);
    }
  });
});
