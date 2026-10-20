import type { ClanDef } from '../../types';

export const CLANS: readonly ClanDef[] = [
  {
    id: 'none',
    name: 'No clan',
    description: 'Nobody handed you anything. You train a little harder because of it.',
    statBonuses: {},
    modifiers: { training: 1.05 },
    arts: [],
    startingTechniqueIds: [],
  },
  {
    id: 'hibana',
    name: 'Hibana',
    outsiders: 'welcoming',
    description: 'Fire-breathers who light the village’s great lanterns each dusk. Hot-tempered.',
    statBonuses: { ninjutsu: 2, stamina: 1, willpower: -2 },
    modifiers: { studyElement: { fire: 1.3 } },
    arts: ['ninjutsu', 'stamina'],
    nature: 'fire',
    startingTechniqueIds: ['hibana-spark'],
    lodging: 'Your room in the Hibana kiln-house',
  },
  {
    id: 'tokaku',
    name: 'Tōkaku',
    outsiders: 'guarded',
    description: 'Lantern-keepers who guide the dead home. They see what others can’t.',
    statBonuses: { perception: 2, willpower: 1, genjutsu: 1, strength: -2 },
    modifiers: { studyDiscipline: { genjutsu: 1.2 } },
    arts: ['perception', 'genjutsu'],
    startingTechniqueIds: ['guiding-light'],
    lodging: 'Your room in the Tōkaku lantern hall',
    kekkeiGenkai: {
      name: 'Spirit Sight',
      description:
        'You see spirits and the threads of chakra between things. Active from the start.',
      dormant: false,
    },
  },
  {
    id: 'kurogane',
    name: 'Kurogane',
    outsiders: 'reserved',
    description: 'Smiths and swordsmen. Every child forges their first blade at twelve.',
    statBonuses: { kenjutsu: 2, strength: 1, genjutsu: -1, intellect: -1 },
    modifiers: { studyDiscipline: { kenjutsu: 1.25, genjutsu: 0.8 } },
    arts: ['kenjutsu', 'strength'],
    startingTechniqueIds: ['forge-cut'],
    lodging: 'The loft above the Kurogane forge',
  },
  {
    id: 'shimenawa',
    name: 'Shimenawa',
    outsiders: 'reserved',
    description: 'Weavers of the sacred ropes that bind the restless dead. Patient, and frail.',
    statBonuses: { fuuinjutsu: 2, chakraControl: 1, stamina: -2 },
    modifiers: { studyDiscipline: { fuuinjutsu: 1.3 } },
    arts: ['fuuinjutsu', 'chakraControl'],
    startingTechniqueIds: ['binding-rope'],
    lodging: 'Your room at the Shimenawa shrine',
    kekkeiGenkai: {
      name: 'Binding Blood',
      description:
        'Seals written in your blood hold twice as long. Dormant until your first true seal.',
      dormant: true,
    },
  },
  {
    id: 'toga',
    name: 'Tōga',
    outsiders: 'welcoming',
    description:
      'Moth-keepers who tend the great lanterns by night. Their children are born with a hive of lantern moths in them.',
    statBonuses: { perception: 2, genjutsu: 1, strength: -2 },
    modifiers: { growth: { perception: 1.1 } },
    arts: ['perception', 'genjutsu'],
    startingTechniqueIds: ['toga-moth-dust'],
    lodging: 'Your room under the eaves of the Tōga moth house',
    hive: {
      strainId: 'lantern-moth',
      rite: {
        name: 'The Lamp Vigil',
        description:
          'A night under the great lantern while the moths find their way in, then days of fever as they settle. The Tōga give their newborns to it; few grown bodies ask.',
      },
    },
  },
  {
    id: 'haibara',
    name: 'Haibara',
    outsiders: 'reserved',
    description:
      'Ash-workers who tend the great lantern kilns. Their children are born able to lift the ash and throw it.',
    statBonuses: { chakraControl: 2, ninjutsu: 1, stamina: -2 },
    modifiers: { growth: { chakraControl: 1.1 } },
    arts: ['chakraControl', 'ninjutsu'],
    startingTechniqueIds: ['haibara-ash-puff'],
    lodging: 'Your room above the Haibara kiln yard',
    dust: { dustId: 'ash' },
  },
];
