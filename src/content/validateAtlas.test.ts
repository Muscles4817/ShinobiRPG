import { CONTENT_PACKS } from './packs';
import { validateAtlas } from './validateAtlas';

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;

describe('the atlas', () => {
  it('passes for every pack', () => {
    for (const pack of CONTENT_PACKS) expect(validateAtlas(pack)).toEqual([]);
  });

  it('catches shapes that are too small or off the map, and empty labels', () => {
    const broken = {
      ...original,
      atlas: {
        ...original.atlas,
        lands: [
          [
            { x: 0, y: 0 },
            { x: 120, y: 5 },
          ],
        ],
        labels: [{ text: ' ', at: { x: 1, y: 1 }, kind: 'sea' as const }],
      },
      routes: [{ ...original.routes[0]!, trail: [{ x: -1, y: 3 }] }],
    };
    expect(validateAtlas(broken)).toEqual([
      'atlas land 1 has too few points',
      'atlas land 1 goes off the map',
      'atlas label " " is empty or off the map',
      `route "${original.routes[0]!.id}" bends off the map`,
    ]);
  });
});
