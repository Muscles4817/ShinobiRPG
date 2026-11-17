import type { PersonDef } from '../../../../types';

/**
 * One of Orochimaru's people (or Sasuke's later team) as a versus duelist: met nowhere in the
 * world yet, so on no schedule. The Sound has no village on the map, so no home is set unless
 * one is given. Marked side-effect free so a release build can drop the fan pack's data.
 */
const AWAY = { morning: null, afternoon: null, evening: null, night: null } as const;

/*#__NO_SIDE_EFFECTS__*/
export function soundFighter(
  fighter: Omit<PersonDef, 'role' | 'schedule'> & { readonly role?: 'shinobi' | 'genin' },
): PersonDef {
  return { role: 'shinobi', schedule: AWAY, ...fighter };
}
