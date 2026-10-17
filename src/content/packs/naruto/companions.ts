import type { CompanionKindDef } from '../../companions';
import { FOREST_WOLF, HOUND_DIET } from '../../shared/wildKinds';

/** Creatures that may become a companion in the Hidden Leaf. */
export const COMPANION_KINDS: readonly CompanionKindDef[] = [
  {
    id: 'ninken',
    name: 'Ninken',
    description: 'A ninja hound of the Inuzuka kennels, raised beside its partner from a pup.',
    temperament: 'bred',
    baseStat: 4,
    statBonuses: { speed: 2, perception: 3, strength: 1, taijutsu: 1, intellect: -1 },
    healthScale: 0.6,
    maxChakra: 15,
    traits: ['brawler'],
    aptitude: {
      speed: 1.3,
      perception: 1.3,
      taijutsu: 1.2,
      intellect: 0.6,
      chakraControl: 0.6,
      ninjutsu: 0.4,
      genjutsu: 0,
      kenjutsu: 0,
      fuuinjutsu: 0,
    },
    diet: HOUND_DIET,
    plays: { likes: ['rough', 'scent'], dislikes: [] },
    names: ['Akamaru', 'Kuromaru', 'Haimaru', 'Shiromaru', 'Kogemaru', 'Tsumemaru'],
  },
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
    diet: HOUND_DIET,
    plays: { likes: ['fetch', 'scent'], dislikes: ['walk'] },
    names: ['Pochi', 'Kuro', 'Shiro', 'Hachi', 'Goro', 'Taro'],
    stray: {
      placeIds: ['shopping-district', 'mission-desk', 'training-grounds'],
      chance: 0.6,
      line: 'A scruffy brown hound is sniffing round the ramen stand’s back door, ribs showing.',
      visit:
        'You crouch by the hound and wait. It edges closer, takes what you offer, and lets you scratch its ear before it trots off.',
      follows:
        'This morning the brown hound is sitting outside your door. When you set off, it falls in at your heel.',
    },
  },
  FOREST_WOLF,
];
