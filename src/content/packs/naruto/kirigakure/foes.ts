import type { EnemyDef, GearDef } from '../../../types';

/**
 * Who keeps order in the harbour ward under the Bloody Mist: the Mizukage's patrols and the
 * masked hunter-nin who track down bloodlines and deserters. And the heavy blade the Seventh
 * Forge still makes, after the Swordsmen it was made for.
 */
export const KIRI_FOES: readonly EnemyDef[] = [
  {
    id: 'mist-patrol',
    kind: 'Chūnin of the Mist',
    danger: 'deadly',
    name: 'Mist Patrol',
    description:
      'A chūnin of the harbour patrol. Under the Bloody Mist, the patrols ask questions with kunai.',
    baseStat: 9,
    statBonuses: { ninjutsu: 2, speed: 2, perception: 1 },
    maxChakra: 50,
    techniqueIds: ['water-bullet', 'hiding-in-water', 'shuriken-jutsu'],
    nature: 'water',
  },
  {
    id: 'mist-hunter-nin',
    kind: 'Hunter-nin',
    danger: 'deadly',
    name: 'Masked Hunter-nin',
    description:
      'A blank porcelain mask and a satchel of senbon. Hunts bloodlines for the Mizukage and never comes back empty-handed.',
    baseStat: 10,
    statBonuses: { speed: 3, perception: 2, ninjutsu: 1 },
    maxChakra: 60,
    techniqueIds: ['senbon-needles', 'hidden-mist', 'water-needle'],
    traits: ['swift'],
    nature: 'water',
  },
];

export const KIRI_GEAR: readonly GearDef[] = [
  {
    id: 'kiri-broadsword',
    name: 'Mist Broadsword',
    description:
      'A broad, heavy blade forged in the old Swordsmen’s way. It wants both hands and a strong back.',
    kind: 'weapon',
    shape: 'blade',
    rank: 'B',
    cost: 650,
    icon: 'sword',
  },
];
