import type { TechniqueDef } from '@/systems/techniques';

/**
 * Canon jutsu of the village's jōnin from the Shippuden anime: Ibiki's summoned instruments,
 * Hayate's and Yūgao's sword arts, and the clan heads' later techniques. Each is taught by the
 * one who uses it.
 */
export const CANON_JONIN_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'mind-disturbance-dance',
    name: 'Mind Disturbance Dance Performance Technique',
    description: 'Mind Body Disturbance cast over a crowd: friend and foe turn on each other.',
    discipline: 'genjutsu',
    clan: 'yamanaka',
    effects: [
      { verb: 'confuse', power: 16 },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 17,
    rank: 'B',
    difficulty: 115,
  },
  {
    id: 'black-spider-lily',
    name: 'Black Spider Lily',
    description: 'Shadow Sewing’s tendrils take hold and reel the captured in towards you.',
    discipline: 'ninjutsu',
    clan: 'nara',
    reach: ['close', 'mid', 'far'],
    effects: [
      { verb: 'pin', power: 14 },
      { verb: 'knock', power: 6, to: 'close' },
    ],
    chakraCost: 16,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'iron-maiden',
    name: 'Summoning: Iron Maiden',
    description:
      'A giant split iron statue clamps shut round the target and sinks into the ground.',
    discipline: 'ninjutsu',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 20 },
      { verb: 'pin', power: 12 },
    ],
    chakraCost: 17,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'torture-chamber',
    name: 'Summoning: Torture Chamber',
    description: 'An iron chamber that chains the target and boxes them in.',
    discipline: 'ninjutsu',
    reach: ['close'],
    effects: [
      { verb: 'pin', power: 16 },
      { verb: 'seal', power: 8 },
    ],
    chakraCost: 17,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'secret-sword-moonlight',
    name: 'Secret Sword: Moonlight',
    description: 'A blur of a dash, and one swift sideways cut at the end of it.',
    discipline: 'kenjutsu',
    school: 'Leaf Sword',
    accuracy: 'sure',
    needs: { weapon: 'blade' },
    effects: [
      { verb: 'move', power: 8, to: 'close' },
      { verb: 'damage', power: 20 },
    ],
    chakraCost: 14,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'transparent-escape',
    name: 'Transparent Escape Technique',
    description: 'You turn invisible, to watch or to slip away unseen.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'conceal', power: 14, scaling: { drive: ['ninjutsu'] } }],
    chakraCost: 11,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'hazy-moon-night',
    name: 'Hazy Moon Night',
    description: 'A circling swing that leaves moons of afterimage, and a rush in behind them.',
    discipline: 'kenjutsu',
    school: 'Leaf Sword',
    needs: { weapon: 'blade' },
    effects: [
      { verb: 'conceal', power: 8, scaling: { drive: ['kenjutsu', 'speed'] } },
      { verb: 'damage', power: 18 },
    ],
    chakraCost: 14,
    rank: 'B',
    difficulty: 110,
  },
];
