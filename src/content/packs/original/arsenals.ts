import type { PersonArsenal } from '../../types';

/**
 * What the village's authored fighters fight with, where it is more than their specialty's kit:
 * each a pack technique with its own source (validated).
 */

/** Kōun fights as he held the bridge: palms first, then the wicks lit one band at a time. */
export const ASH_LANTERN_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'temple-bell-palm',
    'bridge-holder-palm',
    'kindled-pulse',
    'white-flame-heel',
    'marrow-wick',
    'every-lantern-lit',
    'kiln-door-kick',
    'shoulder-throw',
    'lantern-fall',
  ],
};

/**
 * Suzu fights as the Night Watch do: gone into the dark, a lock on the arm, and the Last Moth
 * before anyone sees it (the set-up a mind that reads the fight plays from its kit).
 */
export const NIGHT_WATCH_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'moth-needle',
    'moth-wing-strike',
    'hundred-moths',
    'snuffed-wick-step',
    'last-moth',
    'paper-veil',
    'arm-lock',
  ],
};
