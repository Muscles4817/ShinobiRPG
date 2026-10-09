import { daysOfRentLeft, isRentOverdue, newTenancy, payWeek } from './housing';

describe('housing', () => {
  const home = newTenancy('home', 30, 1);

  it('starts with the first week paid', () => {
    expect(isRentOverdue(home, 7)).toBe(false);
    expect(isRentOverdue(home, 8)).toBe(true);
    expect(daysOfRentLeft(home, 3)).toBe(4);
  });

  it('extends the tenancy a week at a time', () => {
    expect(isRentOverdue(payWeek(home), 14)).toBe(false);
    expect(isRentOverdue(payWeek(home), 15)).toBe(true);
  });
});
