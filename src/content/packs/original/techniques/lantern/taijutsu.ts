import type { TechniqueDef } from '@/systems/techniques';

/**
 * Taijutsu: new techniques of the lantern country, their mechanics drawn from proven shapes and their
 * names and words its own (`docs/research/lantern-techniques.md`).
 */
export const LANTERN_TAIJUTSU: readonly TechniqueDef[] = [
  {
    id: 'ear-clap',
    name: 'Ear Clap',
    description: 'Both cupped palms over the ears at once, and the world rings like the noon bell.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 5 },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 0,
    rank: 'E',
    difficulty: 30,
  },
  {
    id: 'barred-door-stance',
    name: 'Barred-Door Stance',
    description: 'Plant both feet like a bar across the door and let them try it.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [{ verb: 'counter', power: 12 }],
    chakraCost: 0,
    rank: 'D',
    difficulty: 55,
    school: 'Iron Gate',
  },
  {
    id: 'cedar-root-trip',
    name: 'Cedar-Root Trip',
    description:
      'Hook their ankle like a root across the forest path and keep your foot on it while they find the ground.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 6 },
      { verb: 'pin', power: 10 },
    ],
    chakraCost: 0,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'draught-kick',
    name: 'Draught Kick',
    description:
      'Two quick kicks like a draught under the door, and every lantern in the street flickers.',
    discipline: 'taijutsu',
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 12, hits: 2 }],
    chakraCost: 0,
    rank: 'D',
    difficulty: 55,
    school: 'Lantern Wind',
  },
  {
    id: 'hot-poker-jab',
    name: 'Hot Poker Jab',
    description: 'Two fingers driven in like a fire iron left too long in the coals.',
    discipline: 'taijutsu',
    element: 'fire',
    reach: ['close'],
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 12 },
      { verb: 'afflict', power: 5, harm: 'burn' },
    ],
    chakraCost: 0,
    rank: 'D',
    difficulty: 55,
    moulded: true,
  },
  {
    id: 'wing-dust-tap',
    name: 'Wing-Dust Tap',
    description:
      'A fingertip that brushes the wrist like a moth’s wing, and the chakra there goes quiet.',
    discipline: 'taijutsu',
    reach: ['close'],
    accuracy: 'sure',
    effects: [{ verb: 'seal', power: 10 }],
    chakraCost: 0,
    rank: 'D',
    difficulty: 55,
    school: 'Moth Needle',
  },
  {
    id: 'bolt-shot-shoulder',
    name: 'Bolt-Shot Shoulder',
    description:
      'One stride and the shoulder goes in like the bolt shot home on the east bridge gate.',
    discipline: 'taijutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'move', power: 6, to: 'close' },
      { verb: 'break', power: 14 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
    school: 'Iron Gate',
  },
  {
    id: 'bucket-line-flurry',
    name: 'Bucket-Line Flurry',
    description:
      'Blows passed hand to hand like buckets down a fire line, four along the chain before anyone can break it.',
    discipline: 'taijutsu',
    effects: [{ verb: 'damage', power: 16, hits: 4 }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'circling-the-lamp',
    name: 'Circling the Lamp',
    description:
      'Three strikes round them the way moths circle a lamp, each one closing a point the last one found.',
    discipline: 'taijutsu',
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 12, hits: 3 },
      { verb: 'seal', power: 9 },
      { verb: 'drain', power: 6 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
    school: 'Moth Needle',
  },
  {
    id: 'gutter-sweep',
    name: 'Gutter Sweep',
    description:
      'A low spinning kick that runs round you like wind along the gutters and sends everyone a step back.',
    discipline: 'taijutsu',
    effects: [
      { verb: 'area', power: 10 },
      { verb: 'knock', power: 6, to: 'mid' },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
    school: 'Lantern Wind',
  },
  {
    id: 'kite-tail-kick',
    name: 'Kite-Tail Kick',
    description:
      'A high kick that trails a whip of wind behind it and snaps them away like a kite in a gust.',
    discipline: 'taijutsu',
    element: 'wind',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 14 },
      { verb: 'knock', power: 8, to: 'mid' },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
    moulded: true,
  },
  {
    id: 'ox-cart-shoulder',
    name: 'Ox-Cart Shoulder',
    description:
      'Come in low behind the shoulder and keep coming, the way a loaded cart goes through a market gate.',
    discipline: 'taijutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'move', power: 6, to: 'close' },
      { verb: 'break', power: 14 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'slack-line',
    name: 'Slack Line',
    description:
      'Let the wire hang loose between your hands, and snap it tight round whoever steps into the slack.',
    discipline: 'taijutsu',
    reach: ['close', 'mid'],
    effects: [{ verb: 'counter', power: 15 }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
    school: 'Tidewire',
  },
  {
    id: 'bellows-breath',
    name: 'Bellows Breath',
    description:
      'Breathe in hard and hold it like a fired kiln holds its heat. The body hardens, and the heat eats it from inside.',
    discipline: 'taijutsu',
    effects: [
      {
        verb: 'empower',
        power: 14,
        boosts: ['strength', 'stamina', 'taijutsu'],
        healthPerExchange: 3,
      },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'drawbridge-haul',
    name: 'Drawbridge Haul',
    description:
      'Catch a sleeve from half a stride off and haul them in like the drawbridge chain, into a hold that does not let go.',
    discipline: 'taijutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'knock', power: 9, to: 'close' },
      { verb: 'damage', power: 8 },
      { verb: 'pin', power: 15 },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
    school: 'Iron Gate',
  },
  {
    id: 'ferry-pole-reversal',
    name: 'Ferry-Pole Reversal',
    description:
      'Lean into their blow as a ferryman leans on the pole, then push off it and send it all back.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [{ verb: 'counter', power: 17 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
];
