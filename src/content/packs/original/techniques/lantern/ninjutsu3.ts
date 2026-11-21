import type { TechniqueDef } from '@/systems/techniques';

/**
 * Ninjutsu: new techniques of the lantern country, their mechanics drawn from proven shapes and their
 * names and words its own (`docs/research/lantern-techniques.md`).
 */
export const LANTERN_NINJUTSU3: readonly TechniqueDef[] = [
  {
    id: 'listening-floor',
    name: 'Listening Floor',
    description:
      'Lay a palm on the boards and feel every footstep in the building, the light ones most of all.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'sense', power: 14 }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'mill-paddles',
    name: 'Mill Paddles',
    description:
      'Water thrown up in paddles, one after another, each striking as the last drops away.',
    discipline: 'ninjutsu',
    element: 'water',
    reach: ['close', 'mid'],
    effects: [{ verb: 'damage', power: 16, hits: 3 }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'paddy-mire',
    name: 'Paddy Mire',
    description:
      'The ground under them goes soft as a flooded rice paddy, and every step sinks deeper than the last.',
    discipline: 'ninjutsu',
    element: 'earth',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'pin', power: 12 },
      { verb: 'daze', power: 4 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'pot-lid-downdraught',
    name: 'Pot-Lid Downdraught',
    description:
      'Air presses down on them like a lid on a simmering pot, and nothing under it gets up.',
    discipline: 'ninjutsu',
    element: 'wind',
    reach: ['close', 'mid'],
    effects: [{ verb: 'pin', power: 12 }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'threshing-dust',
    name: 'Threshing Dust',
    description:
      'Beat the ground like grain on a threshing floor until the chaff hangs in the air and no one can tell which shape is which.',
    discipline: 'ninjutsu',
    element: 'earth',
    effects: [
      { verb: 'field', power: 12, field: 'dust' },
      { verb: 'confuse', power: 6 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'thunderclap-vanish',
    name: 'Thunderclap Vanish',
    description:
      'A white flash and a bang, and by the time their eyes clear you are somewhere else entirely.',
    discipline: 'ninjutsu',
    element: 'lightning',
    effects: [
      { verb: 'conceal', power: 12 },
      { verb: 'move', power: 6, to: 'far' },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'weir-spill',
    name: 'Weir Spill',
    description:
      'The weir gives way and a low wave of brown water runs through the fight, taking legs out from under everyone.',
    discipline: 'ninjutsu',
    element: 'water',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'area', power: 10, size: 'wide' },
      { verb: 'knock', power: 6, to: 'mid' },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'hibana-bonfire-street',
    name: 'Bonfire Street',
    description:
      'The whole lane goes up like the last night of the festival, and nobody in it walks out unburnt.',
    discipline: 'ninjutsu',
    element: 'fire',
    needs: { nature: 'fire' },
    effects: [
      { verb: 'area', power: 13, size: 'wide' },
      { verb: 'afflict', power: 8, harm: 'burn' },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
    clan: 'hibana',
  },
  {
    id: 'haibara-cinder-coat',
    name: 'Cinder Coat',
    description:
      'Ash settles over your skin and sets like a glaze, and blows skid off it with a puff of grey.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'shroud', power: 12, kind: 'sand' }],
    chakraCost: 0,
    dustCost: 30,
    rank: 'B',
    difficulty: 105,
    clan: 'haibara',
  },
  {
    id: 'drowned-ford',
    name: 'Drowned Ford',
    description:
      'The ford is deeper than it looked: water takes them round the waist and drags them in towards you, and does not let go.',
    discipline: 'ninjutsu',
    element: 'water',
    needs: { nature: 'water' },
    reach: ['mid', 'far'],
    effects: [
      { verb: 'pin', power: 14 },
      { verb: 'knock', power: 6, to: 'close' },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'kingfisher-bolt',
    name: 'Kingfisher Bolt',
    description:
      'A dart of water shaped like a kingfisher, gone from your hand and into them before the splash.',
    discipline: 'ninjutsu',
    element: 'water',
    needs: { nature: 'water' },
    reach: ['mid', 'far'],
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 19 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'lacquer-coat',
    name: 'Lacquer Coat',
    description:
      'Chakra laid over the skin in coat after coat, like lacquer on a bowl, until blows skid off it.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'shroud', power: 12, kind: 'chakra' }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'lightning-awl',
    name: 'Lightning Awl',
    description:
      'Lightning narrowed to the point of a cobbler’s awl and driven through the guard as easily as through leather.',
    discipline: 'ninjutsu',
    element: 'lightning',
    needs: { nature: 'lightning' },
    reach: ['close'],
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 16 },
      { verb: 'break', power: 10 },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'out-of-the-moss',
    name: 'Out of the Moss',
    description:
      'The moss stands up behind them as a person, and the first they know of it is the blow.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'move', power: 8, to: 'close' },
      { verb: 'damage', power: 19 },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
    school: 'Moss Step',
  },
  {
    id: 'plough-wave',
    name: 'Plough Wave',
    description:
      'The earth folds up like soil before a plough and turns over everyone in its line.',
    discipline: 'ninjutsu',
    element: 'earth',
    needs: { nature: 'earth' },
    reach: ['close', 'mid'],
    effects: [
      { verb: 'area', power: 13, size: 'wide' },
      { verb: 'knock', power: 8, to: 'mid' },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
];
