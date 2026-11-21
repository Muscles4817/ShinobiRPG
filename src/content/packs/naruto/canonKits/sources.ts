/** Where the canon kits' new techniques are learned, so each has a source (`apply.ts`). */

/** New techniques each teacher of the world now teaches. */
export const CANON_TEACHES: Readonly<Record<string, readonly string[]>> = {
  aoba: ['scattering-crows'],
  guy: ['soshuga', 'strong-fist'],
  hiashi: ['eight-trigrams-vacuum-palm'],
  kakashi: ['purple-electricity'],
  lee: ['strong-fist'],
  naruto: [
    'big-ball-rasenshuriken',
    'frog-strike',
    'naruto-region-combo',
    'negative-emotions-sensing',
    'spiralling-absorption-sphere',
    'spiralling-strife-spheres',
    'super-ultra-big-ball-rasengan',
    'repeated-rasenshuriken',
    'wisdom-wolf-decay',
  ],
  sakura: ['chakra-control-bind'],
  sasuke: [
    'kagutsuchi',
    'strong-fist',
    'supercooled-water',
    'susanoo-crush',
    'susanoo-fist',
    'chidori-katana',
    'uchiha-style-kenjutsu',
    'lightning-triple',
  ],
};

/** Techniques shelved in the home village for people of the world who teach nothing. */
export const CANON_SHELVED = {
  academy: [],
  library: ['armoured-eye', 'bashosen-coil-of-wind'],
} as const;

/** People of the world without an arsenal, who keep the kit they fight with now beside these. */
export const KIT_KEPT: Readonly<Record<string, readonly string[]>> = {
  ao: ['shuriken-jutsu', 'clone-jutsu', 'phoenix-flower', 'gale-palm'],
  ino: ['shuriken-jutsu', 'clone-jutsu', 'hell-viewing', 'mind-body-switch'],
  izumo: ['shuriken-jutsu', 'clone-jutsu', 'phoenix-flower', 'gale-palm'],
  kotetsu: ['shuriken-jutsu', 'clone-jutsu', 'basic-strike-combination'],
  sakura: ['shuriken-jutsu', 'clone-jutsu', 'hell-viewing'],
  shikamaru: ['shuriken-jutsu', 'clone-jutsu', 'phoenix-flower', 'shadow-possession', 'gale-palm'],
  tenten: ['shuriken-jutsu', 'clone-jutsu', 'iaido-draw', 'twin-rising-dragons'],
};
