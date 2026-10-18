import type { EnemyDef } from '../../../types';

/**
 * Jōnin-grade rogues: the quarry of S-rank hunts (`templates/joninS.ts`). Elite danger, so
 * the village sends only a jōnin, with a chūnin squad behind them.
 */
export const ELITE_ENEMIES: readonly EnemyDef[] = [
  {
    id: 'hollow-lantern',
    kind: 'Rogue',
    danger: 'elite',
    name: 'The Hollow Lantern',
    description:
      'A jōnin who walked out of the archive with a sealed lantern under one arm, and has been reading its seals aloud ever since.',
    baseStat: 14,
    statBonuses: { fuuinjutsu: 6, genjutsu: 3, perception: 2 },
    maxChakra: 120,
    techniqueIds: ['seven-knot-seal', 'ink-chain-seal', 'kiln-mine', 'whispering-dread'],
    traits: ['illusionist'],
  },
  {
    id: 'dune-warlords-blade',
    kind: 'Rogue',
    danger: 'elite',
    name: 'The Warlord’s Blade',
    description:
      'Once the best sword the village had. Now the dune warlord’s, and paid in water and gold.',
    baseStat: 15,
    statBonuses: { kenjutsu: 7, speed: 3, strength: 2 },
    maxChakra: 100,
    techniqueIds: ['tile-splitting-cut', 'moonfall-slash', 'crescent-drop'],
    traits: ['swift'],
  },
  {
    id: 'salt-widow',
    kind: 'Rogue',
    danger: 'elite',
    name: 'The Salt Widow',
    description:
      'A water jōnin who sank her own patrol boat and took to the strait. The pirates there call her mother.',
    baseStat: 14,
    statBonuses: { ninjutsu: 5, speed: 3, chakraControl: 2 },
    maxChakra: 120,
    techniqueIds: ['tide-lash', 'water-needle', 'river-grip', 'lamp-black-hammer'],
    nature: 'water',
  },
];
