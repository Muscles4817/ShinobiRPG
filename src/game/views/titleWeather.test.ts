import { titleLight } from './titleLight';
import { seasonOf, titleAmbience, titleWeather, type CalendarDay } from './titleWeather';

function daysOf(year: number, month: number): CalendarDay[] {
  return Array.from({ length: 28 }, (_, i) => ({ year, month, day: i + 1 }));
}

describe('the title screen’s weather', () => {
  it('reads the season from the month', () => {
    expect([1, 4, 7, 10, 12].map((m) => seasonOf(m))).toEqual([
      'winter',
      'spring',
      'summer',
      'autumn',
      'winter',
    ]);
  });

  it('is the same all day, and drawn from the date alone', () => {
    const day = { year: 2026, month: 11, day: 17 };
    expect(titleWeather(day)).toBe(titleWeather({ ...day }));
  });

  it('snows only in winter, and every season sees more than one sky', () => {
    const years = Array.from({ length: 10 }, (_, i) => 2025 + i);
    const summer = years
      .flatMap((y) => [6, 7, 8].flatMap((m) => daysOf(y, m)))
      .map((d) => titleWeather(d));
    const winter = years
      .flatMap((y) => [12, 1, 2].flatMap((m) => daysOf(y, m)))
      .map((d) => titleWeather(d));
    expect(summer).not.toContain('snow');
    expect(winter).toContain('snow');
    expect(summer).toContain('rain');
    expect(new Set(summer).size).toBeGreaterThan(2);
    // Clear is the commonest sky.
    const clear = summer.filter((w) => w === 'clear').length;
    expect(clear).toBeGreaterThan(summer.length * 0.35);
    expect(clear).toBeLessThan(summer.length * 0.55);
  });

  it('lets rain and snow drown out the hour’s own sounds', () => {
    const dawn = titleLight(6, 0);
    expect(titleAmbience(dawn, 'clear')).toBe('dawn-chorus');
    expect(titleAmbience(dawn, 'mist')).toBe('dawn-chorus');
    expect(titleAmbience(dawn, 'rain')).toBe('rain');
    expect(titleAmbience(dawn, 'snow')).toBe('snow-hush');
  });

  it('turns the seasons over south of the equator', () => {
    expect(seasonOf(7, 'south')).toBe('winter');
    expect(seasonOf(1, 'south')).toBe('summer');
    expect(seasonOf(10, 'south')).toBe('spring');
    expect(seasonOf(4, 'south')).toBe('autumn');
    const julys = Array.from({ length: 10 }, (_, i) => 2025 + i).flatMap((y) => daysOf(y, 7));
    expect(julys.map((d) => titleWeather(d, 'south'))).toContain('snow');
    expect(julys.map((d) => titleWeather(d))).not.toContain('snow');
  });
});
