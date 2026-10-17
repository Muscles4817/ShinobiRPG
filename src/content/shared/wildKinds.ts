import type { CompanionKindDef } from '../companions';

/**
 * Wild companion kinds the countries share: found only by tracking them on purpose in a wild
 * place of their biome, where a save has one (`WildHaunt`). Stronger than a hound and growing
 * further, slow to take to you and slower to take orders.
 */

/** What a hound or a wolf will eat. */
export const HOUND_DIET: readonly string[] = [
  'river-fish',
  'eggs',
  'wild-game',
  'sweetfish',
  'river-eel',
  'crayfish',
  'travel-rations',
];

export const FOREST_WOLF: CompanionKindDef = {
  id: 'forest-wolf',
  name: 'Forest wolf',
  description:
    'A grey wolf of the deep woods: bigger than any hound, quick and hard to tire, and nobody’s.',
  temperament: 'wild',
  baseStat: 5,
  statBonuses: { speed: 3, perception: 3, strength: 2, stamina: 2, taijutsu: 1, intellect: -2 },
  healthScale: 0.8,
  maxChakra: 10,
  traits: ['brawler', 'swift'],
  aptitude: {
    speed: 1.3,
    perception: 1.3,
    strength: 1.2,
    stamina: 1.2,
    taijutsu: 1.2,
    intellect: 0.5,
    chakraControl: 0.4,
    ninjutsu: 0,
    genjutsu: 0,
    kenjutsu: 0,
    fuuinjutsu: 0,
  },
  diet: ['wild-game', 'river-fish', 'sweetfish', 'river-eel', 'eggs'],
  plays: { likes: ['scent', 'walk'], dislikes: ['fetch'] },
  names: ['Fubuki', 'Arashi', 'Shigure', 'Kogarashi', 'Mizore', 'Oboro', 'Kasumi'],
  wild: {
    biome: 'woods',
    chance: 0.5,
    sign: 'Prints the size of your palm in the mud by the stream, and a deer’s bones picked clean.',
    closer:
      'You follow the trail into the deep trees and wait downwind. Grey shape, yellow eyes; it watches you a long while before it goes.',
    lost: 'The trail runs into a stream and out of the world. Whatever it is, it is not ready for you.',
    comes:
      'Today the wolf doesn’t go. It walks out of the trees, takes the meat from your hand and, when you start for home, follows at a distance it keeps all the way.',
  },
};
