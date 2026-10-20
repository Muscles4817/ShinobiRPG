import type { TechniqueDef } from '@/systems/techniques';

/**
 * The Haibara's ash techniques, taught only to the clan. Each spends ash from what its user holds
 * up (`dustCost`) beside a little chakra, or draws more up from the hearths and kilns around them
 * (`dustDraw`); ash that reaches a foe gets in their eyes.
 */
export const HAIBARA_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'haibara-ash-puff',
    name: 'Ash Puff',
    description: 'A fistful of kiln ash, flung hard, straight into a foe’s face.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'damage', power: 7 }],
    chakraCost: 3,
    dustCost: 15,
    rank: 'E',
    difficulty: 30,
    clan: 'haibara',
  },
  {
    id: 'haibara-ash-pall',
    name: 'Ash Pall',
    description:
      'Ash pulled up out of every hearth nearby, hung in the air around you until you are hard to find in it.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'conceal', power: 8 }],
    chakraCost: 4,
    dustDraw: 40,
    rank: 'D',
    difficulty: 45,
    clan: 'haibara',
  },
  {
    id: 'haibara-cinder-bind',
    name: 'Cinder Bind',
    description: 'Wet ash wrapped round a foe’s legs that sets like kiln clay.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'pin', power: 9 }],
    chakraCost: 5,
    dustCost: 25,
    rank: 'D',
    difficulty: 45,
    clan: 'haibara',
  },
  {
    id: 'haibara-kiln-storm',
    name: 'Kiln Storm',
    description: 'Everything you hold up, at once, a grey storm over everyone in front of you.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'area', power: 10, size: 'small' }],
    chakraCost: 8,
    dustCost: 45,
    rank: 'C',
    difficulty: 70,
    clan: 'haibara',
  },
];
