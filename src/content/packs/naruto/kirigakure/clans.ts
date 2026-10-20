import type { ClanDef } from '../../../types';

/**
 * The Mist's families, who belong to Kirigakure (`ClanDef.village`): never born into the Leaf,
 * met in their compounds or across the water. The loyal houses have no bloodline and keep
 * Yagura's order; the bloodline clans he hunts have fled their compounds for the resistance;
 * the Uminari divers belong to neither side.
 */
const KIRI = 'kirigakure';

const LOYAL_HOUSES: readonly ClanDef[] = [
  {
    id: 'kasumi',
    name: 'Kasumi',
    village: KIRI,
    outsiders: 'reserved',
    description:
      'The mist-keepers: their braziers and genjutsu keep the village’s fog, and the fog watches for them.',
    statBonuses: { genjutsu: 3, chakraControl: 2 },
    modifiers: {},
    arts: ['genjutsu', 'chakraControl'],
    nature: 'water',
    startingTechniqueIds: [],
  },
  {
    id: 'amibari',
    name: 'Amibari',
    village: KIRI,
    outsiders: 'guarded',
    description:
      'The net-weavers, who keep the Blood Register of every child’s chakra and the sealing nets that answer it.',
    statBonuses: { fuuinjutsu: 3, intellect: 2 },
    modifiers: {},
    arts: ['fuuinjutsu', 'intellect'],
    startingTechniqueIds: [],
  },
  {
    id: 'kurage',
    name: 'Kurage',
    village: KIRI,
    outsiders: 'guarded',
    description:
      'The hunter-nin house. Masked from childhood, with needles fine as a jellyfish’s threads.',
    statBonuses: { speed: 3, perception: 2 },
    modifiers: {},
    arts: ['speed', 'perception'],
    startingTechniqueIds: [],
  },
  {
    id: 'isana',
    name: 'Isana',
    village: KIRI,
    outsiders: 'welcoming',
    description:
      'The whalers, who run the fleet and the blockade, and bury whales and rebels with the same rites.',
    statBonuses: { strength: 3, stamina: 2 },
    modifiers: {},
    arts: ['strength', 'taijutsu'],
    startingTechniqueIds: [],
  },
  {
    id: 'shiogama',
    name: 'Shiogama',
    village: KIRI,
    outsiders: 'reserved',
    description:
      'The salt-smiths of the Seventh Forge, who made the Swordsmen’s blades and still quench steel in brine.',
    statBonuses: { kenjutsu: 3, strength: 2 },
    modifiers: {},
    arts: ['kenjutsu', 'strength'],
    startingTechniqueIds: [],
  },
  {
    id: 'karatachi',
    name: 'Karatachi',
    village: KIRI,
    outsiders: 'guarded',
    description:
      'The Mizukage’s own family, who guard the tower and don’t talk about what has changed in him.',
    statBonuses: { ninjutsu: 3, willpower: 2 },
    modifiers: {},
    arts: ['ninjutsu', 'willpower'],
    nature: 'water',
    startingTechniqueIds: [],
  },
];

const HUNTED_CLANS: readonly ClanDef[] = [
  {
    id: 'yuki',
    name: 'Yuki',
    village: KIRI,
    description:
      'The ice clan of the snow islands, the first the Register hunted and the most scattered.',
    statBonuses: { ninjutsu: 3, speed: 2 },
    modifiers: {},
    arts: ['ninjutsu', 'speed'],
    nature: 'water',
    startingTechniqueIds: [],
    kekkeiGenkai: {
      name: 'Ice Release',
      description: 'Water and wind made one: needles, mirrors and shackles of ice.',
      dormant: false,
    },
  },
  {
    id: 'hozuki',
    name: 'Hōzuki',
    village: KIRI,
    description:
      'Bodies that turn to water at will. They fight the purge from the canals and drains.',
    statBonuses: { ninjutsu: 2, chakraControl: 2, kenjutsu: 1 },
    modifiers: {},
    arts: ['ninjutsu', 'kenjutsu'],
    nature: 'water',
    startingTechniqueIds: [],
    kekkeiGenkai: {
      name: 'Hydrification',
      description: 'The body goes to water where it is struck, and comes back.',
      dormant: false,
    },
  },
  {
    id: 'hoshigaki',
    name: 'Hoshigaki',
    village: KIRI,
    description:
      'Grey-skinned and deep in chakra, sea people who run the rebels’ boats through the blockade.',
    statBonuses: { reserves: 3, strength: 2 },
    modifiers: {},
    arts: ['reserves', 'strength'],
    nature: 'water',
    startingTechniqueIds: [],
    kekkeiGenkai: {
      name: 'Shark Blood',
      description: 'Gills behind the ears, skin like a shark’s and chakra like the sea.',
      dormant: false,
    },
  },
  {
    id: 'suikazan',
    name: 'Suikazan',
    village: KIRI,
    description:
      'A small clan whose hair hardens into chakra-drinking needles. Its spies are everywhere in the tower.',
    statBonuses: { ninjutsu: 2, speed: 2 },
    modifiers: {},
    arts: ['ninjutsu', 'perception'],
    startingTechniqueIds: [],
    kekkeiGenkai: {
      name: 'Needle Hair',
      description:
        'Hair that stiffens into needles and drinks a little chakra from whatever it pierces.',
      dormant: false,
    },
  },
  {
    id: 'kaguya',
    name: 'Kaguya',
    village: KIRI,
    description:
      'They rose against the purge too early and alone, and were wiped out. A few survived the burning.',
    statBonuses: { taijutsu: 3, stamina: 2 },
    modifiers: {},
    arts: ['taijutsu', 'stamina'],
    startingTechniqueIds: [],
    kekkeiGenkai: {
      name: 'Dead Bone Pulse',
      description: 'Bones grown, shaped and drawn out of the body as weapons.',
      dormant: false,
    },
  },
  {
    id: 'uminari',
    name: 'Uminari',
    village: KIRI,
    description:
      'The breath-divers, a women-led line with no bloodline but the sea. They carry for whoever pays.',
    statBonuses: { stamina: 2, perception: 2 },
    modifiers: {},
    arts: ['stamina', 'perception'],
    startingTechniqueIds: [],
  },
];

export const KIRI_CLANS: readonly ClanDef[] = [...LOYAL_HOUSES, ...HUNTED_CLANS];
