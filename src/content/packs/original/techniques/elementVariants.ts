import type { TechniqueDef } from '@/systems/techniques';

/**
 * Elemental ninjutsu beyond the first ladder, so each element has more than one way to fight at
 * each grade: fire in flurries and walls, water that whips and drowns, earth that breaks guards
 * and shakes the ground, wind that bleeds, lightning that snares and splits. The heaviest need
 * the nature itself.
 */
export const ELEMENT_VARIANTS: readonly TechniqueDef[] = [
  {
    id: 'moth-embers',
    name: 'Moth Embers',
    description:
      'A handful of sparks that flutter out like moths at a paper lantern and burn wherever they settle.',
    discipline: 'ninjutsu',
    element: 'fire',
    effects: [
      { verb: 'damage', power: 14, hits: 3 },
      { verb: 'afflict', power: 4, harm: 'burn' },
    ],
    chakraCost: 9,
    rank: 'D',
    difficulty: 60,
  },
  {
    id: 'hearth-wall',
    name: 'Hearth Wall',
    description:
      'A sheet of flame thrown up from the ground between you and the blow, hot enough to turn most things aside.',
    discipline: 'ninjutsu',
    element: 'fire',
    effects: [{ verb: 'substitute', power: 11 }],
    chakraCost: 10,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'kiln-serpent',
    name: 'Kiln Serpent',
    description:
      'A long rope of fire that winds out across the field and wraps its target in heat the way a kiln wraps a pot.',
    discipline: 'ninjutsu',
    element: 'fire',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'damage', power: 24 },
      { verb: 'afflict', power: 8, harm: 'burn' },
    ],
    chakraCost: 18,
    rank: 'B',
    needs: { nature: 'fire' },
    difficulty: 115,
  },
  {
    id: 'festival-pyre',
    name: 'Festival Pyre',
    description:
      'The bonfire that closes the lantern festival, lit in one breath across the whole field, and too bright to look into.',
    discipline: 'ninjutsu',
    element: 'fire',
    effects: [
      { verb: 'area', power: 20, size: 'wide' },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 30,
    rank: 'A',
    needs: { nature: 'fire', control: 'C' },
    difficulty: 140,
  },
  {
    id: 'canal-whip',
    name: 'Canal Whip',
    description:
      'A rope of canal water cracked out at arm’s length that snaps round a leg and drags its owner in.',
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
    id: 'rain-needles',
    name: 'Rain Needles',
    description:
      'A short squall of water needles thrown from far off, each one stinging alone like the first drops of a storm.',
    discipline: 'ninjutsu',
    element: 'water',
    reach: ['mid', 'far'],
    effects: [{ verb: 'damage', power: 16, hits: 4 }],
    chakraCost: 12,
    rank: 'C',
    needs: { control: 'D' },
    difficulty: 85,
  },
  {
    id: 'millrace-prison',
    name: 'Millrace Prison',
    description:
      'Water closes round them like the race under a mill wheel, holding them in its pull and drowning the chakra out of their hands.',
    discipline: 'ninjutsu',
    element: 'water',
    effects: [
      { verb: 'pin', power: 16 },
      { verb: 'seal', power: 6 },
    ],
    chakraCost: 18,
    rank: 'B',
    needs: { nature: 'water', control: 'C' },
    difficulty: 115,
  },
  {
    id: 'floodgate-surge',
    name: 'Floodgate Surge',
    description:
      'Open every gate of the river at once and let the flood carry the fight down the valley.',
    discipline: 'ninjutsu',
    element: 'water',
    effects: [
      { verb: 'area', power: 20, size: 'wide' },
      { verb: 'knock', power: 10, to: 'far' },
    ],
    chakraCost: 30,
    rank: 'A',
    needs: { nature: 'water' },
    difficulty: 140,
  },
  {
    id: 'stone-knuckle',
    name: 'Stone Knuckle',
    description:
      'Earth packed round the fist as hard as a mason’s mallet, thrown straight through whatever guard is up.',
    discipline: 'ninjutsu',
    element: 'earth',
    reach: ['close'],
    effects: [{ verb: 'break', power: 14 }],
    chakraCost: 9,
    rank: 'D',
    difficulty: 60,
  },
  {
    id: 'quarry-spikes',
    name: 'Quarry Spikes',
    description:
      'Stakes of raw stone burst up under them, crude and badly aimed but heavy enough to break bone where they catch.',
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
    id: 'kiln-quake',
    name: 'Kiln Quake',
    description:
      'Stamp once and the ground heaves the way the old kiln hill did the year it fell, throwing everyone off their feet.',
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
    id: 'reed-whistle',
    name: 'Reed Whistle',
    description:
      'Two thin cuts of air that sing like reeds as they pass and leave the skin open behind them.',
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
    id: 'kite-string-blades',
    name: 'Kite-String Blades',
    description:
      'A fan of wind blades let out on a long line like festival kites, each one cutting in from its own angle.',
    discipline: 'ninjutsu',
    element: 'wind',
    reach: ['mid', 'far'],
    effects: [{ verb: 'damage', power: 15, hits: 3 }],
    chakraCost: 12,
    rank: 'C',
    difficulty: 85,
  },
  {
    id: 'sickle-gale',
    name: 'Sickle Gale',
    description:
      'A curved wind as sharp as a harvest sickle that goes through armour and leaves wounds slow to close.',
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
    id: 'twin-cyclone',
    name: 'Twin Cyclone',
    description:
      'Two whirlwinds turned against each other around the target, which grind anything caught between them.',
    discipline: 'ninjutsu',
    element: 'wind',
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 26, hits: 2 }],
    chakraCost: 30,
    rank: 'A',
    needs: { nature: 'wind', control: 'B' },
    difficulty: 145,
  },
  {
    id: 'spark-snare',
    name: 'Spark Snare',
    description:
      'A net of crackling threads cast over the legs that locks the muscles until the charge runs out.',
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
    id: 'storm-lance',
    name: 'Storm Lance',
    description:
      'Lightning drawn out into a long spear and thrown, quicker across the field than any eye can follow.',
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
    id: 'forked-lightning',
    name: 'Forked Lightning',
    description:
      'One bolt let go that splits and splits again, finding everyone on the far side of the field.',
    discipline: 'ninjutsu',
    element: 'lightning',
    effects: [
      { verb: 'area', power: 14, size: 'wide' },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 18,
    rank: 'B',
    needs: { nature: 'lightning' },
    difficulty: 115,
  },
  {
    id: 'sky-splitter',
    name: 'Sky-Splitter',
    description:
      'The whole charge of a storm called down in one stroke on one head, sure as the bolt that finds the temple spire.',
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
