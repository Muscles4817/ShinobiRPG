import type { EnemyDef } from '../../types';

/**
 * The desert's plain animals: no chakra and no techniques, only their kit, their size and their
 * meat. Beasts the tainted sand has changed are another thing, and each setting writes its own.
 */
const PLAIN = { maxChakra: 0, techniqueIds: [] } as const;

export const DESERT_BEASTS: readonly EnemyDef[] = [
  {
    id: 'sand-viper',
    kind: 'Beast',
    danger: 'petty',
    name: 'Sand Viper',
    blow: 'bite',
    description: 'Buried to the eyes in the sand by the path, and quicker than the foot it bites.',
    baseStat: 4,
    statBonuses: { speed: 4, perception: 2, strength: -2 },
    healthScale: 0.3,
    ...PLAIN,
    traits: ['swift', 'coward'],
  },
  {
    id: 'striped-hyena',
    kind: 'Beast',
    drops: ['wild-game'],
    danger: 'petty',
    name: 'Striped Hyena',
    description: 'Laughs in the dark round the camp, and comes closer each time it laughs.',
    baseStat: 5,
    statBonuses: { strength: 2, stamina: 2, speed: 1 },
    healthScale: 0.7,
    ...PLAIN,
    traits: ['pack', 'coward'],
  },
  {
    id: 'desert-lion',
    kind: 'Beast',
    drops: ['wild-game'],
    danger: 'armed',
    name: 'Desert Lion',
    blow: 'claw',
    description: 'Lean and pale as the sand, maneless, and patient enough to wait out a caravan.',
    baseStat: 7,
    statBonuses: { strength: 4, speed: 2, perception: 2 },
    healthScale: 1.1,
    ...PLAIN,
    traits: ['brawler'],
  },
];
