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
    'area-scanning',
    'hiding-like-a-mole',
    'water-clone',
    'water-shark-bullet',
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

/** The Strong Fist as Guy fought with it in Part I: the kicks, the Lotuses and the first gates. */
export const GUY_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'leaf-whirlwind',
    'leaf-gale',
    'dynamic-entry',
    'shadow-dancing-leaf',
    'leaf-hurricane',
    'leaf-strong-whirlwind',
    'gate-of-opening',
    'gate-of-life',
    'front-lotus',
    'reverse-lotus',
  ],
};

/** Snakes from the sleeve, and the fire and illusion she uses in the anime. */
export const ANKO_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'hidden-shadow-snake-hands',
    'dragon-fire',
    'sly-mind-affect',
    'substitution-jutsu',
  ],
};

/** What a fresh Naruto can manage: shadow clones, his own Sexy Technique and the finger jab. */
export const NARUTO_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'shuriken-jutsu',
    'shadow-clone',
    'substitution-jutsu',
    'sexy-technique',
    'thousand-years-of-death',
  ],
};

/** The Uchiha fire he learned young, and his shuriken. */
export const SASUKE_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'shuriken-jutsu',
    'shadow-shuriken',
    'phoenix-flower',
    'great-fireball',
    'dragon-fire',
    'area-scanning',
    'substitution-jutsu',
  ],
};

/** Guy's kicks, as far as a genin's taijutsu reaches. */
export const LEE_ARSENAL: PersonArsenal = {
  techniqueIds: ['leaf-whirlwind', 'leaf-gale', 'dynamic-entry'],
};
