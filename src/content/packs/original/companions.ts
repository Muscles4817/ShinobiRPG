import type { CompanionKindDef } from '../../companions';

/** Creatures that may become a companion in Tōrōgakure. */
export const COMPANION_KINDS: readonly CompanionKindDef[] = [
  {
    id: 'stray-hound',
    name: 'Stray hound',
    description: 'Lean, wary and quick, with a nose for trouble and for anything left unguarded.',
    temperament: 'stray',
    baseStat: 4,
    statBonuses: { speed: 2, perception: 3, strength: 1, intellect: -2 },
    healthScale: 0.6,
    maxChakra: 10,
    traits: ['brawler'],
    aptitude: {
      speed: 1.1,
      perception: 1.1,
      taijutsu: 0.9,
      intellect: 0.5,
      chakraControl: 0.4,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 0,
      fuuinjutsu: 0,
    },
    diet: [
      'river-fish',
      'eggs',
      'wild-game',
      'sweetfish',
      'river-eel',
      'crayfish',
      'travel-rations',
    ],
    plays: { likes: ['fetch', 'scent'], dislikes: ['walk'] },
    names: ['Ash', 'Soot', 'Ember', 'Wick', 'Tallow', 'Cinder', 'Moth', 'Dusk'],
    stray: {
      placeIds: ['market-street', 'mission-hall', 'training-grounds'],
      chance: 0.6,
      line: 'A thin grey hound noses through the scraps under the lanterns, ribs showing.',
      visit:
        'You crouch by the hound and wait. It edges closer, takes what you offer, and lets you touch its ear before it slips away.',
      follows:
        'This morning the grey hound is sitting outside your door. When you set off, it falls in at your heel.',
    },
  },
];
