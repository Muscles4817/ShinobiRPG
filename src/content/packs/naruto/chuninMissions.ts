import type { MissionDef } from '@/systems/missions';

import type { EnemyDef } from '../../types';

/**
 * Jobs the Leaf gives only to chūnin: B- and A-rank, and taken alone. They are what opens on
 * the board at promotion, and what a jōnin's record is made of.
 */
export const CHUNIN_MISSIONS: readonly MissionDef[] = [
  {
    id: 'smugglers-of-tanzaku',
    title: 'Smugglers of Tanzaku',
    rank: 'B',
    client: 'Tanzaku Town Magistrate',
    summary: 'Someone is running stolen Leaf kunai out through the gambling halls. Find them.',
    slots: 4,
    energyCost: 35,
    reward: { ryo: 520, reputation: 10 },
    minMissionsCompleted: 6,
    stages: [
      {
        kind: 'check',
        text: 'The dealer at the third table is counting in a cipher.',
        approaches: [
          { label: 'Crack the cipher', stat: 'intellect', difficulty: 12 },
          { label: 'Tail the runner', stat: 'perception', difficulty: 12 },
        ],
        success: 'The runner leads you to a boathouse on the river.',
        failure: 'You lose the runner in the crowd, and the trail goes cold for a day.',
        onFailure: 'penalty',
        failureDamage: 6,
      },
      {
        kind: 'encounter',
        template: 'lone-rogue',
        job: 'eliminate',
        text: 'In the boathouse, a missing-nin with a scratched Leaf headband is packing crates.',
        enemyIds: ['leaf-missing-nin'],
        canFlee: true,
      },
    ],
  },
  {
    id: 'bridge-builders-debt',
    title: 'The Bridge Builder’s Debt',
    rank: 'B',
    client: 'Land of Waves Builders’ Guild',
    summary: 'A mercenary band is squeezing the new bridge for tolls. Make them stop.',
    slots: 4,
    energyCost: 35,
    reward: { ryo: 480, reputation: 11 },
    minMissionsCompleted: 6,
    stages: [
      {
        kind: 'narrative',
        text: 'Mist on the water, and a toll gate where there was none last month.',
      },
      {
        kind: 'encounter',
        template: 'bandit-camp',
        job: 'eliminate',
        text: 'Two mercenaries in cast-off Mist gear lounge at the toll gate.',
        enemyIds: ['leaf-missing-nin', 'leaf-missing-nin'],
        canFlee: true,
      },
    ],
  },
  {
    id: 'border-outpost-orders',
    title: 'Orders to the Border Outpost',
    rank: 'A',
    client: 'The Hokage’s office',
    summary: 'Carry sealed orders to the northern outpost through hills a rogue cell holds.',
    slots: 6,
    energyCost: 40,
    reward: { ryo: 900, reputation: 16 },
    minMissionsCompleted: 10,
    stages: [
      {
        kind: 'encounter',
        template: 'bandit-camp',
        job: 'deliver',
        text: 'A camp on the ridge road: rogues with their headbands scratched through.',
        enemyIds: ['leaf-missing-nin', 'leaf-missing-nin'],
        canFlee: true,
      },
    ],
  },
];

/** Foes worth a chūnin's time. */
export const CHUNIN_ENEMIES: readonly EnemyDef[] = [
  {
    id: 'leaf-missing-nin',
    kind: 'Rogue',
    name: 'Missing-nin',
    description: 'Left the Leaf with its secrets and a grudge. Fights like a chūnin, because he was one.',
    baseStat: 11,
    statBonuses: { ninjutsu: 4, speed: 2, kenjutsu: 2 },
    maxChakra: 70,
    techniqueIds: ['phoenix-flower', 'water-bullet', 'crescent-moon-dance'],
    traits: ['swift'],
    nature: 'fire',
  },
];
