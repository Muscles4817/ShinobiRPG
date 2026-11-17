import { useEffect, useState } from 'react';

import { hemisphereOf, titleLight, titleWeather, type TitleLight, type TitleWeather } from '@/game';

/**
 * The title screen's light and weather by the player's own clock and calendar, looked at again
 * each minute. A page address with `?hour=19` (or `?hour=19:30`) holds it at that hour, and
 * `?weather=rain` (clear, cloudy, mist, rain or snow) holds the weather, to see every sky
 * without waiting for it.
 */

const RECHECK_MS = 60_000;
const HOUR_PARAM = /^(\d{1,2})(?::(\d{2}))?$/;
const WEATHERS: readonly TitleWeather[] = ['clear', 'cloudy', 'mist', 'rain', 'snow'];

export interface TitleSkyNow {
  readonly light: TitleLight;
  readonly weather: TitleWeather;
}

function asked(name: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(name);
}

function heldWeather(): TitleWeather | null {
  const wanted = asked('weather');
  return WEATHERS.find((w) => w === wanted) ?? null;
}

/** The device's time zone name ("Australia/Sydney"), or undefined where it can't say. */
function deviceTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

function skyNow(): TitleSkyNow {
  const now = new Date();
  const match = HOUR_PARAM.exec(asked('hour') ?? '');
  const hour = match ? Number(match[1]) : now.getHours();
  const minute = match ? Number(match[2] ?? 0) : now.getMinutes();
  const today = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  return {
    light: titleLight(hour, minute),
    weather: heldWeather() ?? titleWeather(today, hemisphereOf(deviceTimeZone())),
  };
}

export function useTitleSky(): TitleSkyNow {
  const [sky, setSky] = useState(skyNow);
  useEffect(() => {
    const timer = setInterval(() => {
      setSky(skyNow());
    }, RECHECK_MS);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return sky;
}
