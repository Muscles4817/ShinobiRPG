import { learnOf, meetOnRoad, NEW_ATLAS, RECENT_ROAD, visit } from './atlas';

describe('the atlas', () => {
  it('learns of places once each', () => {
    const atlas = learnOf(learnOf(NEW_ATLAS, ['ford', 'falls', 'ford']), ['falls']);
    expect(atlas.known).toEqual(['ford', 'falls']);
  });

  it('knows a place once you have been there', () => {
    const atlas = visit(NEW_ATLAS, 'falls');
    expect(atlas).toMatchObject({ known: ['falls'], visited: ['falls'] });
    expect(visit(atlas, 'falls')).toBe(atlas);
  });

  it('remembers the last few road events, and the once-in-a-life ones for good', () => {
    const met = Array.from({ length: RECENT_ROAD + 2 }, (_, i) => `event-${i}`).reduce(
      (atlas, id) => meetOnRoad(atlas, id, id === 'event-0'),
      NEW_ATLAS,
    );
    expect(met.recentRoad).toHaveLength(RECENT_ROAD);
    expect(met.recentRoad).not.toContain('event-0');
    expect(met.roadSeen).toEqual(['event-0']);
  });
});
