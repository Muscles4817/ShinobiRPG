/**
 * Which build of the game this is: the commit it was made from and the day, stamped in by Vite
 * (`vite.config.ts`), so a player can tell an updated app from one the offline cache still holds.
 */

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export interface BuildStamp {
  readonly commit: string;
  /** YYYY-MM-DD, or empty where the build wasn't stamped. */
  readonly date: string;
}

/** The stamp Vite put in, or a plain 'dev' where nothing did. */
export function buildStamp(): BuildStamp {
  return {
    commit: typeof __BUILD_COMMIT__ === 'string' ? __BUILD_COMMIT__ : 'dev',
    date: typeof __BUILD_DATE__ === 'string' ? __BUILD_DATE__ : '',
  };
}

/** A build in words: "Build 1a2b3c4, made 18 November 2026". */
export function buildLine(stamp: BuildStamp = buildStamp()): string {
  const [year, month, day] = stamp.date.split('-').map(Number);
  const monthName = month ? MONTHS[month - 1] : undefined;
  if (!year || !monthName || !day) return `Build ${stamp.commit}`;
  return `Build ${stamp.commit}, made ${String(day)} ${monthName} ${String(year)}`;
}
