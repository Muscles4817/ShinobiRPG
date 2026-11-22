import { nextWatching, type Watching } from './useWatching';

/** Where watching stands, as the fight's log grows (or is replaced). */

const AT_START: Watching = { from: 4, seen: 4, holding: false, before: null };

describe('where watching a staged fight stands', () => {
  it('stays put while the log has nothing new, as while a step is still out', () => {
    expect(nextWatching(AT_START, 4, true)).toBeNull();
  });

  it('stages new lines from where you left off, and holds the stage', () => {
    const staged = nextWatching(AT_START, 9, true);
    expect(staged).toMatchObject({ from: 4, seen: 4, holding: true });
    expect(nextWatching(staged!, 9, true)).toBeNull();
  });

  it('stages the next lines after the last ones were watched', () => {
    const watched: Watching = { from: 4, seen: 9, holding: false, before: null };
    expect(nextWatching(watched, 9, true)).toBeNull();
    expect(nextWatching(watched, 14, true)).toMatchObject({ from: 9, seen: 9, holding: true });
  });

  it('starts over at the end of a log shorter than what was watched (another fight)', () => {
    const watched: Watching = { from: 4, seen: 9, holding: true, before: [] };
    expect(nextWatching(watched, 2, true)).toEqual({
      from: 2,
      seen: 2,
      holding: false,
      before: null,
    });
  });

  it('keeps up turn by turn, so a finished fight stages only its end', () => {
    expect(nextWatching(AT_START, 7, false)).toEqual({
      from: 7,
      seen: 7,
      holding: false,
      before: null,
    });
    expect(nextWatching({ ...AT_START, from: 7, seen: 7 }, 7, false)).toBeNull();
  });
});
