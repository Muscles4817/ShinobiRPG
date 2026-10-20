import { batchAdded, SCROLL_SESSIONS, scrollMastered, studiedScroll } from './scrolls';

/** An S-rank dust scroll, studied day by day; batches of dust added to a store. */
describe('dust scrolls and batches', () => {
  it('is mastered after its days of study, and never studied past them', () => {
    let scroll = { dustId: 'iron-sand', sessions: 0 };
    for (let day = 1; day <= SCROLL_SESSIONS + 2; day += 1) scroll = studiedScroll(scroll, day);
    expect(scrollMastered(scroll)).toBe(true);
    expect(scroll.sessions).toBe(SCROLL_SESSIONS);
    expect(scrollMastered({ dustId: 'iron-sand', sessions: 1 })).toBe(false);
  });

  it('adds a batch to a store, never past the cap', () => {
    expect(batchAdded(10, 100, 0.25)).toBe(35);
    expect(batchAdded(90, 100, 0.25)).toBe(100);
  });
});
