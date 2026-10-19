import type { Hive, Jar } from './hives';

/**
 * Jars and broods (`docs/design/retinue-plan.md`, step 4c): wild insects kept at home, a few at
 * a time, studied for some days before you understand them well enough to cross them in; a cross
 * takes some days and half the hive goes into it.
 */

export const MAX_JARS = 3;
/** Days of study before a jar's insects can be crossed. */
export const STUDY_DAYS = 2;
/** Days a cross takes to breed. */
export const CROSS_DAYS = 3;
/** Share of the hive given to a brood while it breeds. */
export const BROOD_SHARE = 0.5;

export function jarOf(hive: Hive, strainId: string): Jar | undefined {
  return (hive.jars ?? []).find((j) => j.strainId === strainId);
}

export function understood(jar: Jar): boolean {
  return jar.studied >= STUDY_DAYS;
}

/** The hive with a new jar of these insects (one jar per strain, a few at most). */
export function withJar(hive: Hive, strainId: string): Hive {
  const jars = hive.jars ?? [];
  if (jars.length >= MAX_JARS || jarOf(hive, strainId)) return hive;
  return { ...hive, jars: [...jars, { strainId, studied: 0 }] };
}

/** The hive after a day's study of one jar. */
export function studiedJar(hive: Hive, strainId: string): Hive {
  const jars = (hive.jars ?? []).map((j) =>
    j.strainId === strainId ? { ...j, studied: j.studied + 1 } : j,
  );
  return { ...hive, jars };
}

/** The hive with a cross begun: the jar is used, half the hive goes into the brood. */
export function crossBegun(hive: Hive, strainId: string, day: number): Hive {
  return {
    ...hive,
    count: Math.round(hive.count * (1 - BROOD_SHARE)),
    jars: (hive.jars ?? []).filter((j) => j.strainId !== strainId),
    breeding: { jarStrainId: strainId, readyDay: day + CROSS_DAYS },
  };
}
