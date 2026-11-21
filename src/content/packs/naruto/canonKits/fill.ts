import { FILL_KITS_1 } from './fill1';
import { FILL_KITS_2 } from './fill2';

/** What each thin versus fighter gains: generic techniques a person of the pack could have learned (shelved, their clan's, their schools'), usable now, chosen for variety then fit (prototypes/narutopedia/fill.py). */
export const FILL_KITS: Readonly<Record<string, readonly string[]>> = {
  ...FILL_KITS_1,
  ...FILL_KITS_2,
};

/** People of the world without an arsenal, who keep the kit they fight with now beside these. */
export const FILL_KEPT: Readonly<Record<string, readonly string[]>> = {
  chiriku: ['shuriken-jutsu', 'clone-jutsu', 'basic-strike-combination'],
  genma: ['shuriken-jutsu', 'clone-jutsu', 'basic-strike-combination'],
  ibiki: ['shuriken-jutsu', 'clone-jutsu', 'hell-viewing'],
  mirei: ['shuriken-jutsu', 'clone-jutsu', 'phoenix-flower', 'gale-palm'],
  raido: ['shuriken-jutsu', 'clone-jutsu', 'iaido-draw', 'twin-rising-dragons'],
  sosuke: ['shuriken-jutsu', 'clone-jutsu', 'phoenix-flower', 'insect-swarm', 'gale-palm'],
  'suna-gozan': ['shuriken-jutsu', 'clone-jutsu', 'basic-strike-combination'],
  'suna-kiyose': ['shuriken-jutsu', 'clone-jutsu', 'phoenix-flower', 'gale-palm'],
};
