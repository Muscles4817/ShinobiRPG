import {
  advanceSlots,
  calendarDay,
  daysUntil,
  formatDate,
  slotName,
  slotsUntilNextMorning,
  START_TIME,
} from './time';

describe('time', () => {
  it('advances within a day', () => {
    expect(advanceSlots(START_TIME, 2)).toEqual({ day: 1, slot: 2 });
  });

  it('rolls over into following days', () => {
    expect(advanceSlots({ day: 1, slot: 3 }, 1)).toEqual({ day: 2, slot: 0 });
    expect(advanceSlots({ day: 1, slot: 2 }, 9)).toEqual({ day: 3, slot: 3 });
  });

  it('counts slots until next morning', () => {
    expect(slotsUntilNextMorning({ day: 1, slot: 0 })).toBe(4);
    expect(slotsUntilNextMorning({ day: 1, slot: 3 })).toBe(1);
  });

  it('formats dates across seasons and years', () => {
    expect(formatDate(START_TIME)).toBe('Year 1, Spring 1');
    expect(formatDate({ day: 29, slot: 0 })).toBe('Year 1, Summer 1');
    expect(formatDate({ day: 113, slot: 0 })).toBe('Year 2, Spring 1');
  });

  it('finds the day of the year and counts down to a date', () => {
    expect(calendarDay(1)).toEqual({ season: 0, day: 1 });
    expect(calendarDay(30)).toEqual({ season: 1, day: 2 });
    expect(calendarDay(113)).toEqual({ season: 0, day: 1 });
    expect(daysUntil(1, { season: 0, day: 1 })).toBe(0);
    expect(daysUntil(1, { season: 0, day: 8 })).toBe(7);
    expect(daysUntil(30, { season: 0, day: 1 })).toBe(83);
  });

  it('names slots', () => {
    expect(slotName({ day: 1, slot: 3 })).toBe('night');
  });
});
