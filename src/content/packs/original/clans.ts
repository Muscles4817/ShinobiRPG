import type { ClanDef } from '../../types';

export const CLANS: readonly ClanDef[] = [
  {
    id: 'none',
    name: 'No clan',
    description: 'Nobody handed you anything. You train a little harder because of it.',
    statBonuses: {},
    modifiers: { training: 1.05 },
    startingTechniqueIds: [],
  },
  {
    id: 'hibana',
    name: 'Hibana',
    description: 'Fire-breathers who light the village’s great lanterns each dusk. Hot-tempered.',
    statBonuses: { ninjutsu: 2, stamina: 1, willpower: -2 },
    modifiers: { studyElement: { fire: 1.3 } },
    nature: 'fire',
    startingTechniqueIds: ['hibana-spark'],
    lodging: 'Your room in the Hibana kiln-house',
  },
  {
    id: 'tokaku',
    name: 'Tōkaku',
    description: 'Lantern-keepers who guide the dead home. They see what others can’t.',
    statBonuses: { perception: 2, willpower: 1, genjutsu: 1, strength: -2 },
    modifiers: { studyDiscipline: { genjutsu: 1.2 } },
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
    description: 'Smiths and swordsmen. Every child forges their first blade at twelve.',
    statBonuses: { kenjutsu: 2, strength: 1, genjutsu: -1, intellect: -1 },
    modifiers: { studyDiscipline: { kenjutsu: 1.25, genjutsu: 0.8 } },
    startingTechniqueIds: ['forge-cut'],
    lodging: 'The loft above the Kurogane forge',
  },
  {
    id: 'shimenawa',
    name: 'Shimenawa',
    description: 'Weavers of the sacred ropes that bind the restless dead. Patient, and frail.',
    statBonuses: { fuuinjutsu: 2, chakraControl: 1, stamina: -2 },
    modifiers: { studyDiscipline: { fuuinjutsu: 1.3 } },
    startingTechniqueIds: ['binding-rope'],
    lodging: 'Your room at the Shimenawa shrine',
    kekkeiGenkai: {
      name: 'Binding Blood',
      description:
        'Seals written in your blood hold twice as long. Dormant until your first true seal.',
      dormant: true,
    },
  },
];
