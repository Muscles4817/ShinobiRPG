/**
 * Game calendar. A day is split into four slots; most actions cost one or more slots.
 */
export const TIME_SLOTS = ['morning', 'afternoon', 'evening', 'night'] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

export const SLOTS_PER_DAY = TIME_SLOTS.length;
export const DAYS_PER_SEASON = 28;
export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;

export interface GameTime {
  /** 1-based day count since the game began. */
  readonly day: number;
  /** Index into TIME_SLOTS. */
  readonly slot: number;
}

export const START_TIME: GameTime = { day: 1, slot: 0 };

export function advanceSlots(time: GameTime, slots: number): GameTime {
  const total = time.slot + slots;
  return { day: time.day + Math.floor(total / SLOTS_PER_DAY), slot: total % SLOTS_PER_DAY };
}

/** Number of slots from `time` until the start of the next morning. */
export function slotsUntilNextMorning(time: GameTime): number {
  return SLOTS_PER_DAY - time.slot;
}

export function slotName(time: GameTime): TimeSlot {
  const name = TIME_SLOTS[time.slot];
  if (name === undefined) throw new Error(`Invalid time slot index: ${time.slot}`);
  return name;
}

export function formatDate(time: GameTime): string {
  const dayIndex = time.day - 1;
  const season = SEASONS[Math.floor(dayIndex / DAYS_PER_SEASON) % SEASONS.length];
  const year = Math.floor(dayIndex / (DAYS_PER_SEASON * SEASONS.length)) + 1;
  const dayOfSeason = (dayIndex % DAYS_PER_SEASON) + 1;
  return `Year ${year}, ${season ?? ''} ${dayOfSeason}`;
}
