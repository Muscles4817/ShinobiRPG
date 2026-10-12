import type { TechniqueDef } from '@/systems/techniques';

/** The open-hand arts anyone may learn, from the academy palm to the legend’s last stand. */
export const TAIJUTSU: readonly TechniqueDef[] = [
  {
    id: 'palm-strike',
    name: 'Palm Strike',
    description: 'A chakra-backed open palm, the first technique every academy student learns.',
    discipline: 'taijutsu',
    effects: [{ verb: 'damage', power: 8 }],
    chakraCost: 3,
    rank: 'E',
    difficulty: 20,
  },
  {
    id: 'gale-heel',
    name: 'Gale Heel',
    description: 'A spinning kick riding a gust of wind chakra.',
    discipline: 'taijutsu',
    element: 'wind',
    effects: [{ verb: 'damage', power: 13 }],
    chakraCost: 5,
    rank: 'E',
    difficulty: 40,
  },
  {
    id: 'temple-bell-palm',
    name: 'Temple-Bell Palm',
    description: 'A palm that rings through a guard the way a beam rings through a temple bell.',
    discipline: 'taijutsu',
    effects: [{ verb: 'break', power: 14 }],
    chakraCost: 6,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'crescent-drop',
    name: 'Crescent Drop',
    description: 'Leap, flip, and bring the heel down like a falling moon.',
    discipline: 'taijutsu',
    effects: [{ verb: 'damage', power: 18 }],
    chakraCost: 7,
    rank: 'C',
    difficulty: 70,
  },
  {
    id: 'kindled-pulse',
    name: 'Kindled Pulse',
    description:
      'Light the body’s inner lanterns one by one. Every muscle burns brighter, and so does the bill.',
    discipline: 'taijutsu',
    effects: [
      {
        verb: 'empower',
        power: 12,
        boosts: ['strength', 'speed', 'taijutsu'],
        healthPerExchange: 6,
        afterCost: { kind: 'exhaustion', days: 1 },
      },
    ],
    chakraCost: 8,
    rank: 'C',
    difficulty: 70,
  },
  {
    id: 'lamplighters-ladder',
    name: 'Lamplighter’s Ladder',
    description:
      'Climb the guard like a lamplighter climbs a pole: three quick steps in, and a knee at the top.',
    discipline: 'taijutsu',
    effects: [
      { verb: 'move', to: 'close', power: 6 },
      { verb: 'damage', power: 15 },
    ],
    chakraCost: 8,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'bellows-fist',
    name: 'Bellows Fist',
    description: 'A fist to the middle that empties the lungs the way a kiln bellows empties.',
    discipline: 'taijutsu',
    effects: [
      { verb: 'break', power: 12 },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 9,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'ash-whirlwind',
    name: 'Ash Whirlwind',
    description:
      'Spin low through the fight like a gust through a cold hearth, and sweep everyone in reach.',
    discipline: 'taijutsu',
    effects: [{ verb: 'area', power: 16 }],
    chakraCost: 14,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'kiln-door-kick',
    name: 'Kiln-Door Kick',
    description:
      'The kick that slams a kiln door shut, aimed at a guard. The guard stays shut less.',
    discipline: 'taijutsu',
    effects: [{ verb: 'break', power: 22 }],
    chakraCost: 12,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'night-watch-flurry',
    name: 'Night Watch Flurry',
    description:
      'Too many blows from too many angles: how the masked watch end a brawl before anyone sees it.',
    discipline: 'taijutsu',
    effects: [
      { verb: 'damage', power: 16, scaling: { drive: ['speed', 'art'] } },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 12,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'banked-coals',
    name: 'Banked Coals',
    description:
      'Breathe slow and hot, like coals banked for the night. Wounds close and the body hardens, and tomorrow you sleep like a stone.',
    discipline: 'taijutsu',
    effects: [
      { verb: 'heal', power: 14, scaling: { drive: ['stamina', 'willpower'] } },
      {
        verb: 'empower',
        power: 14,
        boosts: ['stamina', 'willpower', 'taijutsu'],
        afterCost: { kind: 'exhaustion', days: 2 },
      },
    ],
    chakraCost: 16,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'bridge-holder-palm',
    name: 'Bridge-Holder’s Palm',
    description:
      'The palm that held the east bridge. It goes through the guard, the armour and the nerve behind them.',
    discipline: 'taijutsu',
    effects: [
      { verb: 'break', power: 20 },
      { verb: 'daze', power: 12 },
    ],
    chakraCost: 18,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'every-lantern-lit',
    name: 'Every Lantern Lit',
    description:
      'Light every inner lantern at once and burn as one bright thing. The hospital keeps a bed for those who learn it.',
    discipline: 'taijutsu',
    effects: [
      {
        verb: 'empower',
        power: 26,
        boosts: ['strength', 'speed', 'taijutsu'],
        healthPerExchange: 10,
      },
      { verb: 'damage', power: 24 },
    ],
    chakraCost: 20,
    rank: 'S',
    difficulty: 175,
    oncePerFight: true,
    afterCost: { kind: 'hospital', days: 3 },
  },
];
