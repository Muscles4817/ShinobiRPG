import type { TechniqueDef } from '@/systems/techniques';

/**
 * Fuuinjutsu: new techniques of the lantern country, their mechanics drawn from proven shapes and their
 * names and words its own (`docs/research/lantern-techniques.md`).
 */
export const LANTERN_FUUINJUTSU: readonly TechniqueDef[] = [
  {
    id: 'damper-tag',
    name: 'Damper Tag',
    description:
      'A tag like the iron plate shut over a stove, slapped on the chest to choke the chakra down.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'seal', power: 10 }],
    chakraCost: 0,
    rank: 'E',
    difficulty: 30,
  },
  {
    id: 'tripwire-tag',
    name: 'Tripwire Tag',
    description: 'A tag on a thread across the path that bursts when a foot finds it.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'trap', power: 6 }],
    chakraCost: 0,
    rank: 'E',
    difficulty: 30,
  },
  {
    id: 'doorpost-ward',
    name: 'Doorpost Ward',
    description:
      'A ward pasted where you stood, and the blow lands on a doorpost that was not there a moment ago.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'substitute', power: 8 }],
    chakraCost: 0,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'shimenawa-paper-streamer-ward',
    name: 'Paper Streamer Ward',
    description:
      'Zigzag paper streamers snap out on a rope between you and the blow, and take it in your place.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'substitute', power: 8 }],
    chakraCost: 0,
    rank: 'D',
    difficulty: 55,
    clan: 'shimenawa',
  },
  {
    id: 'pot-lid-seal',
    name: 'Pot-Lid Seal',
    description:
      'Clap the seal down like a lid on a boiling pot, and the chakra underneath can only hiss.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'seal', power: 9 }],
    chakraCost: 0,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'shimenawa-grave-rope-knot',
    name: 'Grave-Rope Knot',
    description:
      'Tie the knot that holds a coffin shut, and keep a hand on it while the foe pulls against it.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'pin', power: 12, channelled: true }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
    clan: 'shimenawa',
  },
  {
    id: 'lintel-tag',
    name: 'Lintel Tag',
    description:
      'A tag tucked above a doorway, and a second one in your hand for whoever ducks to avoid the first.',
    discipline: 'fuuinjutsu',
    effects: [
      { verb: 'damage', power: 10 },
      { verb: 'trap', power: 10 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'rope-and-ink',
    name: 'Rope and Ink',
    description:
      'Inked cord thrown round the arms and tied off with a seal, so the hands are held and the chakra with them.',
    discipline: 'fuuinjutsu',
    effects: [
      { verb: 'pin', power: 12 },
      { verb: 'seal', power: 8 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'shimenawa-rope-across-the-path',
    name: 'Rope Across the Path',
    description:
      'A rope laid low across the ground as a boundary, and whoever crosses it stops dead.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'trap', power: 16, dazes: true }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
    clan: 'shimenawa',
  },
  {
    id: 'wick-drawing-seal',
    name: 'Wick-Drawing Seal',
    description:
      'A seal that drinks chakra the way a dry wick drinks oil, and lets none of it through to the flame.',
    discipline: 'fuuinjutsu',
    effects: [
      { verb: 'drain', power: 13 },
      { verb: 'seal', power: 8 },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'gatehouse-seal',
    name: 'Gatehouse Seal',
    description:
      'The whole field written into a gatehouse at night: every chakra point barred, and every way out tagged.',
    discipline: 'fuuinjutsu',
    effects: [
      { verb: 'seal', power: 17 },
      { verb: 'trap', power: 12 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'shimenawa-hundredfold-knot',
    name: 'The Hundredfold Knot',
    description:
      'Every rope the clan has ever tied, tied again at once around one foe, their chakra and their limbs alike.',
    discipline: 'fuuinjutsu',
    effects: [
      { verb: 'seal', power: 24 },
      { verb: 'pin', power: 20 },
    ],
    chakraCost: 0,
    rank: 'S',
    difficulty: 175,
    clan: 'shimenawa',
    oncePerFight: true,
    afterCost: { kind: 'injury', stat: 'chakraControl', amount: 3, days: 7 },
  },
];
