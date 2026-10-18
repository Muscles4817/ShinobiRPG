import type { TeacherProfile } from '../../types';

/** How the senseis teach and what they ask of anyone who isn't on their team. */

export const KAKASHI_TEACHER: TeacherProfile = {
  quirk: 'distracted',
  steers: { focus: 'weakest', freeAtStage: 3 },
  teaches: [
    'summoning-ninken',
    'water-prison',
    'lightning-clone',
    'lightning-blade',
    'lightning-hound',
    'rasengan',
    'thousand-years-of-death',
    'great-waterfall',
    'evil-sealing-method',
    'lightning-transmission',
  ],
  price: {
    kind: 'favour',
    favourId: 'kakashi-patience',
    ask: 'Kakashi only teaches people who can sit and wait while he finishes his chapter.',
  },
  contract: { contractId: 'kakashi-ninken', minStage: 3 },
};

export const GUY_TEACHER: TeacherProfile = {
  quirk: 'natural',
  steers: { focus: 'specialty', freeAtStage: 4 },
  teaches: [
    'leaf-whirlwind',
    'dynamic-entry',
    'leaf-hurricane',
    'leaf-rising-wind',
    'leaf-strong-whirlwind',
    'gate-of-opening',
    'front-lotus',
    'gate-of-life',
    'gate-of-limit',
    'reverse-lotus',
    'gate-of-view',
    'morning-peacock',
    'daytime-tiger',
    'leaf-gale',
    'intersection-method',
    'leaf-rock-destroying-rise',
    'adamantine-strength-whirlwind',
    'little-toe-attack',
    'gate-of-wonder',
    'evening-elephant',
    'eight-gates-released',
    'night-guy',
    'dynamic-action',
    'leaf-coiling-wind',
    'leaf-great-flash',
    'leaf-gust',
  ],
  price: { kind: 'bond', minStage: 1, line: '“Anyone who burns with youth may join me!”' },
};

export const IRUKA_TEACHER: TeacherProfile = {
  quirk: 'patient',
  teaches: [
    'substitution-jutsu',
    'clone-jutsu',
    'sealed-binding-formation',
    'string-light-formation',
  ],
  sessionsPerWeek: 3,
  price: { kind: 'bond', minStage: 0, line: '“Come by after class. I’ll always make time.”' },
};

export const KURENAI_TEACHER: TeacherProfile = {
  quirk: 'patient',
  steers: { focus: 'specialty', freeAtStage: 2 },
  teaches: [
    'petal-storm',
    'tree-binding-death',
    'mirror-heaven-earth',
    'hiding-in-surface',
    'string-bean-binding',
  ],
  price: { kind: 'bond', minStage: 2 },
};

export const ASUMA_TEACHER: TeacherProfile = {
  quirk: 'patient',
  teaches: [
    'flying-swallow',
    'chakra-blade-straight-line',
    'verdant-mountain-gale',
    'ash-pile-burning',
    'trench-knife-rush',
    'wind-blade-flurry',
    'seven-swords-dance',
    'dust-cloud',
    'thousand-armed-murder',
  ],
  price: { kind: 'ryo', perSession: 30, line: '“You’re buying the cigarettes. Kidding. Mostly.”' },
};

export const ANKO_TEACHER: TeacherProfile = {
  quirk: 'harsh',
  steers: { focus: 'weakest', freeAtStage: 3 },
  teaches: [
    'snake-binding-seal',
    'chakra-absorbing-seal',
    'eight-trigrams-seal',
    'four-symbols-seal',
    'hidden-shadow-snake-hands',
    'twin-snakes-mutual-death',
    'many-snake-hands',
    'snake-clone',
  ],
  price: {
    kind: 'all',
    parts: [
      { kind: 'bond', minStage: 1 },
      {
        kind: 'mission',
        missionId: 'stolen-scrolls',
        line: '“Bring back some stolen scrolls first. Then I might bother.”',
      },
    ],
  },
};

/**
 * Lee teaches the Strong Fist too, but only to someone who has sparred with him until they are
 * bonded: he won't hand Guy-sensei's style to anyone who hasn't earned it with sweat.
 */
export const LEE_TEACHER: TeacherProfile = {
  quirk: 'natural',
  teaches: [
    'leaf-whirlwind',
    'leaf-hurricane',
    'leaf-rising-wind',
    'front-lotus',
    'leaf-gale',
    'leaf-drop',
    'one-man-front-lotus',
    'seasickness-fist',
    'youth-full-power',
  ],
  price: {
    kind: 'bond',
    minStage: 4,
    line: '“Guy-sensei’s style is not for show! Spar with me until we are true rivals.”',
  },
};

/** Naruto passes on the clone tricks he invented, and the clan’s chains. */
export const NARUTO_TEACHER: TeacherProfile = {
  teaches: [
    'adamantine-chains',
    'sexy-technique',
    'uzumaki-combo',
    'two-thousand-combo',
    'all-directions-shuriken',
    'clone-body-blow',
    'harem-technique',
    'shuriken-shadow-clone',
    'spiralling-serial-spheres',
    'food-cart-destroyer',
    'clone-spinning-heel-drop',
    'toad-oil-flame-bullet',
    'uzumaki-formation',
    'parachute',
    'sexy-reverse-harem',
    'big-ball-rasengan',
    'big-ball-serial-zone-spheres',
    'planetary-rasengan',
    'ultra-many-serial-spheres',
    'wind-rasengan',
    'mini-rasenshuriken',
    'rasenshuriken',
    'ultra-big-ball-rasengan',
    'ultra-big-ball-rasenshuriken',
    'new-sexy-technique',
    'turning-into-a-frog',
    'toad-gun',
    'toad-oil-bullet',
    'runt-ball-rasengan',
    'toad-oil-wind-flame-bullet',
  ],
};

/** Sakura teaches the medical arts that grow out of her chakra control. */
export const SAKURA_TEACHER: TeacherProfile = {
  teaches: ['chakra-scalpel', 'chakra-enhanced-strength', 'creation-rebirth', 'illness-extraction'],
};

/** Sasuke teaches the Uchiha fire and eyes to his clan, and the lightning and snakes he learned. */
export const SASUKE_TEACHER: TeacherProfile = {
  teaches: [
    'great-fireball',
    'amaterasu',
    'binding-snake-glare',
    'chidori-current',
    'chidori-senbon',
    'chidori-sharp-spear',
    'coercion-sharingan',
    'mirage-crow',
    'kirin',
    'orochimaru-body-replacement',
  ],
};
