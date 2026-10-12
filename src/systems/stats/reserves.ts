/**
 * Chakra reserves are never drilled. They deepen alongside stamina (a share of every stamina
 * gain) and with the chakra a fighter actually spends, both through the usual diminishing
 * returns on the reserves stat itself.
 */

/** The part of a stat delta this file reads and writes (kept structural: `stats.ts` uses it). */
interface ReservesGains {
  readonly stamina?: number;
  readonly reserves?: number;
}

/** Share of a session's stamina gain that also goes to reserves. */
export const RESERVES_PER_STAMINA = 0.5;
/** Base reserves gain per point of chakra spent in a fight, before diminishing returns. */
export const RESERVES_PER_CHAKRA_SPENT = 0.02;

/** A session's gains with the reserves that come along with its stamina work. */
export function withReserves<T extends ReservesGains>(gains: T): T {
  const stamina = gains.stamina;
  if (stamina === undefined || stamina <= 0) return gains;
  return { ...gains, reserves: (gains.reserves ?? 0) + stamina * RESERVES_PER_STAMINA };
}

/** The base reserves gain from spending this much chakra in a fight. */
export function reservesFromChakraSpent(chakraSpent: number): ReservesGains {
  return chakraSpent > 0 ? { reserves: chakraSpent * RESERVES_PER_CHAKRA_SPENT } : {};
}
