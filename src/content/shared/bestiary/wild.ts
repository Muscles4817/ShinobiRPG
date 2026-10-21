import type { EnemyDef } from '../../types';
import type { FoeKit } from './kit';
import { foeStats, NO_ARTS } from './foeStats';

/**
 * Animals by the country they live in, and the sea's pirates and ghosts. Animals are plain:
 * no chakra and no techniques, only their kit (traits), their size (`healthScale`) and their
 * meat. Beasts changed by chakra come later and are another thing (the content-pass plan).
 */

/** A beast's body, whatever its kind: no chakra, no techniques. */
const PLAIN = { maxChakra: 0, techniqueIds: [] } as const;

export const WILD_BEASTS: readonly EnemyDef[] = [
  // Woods.
  {
    id: 'wild-dog',
    kind: 'Beast',
    danger: 'petty',
    name: 'Wild Dog',
    description: 'Ribs showing, ears flat, and never alone for long.',
    ...foeStats(3, [6, 11, 10, 13], { ...NO_ARTS, taijutsu: 6, willpower: 5 }),
    healthScale: 0.6,
    ...PLAIN,
    traits: ['pack', 'coward'],
  },
  {
    id: 'grey-wolf',
    kind: 'Beast',
    drops: ['wild-game'],
    danger: 'petty',
    name: 'Grey Wolf',
    description: 'Lopes along beside you just out of sight, waiting for you to tire.',
    ...foeStats(3, [6, 10, 10, 12], { ...NO_ARTS, taijutsu: 5, willpower: 5 }),
    healthScale: 0.7,
    ...PLAIN,
    traits: ['pack', 'swift'],
  },
  {
    id: 'wolf-pack-leader',
    kind: 'Beast',
    drops: ['wild-game'],
    danger: 'armed',
    name: 'Wolf Pack Leader',
    description: 'Scarred grey muzzle and two younger wolves who go where it looks.',
    ...foeStats(4, [8, 10, 10, 12], { ...NO_ARTS, taijutsu: 6, willpower: 6 }),
    healthScale: 0.9,
    ...PLAIN,
    traits: ['pack'],
    retinue: [
      { enemyId: 'grey-wolf', tell: 'open' },
      { enemyId: 'grey-wolf', tell: 'kept' },
    ],
  },
  {
    id: 'giant-centipede',
    kind: 'Beast',
    danger: 'armed',
    name: 'Giant Centipede',
    description:
      'As long as a man is tall, red-legged, and fast in a way nothing that size should be.',
    ...foeStats(3, [8, 13, 12, 8], { ...NO_ARTS, taijutsu: 7, willpower: 6 }),
    healthScale: 0.8,
    ...PLAIN,
    traits: ['swift'],
  },
  {
    id: 'hornet-swarm',
    kind: 'Beast',
    danger: 'petty',
    name: 'Hornet Swarm',
    form: 'swarm',
    description: 'A nest knocked out of a cedar, and every one of them angry with you.',
    ...foeStats(2, [1, 18, 4, 10], { ...NO_ARTS, taijutsu: 5, willpower: 6 }),
    healthScale: 0.4,
    ...PLAIN,
    traits: ['pack', 'swift'],
  },
  // Mountains.
  {
    id: 'mountain-eagle',
    kind: 'Beast',
    danger: 'petty',
    name: 'Mountain Eagle',
    blow: 'talon',
    description: 'Drops out of the sun on anything it thinks it can carry off.',
    ...foeStats(2, [4, 20, 8, 22], { ...NO_ARTS, taijutsu: 6, willpower: 6 }),
    healthScale: 0.5,
    ...PLAIN,
    traits: ['swift', 'coward'],
  },
  {
    id: 'old-cave-bear',
    kind: 'Beast',
    drops: ['wild-game'],
    danger: 'deadly',
    name: 'Old Cave Bear',
    blow: 'claw',
    description: 'Has slept in the same cave for twenty winters and woken up angry for every one.',
    ...foeStats(8, [30, 11, 17, 13], { ...NO_ARTS, taijutsu: 12, willpower: 13 }),
    healthScale: 1.8,
    ...PLAIN,
    traits: ['brawler'],
  },
  // Marsh.
  {
    id: 'marsh-viper',
    kind: 'Beast',
    danger: 'petty',
    name: 'Marsh Viper',
    description: 'A brown coil in brown water. You find it by standing on it.',
    ...foeStats(2, [2, 15, 4, 10], { ...NO_ARTS, taijutsu: 6, willpower: 4 }),
    healthScale: 0.3,
    ...PLAIN,
    traits: ['swift', 'coward'],
  },
  {
    id: 'giant-salamander',
    kind: 'Beast',
    drops: ['wild-game'],
    danger: 'armed',
    name: 'Giant Salamander',
    description: 'Older than the village, flat as a door, and it bites like one slamming.',
    ...foeStats(3, [13, 4, 16, 7], { ...NO_ARTS, taijutsu: 7, willpower: 8 }),
    healthScale: 1.3,
    ...PLAIN,
    traits: ['brawler'],
  },
  // The shore.
  {
    id: 'moray-eel',
    kind: 'Beast',
    danger: 'petty',
    name: 'Moray Eel',
    description: 'Lives in a hole in the rocks and objects to hands.',
    ...foeStats(2, [8, 10, 8, 8], { ...NO_ARTS, taijutsu: 6, willpower: 5 }),
    healthScale: 0.5,
    ...PLAIN,
    traits: ['coward'],
  },
  {
    id: 'shore-crab',
    kind: 'Beast',
    danger: 'armed',
    name: 'Great Shore Crab',
    blow: 'claw',
    description: 'A shell like a cart wheel. It walks sideways and does not stop.',
    ...foeStats(3, [14, 4, 15, 6], { ...NO_ARTS, taijutsu: 7, willpower: 7 }),
    healthScale: 0.9,
    ...PLAIN,
    traits: ['armoured'],
  },
  {
    id: 'reef-shark',
    kind: 'Beast',
    danger: 'armed',
    name: 'Reef Shark',
    description: 'Comes in with the tide when the boats are gutting fish, and stays for more.',
    ...foeStats(3, [14, 13, 12, 13], { ...NO_ARTS, taijutsu: 7, willpower: 8 }),
    healthScale: 1.2,
    ...PLAIN,
    traits: ['brawler'],
  },
];

