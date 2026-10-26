import type { EnemyDef } from '../../types';
import { CHAKRA_BEASTS_OF_WATER } from './chakraBeastsWater';
import { CHAKRA_BEAST } from './chakraBeastShape';
import { foeStats, NO_ARTS } from './foeStats';

/**
 * Animals whose lines have lived beside chakra for generations (`docs/design/chakra-beasts-plan.md`).
 * They are still animals, never people, but they have chakra and techniques of their own
 * (`beastArts.ts`). They live off the roads, in the deep wilds. A touched beast has one trick, a
 * changed one an element; an elder is the only one of its kind.
 */

const WOODS_AND_MOUNTAIN: readonly EnemyDef[] = [
  {
    ...CHAKRA_BEAST,
    id: 'mist-fox',
    danger: 'petty',
    name: 'Mist Fox',
    description:
      'A red fox that is never quite where you are looking, and leads hunters in circles.',
    ...foeStats(4, [5, 13, 8, 14], { ...NO_ARTS, genjutsu: 8, taijutsu: 5, willpower: 7 }),
    healthScale: 0.5,
    maxChakra: 30,
    techniqueIds: ['fox-haze', 'fox-fire-lure'],
    traits: ['illusionist', 'swift'],
  },
  {
    ...CHAKRA_BEAST,
    id: 'echo-shrike',
    danger: 'petty',
    name: 'Echo Shrike',
    blow: 'beak',
    description:
      'A grey shrike that copies every call in the wood. It copies what you do in front of it too.',
    ...foeStats(4, [3, 18, 6, 16], { ...NO_ARTS, taijutsu: 6, willpower: 6 }),
    healthScale: 0.3,
    maxChakra: 30,
    techniqueIds: ['shrike-cry'],
    perks: ['mimicry'],
    traits: ['swift', 'coward'],
  },
  {
    ...CHAKRA_BEAST,
    id: 'ember-tusk-boar',
    drops: ['ember-boar-flank'],
    danger: 'armed',
    name: 'Ember-Tusk Boar',
    blow: 'tusk',
    description: 'Its tusks smoke in the rain. Where it beds down, the leaves are scorched black.',
    ...foeStats(6, [15, 10, 14, 9], { ...NO_ARTS, taijutsu: 9, chakraControl: 6, willpower: 9 }),
    healthScale: 1.2,
    maxChakra: 50,
    techniqueIds: ['burning-charge'],
    nature: 'fire',
    traits: ['brawler'],
  },
  {
    ...CHAKRA_BEAST,
    id: 'moss-backed-bear',
    drops: ['moss-bear-fat'],
    danger: 'elite',
    name: 'Moss-Backed Bear',
    blow: 'claw',
    description:
      'Moss and saplings grow on its back. Foresters who see it lying down take it for a bank.',
    ...foeStats(12, [26, 10, 20, 15], {
      ...NO_ARTS,
      taijutsu: 18,
      ninjutsu: 14,
      chakraControl: 12,
      willpower: 16,
    }),
    size: 'huge',
    maxChakra: 140,
    techniqueIds: ['mountains-weight', 'root-bind', 'moss-mend'],
    nature: 'earth',
    traits: ['brawler'],
  },
  {
    ...CHAKRA_BEAST,
    id: 'thunder-kite',
    danger: 'armed',
    name: 'Thunder Kite',
    blow: 'talon',
    description: 'Rides the storm in over the peaks. Its feathers crackle when it banks.',
    ...foeStats(6, [6, 20, 9, 20], { ...NO_ARTS, taijutsu: 9, chakraControl: 7, willpower: 8 }),
    healthScale: 0.6,
    maxChakra: 50,
    techniqueIds: ['thunder-dive'],
    nature: 'lightning',
    traits: ['swift'],
  },
  {
    ...CHAKRA_BEAST,
    id: 'stone-serow',
    drops: ['serow-haunch'],
    danger: 'armed',
    name: 'Stone Serow',
    blow: 'horn',
    description:
      'A goat-antelope of the high scree, grey as the rock, with a coat you could sharpen a knife on.',
    ...foeStats(6, [13, 11, 14, 11], { ...NO_ARTS, taijutsu: 9, chakraControl: 6, willpower: 9 }),
    healthScale: 0.9,
    maxChakra: 45,
    techniqueIds: ['stone-horn'],
    nature: 'earth',
    traits: ['armoured'],
  },
  {
    ...CHAKRA_BEAST,
    id: 'old-owl-of-the-pass',
    danger: 'deadly',
    name: 'Old Owl of the Pass',
    blow: 'talon',
    description:
      'Has watched shinobi cross the pass for sixty years from the same dead pine. It moves before they do.',
    ...foeStats(10, [6, 16, 10, 22], {
      ...NO_ARTS,
      genjutsu: 17,
      taijutsu: 10,
      chakraControl: 12,
      intellect: 10,
      willpower: 14,
    }),
    healthScale: 0.7,
    maxChakra: 100,
    techniqueIds: ['owl-stare', 'hollow-hoot', 'silent-wing'],
    perks: ['foresight'],
    traits: ['illusionist'],
  },
];

