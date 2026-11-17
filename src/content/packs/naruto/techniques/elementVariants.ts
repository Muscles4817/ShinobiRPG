import type { TechniqueDef } from '@/systems/techniques';

/**
 * More of the standard elemental ninjutsu taught in every hidden village, so each element has
 * more than one shape at each grade: fire walls and tornadoes, water whips and trumpets, earth
 * that breaks guards and heaves, wind that bleeds, lightning that snares and splits. The heaviest
 * need the nature itself.
 */
export const ELEMENT_VARIANTS: readonly TechniqueDef[] = [
  {
    id: 'flame-wall',
    name: 'Fire Wall',
    description:
      'Katon. A sheet of flame breathed out along the ground between you and the blow, hot enough to turn most things aside.',
    discipline: 'ninjutsu',
    element: 'fire',
    effects: [{ verb: 'substitute', power: 11 }],
    chakraCost: 10,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'running-fire',
    name: 'Running Fire',
    description:
      'Fire spat along a wire or a line of oil that races to the target and wraps it before it can step away.',
    discipline: 'ninjutsu',
    element: 'fire',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'damage', power: 22 },
      { verb: 'afflict', power: 8, harm: 'burn' },
    ],
    chakraCost: 18,
    rank: 'B',
    needs: { nature: 'fire' },
    difficulty: 115,
  },
  {
    id: 'flame-tornado',
    name: 'Flame Tornado',
    description:
      'A column of fire set spinning across the field that pulls everyone near it into the heat and leaves them reeling.',
    discipline: 'ninjutsu',
    element: 'fire',
    effects: [
      { verb: 'area', power: 20, size: 'wide' },
      { verb: 'afflict', power: 8, harm: 'burn' },
    ],
    chakraCost: 30,
    rank: 'A',
    needs: { nature: 'fire', control: 'C' },
    difficulty: 140,
  },
  {
    id: 'water-whip',
    name: 'Water Whip',
    description:
      'A lash of water cracked out at arm’s length that wraps round a leg and drags its owner in.',
    discipline: 'ninjutsu',
    element: 'water',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 10 },
      { verb: 'knock', power: 6, to: 'close' },
    ],
    chakraCost: 8,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'water-trumpet',
    name: 'Water Trumpet',
    description:
      'Suiton. A great blast of water spat from the mouth that floods the ground in front of you and shoves everyone in it back.',
    discipline: 'ninjutsu',
    element: 'water',
    effects: [
      { verb: 'area', power: 12 },
      { verb: 'knock', power: 6, to: 'mid' },
    ],
    chakraCost: 13,
    rank: 'C',
    needs: { control: 'D' },
    difficulty: 85,
  },
  {
    id: 'raging-waves',
    name: 'Raging Waves',
    description:
      'A wave called up out of nothing that breaks over the whole field and carries everyone in it far down the shore.',
    discipline: 'ninjutsu',
    element: 'water',
    effects: [
      { verb: 'area', power: 20, size: 'wide' },
      { verb: 'knock', power: 10, to: 'far' },
    ],
    chakraCost: 30,
    rank: 'A',
    needs: { nature: 'water', control: 'C' },
    difficulty: 140,
  },
  {
    id: 'rock-fist',
    name: 'Rock Fist',
    description:
      'Doton. Earth packed round the fist as hard as granite and thrown straight through whatever guard is up.',
    discipline: 'ninjutsu',
    element: 'earth',
    reach: ['close'],
    effects: [{ verb: 'break', power: 14 }],
    chakraCost: 9,
    rank: 'D',
    difficulty: 60,
  },
  {
    id: 'earth-spikes',
    name: 'Earth Spikes',
    description:
      'Stakes of raw rock burst out of the ground under them, crude and badly aimed but heavy where they catch.',
    discipline: 'ninjutsu',
    element: 'earth',
    reach: ['close', 'mid'],
    accuracy: 'wild',
    effects: [{ verb: 'damage', power: 21 }],
    chakraCost: 12,
    rank: 'C',
    difficulty: 85,
  },
  {
    id: 'earth-upheaval',
    name: 'Earth Upheaval',
    description:
      'Both palms to the ground and the whole field heaves up and drops again, throwing everyone standing on it off their feet.',
    discipline: 'ninjutsu',
    element: 'earth',
    effects: [
      { verb: 'area', power: 18, size: 'wide' },
      { verb: 'daze', power: 10 },
    ],
    chakraCost: 30,
    rank: 'A',
    needs: { nature: 'earth' },
    difficulty: 140,
  },
  {
    id: 'wind-cutter',
    name: 'Wind Cutter',
    description:
      'Futon. Two thin blades of air flicked off the fingers that sing as they pass and leave the skin open.',
    discipline: 'ninjutsu',
    element: 'wind',
    effects: [
      { verb: 'damage', power: 10, hits: 2 },
      { verb: 'afflict', power: 5, harm: 'bleed' },
    ],
    chakraCost: 8,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'wind-barrier',
    name: 'Wind Barrier',
    description:
      'A wall of turning air thrown up in front of you that bats thrown steel aside and breaks against anything heavier.',
    discipline: 'ninjutsu',
    element: 'wind',
    effects: [{ verb: 'substitute', power: 11 }],
    chakraCost: 10,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'scything-gale',
    name: 'Scything Gale',
    description:
      'A curved wind as sharp as a scythe that goes through armour and leaves wounds slow to close.',
    discipline: 'ninjutsu',
    element: 'wind',
    effects: [
      { verb: 'damage', power: 20 },
      { verb: 'afflict', power: 8, harm: 'bleed' },
    ],
    chakraCost: 18,
    rank: 'B',
    needs: { nature: 'wind' },
    difficulty: 115,
  },
  {
    id: 'lightning-snare',
    name: 'Lightning Snare',
    description:
      'Raiton. Crackling threads cast over the legs that lock the muscles until the charge runs out.',
    discipline: 'ninjutsu',
    element: 'lightning',
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 6 },
      { verb: 'pin', power: 9 },
    ],
    chakraCost: 9,
    rank: 'D',
    difficulty: 60,
  },
  {
    id: 'thunder-spear',
    name: 'Thunder Spear',
    description:
      'Lightning drawn into a long spear and thrown, quicker across the field than any eye can follow.',
    discipline: 'ninjutsu',
    element: 'lightning',
    reach: ['mid', 'far'],
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 18 }],
    chakraCost: 13,
    rank: 'C',
    needs: { control: 'D' },
    difficulty: 85,
  },
  {
    id: 'thunderclap-strike',
    name: 'Thunderclap',
    description:
      'The whole charge of a storm brought down on one head in a single stroke, as sure as the bolt that finds the tallest tree.',
    discipline: 'ninjutsu',
    element: 'lightning',
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 28 },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 30,
    rank: 'A',
    needs: { nature: 'lightning', control: 'B' },
    difficulty: 145,
  },
];
