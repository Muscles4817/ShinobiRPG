import { hashUnit } from '@/core';

import type { Ambience } from '../sound/ambience';
import type { Hemisphere } from './hemisphere';
import type { TitleLight } from './titleLight';

/**
 * The title screen's weather: made up, never looked up. Each calendar day on the player's clock
 * draws its weather from the date alone, by the season's odds, so everyone playing on the same
 * day sees the same sky: clear more often than not, cloud and mist in spring and autumn, rain
 * most in summer, and snow only in winter. South of the equator the seasons turn over
 * (`hemisphere.ts`): July is winter there.
 */

export const TITLE_WEATHERS = ['clear', 'cloudy', 'mist', 'rain', 'snow'] as const;
export type TitleWeather = (typeof TITLE_WEATHERS)[number];

export const TITLE_SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type TitleSeason = (typeof TITLE_SEASONS)[number];

/** A day on the player's calendar: the month 1–12. */
export interface CalendarDay {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

type Odds = readonly (readonly [TitleWeather, number])[];

/** Each season's weather and how often it comes, out of one. */
const ODDS: Readonly<Record<TitleSeason, Odds>> = {
  spring: [
    ['clear', 0.45],
    ['cloudy', 0.25],
    ['mist', 0.15],
    ['rain', 0.15],
  ],
  summer: [
    ['clear', 0.45],
    ['cloudy', 0.15],
    ['mist', 0.05],
    ['rain', 0.35],
  ],
  autumn: [
    ['clear', 0.45],
    ['cloudy', 0.25],
    ['mist', 0.2],
    ['rain', 0.1],
  ],
  winter: [
    ['clear', 0.4],
    ['cloudy', 0.25],
    ['mist', 0.1],
    ['rain', 0.05],
    ['snow', 0.2],
  ],
};

/** Months between a season and the same season in the other half of the world. */
const HALF_YEAR = 6;

/** The season of a month (1–12) in a half of the world. */
export function seasonOf(month: number, hemisphere: Hemisphere = 'north'): TitleSeason {
  const turned = hemisphere === 'south' ? ((month - 1 + HALF_YEAR) % 12) + 1 : month;
  return northernSeason(turned);
}

function northernSeason(month: number): TitleSeason {
  if (month === 12 || month <= 2) return 'winter';
  if (month <= 5) return 'spring';
  if (month <= 8) return 'summer';
  return 'autumn';
}

/** The weather the title screen shows on a calendar day, in the player's half of the world. */
export function titleWeather(date: CalendarDay, hemisphere: Hemisphere = 'north'): TitleWeather {
  // The date's parts come first: the hash mixes what follows them, so close days part ways.
  const roll = hashUnit(date.year, date.month, date.day, 'title-weather');
  let left = roll;
  for (const [weather, chance] of ODDS[seasonOf(date.month, hemisphere)]) {
    left -= chance;
    if (left < 0) return weather;
  }
  return 'clear';
}

/** What the hour sounds like under that weather: rain drowns the birds, snow hushes everything. */
export function titleAmbience(light: TitleLight, weather: TitleWeather): Ambience {
  switch (weather) {
    case 'rain':
      return 'rain';
    case 'snow':
      return 'snow-hush';
    case 'clear':
    case 'cloudy':
    case 'mist':
      return light.ambience;
  }
}
