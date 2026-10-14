import { leaveLeft, NO_LEAVE, passValid, signPass, takeLeave } from './leave';

describe('leave', () => {
  it('a pass is good from the day it is signed for its days, and not after', () => {
    const pass = signPass(NO_LEAVE, 10, 7);
    expect(passValid(NO_LEAVE, 10)).toBe(false);
    expect(passValid(pass, 10)).toBe(true);
    expect(passValid(pass, 16)).toBe(true);
    expect(passValid(pass, 17)).toBe(false);
  });

  it('counts leave days within a season, and starts again with the next', () => {
    const taken = takeLeave(takeLeave(NO_LEAVE, 3, 4), 3, 2);
    expect(leaveLeft(taken, 3, 10)).toBe(4);
    expect(leaveLeft(takeLeave(taken, 3, 9), 3, 10)).toBe(0);
    expect(leaveLeft(taken, 4, 10)).toBe(10);
    expect(takeLeave(taken, 4, 1)).toMatchObject({ season: 4, daysTaken: 1 });
  });
});
