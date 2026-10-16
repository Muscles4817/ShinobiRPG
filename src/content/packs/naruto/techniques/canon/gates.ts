import type { TechniqueDef } from '@/systems/techniques';

/**
 * Guy's Strong Fist beyond Part I: the forbidden Eight Gates arts and the kicks he throws with
 * them open (each needs its gate open: `needsOpen`, opened in order by the gates' own
 * techniques, `opens`). Each takes its price out of the body; Guy teaches them.
 */
export const CANON_GATES: readonly TechniqueDef[] = [
  {
    id: 'leaf-rock-destroying-rise',
    name: 'Leaf Rock-Destroying Rise',
    description: 'A braced elbow strike that smashes coral and stone.',
    discipline: 'taijutsu',
    school: 'Strong Fist',
    effects: [{ verb: 'break', power: 18 }],
    chakraCost: 10,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'adamantine-strength-whirlwind',
    name: 'Violent — Leaf Adamantine-Strength Whirlwind',
    description: 'A roundhouse kick thrown with the gates open; everything around you goes over.',
    discipline: 'taijutsu',
    school: 'Strong Fist',
    effects: [
      { verb: 'area', power: 20, size: 'wide' },
      { verb: 'knock', power: 8, to: 'mid' },
    ],
    chakraCost: 16,
    rank: 'B',
    difficulty: 115,
  },
  {
    id: 'little-toe-attack',
    name: 'Little Toe Attack',
    description: 'A gate-powered kick down on the smallest toe. Giants fall over.',
    discipline: 'taijutsu',
    school: 'Strong Fist',
    effects: [
      { verb: 'break', power: 22 },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 15,
    rank: 'B',
    difficulty: 115,
  },
  {
    id: 'gate-of-limit',
    name: 'Eight Gates: Gate of Limit',
    description:
      'The fifth gate. Past the body’s last warning: the muscles tear as they move, and keep moving.',
    discipline: 'taijutsu',
    school: 'Strong Fist',
    effects: [
      {
        verb: 'empower',
        power: 20,
        boosts: ['strength', 'speed', 'taijutsu', 'stamina'],
        healthPerExchange: 5,
        afterCost: { kind: 'injury', stat: 'strength', amount: 2, days: 4 },
        opens: { ladder: 'gates', step: 5 },
      },
    ],
    chakraCost: 12,
    rank: 'B',
    difficulty: 120,
  },
  {
    id: 'gate-of-view',
    name: 'Eight Gates: Gate of View',
    description:
      'The sixth gate. Green chakra steams off the skin; the water around the body is thrown back.',
    discipline: 'taijutsu',
    school: 'Strong Fist',
    effects: [
      {
        verb: 'empower',
        power: 24,
        boosts: ['strength', 'speed', 'taijutsu', 'stamina'],
        healthPerExchange: 6,
        afterCost: { kind: 'injury', stat: 'strength', amount: 3, days: 5 },
        opens: { ladder: 'gates', step: 6 },
      },
    ],
    chakraCost: 14,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'gate-of-wonder',
    name: 'Eight Gates: Gate of Wonder',
    description:
      'The seventh gate. Blue sweat, a body moving faster than its own eyes can follow, and nothing held back.',
    discipline: 'taijutsu',
    school: 'Strong Fist',
    effects: [
      {
        verb: 'empower',
        power: 28,
        boosts: ['strength', 'speed', 'taijutsu', 'stamina'],
        healthPerExchange: 8,
        afterCost: { kind: 'hospital', days: 3 },
        opens: { ladder: 'gates', step: 7 },
      },
    ],
    chakraCost: 16,
    rank: 'A',
    difficulty: 145,
  },
  {
    id: 'evening-elephant',
    name: 'Evening Elephant',
    description: 'Sekizō. The seventh gate open: five punches, each a cannon of air.',
    discipline: 'taijutsu',
    needsOpen: { ladder: 'gates', step: 7 },
    school: 'Strong Fist',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'area', power: 24, size: 'wide' },
      { verb: 'knock', power: 10, to: 'far' },
    ],
    chakraCost: 24,
    rank: 'A',
    difficulty: 145,
    oncePerFight: true,
    afterCost: { kind: 'injury', stat: 'strength', amount: 2, days: 4 },
  },
  {
    id: 'eight-gates-released',
    name: 'Eight Gates Released Formation',
    description:
      'The Gate of Death open. More strength than any body can hold, for as long as it lasts.',
    discipline: 'taijutsu',
    school: 'Strong Fist',
    effects: [
      {
        verb: 'empower',
        power: 30,
        boosts: ['strength', 'speed', 'taijutsu', 'stamina'],
        healthPerExchange: 12,
        opens: { ladder: 'gates', step: 8 },
      },
    ],
    chakraCost: 30,
    rank: 'A',
    difficulty: 150,
    oncePerFight: true,
    afterCost: { kind: 'hospital', days: 14 },
  },
  {
    id: 'night-guy',
    name: 'Night Guy',
    description: 'The eighth gate’s last kick, so fast the space around it bends.',
    discipline: 'taijutsu',
    needsOpen: { ladder: 'gates', step: 8 },
    school: 'Strong Fist',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'break', power: 40 },
      { verb: 'daze', power: 14 },
    ],
    chakraCost: 34,
    rank: 'S',
    difficulty: 180,
    oncePerFight: true,
    afterCost: { kind: 'hospital', days: 14 },
  },
];
