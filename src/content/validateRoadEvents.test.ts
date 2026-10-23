import type { RoadEventDef } from '@/systems/missions';

import { ORIGINAL_PACK } from './packs/original';
import { validateContent } from './validate';

describe('road events', () => {
  it('keep something for every road and season in every region a road crosses', () => {
    const seasonal = ORIGINAL_PACK.roadEvents.map((e) => ({ ...e, seasons: ['Winter' as const] }));
    expect(validateContent({ ...ORIGINAL_PACK, roadEvents: seasonal })).toContain(
      'region "coast-road" has no road event for every road and season',
    );
  });

  it('checks each kind’s own parts', () => {
    const base = { regions: ['coast-road'], text: 'On the road.' };
    const odd: RoadEventDef[] = [
      {
        ...base,
        kind: 'encounter',
        id: 'ghosts',
        parties: [['no-such-foe']],
        template: 'beast',
        around: 'Round.',
      },
      {
        ...base,
        kind: 'encounter',
        id: 'warlord',
        parties: [['hill-warlord']],
        template: 'no-such-encounter',
        around: 'Round.',
      },
      { ...base, kind: 'find', id: 'stones', ingredientIds: ['no-such-food'], taken: 'Taken.' },
      {
        ...base,
        kind: 'weather',
        id: 'drizzle',
        wait: { reply: 'Waited.', slots: 0 },
        push: { reply: 'Pushed.', energy: 0, health: 0 },
      },
      { ...base, kind: 'sight', id: 'nothing', outcome: 'Seen.', reward: {} },
    ];
    const problems = validateContent({
      ...ORIGINAL_PACK,
      roadEvents: [...ORIGINAL_PACK.roadEvents, ...odd],
    });
    expect(problems).toEqual(
      expect.arrayContaining([
        'road event "ghosts" names unknown foe "no-such-foe"',
        'road event "warlord" names unknown encounter "no-such-encounter"',
        'road event "warlord" has no band of foes a petty road may bring',
        'place "road event stones" references unknown ingredient "no-such-food"',
        'road event "drizzle" costs nothing to wait out or push through',
        'road event "nothing" teaches nothing',
      ]),
    );
  });
});
