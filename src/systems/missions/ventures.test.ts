import { depthsOut, depthsTo } from './ventures';

describe('the depths of a venture', () => {
  it('goes in from the edge as far as planned', () => {
    expect(depthsTo('edge')).toEqual(['edge']);
    expect(depthsTo('heart')).toEqual(['edge', 'deep', 'heart']);
  });

  it('walks back out through the depths it came by', () => {
    expect(depthsOut('edge')).toEqual([]);
    expect(depthsOut('heart')).toEqual(['deep', 'edge']);
  });
});
