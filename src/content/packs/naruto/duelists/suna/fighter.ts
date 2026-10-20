import type { PersonDef } from '../../../../types';

/**
 * A Sand duelist: a shinobi of Sunagakure who isn't met in the world yet, so nowhere on any
 * schedule, but at home in the Sand (shown so in versus). Marked side-effect free so a release
 * build can drop the fan pack's data.
 */
const AWAY = { morning: null, afternoon: null, evening: null, night: null } as const;
const SUNA = 'sunagakure';

/*#__NO_SIDE_EFFECTS__*/
export function sunaFighter(
  fighter: Omit<PersonDef, 'role' | 'schedule' | 'homeLocationId'>,
): PersonDef {
  return { role: 'shinobi', schedule: AWAY, homeLocationId: SUNA, ...fighter };
}
