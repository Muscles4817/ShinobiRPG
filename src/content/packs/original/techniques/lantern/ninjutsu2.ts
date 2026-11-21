import type { TechniqueDef } from '@/systems/techniques';

/**
 * Ninjutsu: new techniques of the lantern country, their mechanics drawn from proven shapes and their
 * names and words its own (`docs/research/lantern-techniques.md`).
 */
export const LANTERN_NINJUTSU2: readonly TechniqueDef[] = [
  {
    id: 'swept-yard-dust',
    name: 'Swept-Yard Dust',
    description:
      'A gust across the yard lifts every grain the broom missed, and you are gone inside it.',
    discipline: 'ninjutsu',
    element: 'wind',
    effects: [
      { verb: 'field', power: 8, field: 'dust' },
      { verb: 'conceal', power: 6 },
    ],
    chakraCost: 0,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'hibana-taper-throw',
    name: 'Taper Throw',
    description:
      'A lit taper flicked off the thumb like a coin, and the cloth it lands on keeps smouldering.',
    discipline: 'ninjutsu',
    element: 'fire',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'damage', power: 12 },
      { verb: 'afflict', power: 5, harm: 'burn' },
    ],
    chakraCost: 0,
    rank: 'D',
    difficulty: 55,
    clan: 'hibana',
  },
  {
    id: 'winnowing-cuts',
    name: 'Winnowing Cuts',
    description:
      'Toss the air the way you toss rice in a basket, and the little cuts fly off it like chaff.',
    discipline: 'ninjutsu',
    element: 'wind',
    reach: ['close', 'mid'],
    effects: [{ verb: 'damage', power: 12, hits: 3 }],
    chakraCost: 0,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'bathhouse-steam',
    name: 'Bathhouse Steam',
    description:
      'Fill the field with steam as thick as the bathhouse at dusk, and scalding wherever it is thickest.',
    discipline: 'ninjutsu',
    element: 'water',
    effects: [
      { verb: 'field', power: 12, field: 'mist' },
      { verb: 'afflict', power: 5, harm: 'burn' },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'bell-rope-charge',
    name: 'Bell-Rope Charge',
    description:
      'A rope of lightning thrown round them and held, humming like a temple bell rope in a storm, every muscle it touches locked.',
    discipline: 'ninjutsu',
    element: 'lightning',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'pin', power: 12, channelled: true },
      { verb: 'daze', power: 5 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'burning-effigy',
    name: 'Burning Effigy',
    description:
      'The blow lands on a straw figure in your coat, already burning like the ones cast on the river at summer’s end.',
    discipline: 'ninjutsu',
    element: 'fire',
    effects: [{ verb: 'substitute', power: 11 }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'haibara-clinker-shot',
    name: 'Clinker Shot',
    description: 'Ash packed hard as a lump of kiln slag in an instant, then thrown straight.',
    discipline: 'ninjutsu',
    reach: ['mid', 'far'],
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 16 }],
    chakraCost: 0,
    dustCost: 20,
    rank: 'C',
    difficulty: 80,
    clan: 'haibara',
  },
  {
    id: 'toga-cocoon-wrap',
    name: 'Cocoon Wrap',
    description:
      'The moths settle on a foe so thick that their arms are wrapped as if in wet silk.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'pin', power: 12 }],
    chakraCost: 0,
    swarmCost: 25,
    rank: 'C',
    difficulty: 80,
    clan: 'toga',
  },
  {
    id: 'crackling-coat',
    name: 'Crackling Coat',
    description:
      'A thin coat of static drawn over the skin; it stands the hair on end and spits at anything that touches it.',
    discipline: 'ninjutsu',
    element: 'lightning',
    effects: [{ verb: 'shroud', power: 8, kind: 'lightning' }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'fallen-cedar',
    name: 'Fallen Cedar',
    description:
      'The blow lands on a mossy log lying where you stood, and the forest has you again.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'substitute', power: 11 },
      { verb: 'conceal', power: 6 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
    school: 'Moss Step',
  },
  {
    id: 'hibana-firebrick-wall',
    name: 'Firebrick Wall',
    description:
      'Breathe out over the ground and it bakes into a wall of red brick that is still too hot to touch.',
    discipline: 'ninjutsu',
    element: 'fire',
    effects: [{ verb: 'substitute', power: 11 }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
    clan: 'hibana',
  },
  {
    id: 'firecracker-string',
    name: 'Firecracker String',
    description:
      'A string of crackling sparks tossed at their feet goes off one after another, and the last bang always comes too soon.',
    discipline: 'ninjutsu',
    element: 'fire',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'damage', power: 15, hits: 4 },
      { verb: 'daze', power: 5 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'folding-screen-gust',
    name: 'Folding-Screen Gust',
    description: 'Air stood up in panels like a folding screen, and the blow skids off the fold.',
    discipline: 'ninjutsu',
    element: 'wind',
    effects: [{ verb: 'substitute', power: 11 }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'gatepost-ram',
    name: 'Gatepost Ram',
    description:
      'Charge in behind a shoulder of packed earth and hit them like a gatepost driven home.',
    discipline: 'ninjutsu',
    element: 'earth',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'move', power: 6, to: 'close' },
      { verb: 'break', power: 13 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'kiln-draught',
    name: 'Kiln Draught',
    description:
      'Open your hands like a kiln’s damper and the rush of hot air throws them back across the yard.',
    discipline: 'ninjutsu',
    element: 'fire',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 14 },
      { verb: 'knock', power: 8, to: 'far' },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'lamp-gap-flicker',
    name: 'Lamp-Gap Flicker',
    description:
      'Gone in the dark between two lanterns and back in the light at their shoulder, already striking.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'move', power: 6, to: 'close' },
      { verb: 'damage', power: 12 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
];
