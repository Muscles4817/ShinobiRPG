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
  ],
  price: {
    kind: 'favour',
    favourId: 'kakashi-patience',
    ask: 'Kakashi only teaches people who can sit and wait while he finishes his chapter.',
  },
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
    'reverse-lotus',
    'morning-peacock',
    'daytime-tiger',
    'leaf-gale',
    'intersection-method',
  ],
  price: { kind: 'bond', minStage: 1, line: '“Anyone who burns with youth may join me!”' },
};

export const IRUKA_TEACHER: TeacherProfile = {
  quirk: 'patient',
  teaches: ['substitution-jutsu', 'clone-jutsu'],
  sessionsPerWeek: 3,
  price: { kind: 'bond', minStage: 0, line: '“Come by after class. I’ll always make time.”' },
};

export const KURENAI_TEACHER: TeacherProfile = {
  quirk: 'patient',
  steers: { focus: 'specialty', freeAtStage: 2 },
  teaches: ['petal-storm', 'tree-binding-death', 'mirror-heaven-earth'],
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
  ],
  price: {
    kind: 'bond',
    minStage: 4,
    line: '“Guy-sensei’s style is not for show! Spar with me until we are true rivals.”',
  },
};
