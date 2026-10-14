import type { RouteNeed } from '@/systems/travel';

import { ORIGINAL_PACK } from './packs/original';
import { validateContent } from './validate';

describe('route validation', () => {
  it('passes the shipped pack', () => {
    expect(validateContent(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports a location with no road to it', () => {
    const pack = {
      ...ORIGINAL_PACK,
      routes: ORIGINAL_PACK.routes.filter((r) => r.id !== 'reikon-pass'),
    };
    expect(validateContent(pack)).toContain(
      'location "mount-reikon" has no road to it from the start',
    );
  });

  it('reports bad ends, empty or short legs and unknown regions', () => {
    const pack = {
      ...ORIGINAL_PACK,
      routes: [
        ...ORIGINAL_PACK.routes,
        { id: 'loop', from: 'torogakure', to: 'torogakure', legs: [], danger: 'petty' as const },
        {
          id: 'odd',
          from: 'torogakure',
          to: 'atlantis',
          legs: [{ region: 'sea-floor', days: 0, text: ' ' }],
          danger: 'petty' as const,
        },
      ],
    };
    expect(validateContent(pack)).toEqual([
      'route "loop" goes nowhere',
      'route "loop" has no legs',
      'route "odd" ends at unknown location "atlantis"',
      'route "odd" has a leg through "sea-floor" of under a day',
      'route "odd" has a leg with no text',
      'route "odd" crosses region "sea-floor", which has no road events',
    ]);
  });

  it('reports a place off the map', () => {
    const pack = {
      ...ORIGINAL_PACK,
      locations: ORIGINAL_PACK.locations.map((l) =>
        l.id === 'kiri-ford' ? { ...l, map: { x: 140, y: 20 } } : l,
      ),
    };
    expect(validateContent(pack)).toContain('location "kiri-ford" is off the map');
  });

  it('reports a job that ends elsewhere without a road, or somewhere locked', () => {
    const pack = {
      ...ORIGINAL_PACK,
      missions: ORIGINAL_PACK.missions.map((m) =>
        m.id === 'arc-salt-letter' ? { ...m, endsAt: 'sakyugakure' } : m,
      ),
    };
    expect(validateContent(pack)).toEqual(
      expect.arrayContaining([
        'mission "arc-salt-letter" ends somewhere still locked',
        'mission "arc-salt-letter" ends elsewhere without a road',
      ]),
    );
  });

  it('reports an act based in a town whose office doesn’t post its jobs', () => {
    const pack = {
      ...ORIGINAL_PACK,
      arcs: ORIGINAL_PACK.arcs.map((a) => ({
        ...a,
        acts: a.acts.map((act, i) =>
          i === 0 ? { ...act, baseLocationId: 'port-shiomachi' } : act,
        ),
      })),
    };
    expect(validateContent(pack)).toContain(
      'arc "salt-in-the-lanterns" job "arc-salt-letter" isn’t posted at its base, Port Shiomachi',
    );
  });

  it('reports needs that can’t be met or told: unknown ranks, marks and surfaces, no name', () => {
    const bay = ORIGINAL_PACK.routes.find((r) => r.id === 'bay-crossing')!;
    const { name: _unnamed, ...nameless } = bay;
    const pack = {
      ...ORIGINAL_PACK,
      routes: [
        ...ORIGINAL_PACK.routes.filter((r) => r.id !== 'bay-crossing'),
        {
          ...bay,
          // Deliberately bad data, as a pack typed loosely might hold.
          needs: [
            { kind: 'rank', rank: 'shogun' },
            { kind: 'worldMark', mark: 'never-left', text: 'a ghost’s leave' },
            { kind: 'worldMark', mark: 'salt-shrine-lit', text: ' ' },
            { kind: 'walk', surface: 'lava' },
          ] as unknown as RouteNeed[],
        },
        { ...nameless, id: 'nameless' },
        { ...nameless, id: 'needless', needs: [] },
      ],
    };
    expect(validateContent(pack)).toEqual([
      'route "bay-crossing" needs unknown rank "shogun"',
      'route "bay-crossing" needs "never-left", which no job leaves behind',
      'route "bay-crossing" needs world mark "salt-shrine-lit" with no words for it',
      'route "bay-crossing" needs walking on unknown surface "lava"',
      'route "nameless" has needs but no name to tell the player',
      'route "needless" has an empty needs list',
    ]);
  });
});
