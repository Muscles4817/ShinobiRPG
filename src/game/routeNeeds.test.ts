import { CONTENT_PACKS } from '@/content';
import type { RouteDef } from '@/systems/travel';
import { act, ctx, newGame } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { journeyTo } from './journeys';
import { closedBy, roadOpen } from './routeNeeds';
import type { GameState } from './state';
import { travelView } from './views/travel';
import { travelMap } from './views/travelMap';
import { canWalk } from './walking';

/** Exercises mastered: none, tree-walking, or both. */
const NONE: readonly string[] = [];
const TREES = ['tree-walking'];
const BOTH = ['tree-walking', 'water-walking'];

/** A jōnin at the port (leave aside) who has mastered the given exercises. */
function atPort(mastered: readonly string[]): GameState {
  const state = newGame();
  const breakthroughs = mastered.map((id) => ({ source: `exercise:${id}`, limits: {} }));
  return {
    ...state,
    locationId: 'port-shiomachi',
    standing: { ...state.standing, rank: 'jonin' },
    character: { ...state.character, breakthroughs },
  };
}

const bay = ctx.content.routes.require('bay-crossing');

describe('walking on chakra', () => {
  it('walks a surface once its exercise is mastered', () => {
    expect(canWalk(atPort(NONE), ctx, 'trees')).toBe(false);
    expect(canWalk(atPort(TREES), ctx, 'trees')).toBe(true);
    expect(canWalk(atPort(TREES), ctx, 'water')).toBe(false);
    expect(canWalk(atPort(BOTH), ctx, 'water')).toBe(true);
  });
});

describe('roads with needs', () => {
  it('closes the bay crossing to someone who can’t walk on water, and says what opens it', () => {
    expect(roadOpen(atPort(TREES), ctx, bay)).toBe(false);
    expect(closedBy(atPort(TREES), ctx, bay)).toBe('The bay crossing needs water-walking.');
    expect(roadOpen(atPort(BOTH), ctx, bay)).toBe(true);
    expect(closedBy(atPort(BOTH), ctx, bay)).toBeNull();
  });

  it('goes the long way round without water-walking, and across the bay with it', () => {
    const round = journeyTo(atPort(TREES), ctx, 'kiri-ford');
    expect(round?.routeIds).toEqual(['coast-road', 'ford-track']);
    const across = journeyTo(atPort(BOTH), ctx, 'kiri-ford');
    expect(across?.routeIds).toEqual(['bay-crossing']);
    expect(across?.days).toBeLessThan(round?.days ?? 0);
  });

  it('sets out across the bay only when you can walk on water', () => {
    const round = act(atPort(TREES), { type: 'travel', locationId: 'kiri-ford' });
    expect(round.mission?.journey?.legs.map((l) => l.region)).toEqual([
      'coast-road',
      'forest-track',
    ]);
    const across = act(atPort(BOTH), { type: 'travel', locationId: 'kiri-ford' });
    expect(across.mission?.journey?.legs).toEqual(
      bay.legs.map((leg) => ({ ...leg, toward: 'kiri-ford', danger: bay.danger })),
    );
  });

  it('reads rank and world-mark needs from the save', () => {
    const toll: RouteDef = {
      ...bay,
      needs: [
        { kind: 'rank', rank: 'chunin' },
        { kind: 'worldMark', mark: 'salt-shrine-lit', text: 'the harbour’s thanks' },
      ],
    };
    const able = atPort(BOTH);
    const genin = { ...able, standing: { ...able.standing, rank: 'genin' as const } };
    expect(closedBy(genin, ctx, toll)).toBe('The bay crossing needs Chūnin rank.');
    expect(closedBy(able, ctx, toll)).toBe('The bay crossing needs the harbour’s thanks.');
    const thanked = { ...able, village: { ...able.village, marks: ['salt-shrine-lit'] } };
    expect(roadOpen(thanked, ctx, toll)).toBe(true);
  });
});

describe('the Travel tab and map', () => {
  it('dots a closed road on the map and opens it once you can walk it', () => {
    const road = (s: GameState) => travelMap(s, ctx).roads.find((r) => r.id === 'bay-crossing');
    expect(road(atPort(TREES))?.open).toBe(false);
    expect(road(atPort(BOTH))?.open).toBe(true);
  });

  it('says on the destination what opens the shortcut and what it would save', () => {
    const ford = (s: GameState) =>
      travelView(s, ctx).destinations.find((d) => d.id === 'kiri-ford');
    expect(ford(atPort(TREES))?.closedRoads).toEqual([
      'The bay crossing needs water-walking. It would save a day.',
    ]);
    expect(ford(atPort(TREES))?.days).toBe(2);
    expect(ford(atPort(BOTH))?.closedRoads).toEqual([]);
    expect(ford(atPort(BOTH))?.days).toBe(1);
  });

  it('names a closed road to a place even when it is no shortcut from here', () => {
    const home = { ...atPort(TREES), locationId: 'torogakure' };
    const port = travelView(home, ctx).destinations.find((d) => d.id === 'port-shiomachi');
    expect(port?.closedRoads).toEqual(['The bay crossing needs water-walking.']);
  });

  it('says nothing of roads to a place that is coming soon', () => {
    const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
    const locked = createGameContext({
      ...original,
      locations: original.locations.map((l) =>
        l.id === 'kiri-ford' ? { ...l, lockedReason: 'Coming soon' } : l,
      ),
    });
    const ford = travelView(atPort(TREES), locked).destinations.find((d) => d.id === 'kiri-ford');
    expect(ford?.closedRoads).toEqual([]);
  });
});
