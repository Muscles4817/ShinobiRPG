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

/** Chakra control at the bottom of each grade (see `STAT_TIERS`). */
const GRADE_D = 8;
const GRADE_C = 13;
const BELOW_D = 7;

/** A jōnin at the port (leave aside) with the given chakra control. */
function atPort(chakraControl: number): GameState {
  const state = newGame();
  return {
    ...state,
    locationId: 'port-shiomachi',
    standing: { ...state.standing, rank: 'jonin' },
    character: {
      ...state.character,
      stats: { ...state.character.stats, chakraControl },
    },
  };
}

const bay = ctx.content.routes.require('bay-crossing');

describe('walking on chakra (the stand-in rule)', () => {
  it('walks up trees from chakra control grade D and on water from grade C', () => {
    expect(canWalk(atPort(BELOW_D), ctx, 'trees')).toBe(false);
    expect(canWalk(atPort(GRADE_D), ctx, 'trees')).toBe(true);
    expect(canWalk(atPort(GRADE_D), ctx, 'water')).toBe(false);
    expect(canWalk(atPort(GRADE_C), ctx, 'water')).toBe(true);
  });
});

describe('roads with needs', () => {
  it('closes the bay crossing to someone who can’t walk on water, and says what opens it', () => {
    expect(roadOpen(atPort(GRADE_D), ctx, bay)).toBe(false);
    expect(closedBy(atPort(GRADE_D), ctx, bay)).toBe(
      'The bay crossing needs water-walking: chakra control at grade C.',
    );
    expect(roadOpen(atPort(GRADE_C), ctx, bay)).toBe(true);
    expect(closedBy(atPort(GRADE_C), ctx, bay)).toBeNull();
  });

  it('goes the long way round below the grade, and across the bay at it', () => {
    const round = journeyTo(atPort(GRADE_D), ctx, 'kiri-ford');
    expect(round?.routeIds).toEqual(['coast-road', 'ford-track']);
    const across = journeyTo(atPort(GRADE_C), ctx, 'kiri-ford');
    expect(across?.routeIds).toEqual(['bay-crossing']);
    expect(across?.days).toBeLessThan(round?.days ?? 0);
  });

  it('sets out across the bay only when you can walk on water', () => {
    const round = act(atPort(GRADE_D), { type: 'travel', locationId: 'kiri-ford' });
    expect(round.mission?.journey?.legs.map((l) => l.region)).toEqual([
      'coast-road',
      'forest-track',
    ]);
    const across = act(atPort(GRADE_C), { type: 'travel', locationId: 'kiri-ford' });
    expect(across.mission?.journey?.legs).toEqual(bay.legs);
  });

  it('reads rank and world-mark needs from the save', () => {
    const toll: RouteDef = {
      ...bay,
      needs: [
        { kind: 'rank', rank: 'chunin' },
        { kind: 'worldMark', mark: 'salt-shrine-lit', text: 'the harbour’s thanks' },
      ],
    };
    const able = atPort(GRADE_C);
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
    expect(road(atPort(GRADE_D))?.open).toBe(false);
    expect(road(atPort(GRADE_C))?.open).toBe(true);
  });

  it('says on the destination what opens the shortcut and what it would save', () => {
    const ford = (s: GameState) =>
      travelView(s, ctx).destinations.find((d) => d.id === 'kiri-ford');
    expect(ford(atPort(GRADE_D))?.closedRoads).toEqual([
      'The bay crossing needs water-walking: chakra control at grade C. It would save a day.',
    ]);
    expect(ford(atPort(GRADE_D))?.days).toBe(2);
    expect(ford(atPort(GRADE_C))?.closedRoads).toEqual([]);
    expect(ford(atPort(GRADE_C))?.days).toBe(1);
  });

  it('names a closed road to a place even when it is no shortcut from here', () => {
    const home = { ...atPort(GRADE_D), locationId: 'torogakure' };
    const port = travelView(home, ctx).destinations.find((d) => d.id === 'port-shiomachi');
    expect(port?.closedRoads).toEqual([
      'The bay crossing needs water-walking: chakra control at grade C.',
    ]);
  });

  it('says nothing of roads to a place that is coming soon', () => {
    const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
    const locked = createGameContext({
      ...original,
      locations: original.locations.map((l) =>
        l.id === 'kiri-ford' ? { ...l, lockedReason: 'Coming soon' } : l,
      ),
    });
    const ford = travelView(atPort(GRADE_D), locked).destinations.find((d) => d.id === 'kiri-ford');
    expect(ford?.closedRoads).toEqual([]);
  });
});
