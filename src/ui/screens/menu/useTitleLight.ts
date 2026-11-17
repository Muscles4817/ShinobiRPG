import { useEffect, useState } from 'react';

import { titleLight, type TitleLight } from '@/game';

/**
 * The title screen's light by the player's own clock, looked at again each minute. A page
 * address with `?hour=19` (or `?hour=19:30`) holds it at that hour, to see every sky without
 * waiting for it.
 */

const RECHECK_MS = 60_000;
const HOUR_PARAM = /^(\d{1,2})(?::(\d{2}))?$/;

interface ClockTime {
  readonly hour: number;
  readonly minute: number;
}

/** The hour asked for in the address, or null. */
function heldHour(): ClockTime | null {
  if (typeof window === 'undefined') return null;
  const asked = new URLSearchParams(window.location.search).get('hour');
  const match = asked ? HOUR_PARAM.exec(asked) : null;
  if (!match) return null;
  return { hour: Number(match[1]), minute: Number(match[2] ?? 0) };
}

function clockNow(): ClockTime {
  const now = new Date();
  return heldHour() ?? { hour: now.getHours(), minute: now.getMinutes() };
}

export function useTitleLight(): TitleLight {
  const [time, setTime] = useState(clockNow);
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(clockNow());
    }, RECHECK_MS);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return titleLight(time.hour, time.minute);
}
