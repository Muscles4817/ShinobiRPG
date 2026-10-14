import { findJourney, reachableFrom, type RouteDef } from './travel';

const road = (id: string, from: string, to: string, extra: Partial<RouteDef> = {}): RouteDef => ({
  id,
  from,
  to,
  legs: [{ region: 'hill-road', days: 1, text: 'hill-road' }],
  danger: 'petty',
  ...extra,
});

// home ── port (1 day), home ── ford (1) ── dunes (2, armed, 120 ryo), port ── ford (3)
const routes: RouteDef[] = [
  road('coast', 'home', 'port'),
  road('forest', 'home', 'ford', {
    legs: [{ region: 'forest-track', days: 1, text: 'forest-track' }],
  }),
  road('sands', 'ford', 'dunes', {
    legs: [
      { region: 'river-road', days: 1, text: 'river-road' },
      { region: 'dune-road', days: 1, text: 'dune-road' },
    ],
    danger: 'armed',
    cost: 120,
  }),
  road('long-way', 'port', 'ford', {
    legs: [{ region: 'coast-road', days: 3, text: 'coast-road' }],
  }),
];

describe('travel', () => {
  it('walks the quickest open way, adding up days, ryo and the worst danger', () => {
    expect(findJourney(routes, 'home', 'dunes')).toEqual({
      via: ['ford'],
      legs: [
        { region: 'forest-track', days: 1, text: 'forest-track' },
        { region: 'river-road', days: 1, text: 'river-road' },
        { region: 'dune-road', days: 1, text: 'dune-road' },
      ],
      days: 3,
      cost: 120,
      danger: 'armed',
    });
  });

  it('walks a route backwards with its legs reversed', () => {
    expect(findJourney(routes, 'dunes', 'ford')?.legs.map((l) => l.region)).toEqual([
      'dune-road',
      'river-road',
    ]);
  });

  it('goes the long way round when a road is closed', () => {
    const journey = findJourney(routes, 'port', 'ford', (r) => r.id !== 'long-way');
    expect(journey?.via).toEqual(['home']);
    expect(journey?.days).toBe(2);
    expect(findJourney(routes, 'port', 'ford')?.days).toBe(2);
  });

  it('breaks a tie in days on ryo', () => {
    const tolls = [
      road('dear', 'a', 'b', { cost: 50 }),
      road('cheap', 'a', 'b', {
        cost: 10,
        legs: [{ region: 'coast-road', days: 1, text: 'coast-road' }],
      }),
    ];
    expect(findJourney(tolls, 'a', 'b')?.cost).toBe(10);
  });

  it('finds nothing when no open way goes there', () => {
    expect(findJourney(routes, 'home', 'dunes', (r) => r.id !== 'sands')).toBeNull();
    expect(findJourney(routes, 'home', 'nowhere')).toBeNull();
  });

  it('stays put for free', () => {
    expect(findJourney(routes, 'home', 'home')?.days).toBe(0);
  });

  it('knows what can be reached at all', () => {
    expect([...reachableFrom(routes, 'dunes')].sort()).toEqual(['dunes', 'ford', 'home', 'port']);
    expect([...reachableFrom([], 'home')]).toEqual(['home']);
  });
});
