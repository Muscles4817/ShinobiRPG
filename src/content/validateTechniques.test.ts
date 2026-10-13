import type { TechniqueDef } from '@/systems/techniques';

import { ORIGINAL_PACK } from './packs/original';
import { validateContent } from './validate';

function withPalm(change: (t: TechniqueDef) => TechniqueDef) {
  return {
    ...ORIGINAL_PACK,
    techniques: ORIGINAL_PACK.techniques.map((t) => (t.id === 'palm-strike' ? change(t) : t)),
  };
}

describe('technique shape validation', () => {
  it('reports a flurry of one blow, or of too many', () => {
    for (const hits of [1, 6, 2.5]) {
      const pack = withPalm((t) => ({ ...t, effects: [{ verb: 'damage', power: 8, hits }] }));
      expect(validateContent(pack).join('\n')).toMatch(/palm-strike" has a flurry of/);
    }
  });

  it('reports an empty or repeated reach', () => {
    for (const reach of [[], ['close', 'close']] as const) {
      const pack = withPalm((t) => ({ ...t, reach }));
      expect(validateContent(pack)).toContain(
        'technique "palm-strike" has a reach that isn\'t distinct, real bands',
      );
    }
  });

  it('accepts a sure flurry with its own reach', () => {
    const pack = withPalm((t) => ({
      ...t,
      accuracy: 'sure',
      reach: ['close', 'mid'],
      effects: [{ verb: 'damage', power: 8, hits: 3 }],
    }));
    expect(validateContent(pack)).toEqual([]);
  });
});
