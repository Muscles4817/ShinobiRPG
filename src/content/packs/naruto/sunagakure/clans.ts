import type { ClanDef } from '../../../types';

/**
 * The Sand's families, who belong to Sunagakure (`ClanDef.village`): never born into the Leaf.
 * Their people are named for them in the Sand's way, Gaara of the Sands, Sasori of the Red
 * Sand (`docs/design/sunagakure-plan.md`). The Kazekage's house is part priest by blood and
 * fights with refined dust; the sand priests are the Monarch's old warriors, kept apart under
 * the truce; the puppeteers build what the Sand will not summon; the fan clan fills the barges'
 * sails.
 */
const SUNA = 'sunagakure';

export const SUNA_CLANS: readonly ClanDef[] = [
  {
    id: 'sabaku',
    name: 'Sabaku',
    village: SUNA,
    outsiders: 'guarded',
    description:
      'The Kazekage’s house, “of the Sands”, the First Kazekage’s line and a priestess’s. They command refined dust and leave plain sand to the priests.',
    statBonuses: { ninjutsu: 3, chakraControl: 2 },
    modifiers: {},
    arts: ['ninjutsu', 'chakraControl'],
    nature: 'wind',
    startingTechniqueIds: [],
  },
  {
    id: 'akasuna',
    name: 'Akasuna',
    village: SUNA,
    outsiders: 'reserved',
    description:
      'The puppeteers, “of the Red Sand”. Their bodies are built of wood and steel and worked on threads, never bound, the Sand’s answer to summons.',
    statBonuses: { chakraControl: 3, intellect: 2 },
    modifiers: {},
    arts: ['chakraControl', 'intellect'],
    startingTechniqueIds: [],
  },
  {
    id: 'kamaitachi',
    name: 'Kamaitachi',
    village: SUNA,
    outsiders: 'welcoming',
    description:
      'The fan clan, “of the Cutting Wind”, named for a weasel of the old stories that no one in the Sand would keep. They fill the barges’ sails.',
    statBonuses: { ninjutsu: 3, strength: 2 },
    modifiers: {},
    arts: ['ninjutsu', 'strength'],
    nature: 'wind',
    startingTechniqueIds: [],
  },
  {
    id: 'sakyu',
    name: 'Sakyū',
    village: SUNA,
    outsiders: 'reserved',
    description:
      'The sand priests, “of the Dunes”, the Monarch’s warriors once and Shukaku’s worshippers still. Despised everywhere and needed, since only they can steer a barge across the desert.',
    statBonuses: { ninjutsu: 2, chakraControl: 2, perception: 1 },
    modifiers: {},
    arts: ['ninjutsu', 'perception'],
    nature: 'earth',
    startingTechniqueIds: [],
    dust: { dustId: 'sand' },
  },
];
