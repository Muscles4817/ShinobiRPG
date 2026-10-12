import type { MissionDef } from '@/systems/missions';

import type { EnemyDef } from '../../types';

/**
 * Jobs the village gives only to chūnin: B- and A-rank, and taken alone. They are what opens on
 * the board at promotion, and what a jōnin's record is made of.
 */
export const CHUNIN_MISSIONS: readonly MissionDef[] = [
  {
    id: 'smugglers-at-the-weir',
    title: 'Smugglers at the Weir',
    rank: 'B',
    client: 'River Magistrate',
    summary: 'Ember-oil is crossing the weir by night under forged seals. Find out who, alone.',
    slots: 4,
    energyCost: 35,
    reward: { ryo: 520, reputation: 10 },
    minMissionsCompleted: 6,
    stages: [
      {
        kind: 'check',
        text: 'The weir-keeper’s ledger has been kept in two hands.',
        approaches: [
          { label: 'Compare the hands', stat: 'intellect', difficulty: 12 },
          { label: 'Watch the keeper tonight', stat: 'perception', difficulty: 12 },
        ],
        success: 'The second hand belongs to the keeper’s nephew, and he is expecting a boat.',
        failure: 'You learn nothing before the boat comes in.',
        onFailure: 'penalty',
        failureDamage: 6,
      },
      {
        kind: 'encounter',
        template: 'lone-rogue',
        job: 'eliminate',
        text: 'A hooded figure poles the boat in. Ember-oil, and a missing-nin’s forehead protector, scratched through.',
        enemyIds: ['ember-missing-nin'],
        canFlee: true,
      },
    ],
  },
  {
    id: 'ash-wraith-of-kiln-pass',
    title: 'The Wraith of Kiln Pass',
    rank: 'B',
    client: 'Kiln Pass Potters',
    summary: 'Something in the old kilns burns travellers’ shadows off them. Put it to rest.',
    slots: 4,
    energyCost: 35,
    reward: { ryo: 480, reputation: 11 },
    minMissionsCompleted: 6,
    stages: [
      {
        kind: 'narrative',
        text: 'The kilns have been cold for a generation, but the ash on the road is warm.',
      },
      {
        kind: 'encounter',
        template: 'spirit',
        job: 'eliminate',
        text: 'In the biggest kiln, a shape of cinders turns towards you and drinks the light.',
        enemyIds: ['kiln-wraith'],
        canFlee: true,
      },
    ],
  },
  {
    id: 'border-fort-courier',
    title: 'The Border Fort Courier',
    rank: 'A',
    client: 'The Tōrokage’s office',
    summary: 'Carry sealed orders to the border fort through hills that a rogue cell holds.',
    slots: 6,
    energyCost: 40,
    reward: { ryo: 900, reputation: 16 },
    minMissionsCompleted: 10,
    stages: [
      {
        kind: 'narrative',
        text: 'The orders are sewn into your vest. The hills are quiet in the way that means watchers.',
      },
      {
        kind: 'encounter',
        template: 'bandit-camp',
        job: 'deliver',
        text: 'A camp on the ridge road: two rogues with their forehead protectors scratched through.',
        enemyIds: ['ember-missing-nin', 'ember-missing-nin'],
        canFlee: true,
      },
    ],
  },
];

/** Foes worth a chūnin's time. */
export const CHUNIN_ENEMIES: readonly EnemyDef[] = [
  {
    id: 'ember-missing-nin',
    kind: 'Rogue',
    name: 'Ember Missing-nin',
    description:
      'Left the village with its secrets and a grudge. Fights like a chūnin, because he was one.',
    baseStat: 11,
    statBonuses: { ninjutsu: 4, speed: 2, kenjutsu: 2 },
    maxChakra: 70,
    techniqueIds: ['ember-breath', 'tide-lash', 'moonfall-slash'],
    traits: ['swift'],
    nature: 'fire',
  },
  {
    id: 'kiln-wraith',
    kind: 'Spirit',
    name: 'Kiln Wraith',
    description: 'A potter who fell into his own fire, and has been hungry for light ever since.',
    baseStat: 11,
    statBonuses: { genjutsu: 5, willpower: 4, stamina: -2 },
    healthScale: 1.2,
    maxChakra: 80,
    techniqueIds: ['whispering-dread', 'moth-dance', 'shadow-feint'],
    traits: ['spirit', 'illusionist'],
  },
];
