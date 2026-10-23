import type { TravellerDef } from '@/systems/missions';

import { ORIGINAL_PACK } from './packs/original';
import { validateContent } from './validate';

describe('travellers', () => {
  it('passes the shipped cast', () => {
    expect(validateContent(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports roads nobody walks, meetings no one can reach, odd tones and unknown gifts', () => {
    const stray: TravellerDef = {
      id: 'stray',
      seen: 'Someone.',
      regions: ['moon-road'],
      meetings: [
        {
          text: 'First.',
          needs: 'never',
          options: [
            {
              label: 'Hm',
              tone: 'shouty',
              reply: 'Hm.',
              gift: { kind: 'recipe', recipeId: 'no-such-dish' },
            },
          ],
        },
        {
          text: 'Second.',
          needs: 'forgot',
          options: [
            {
              label: 'Take',
              reply: 'Taken.',
              gift: { kind: 'ingredient', ingredientId: 'no-such-food' },
            },
          ],
        },
      ],
    };
    const empty: TravellerDef = { id: 'empty', seen: 'No one.', regions: [], meetings: [] };
    const problems = validateContent({
      ...ORIGINAL_PACK,
      travellers: [...ORIGINAL_PACK.travellers, stray, empty],
    });
    expect(problems).toEqual(
      expect.arrayContaining([
        'traveller "stray" walks region "moon-road", which no road crosses',
        'traveller "stray" can never be met: the first meeting needs "never"',
        'traveller "stray" meeting 2 needs "forgot", which no earlier meeting leaves',
        'traveller "stray" option "Hm" has unknown tone "shouty"',
        'traveller "stray" teaches unknown recipe "no-such-dish"',
        'traveller "stray" gives unknown ingredient "no-such-food"',
        'traveller "empty" has no meetings',
      ]),
    );
  });
});
