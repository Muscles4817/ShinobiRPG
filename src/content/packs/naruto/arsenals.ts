import type { PersonArsenal } from '../../types';

/** How the village's own fight: their canon techniques (all learnable in the pack) in place of a generic kit. */

/** The Sharingan reads every foe; the rest is what the Copy Ninja fights with in canon. */
export const KAKASHI_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'lightning-blade',
    'lightning-hound',
    'lightning-beast-running',
    'lightning-clone',
    'water-dragon-bullet',
    'great-waterfall',
    'water-wall',
    'earth-flow-wall',
    'headhunter',
    'summoning-ninken',
    'shadow-clone',
    'substitution-jutsu',
    'body-flicker',
    'hell-viewing',
    'thousand-years-of-death',
  ],
  perks: ['insight'],
};

/** The Wind Blade trench knives, Burning Ash, and the clones he fought the Akatsuki with. */
export const ASUMA_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'flying-swallow',
    'trench-knife-rush',
    'wind-blade-flurry',
    'chakra-flow',
    'ash-pile-burning',
    'shadow-clone',
    'substitution-jutsu',
  ],
};
