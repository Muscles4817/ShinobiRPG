import type { PersonDef } from '../../../../types';

/**
 * An Akatsuki duelist: a rogue who isn't met in the world yet, so nowhere on any schedule. Those whose
 * village is on the map name it (`homeLocationId`); the rest show the start village. Marked side-effect free so a release
 * build can drop the fan pack's data.
 */
const AWAY = { morning: null, afternoon: null, evening: null, night: null } as const;

/*#__NO_SIDE_EFFECTS__*/
export function akatsukiFighter(fighter: Omit<PersonDef, 'role' | 'schedule'>): PersonDef {
  return { role: 'shinobi', schedule: AWAY, ...fighter };
}
