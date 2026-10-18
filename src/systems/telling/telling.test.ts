import { NOTHING_TOLD, noteTold, recentlyTold, TOLD_MEMORY } from './telling';

describe('telling', () => {
  it('remembers the newest picks of a bank, a few at most', () => {
    let told = NOTHING_TOLD;
    for (const index of [0, 1, 2, 3, 4]) told = noteTold(told, 'nap', { index, size: 10 });
    expect(recentlyTold(told, 'nap')).toEqual([2, 3, 4]);
    expect(recentlyTold(told, 'nap')).toHaveLength(TOLD_MEMORY);
    expect(recentlyTold(told, 'sleep')).toEqual([]);
  });

  it('never remembers a whole bank, so there is always a line to say', () => {
    let told = NOTHING_TOLD;
    for (const index of [0, 1]) told = noteTold(told, 'small', { index, size: 2 });
    expect(recentlyTold(told, 'small')).toEqual([1]);
  });

  it('moves a line said again to the newest place', () => {
    let told = NOTHING_TOLD;
    for (const index of [0, 1, 0]) told = noteTold(told, 'b', { index, size: 5 });
    expect(recentlyTold(told, 'b')).toEqual([1, 0]);
  });

  it('keeps a longer memory for a bank that asks for one', () => {
    let told = NOTHING_TOLD;
    for (const index of [0, 1, 2, 3, 4]) {
      told = noteTold(told, 'sign-offs', { index, size: 6, memory: 4 });
    }
    expect(recentlyTold(told, 'sign-offs')).toEqual([1, 2, 3, 4]);
  });
});
