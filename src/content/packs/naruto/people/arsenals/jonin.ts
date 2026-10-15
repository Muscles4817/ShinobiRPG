import type { PersonArsenal } from '../../../../types';

/** How the village jōnin fight: their canon techniques, each used once their grades reach it. */

/** Fire, and a flock of crows to vanish into. */
export const AOBA_ARSENAL: PersonArsenal = {
  techniqueIds: ['fire-dragon-bullet', 'crow-scatter', 'substitution-jutsu', 'stone-needles'],
};

/** The Dance of the Crescent Moon and its clones, and the Moonlight cut. */
export const HAYATE_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'crescent-moon-dance',
    'secret-sword-moonlight',
    'transparent-escape',
    'shadow-clone',
    'substitution-jutsu',
  ],
};

/** Hazy Moon Night, with the clones and sensing of an ANBU. */
export const YUGAO_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'hazy-moon-night',
    'shadow-clone',
    'chakra-sensing',
    'substitution-jutsu',
    'crescent-moon-dance',
  ],
};
