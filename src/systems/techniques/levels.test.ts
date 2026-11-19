import { atEachLevel, levelId } from './levels';
import type { TechniqueDef } from './techniques';

/** A technique cast at several sizes is a technique of its own at each. */

const push: TechniqueDef = {
  id: 'push',
  name: 'Push',
  description: 'Everything thrown away.',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 20,
  rank: 'S',
  difficulty: 100,
  tags: { delivery: ['burst'] },
  levels: [
    { id: 'close', label: 'close', reach: ['close'], effects: [{ verb: 'damage', power: 10 }] },
    {
      id: 'vast',
      label: 'vast',
      reach: ['close', 'mid', 'far'],
      effects: [{ verb: 'area', power: 20, size: 'vast' }],
      chakraCost: 200,
      tags: { shape: 'zone' },
    },
  ],
};

describe('technique levels', () => {
  it('makes a technique of each level, named and costed for it', () => {
    const [close, vast] = atEachLevel(push);
    expect(close).toMatchObject({ id: levelId('push', { id: 'close' }), name: 'Push: close' });
    expect(close?.chakraCost).toBe(20);
    expect(vast).toMatchObject({ id: 'push~vast', name: 'Push: vast', chakraCost: 200 });
    expect(vast?.reach).toEqual(['close', 'mid', 'far']);
    expect(vast?.tags).toEqual({ delivery: ['burst'], shape: 'zone' });
    expect(vast && 'levels' in vast).toBe(false);
  });

  it('leaves a technique with no levels as it is', () => {
    const { levels: _l, ...plain } = push;
    expect(atEachLevel(plain)).toEqual([plain]);
  });
});
