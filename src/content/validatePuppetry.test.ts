import { CONTENT_PACKS } from './packs';
import type { ContentPack } from './types';
import { validatePuppetry } from './validatePuppetry';

/** The puppetry kit: frames, mechanisms with real techniques, materials sold somewhere. */

const pack = CONTENT_PACKS.find((p) => p.id === 'original')!;

function withKit(kit: Partial<ContentPack['puppetry']>): ContentPack {
  return { ...pack, puppetry: { ...pack.puppetry, ...kit } };
}

describe('puppetry validation', () => {
  it('passes the shipped packs', () => {
    for (const p of CONTENT_PACKS) expect(validatePuppetry(p)).toEqual([]);
  });

  it('reports a mechanism with no technique and a material nobody sells', () => {
    const part = { ...pack.puppetry.parts[0]!, id: 'ghost', techniqueId: 'nothing' };
    const material = { ...pack.puppetry.materials[0]!, id: 'unsold' };
    expect(
      validatePuppetry(
        withKit({
          parts: [...pack.puppetry.parts, part],
          materials: [...pack.puppetry.materials, material],
        }),
      ),
    ).toEqual([
      'puppet part "ghost" fights with unknown "nothing"',
      'puppet material "unsold" is sold nowhere',
    ]);
  });

  it('reports a frame with no slots or no art', () => {
    const frame = { ...pack.puppetry.frames[0]!, id: 'empty', slots: 0, arts: {} };
    expect(validatePuppetry(withKit({ frames: [frame] }))).toEqual([
      'puppet frame "empty" needs a body, slots, materials, days and upkeep',
      'puppet frame "empty" is built for no art',
    ]);
  });
});
