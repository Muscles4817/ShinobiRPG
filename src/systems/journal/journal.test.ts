import { EMPTY_JOURNAL, JOURNAL_LIMIT, write } from './journal';

const when = { day: 1, slot: 0 };

describe('journal', () => {
  it('appends entries with increasing ids', () => {
    const j = write(write(EMPTY_JOURNAL, when, { text: 'a', tone: 'info' }), when, {
      text: 'b',
      tone: 'success',
      chips: [{ label: 'Speed +1', tone: 'gain' }],
    });
    expect(j.entries.map((e) => e.id)).toEqual([1, 2]);
    expect(j.entries[1]?.chips).toHaveLength(1);
  });

  it('caps its length', () => {
    let j = EMPTY_JOURNAL;
    for (let i = 0; i < JOURNAL_LIMIT + 5; i++)
      j = write(j, when, { text: `entry ${i}`, tone: 'info' });
    expect(j.entries).toHaveLength(JOURNAL_LIMIT);
    expect(j.entries[0]?.text).toBe('entry 5');
  });
});