/*#__NO_SIDE_EFFECTS__*/
export function seaRaiders(kit: FoeKit): EnemyDef[] {
  return [
    {
      id: 'pirate-boarder',
      kind: 'Pirate',
      danger: 'armed',
      name: 'Pirate Boarder',
      description: 'First over the rail with a cutlass in their teeth. Literally.',
      ...foeStats(6, [12, 10, 11, 7], { taijutsu: 7, kenjutsu: 7 }),
      maxChakra: 10,
      techniqueIds: [kit.cut, kit.palm],
      traits: ['brawler'],
    },
    {
      id: 'harpoon-thrower',
      kind: 'Pirate',
      danger: 'armed',
      name: 'Harpoon Thrower',
      description:
        'Throws a barbed iron as far as most people shoot, then hauls you in on the rope.',
      ...foeStats(6, [12, 8, 10, 10], { kenjutsu: 7 }),
      maxChakra: 10,
      techniqueIds: [kit.throw],
      traits: ['archer'],
    },
    {
      id: 'pirate-tide-caller',
      kind: 'Pirate',
      danger: 'armed',
      name: 'Tide-Caller',
      description:
        'The crew’s luck: brings fog on a clear night and the sea over the side on command.',
      ...foeStats(7, [8, 9, 9, 9], { ninjutsu: 11, chakraControl: 9 }),
      maxChakra: 50,
      techniqueIds: [kit.waterShot, kit.waterLash, kit.fog],
      nature: 'water',
    },
    {
      id: 'pirate-captain',
      kind: 'Pirate',
      danger: 'deadly',
      name: 'Pirate Captain',
      description:
        'Three ships, a price on their head in four ports, and no intention of paying it.',
      ...foeStats(10, [14, 11, 13, 10], { kenjutsu: 13, willpower: 13, ninjutsu: 5, genjutsu: 5 }),
      maxChakra: 50,
      techniqueIds: [kit.heavyCut, kit.bleedCut, kit.sweepCut, kit.smoke],
      traits: ['armoured'],
    },
  ];
}

/*#__NO_SIDE_EFFECTS__*/
export function restlessDead(kit: FoeKit): EnemyDef[] {
  return [
    {
      id: 'fox-fire',
      kind: 'Spirit',
      danger: 'petty',
      name: 'Fox-Fire',
      description: 'A cold blue light over the fields at night. Follow it and you are lost.',
      ...foeStats(5, [2, 10, 3, 8], { genjutsu: 9, willpower: 7, chakraControl: 7, taijutsu: 2 }),
      healthScale: 0.4,
      maxChakra: 40,
      techniqueIds: [kit.feint],
      traits: ['spirit', 'illusionist', 'coward'],
    },
    {
      id: 'shrine-spirit',
      kind: 'Spirit',
      danger: 'armed',
      name: 'Forgotten Shrine Spirit',
      description: 'A roadside god nobody leaves rice for any more. It has noticed.',
      ...foeStats(6, [4, 7, 4, 9], { genjutsu: 10, willpower: 11, intellect: 8, taijutsu: 3 }),
      healthScale: 0.7,
      maxChakra: 50,
      techniqueIds: [kit.feint, kit.dread],
      traits: ['spirit', 'illusionist'],
    },
    {
      id: 'drowned-sailor',
      kind: 'Spirit',
      danger: 'armed',
      name: 'Drowned Sailor',
      description: 'Walks up the beach on foggy nights, dripping, asking which ship you’re from.',
      ...foeStats(7, [11, 7, 10, 7], { willpower: 11, genjutsu: 9 }),
      healthScale: 0.8,
      maxChakra: 40,
      techniqueIds: [kit.dread, kit.waterShot],
      traits: ['spirit'],
    },
  ];
}