const DESERT_AND_SWARMS: readonly EnemyDef[] = [
  {
    ...CHAKRA_BEAST,
    id: 'glass-scorpion',
    drops: ['glass-venom-sac'],
    danger: 'armed',
    name: 'Glass Scorpion',
    description: 'Clear as a bottle. You can see the venom in its tail.',
    ...foeStats(6, [9, 12, 10, 11], { ...NO_ARTS, taijutsu: 10, willpower: 8 }),
    healthScale: 0.5,
    maxChakra: 35,
    techniqueIds: ['glass-sting'],
    traits: ['armoured'],
  },
  {
    ...CHAKRA_BEAST,
    id: 'dune-serpent',
    danger: 'armed',
    name: 'Dune Serpent',
    description: 'A ridge in the sand that wasn’t there this morning. It is moving towards you.',
    ...foeStats(7, [13, 11, 12, 11], { ...NO_ARTS, taijutsu: 10, ninjutsu: 9, willpower: 9 }),
    size: 'large',
    maxChakra: 55,
    techniqueIds: ['sand-dive', 'burrow-strike'],
    nature: 'earth',
  },
  {
    ...CHAKRA_BEAST,
    id: 'sand-sea-turtle',
    danger: 'elite',
    name: 'Sand-Sea Turtle',
    blow: 'beak',
    description:
      'Lies under the dunes for years at a time. Caravans have camped on its shell without knowing.',
    ...foeStats(12, [22, 7, 22, 13], {
      ...NO_ARTS,
      taijutsu: 15,
      ninjutsu: 16,
      chakraControl: 13,
      willpower: 16,
    }),
    size: 'huge',
    maxChakra: 150,
    techniqueIds: ['shell-slam', 'sand-breath'],
    nature: 'earth',
    dust: { dustId: 'sand', shield: true },
    traits: ['armoured'],
  },
  {
    ...CHAKRA_BEAST,
    id: 'bell-nest-wasps',
    danger: 'petty',
    name: 'Bell-Nest Wasps',
    noun: 'bell-nest swarm',
    form: 'swarm',
    description:
      'A grey paper nest that hums like a struck bell. The wasps’ bellies glow faintly blue.',
    ...foeStats(4, [1, 18, 4, 12], { ...NO_ARTS, ninjutsu: 7, taijutsu: 5, willpower: 6 }),
    healthScale: 0.4,
    maxChakra: 30,
    techniqueIds: ['hornet-cloud'],
    hive: { strainId: 'paper-wasp', tell: 'open' },
    traits: ['pack', 'swift'],
  },
  {
    ...CHAKRA_BEAST,
    id: 'lantern-moths',
    danger: 'petty',
    name: 'Lantern Moths',
    noun: 'lantern moth swarm',
    form: 'swarm',
    description:
      'Pale moths that glow like paper lanterns. Travellers who follow the light lose the path.',
    ...foeStats(3, [1, 12, 4, 10], { ...NO_ARTS, genjutsu: 7, willpower: 6 }),
    healthScale: 0.3,
    maxChakra: 35,
    techniqueIds: ['moth-glow'],
    traits: ['illusionist', 'coward'],
  },
];

export const CHAKRA_BEASTS: readonly EnemyDef[] = [
  ...WOODS_AND_MOUNTAIN,
  ...CHAKRA_BEASTS_OF_WATER,
  ...DESERT_AND_SWARMS,
];
