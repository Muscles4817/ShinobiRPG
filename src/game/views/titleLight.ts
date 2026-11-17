import type { Ambience } from '../sound/ambience';

/**
 * The title screen follows the player's own clock (`ui/screens/menu/useLocalClock.ts` reads
 * it; this decides what it means): the sun coming up over the village at dawn, the plain day,
 * the low sun at dusk while the lanterns are lit one by one, and the night with every lantern
 * burning. Pure, so any hour can be drawn and tested.
 */

export const TITLE_SKIES = ['dawn', 'morning', 'day', 'dusk', 'evening', 'night'] as const;
export type TitleSky = (typeof TITLE_SKIES)[number];

/** Where each sky begins, in minutes after midnight; night runs on past midnight to dawn. */
const SKY_STARTS: readonly (readonly [TitleSky, number])[] = [
  ['dawn', 5 * 60],
  ['morning', 7 * 60 + 30],
  ['day', 11 * 60],
  ['dusk', 16 * 60 + 30],
  ['evening', 18 * 60 + 30],
  ['night', 20 * 60 + 30],
];
const DAY_MINUTES = 24 * 60;

/** The lanterns on the line, in the order they are lit: the middle first, then left, then right. */
export const TITLE_LANTERNS = 3;

const AMBIENCE: Readonly<Record<TitleSky, Ambience>> = {
  dawn: 'dawn-chorus',
  morning: 'birdsong',
  day: 'birdsong',
  dusk: 'evening',
  evening: 'evening',
  night: 'night-wind',
};

export interface TitleLight {
  readonly sky: TitleSky;
  /** How far through its sky the hour is, 0 at its start to 1 at its end. */
  readonly progress: number;
  /** How many lanterns burn, in lighting order (`TITLE_LANTERNS` at most). */
  readonly lanternsLit: number;
  /** Lamps lit behind the village's windows. */
  readonly windowsLit: boolean;
  readonly ambience: Ambience;
}

function skyAt(minutes: number): { sky: TitleSky; progress: number } {
  const index = SKY_STARTS.findLastIndex(([, start]) => minutes >= start);
  // Before dawn is still the night that began the evening before.
  const at = index === -1 ? SKY_STARTS.length - 1 : index;
  const [sky, start] = SKY_STARTS[at] ?? ['night', 0];
  const end = SKY_STARTS[at + 1]?.[1] ?? (SKY_STARTS[0]?.[1] ?? 0) + DAY_MINUTES;
  const since = (minutes - start + DAY_MINUTES) % DAY_MINUTES;
  return { sky, progress: Math.min(1, since / (end - start)) };
}

/**
 * Lanterns come on through dusk and the evening, one after another, and go out as the dawn
 * comes up; the day has none lit.
 */
function lanternsFor(sky: TitleSky, progress: number): number {
  switch (sky) {
    case 'night':
      return TITLE_LANTERNS;
    case 'dawn':
      return progress < 0.5 ? 1 : 0;
    case 'morning':
    case 'day':
      return 0;
    case 'dusk':
      return progress < 0.6 ? 0 : 1;
    case 'evening':
      return Math.min(TITLE_LANTERNS, 1 + Math.floor(progress * TITLE_LANTERNS));
  }
}

/** The title's light at a time of day on the player's clock. */
export function titleLight(hour: number, minute: number): TitleLight {
  const minutes = (((hour * 60 + minute) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const { sky, progress } = skyAt(minutes);
  const lanternsLit = lanternsFor(sky, progress);
  const windowsLit = sky === 'evening' || sky === 'night' || (sky === 'dusk' && progress > 0.3);
  return { sky, progress, lanternsLit, windowsLit, ambience: AMBIENCE[sky] };
}
