import { EMPTY_JOURNAL, JOURNAL_LIMIT, write } from './journal';

describe('journal', () => {
  it('appends entries with increasing ids', () => {
    const j = write(write(EMPTY_JOURNAL, 1, 'a'), 1, 'b', 'success');
    expect(j.entries.map((e) => e.id)).toEqual([1, 2]);
  });

  it('caps its length', () => {
    let j = EMPTY_JOURNAL;
    for (let i = 0; i < JOURNAL_LIMIT + 5; i++) j = write(j, 1, `entry ${i}`);
    expect(j.entries).toHaveLength(JOURNAL_LIMIT);
    expect(j.entries[0]?.text).toBe('entry 5');
  });
});
