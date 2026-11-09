import { worldAllows } from './worldGate';

describe('a world gate', () => {
  it('lets anything through when it asks nothing', () => {
    expect(worldAllows({}, [])).toBe(true);
  });

  it('waits on a mark and closes on another', () => {
    const gate = { needsWorldMark: 'met', closedBy: 'gone' };
    expect(worldAllows(gate, [])).toBe(false);
    expect(worldAllows(gate, ['met'])).toBe(true);
    expect(worldAllows(gate, ['met', 'gone'])).toBe(false);
  });
});
