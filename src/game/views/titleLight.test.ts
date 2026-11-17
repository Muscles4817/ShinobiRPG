import { titleLight, TITLE_LANTERNS } from './titleLight';

describe('the title screen’s light', () => {
  it('follows the clock through the day', () => {
    expect(titleLight(6, 0).sky).toBe('dawn');
    expect(titleLight(9, 0).sky).toBe('morning');
    expect(titleLight(13, 0).sky).toBe('day');
    expect(titleLight(17, 0).sky).toBe('dusk');
    expect(titleLight(19, 30).sky).toBe('evening');
    expect(titleLight(23, 0).sky).toBe('night');
    // The small hours are still the night before.
    expect(titleLight(2, 0).sky).toBe('night');
  });

  it('lights the lanterns one by one from dusk, all of them by night', () => {
    const lit = [16 * 60 + 30, 18 * 60, 18 * 60 + 40, 19 * 60 + 20, 20 * 60, 22 * 60].map((m) =>
      titleLight(Math.floor(m / 60), m % 60),
    );
    const counts = lit.map((l) => l.lanternsLit);
    expect(counts[0]).toBe(0);
    expect(counts.at(-1)).toBe(TITLE_LANTERNS);
    // Never one put out as the evening goes on.
    expect(counts.every((n, i) => i === 0 || n >= (counts[i - 1] ?? 0))).toBe(true);
    expect(new Set(counts).size).toBeGreaterThan(2);
    expect(titleLight(13, 0).lanternsLit).toBe(0);
    expect(titleLight(13, 0).windowsLit).toBe(false);
    expect(titleLight(22, 0).windowsLit).toBe(true);
  });

  it('wakes to birds and settles to the wind at night', () => {
    expect(titleLight(6, 0).ambience).toBe('dawn-chorus');
    expect(titleLight(10, 0).ambience).toBe('birdsong');
    expect(titleLight(19, 0).ambience).toBe('evening');
    expect(titleLight(1, 0).ambience).toBe('night-wind');
  });

  it('keeps progress within its sky, and takes any hour', () => {
    for (let h = -2; h < 27; h++) {
      const { progress } = titleLight(h, 17);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    }
  });
});
