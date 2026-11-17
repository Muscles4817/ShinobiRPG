import type { PersonDef } from '../../../../types';

/**
 * A duelist from one of the far villages (`farVillages.ts`): nowhere on any schedule, since
 * none of those villages can be visited yet, but at home there (shown so in versus). Marked
 * side-effect free so a release build can drop the fan pack's data.
 */
const AWAY = { morning: null, afternoon: null, evening: null, night: null } as const;

/** Where each far fighter lives: a locked location of the pack. */
export type FarHome = 'kumogakure' | 'iwagakure' | 'takigakure' | 'amegakure' | 'land-of-iron';

/*#__NO_SIDE_EFFECTS__*/
export function farFighter(
  home: FarHome,
  fighter: Omit<PersonDef, 'role' | 'schedule' | 'homeLocationId'> & {
    readonly role?: 'shinobi' | 'genin';
  },
): PersonDef {
  return { role: 'shinobi', schedule: AWAY, homeLocationId: home, ...fighter };
}
