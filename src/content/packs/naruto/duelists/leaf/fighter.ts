import type { PersonDef } from '../../../../types';

/**
 * A Leaf duelist: a shinobi of the start village who isn't met in the world yet (gone, dead or
 * not grown into the story), so nowhere on any schedule. Marked side-effect free so a release
 * build can drop the fan pack's data.
 */
const AWAY = { morning: null, afternoon: null, evening: null, night: null } as const;

/*#__NO_SIDE_EFFECTS__*/
export function leafFighter(
  fighter: Omit<PersonDef, 'role' | 'schedule'> & { readonly role?: 'shinobi' | 'genin' },
): PersonDef {
  return { role: 'shinobi', schedule: AWAY, ...fighter };
}
