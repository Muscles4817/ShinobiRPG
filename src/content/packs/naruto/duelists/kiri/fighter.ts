import type { PersonDef } from '../../../../types';

/**
 * A Kiri duelist: a shinobi of the Water Country who isn't met in the world yet, so nowhere
 * on any schedule. Marked side-effect free so a release build can drop the fan pack's data.
 */
const AWAY = { morning: null, afternoon: null, evening: null, night: null } as const;

/*#__NO_SIDE_EFFECTS__*/
export function kiriFighter(fighter: Omit<PersonDef, 'role' | 'schedule'>): PersonDef {
  return { role: 'shinobi', schedule: AWAY, ...fighter };
}
