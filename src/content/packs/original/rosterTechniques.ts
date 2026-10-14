import type { TechniqueDef } from '@/systems/techniques';

/** Signature techniques of the village's jōnin, taught by them in "train with". */
export const ROSTER_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'lantern-question',
    name: 'The Lantern Question',
    description: 'A lantern swings before the target’s eyes and every answer they had goes dark.',
    discipline: 'genjutsu',
    effects: [{ verb: 'confuse', power: 15 }],
    chakraCost: 10,
    rank: 'C',
    difficulty: 70,
  },
  {
    id: 'moth-needle',
    name: 'Moth Needle',
    description: 'A grey needle that flutters like a moth and lands like a hornet.',
    discipline: 'taijutsu',
    reach: ['close', 'mid'],
    school: 'Moth Needle',
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 12 }],
    chakraCost: 4,
    rank: 'D',
    difficulty: 50,
  },
  {
    id: 'pitch-snare',
    name: 'Pitch Snare',
    description: 'A seal under a smear of pine pitch. Whoever steps on it is stuck fast.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'trap', power: 8, dazes: true }],
    chakraCost: 8,
    rank: 'D',
    difficulty: 55,
  },
];
