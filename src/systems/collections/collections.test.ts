import {
  EMPTY_FIELD_BOOK,
  knownWell,
  lengthAt,
  markRewarded,
  recordCatch,
  recordFight,
  recordFinds,
  recordSight,
} from './index';

describe('the field book', () => {
  it('keeps the longest catch of each kind and the day it was landed', () => {
    const first = recordCatch(EMPTY_FIELD_BOOK, { id: 'eel', length: 50, day: 3 });
    expect(first.best).toBe(true);
    const shorter = recordCatch(first.book, { id: 'eel', length: 40, day: 4 });
    expect(shorter.best).toBe(false);
    expect(shorter.book.catches.eel).toEqual({ count: 2, best: 50, bestDay: 3 });
    const longer = recordCatch(shorter.book, { id: 'eel', length: 61, day: 9 });
    expect(longer.best).toBe(true);
    expect(longer.book.catches.eel).toEqual({ count: 3, best: 61, bestDay: 9 });
  });

  it('counts finds, and each sight once', () => {
    const book = recordFinds(EMPTY_FIELD_BOOK, ['greens', 'greens', 'ginger']);
    expect(book.finds).toEqual({ greens: 2, ginger: 1 });
    expect(recordFinds(book, [])).toBe(book);
    const seen = recordSight(recordSight(book, 'fox'), 'fox');
    expect(seen.sights).toEqual(['fox']);
  });

  it('counts a fight once per kind of foe, and a foe beaten often is known well', () => {
    let book = recordFight(EMPTY_FIELD_BOOK, ['thug', 'thug', 'archer'], true);
    expect(book.foes.thug).toEqual({ fought: 1, beaten: 1 });
    book = recordFight(book, ['thug'], false);
    expect(book.foes.thug).toEqual({ fought: 2, beaten: 1 });
    book = recordFight(recordFight(book, ['thug'], true), ['thug'], true);
    expect(knownWell(book.foes.thug)).toBe(true);
    expect(knownWell(book.foes.archer)).toBe(false);
  });

  it('hands a page’s reward over once', () => {
    const book = markRewarded(EMPTY_FIELD_BOOK, 'fish');
    expect(markRewarded(book, 'fish').rewarded).toEqual(['fish']);
  });

  it('makes big fish rare: the top of the range needs the top of the roll', () => {
    expect(lengthAt([10, 50], 0)).toBe(10);
    expect(lengthAt([10, 50], 0.5)).toBe(20);
    expect(lengthAt([10, 50], 0.999)).toBe(50);
  });
});
