import { learnOf, NEW_ATLAS, visit } from './atlas';

describe('the atlas', () => {
  it('learns of places once each', () => {
    const atlas = learnOf(learnOf(NEW_ATLAS, ['ford', 'falls', 'ford']), ['falls']);
    expect(atlas.known).toEqual(['ford', 'falls']);
  });

  it('knows a place once you have been there', () => {
    const atlas = visit(NEW_ATLAS, 'falls');
    expect(atlas).toEqual({ known: ['falls'], visited: ['falls'] });
    expect(visit(atlas, 'falls')).toBe(atlas);
  });
});
