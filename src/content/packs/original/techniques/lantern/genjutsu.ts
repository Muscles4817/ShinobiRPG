import type { TechniqueDef } from '@/systems/techniques';

/**
 * Genjutsu: new techniques of the lantern country, their mechanics drawn from proven shapes and their
 * names and words its own (`docs/research/lantern-techniques.md`).
 */
export const LANTERN_GENJUTSU: readonly TechniqueDef[] = [
  {
    id: 'flicker-at-the-wick',
    name: 'Flicker at the Wick',
    description:
      'A lantern flame jumps in the corner of their eye, and for a breath they forget what they were doing.',
    discipline: 'genjutsu',
    effects: [{ verb: 'daze', power: 6 }],
    chakraCost: 0,
    rank: 'E',
    difficulty: 30,
  },
  {
    id: 'wrong-bank',
    name: 'The Wrong Bank',
    description: 'They cross the bridge and are sure they are still on the near side of the river.',
    discipline: 'genjutsu',
    effects: [{ verb: 'confuse', power: 5 }],
    chakraCost: 0,
    rank: 'E',
    difficulty: 30,
  },
  {
    id: 'ebbing-will',
    name: 'Ebbing Will',
    description:
      'Every step feels uphill and every breath a chore, and the fight starts to seem like someone else’s.',
    discipline: 'genjutsu',
    effects: [{ verb: 'drain', power: 6, will: true }],
    chakraCost: 0,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'moth-in-the-ear',
    name: 'Moth in the Ear',
    description: 'A wingbeat inside the head, loud as a drum, and then nowhere to be found.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'daze', power: 6 },
      { verb: 'confuse', power: 4 },
    ],
    chakraCost: 0,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'tokaku-mourners-murmur',
    name: 'Mourner’s Murmur',
    description:
      'Voices at a wake, just behind the foe’s ear, all saying a name that might be theirs.',
    discipline: 'genjutsu',
    effects: [{ verb: 'confuse', power: 8 }],
    chakraCost: 0,
    rank: 'D',
    difficulty: 55,
    clan: 'tokaku',
  },
  {
    id: 'empty-doorway',
    name: 'Empty Doorway',
    description:
      'They see you step into a doorway and look into it for a long while. You left by the window.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'conceal', power: 8 },
      { verb: 'move', power: 6, to: 'far' },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'tokaku-grave-watch-eyes',
    name: 'Grave-Watch Eyes',
    description:
      'Look the way the dead look, and every living warmth in the night stands out like a lantern.',
    discipline: 'genjutsu',
    effects: [{ verb: 'sense', power: 14 }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
    clan: 'tokaku',
  },
  {
    id: 'kneeling-mind',
    name: 'Kneeling Mind',
    description: 'The mind is told to kneel, and the body hears it a moment too late to argue.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'pin', power: 12 },
      { verb: 'daze', power: 5 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'lantern-that-follows',
    name: 'The Lantern That Follows',
    description: 'A lantern bobs after them wherever they turn, closer every time, and it is hot.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'damage', power: 10 },
      { verb: 'confuse', power: 8 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'cold-hearth-dream',
    name: 'Cold Hearth Dream',
    description:
      'They dream of a hearth gone out in winter, and wake still shivering, with less in them than before.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'drain', power: 13, will: true },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'ferry-fog',
    name: 'Ferry Fog',
    description:
      'River fog rolls over the field that only they can see, and the ferry bell rings somewhere they can’t find.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'field', power: 8, field: 'mist' },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'tokaku-hands-from-the-well',
    name: 'Hands from the Well',
    description:
      'Cold wet hands close round the foe’s ankles and pull, and the pulling hurts as if it were real.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'pin', power: 15 },
      { verb: 'damage', power: 12 },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
    clan: 'tokaku',
  },
  {
    id: 'bell-that-never-stops',
    name: 'The Bell That Never Stops',
    description:
      'The temple bell tolls inside their skull and will not stop, and every thought falls between the strokes.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'confuse', power: 17 },
      { verb: 'daze', power: 10 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'tokaku-returning-night',
    name: 'The Returning Night',
    description:
      'On the night the dead come home, the foe’s own dead come home to them, and will not let them look away.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'confuse', power: 17 },
      { verb: 'daze', power: 10 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
    clan: 'tokaku',
  },
];
