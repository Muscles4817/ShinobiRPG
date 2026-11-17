import type { TechniqueDef } from '@/systems/techniques';

/**
 * The small lands' arts: the Seven-Tails' scales and wings in Fū, Mifune's draw, and the
 * salamander's venom that Hanzō of the Rain breathes out through his mask.
 */
export const SMALL_LAND_ARTS: readonly TechniqueDef[] = [
  {
    id: 'scale-powder',
    name: 'Hidden Scale: Scale Powder',
    description:
      'A cloud of glittering scales from the Seven-Tails’ wings. It catches the light, and the eyes.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'field', field: 'dust', power: 14 },
      { verb: 'confuse', power: 10 },
    ],
    chakraCost: 14,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'seven-tails-cloak',
    name: 'Cloak of the Seven-Tails',
    description: 'Insect wings open on her back, and she is in the air and on them at once.',
    discipline: 'ninjutsu',
    oncePerFight: true,
    effects: [
      {
        verb: 'empower',
        power: 10,
        boosts: ['speed', 'ninjutsu', 'taijutsu'],
        healthPerExchange: 3,
      },
    ],
    chakraCost: 22,
    rank: 'B',
    difficulty: 120,
    afterCost: { kind: 'exhaustion', days: 2 },
  },
  {
    id: 'mifune-iai',
    name: 'Iaidō',
    description:
      'He is past them before the blade seems to leave the scabbard, and chakra in the edge cuts what steel alone would not.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    accuracy: 'sure',
    effects: [
      { verb: 'move', power: 8, to: 'close' },
      { verb: 'break', power: 30, scaling: { drive: ['kenjutsu', 'chakraControl'] } },
    ],
    chakraCost: 20,
    rank: 'S',
    difficulty: 175,
  },
  {
    id: 'salamander-venom',
    name: 'Salamander Venom',
    description:
      'Poison breathed out from the sac in his chest, a mist that kills whoever breathes it slowly.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'area', power: 12, size: 'wide' },
      { verb: 'afflict', power: 14, harm: 'poison' },
    ],
    chakraCost: 20,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'kusarigama-sweep',
    name: 'Kusarigama Sweep',
    description:
      'The sickle flies out on its chain, then swings round to come back for another pass.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 18, hits: 2 },
      { verb: 'afflict', power: 6, harm: 'bleed' },
    ],
    chakraCost: 10,
    rank: 'B',
    difficulty: 110,
  },
];
