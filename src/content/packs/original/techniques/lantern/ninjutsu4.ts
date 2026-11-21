import type { TechniqueDef } from '@/systems/techniques';

/**
 * Ninjutsu: new techniques of the lantern country, their mechanics drawn from proven shapes and their
 * names and words its own (`docs/research/lantern-techniques.md`).
 */
export const LANTERN_NINJUTSU4: readonly TechniqueDef[] = [
  {
    id: 'ring-of-coals',
    name: 'Ring of Coals',
    description:
      'Coals spring up glowing in a ring round their feet, and while you feed them, stepping over is out of the question.',
    discipline: 'ninjutsu',
    element: 'fire',
    needs: { nature: 'fire' },
    reach: ['close', 'mid'],
    effects: [
      { verb: 'pin', power: 15, channelled: true },
      { verb: 'afflict', power: 6, harm: 'burn' },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'toga-stinging-scales',
    name: 'Stinging Scales',
    description:
      'Wings beat close round a foe’s face and throat, and the scales they shed burn like nettles.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'damage', power: 19, hits: 3 },
      { verb: 'afflict', power: 8, harm: 'poison' },
    ],
    chakraCost: 0,
    swarmCost: 30,
    rank: 'B',
    difficulty: 105,
    clan: 'toga',
  },
  {
    id: 'terrace-wall',
    name: 'Terrace Wall',
    description:
      'A dry-stone terrace wall stacks itself up in front of you, stone on stone, and holds like the hillside fields do.',
    discipline: 'ninjutsu',
    element: 'earth',
    needs: { nature: 'earth' },
    effects: [{ verb: 'substitute', power: 14 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'thornbush-charge',
    name: 'Thornbush Charge',
    description:
      'Lightning bristles out of the skin like a thornbush in winter; reach in and it bites back.',
    discipline: 'ninjutsu',
    element: 'lightning',
    needs: { nature: 'lightning' },
    effects: [
      { verb: 'shroud', power: 10, kind: 'lightning' },
      { verb: 'counter', power: 10 },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'threshing-wind',
    name: 'Threshing Wind',
    description:
      'A wide wind that beats across the field like flails at harvest and leaves everyone in it cut and bleeding.',
    discipline: 'ninjutsu',
    element: 'wind',
    needs: { nature: 'wind' },
    effects: [
      { verb: 'area', power: 13, size: 'wide' },
      { verb: 'afflict', power: 6, harm: 'bleed' },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'beacon-fire',
    name: 'Beacon Fire',
    description:
      'Light yourself like the hilltop beacon that calls the village to arms, and burn that bright until the fight is done.',
    discipline: 'ninjutsu',
    element: 'fire',
    needs: { nature: 'fire' },
    effects: [
      { verb: 'empower', power: 18, boosts: ['ninjutsu', 'willpower'], healthPerExchange: 4 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
    oncePerFight: true,
  },
  {
    id: 'bottom-of-the-well',
    name: 'Bottom of the Well',
    description:
      'The ground opens on cold well water and they are at the bottom of it, held there while it drinks their chakra up into you.',
    discipline: 'ninjutsu',
    element: 'water',
    needs: { nature: 'water' },
    reach: ['close', 'mid'],
    effects: [
      { verb: 'pin', power: 16, channelled: true },
      { verb: 'drain', power: 12, absorb: true },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'haibara-burying-ash',
    name: 'Burying Ash',
    description:
      'Every hearth for a mile gives up its ash at once, and it comes down on the foe like a mountain’s fall of it.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'area', power: 18, size: 'wide' },
      { verb: 'daze', power: 10 },
    ],
    chakraCost: 0,
    dustDraw: 50,
    rank: 'A',
    difficulty: 140,
    clan: 'haibara',
    oncePerFight: true,
  },
  {
    id: 'cracked-seal-palm',
    name: 'Cracked Seal Palm',
    description:
      'A palm of packed chakra that cracks a guard the way frost cracks a glazed pot, ward and all.',
    discipline: 'ninjutsu',
    reach: ['close'],
    effects: [
      { verb: 'break', power: 22 },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'deep-moss',
    name: 'Deep Moss',
    description:
      'Breathe out a green fog that smells of wet bark, and walk into the forest that grows inside it.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'field', power: 16, field: 'mist' },
      { verb: 'conceal', power: 14 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
    school: 'Moss Step',
  },
  {
    id: 'drifting-lanterns',
    name: 'Drifting Lanterns',
    description:
      'Float paper lanterns down the water as on the night of the dead; each one that touches the bank stands up as you.',
    discipline: 'ninjutsu',
    element: 'water',
    needs: { nature: 'water' },
    effects: [
      { verb: 'clone', power: 12, kind: 'water', strikes: true },
      { verb: 'confuse', power: 10 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'festival-wires',
    name: 'Festival Wires',
    description:
      'Every lantern wire strung across the street goes live at once, and whoever stands under them dances until the current lets go.',
    discipline: 'ninjutsu',
    element: 'lightning',
    needs: { nature: 'lightning' },
    reach: ['close', 'mid', 'far'],
    effects: [
      { verb: 'area', power: 16, size: 'wide' },
      { verb: 'pin', power: 12 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'gorge-wind',
    name: 'Gorge Wind',
    description:
      'All the air of the valley squeezed through one narrow pass and let go at a single foe.',
    discipline: 'ninjutsu',
    element: 'wind',
    needs: { nature: 'wind' },
    reach: ['mid', 'far'],
    accuracy: 'sure',
    effects: [{ verb: 'break', power: 22 }],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'heat-lightning-pulse',
    name: 'Heat-Lightning Pulse',
    description:
      'Let the summer’s heat lightning into your own nerves; you move before you have decided to, and pay for it in the morning.',
    discipline: 'ninjutsu',
    element: 'lightning',
    needs: { nature: 'lightning' },
    effects: [
      {
        verb: 'empower',
        power: 18,
        boosts: ['speed', 'perception', 'taijutsu'],
        healthPerExchange: 3,
      },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'hills-grip',
    name: 'Hill’s Grip',
    description:
      'The hillside closes on them like a fist round a stone and crushes what it can reach.',
    discipline: 'ninjutsu',
    element: 'earth',
    needs: { nature: 'earth' },
    reach: ['close', 'mid'],
    accuracy: 'wild',
    effects: [
      { verb: 'pin', power: 18 },
      { verb: 'damage', power: 14 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
];
