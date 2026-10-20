import type { EnemyDef, GearDef } from '../../../types';

/**
 * Who fights in the harbour ward under the Bloody Mist: the Mizukage's patrols, the Kurage
 * house's masked hunter-nin and the loyal houses' rank and file; the bloodline rebels they
 * hunt; and the heavy blade the Seventh Forge still makes, after the Swordsmen it was made for.
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
    techniqueIds: ['jellyfish-senbon', 'false-death-needle', 'hidden-mist'],
    traits: ['swift'],
    nature: 'water',
  },
  {
    id: 'kasumi-fog-weaver',
    kind: 'Mist-keeper',
    danger: 'deadly',
    name: 'Kasumi Fog-Weaver',
    description:
      'One of the house that keeps the village’s fog. Where they stand the mist is thicker, and it watches you.',
    baseStat: 9,
    statBonuses: { genjutsu: 3, chakraControl: 2 },
    maxChakra: 60,
    techniqueIds: ['fog-lure', 'drowning-fog', 'hidden-mist'],
    traits: ['illusionist'],
  },
  {
    id: 'amibari-net-binder',
    kind: 'Register-keeper',
    danger: 'deadly',
    name: 'Amibari Net-Binder',
    description:
      'Carries a sealing net over one shoulder and a page of the Blood Register in the other hand.',
    baseStat: 9,
    statBonuses: { fuuinjutsu: 3, intellect: 2 },
    maxChakra: 55,
    techniqueIds: ['weighted-net-cast', 'sealing-net', 'register-brand'],
  },
  {
    id: 'isana-harpooner',
    kind: 'Whaler of the fleet',
    danger: 'armed',
    name: 'Isana Harpooner',
    description: 'A whaler of the blockade fleet with an iron on a rope and arms like hawsers.',
    baseStat: 7,
    statBonuses: { strength: 3, taijutsu: 2, stamina: 1 },
    maxChakra: 25,
    techniqueIds: ['harpoon-throw', 'breaker-fist'],
    traits: ['brawler'],
  },
  {
    id: 'shiogama-blade',
    kind: 'Smith of the Seventh Forge',
    danger: 'deadly',
    name: 'Shiogama Blade',
    description: 'A smith’s son with a blade he forged himself and a forge-scarred guard.',
    baseStat: 9,
    statBonuses: { kenjutsu: 3, strength: 2 },
    maxChakra: 40,
    techniqueIds: ['salt-kiln-edge', 'tempered-guard'],
    traits: ['swift'],
  },
  {
    id: 'hozuki-rebel',
    kind: 'Rebel of the Mist',
    danger: 'deadly',
    name: 'Hōzuki Rebel',
    description: 'Blows go through the body like water. The Hōzuki fight in the drains and canals.',
    baseStat: 10,
    statBonuses: { ninjutsu: 3, chakraControl: 2 },
    maxChakra: 60,
    techniqueIds: ['hydrification', 'water-gun', 'great-water-arm'],
    nature: 'water',
  },
  {
    id: 'hoshigaki-raider',
    kind: 'Rebel of the Mist',
    danger: 'deadly',
    name: 'Hoshigaki Raider',
    description:
      'Grey-skinned and grinning, off a rebel boat that slipped the blockade in the fog.',
    baseStat: 10,
    statBonuses: { strength: 3, stamina: 2, ninjutsu: 1 },
    maxChakra: 70,
    techniqueIds: ['water-shark-bullet', 'shark-skin', 'hiding-in-water'],
    nature: 'water',
  },
  {
    id: 'yuki-fugitive',
    kind: 'Bloodline fugitive',
    danger: 'deadly',
    name: 'Yuki Fugitive',
    description: 'Frost spreads from their feet when they are afraid, and they are always afraid.',
    baseStat: 9,
    statBonuses: { ninjutsu: 3, speed: 2 },
    maxChakra: 55,
    techniqueIds: ['ice-needles', 'frost-shackle'],
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
