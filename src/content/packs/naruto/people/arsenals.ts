import type { PersonArsenal } from '../../../types';

/** How the village's own fight: their canon techniques (all learnable in the pack) in place of a generic kit. */

/** The Sharingan reads every foe; the rest is what the Copy Ninja fights with in canon. */
export const KAKASHI_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'lightning-blade',
    'lightning-hound',
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

/** His canon trench-knife jutsu (wind chakra flowed through the blades) and Burning Ash. */
export const ASUMA_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'flying-swallow',
    'chakra-blade-straight-line',
    'verdant-mountain-gale',
    'chakra-flow',
    'ash-pile-burning',
    'substitution-jutsu',
  ],
};
